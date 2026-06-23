import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import type { PropsWithChildren } from "react";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";
import type { FlowMetrics } from "../insights/analytics";

export interface ProjectRecord {
  id: string;
  name: string;
  industryProfile?: string;
  ownerId?: string;
  memberIds?: string[];
  metadata?: {
    metrics?: FlowMetrics;
  };
  updatedAt?: unknown;
  createdAt?: unknown;
}

interface ProjectContextValue {
  userId: string | null;
  selectedProjectId: string | null;
  selectedProfile: string;
  selectedProjectName: string;
  selectProject: (projectId: string) => void;
  clearProject: () => void;
  projects: ProjectRecord[];
  projectsLoading: boolean;
  projectsError: string | null;
  createProject: (name: string, industryProfile: string) => Promise<string | null>;
  renameProject: (projectId: string, name: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<string | null>;
  acceptInvite: (projectId: string, inviteId: string) => Promise<void>;
}

interface ProjectProviderProps extends PropsWithChildren {
  userId: string | null;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const ProjectProvider = ({ userId, children }: ProjectProviderProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    let cancelled = false;

    const bootstrap = async () => {
      if (!userId) {
        setProjects([]);
        setSelectedProjectId(null);
        setProjectsLoading(false);
        setProjectsError(null);
        return;
      }

      setProjectsLoading(true);
      setProjectsError(null);

      const userDocRef = doc(db, "users", userId);

      try {
        const userSnapshot = await getDoc(userDocRef);
        if (!userSnapshot.exists()) {
          await setDoc(userDocRef, { createdAt: serverTimestamp() }, { merge: true });
          if (!cancelled) {
            setSelectedProjectId(null);
          }
        } else {
          const storedSelection = userSnapshot.data()?.selectedProjectId as string | undefined;
          if (!cancelled) {
            setSelectedProjectId(storedSelection ?? null);
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences", error);
        if (!cancelled) {
          setProjectsError("Failed to load your workspace preferences.");
        }
      }

      const projectsRef = collection(db, "projects");
      const projectsQuery = query(
        projectsRef,
        where("memberIds", "array-contains", userId)
      );
      unsubscribe = onSnapshot(
        projectsQuery,
        (snapshot) => {
          const nextProjects = snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data() as Omit<ProjectRecord, "id">;
              const industryProfile = (data.industryProfile as string) ?? "manufacturing";
              return { id: docSnap.id, ...data, industryProfile };
            })
            .sort((a, b) => {
              const aTime = a.updatedAt && typeof a.updatedAt === "object" && "seconds" in (a.updatedAt as { seconds: number }) ? (a.updatedAt as { seconds: number }).seconds : 0;
              const bTime = b.updatedAt && typeof b.updatedAt === "object" && "seconds" in (b.updatedAt as { seconds: number }) ? (b.updatedAt as { seconds: number }).seconds : 0;
              return bTime - aTime;
            });
          if (!cancelled) {
            setProjects(nextProjects);
            setProjectsLoading(false);
          }
        },
        (error) => {
          console.error("Project listener error", error);
          if (!cancelled) {
              setProjectsError("Unable to load projects.");
            setProjectsLoading(false);
          }
        }
      );
    };

    bootstrap();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const persistSelection = useCallback(
    async (projectId: string | null) => {
      if (!userId) return;
      const userDocRef = doc(db, "users", userId);
      try {
        await setDoc(userDocRef, { selectedProjectId: projectId }, { merge: true });
      } catch (error) {
        console.error("Failed to persist selected project", error);
      }
    },
    [userId]
  );

  const selectProject = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
      void persistSelection(projectId);
    },
    [persistSelection]
  );

  const clearProject = useCallback(() => {
    setSelectedProjectId(null);
    void persistSelection(null);
  }, [persistSelection]);

  const createProject = useCallback(
    async (name: string, industryProfile: string) => {
      if (!userId) {
        throw new Error("You must be signed in to create a project.");
      }
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error("Project name cannot be empty.");
      }
      const projectsRef = collection(db, "projects");
      const docRef = await addDoc(projectsRef, {
        name: trimmed,
        industryProfile,
        ownerId: userId,
        memberIds: [userId],
        metadata: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const userDocRef = doc(db, "users", userId);
      setSelectedProjectId(docRef.id);
      await setDoc(userDocRef, { selectedProjectId: docRef.id }, { merge: true });
      return docRef.id;
    },
    [userId]
  );

  const renameProject = useCallback(
    async (projectId: string, name: string) => {
      if (!userId) {
        throw new Error("You must be signed in to update a project.");
      }
      const trimmed = name.trim();
      if (!trimmed) return;
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, { name: trimmed, updatedAt: serverTimestamp() });
    },
    [userId]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!userId) {
        throw new Error("You must be signed in to delete a project.");
      }
      const projectRef = doc(db, "projects", projectId);
      await deleteDoc(projectRef);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        await persistSelection(null);
      }
    },
    [persistSelection, selectedProjectId, userId]
  );

  const duplicateProject = useCallback(
    async (projectId: string) => {
      if (!userId) throw new Error("You must be signed in to duplicate a project.");
      const sourceRef = doc(db, "projects", projectId);
      const snap = await getDoc(sourceRef);
      if (!snap.exists()) return null;
      const data = snap.data();
      const newName = `${data.name ?? "Project"} Copy`;
      const projectsRef = collection(db, "projects");
      const newDoc = await addDoc(projectsRef, {
        ...data,
        name: newName,
        ownerId: userId,
        memberIds: [userId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const userDocRef = doc(db, "users", userId);
      setSelectedProjectId(newDoc.id);
      await setDoc(userDocRef, { selectedProjectId: newDoc.id }, { merge: true });
      return newDoc.id;
    },
    [userId]
  );

  const acceptInvite = useCallback(
    async (projectId: string, inviteId: string) => {
      if (!userId) throw new Error("You must be signed in to accept an invite.");
      const inviteRef = doc(db, "projects", projectId, "invites", inviteId);
      const snap = await getDoc(inviteRef);
      if (!snap.exists()) return;
      const invite = snap.data();
      await setDoc(doc(db, "projects", projectId, "memberships", userId), { role: invite.role ?? "editor" }, { merge: true });
      await updateDoc(doc(db, "projects", projectId), { memberIds: arrayUnion(userId) });
      await deleteDoc(inviteRef);
    },
    [userId]
  );

  const selectedProfile = useMemo(() => {
    const match = projects.find((proj) => proj.id === selectedProjectId);
    return match?.industryProfile ?? "manufacturing";
  }, [projects, selectedProjectId]);

  const selectedProjectName = useMemo(() => {
    const match = projects.find((proj) => proj.id === selectedProjectId);
    return match?.name ?? "";
  }, [projects, selectedProjectId]);

  const value: ProjectContextValue = {
    userId,
    selectedProjectId,
    selectedProfile,
    selectedProjectName,
    selectProject,
    clearProject,
    projects,
    projectsLoading,
    projectsError,
    createProject,
    renameProject,
    deleteProject,
    duplicateProject,
    acceptInvite,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = (): ProjectContextValue => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
