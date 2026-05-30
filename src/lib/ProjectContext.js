import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where, } from "firebase/firestore";
import { db } from "../firebase";
const ProjectContext = createContext(undefined);
export const ProjectProvider = ({ userId, children }) => {
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState(null);
    useEffect(() => {
        let unsubscribe;
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
                }
                else {
                    const storedSelection = userSnapshot.data()?.selectedProjectId;
                    if (!cancelled) {
                        setSelectedProjectId(storedSelection ?? null);
                    }
                }
            }
            catch (error) {
                console.error("Failed to load user preferences", error);
                if (!cancelled) {
                    setProjectsError("Failed to load your workspace preferences.");
                }
            }
            const projectsRef = collection(db, "projects");
            const projectsQuery = query(projectsRef, where("memberIds", "array-contains", userId), orderBy("updatedAt", "desc"));
            unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
                const nextProjects = snapshot.docs.map((docSnap) => {
                    const data = docSnap.data();
                    const industryProfile = data.industryProfile ?? "manufacturing";
                    return { id: docSnap.id, ...data, industryProfile };
                });
                if (!cancelled) {
                    setProjects(nextProjects);
                    setProjectsLoading(false);
                }
            }, (error) => {
                console.error("Project listener error", error);
                if (!cancelled) {
                    setProjectsError("Unable to load projects.");
                    setProjectsLoading(false);
                }
            });
        };
        bootstrap();
        return () => {
            cancelled = true;
            if (unsubscribe)
                unsubscribe();
        };
    }, [userId]);
    const persistSelection = useCallback(async (projectId) => {
        if (!userId)
            return;
        const userDocRef = doc(db, "users", userId);
        try {
            await setDoc(userDocRef, { selectedProjectId: projectId }, { merge: true });
        }
        catch (error) {
            console.error("Failed to persist selected project", error);
        }
    }, [userId]);
    const selectProject = useCallback((projectId) => {
        setSelectedProjectId(projectId);
        void persistSelection(projectId);
    }, [persistSelection]);
    const clearProject = useCallback(() => {
        setSelectedProjectId(null);
        void persistSelection(null);
    }, [persistSelection]);
    const createProject = useCallback(async (name, industryProfile) => {
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
    }, [userId]);
    const renameProject = useCallback(async (projectId, name) => {
        if (!userId) {
            throw new Error("You must be signed in to update a project.");
        }
        const trimmed = name.trim();
        if (!trimmed)
            return;
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, { name: trimmed, updatedAt: serverTimestamp() });
    }, [userId]);
    const deleteProject = useCallback(async (projectId) => {
        if (!userId) {
            throw new Error("You must be signed in to delete a project.");
        }
        const projectRef = doc(db, "projects", projectId);
        await deleteDoc(projectRef);
        if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
            await persistSelection(null);
        }
    }, [persistSelection, selectedProjectId, userId]);
    const duplicateProject = useCallback(async (projectId) => {
        if (!userId)
            throw new Error("You must be signed in to duplicate a project.");
        const sourceRef = doc(db, "projects", projectId);
        const snap = await getDoc(sourceRef);
        if (!snap.exists())
            return null;
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
    }, [userId]);
    const acceptInvite = useCallback(async (projectId, inviteId) => {
        if (!userId)
            throw new Error("You must be signed in to accept an invite.");
        const inviteRef = doc(db, "projects", projectId, "invites", inviteId);
        const snap = await getDoc(inviteRef);
        if (!snap.exists())
            return;
        const invite = snap.data();
        await setDoc(doc(db, "projects", projectId, "memberships", userId), { role: invite.role ?? "editor" }, { merge: true });
        await updateDoc(doc(db, "projects", projectId), { memberIds: invite.memberIds ? invite.memberIds.concat(userId) : [userId] });
        await deleteDoc(inviteRef);
    }, [userId]);
    const selectedProfile = useMemo(() => {
        const match = projects.find((proj) => proj.id === selectedProjectId);
        return match?.industryProfile ?? "manufacturing";
    }, [projects, selectedProjectId]);
    const value = {
        userId,
        selectedProjectId,
        selectedProfile,
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
    return _jsx(ProjectContext.Provider, { value: value, children: children });
};
export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
};
