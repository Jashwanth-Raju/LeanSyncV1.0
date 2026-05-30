import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";
import { useProject } from "./ProjectContext";

export interface ProjectMember {
  id: string;
  email?: string;
  displayName?: string;
  role: "owner" | "editor" | "viewer";
}

export interface PresenceUser {
  userId: string;
  displayName?: string;
  lastActive: number;
}

interface CollaborationContextValue {
  members: ProjectMember[];
  invites: ProjectMember[];
  presence: PresenceUser[];
  sendInvite: (email: string, role: ProjectMember["role"]) => Promise<void>;
  updateRole: (memberId: string, role: ProjectMember["role"]) => Promise<void>;
}

const CollaborationContext = createContext<CollaborationContextValue | undefined>(undefined);

export const CollaborationProvider = ({ children }: PropsWithChildren<{}>) => {
  const { userId, selectedProjectId } = useProject();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [invites, setInvites] = useState<ProjectMember[]>([]);
  const [presence, setPresence] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!userId || !selectedProjectId) {
      setMembers([]);
      setInvites([]);
      setPresence([]);
      return;
    }

    const membersRef = collection(db, "projects", selectedProjectId, "memberships");
    const unsubscribeMembers = onSnapshot(membersRef, (snapshot) => {
      const next = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as DocumentData) })) as ProjectMember[];
      setMembers(next);
    });

    const invitesRef = collection(db, "projects", selectedProjectId, "invites");
    const unsubscribeInvites = onSnapshot(invitesRef, (snapshot) => {
      const next = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as DocumentData) })) as ProjectMember[];
      setInvites(next);
    });

    const presenceRef = collection(db, "projects", selectedProjectId, "presence");
    const unsubscribePresence = onSnapshot(presenceRef, (snapshot) => {
      const now = Date.now();
      const online = snapshot.docs
        .map((docSnap) => ({ userId: docSnap.id, ...(docSnap.data() as DocumentData) }))
        .filter((entry) => now - ((entry as PresenceUser).lastActive ?? 0) < 60_000) as PresenceUser[];
      setPresence(online);
    });

    return () => {
      unsubscribeMembers();
      unsubscribeInvites();
      unsubscribePresence();
    };
  }, [userId, selectedProjectId]);

  useEffect(() => {
    if (!userId || !selectedProjectId) return;
    const presenceRef = doc(db, "projects", selectedProjectId, "presence", userId);
    const interval = setInterval(() => {
      setDoc(presenceRef, { lastActive: Date.now() }, { merge: true }).catch(console.error);
    }, 20_000);
    setDoc(presenceRef, { lastActive: Date.now() }, { merge: true }).catch(console.error);
    return () => clearInterval(interval);
  }, [userId, selectedProjectId]);

  const sendInvite = async (email: string, role: ProjectMember["role"]) => {
    if (!selectedProjectId) return;
    const invitesRef = collection(db, "projects", selectedProjectId, "invites");
    const inviteDoc = doc(invitesRef);
    await setDoc(inviteDoc, { email, role, status: "pending", createdAt: serverTimestamp() });
  };

  const updateRole = async (memberId: string, role: ProjectMember["role"]) => {
    if (!selectedProjectId) return;
    const membershipRef = doc(db, "projects", selectedProjectId, "memberships", memberId);
    await updateDoc(membershipRef, { role });
  };

  const value = useMemo(
    () => ({ members, invites, presence, sendInvite, updateRole }),
    [members, invites, presence]
  );

  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
};

export const useCollaboration = () => {
  const ctx = useContext(CollaborationContext);
  if (!ctx) {
    throw new Error("useCollaboration must be used within CollaborationProvider");
  }
  return ctx;
};
