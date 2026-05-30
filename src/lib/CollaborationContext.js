import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, setDoc, updateDoc, serverTimestamp, } from "firebase/firestore";
import { db } from "../firebase";
import { useProject } from "./ProjectContext";
const CollaborationContext = createContext(undefined);
export const CollaborationProvider = ({ children }) => {
    const { userId, selectedProjectId } = useProject();
    const [members, setMembers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [presence, setPresence] = useState([]);
    useEffect(() => {
        if (!userId || !selectedProjectId) {
            setMembers([]);
            setInvites([]);
            setPresence([]);
            return;
        }
        const membersRef = collection(db, "projects", selectedProjectId, "memberships");
        const unsubscribeMembers = onSnapshot(membersRef, (snapshot) => {
            const next = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
            setMembers(next);
        });
        const invitesRef = collection(db, "projects", selectedProjectId, "invites");
        const unsubscribeInvites = onSnapshot(invitesRef, (snapshot) => {
            const next = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
            setInvites(next);
        });
        const presenceRef = collection(db, "projects", selectedProjectId, "presence");
        const unsubscribePresence = onSnapshot(presenceRef, (snapshot) => {
            const now = Date.now();
            const online = snapshot.docs
                .map((docSnap) => ({ userId: docSnap.id, ...docSnap.data() }))
                .filter((entry) => now - (entry.lastActive ?? 0) < 60_000);
            setPresence(online);
        });
        return () => {
            unsubscribeMembers();
            unsubscribeInvites();
            unsubscribePresence();
        };
    }, [userId, selectedProjectId]);
    useEffect(() => {
        if (!userId || !selectedProjectId)
            return;
        const presenceRef = doc(db, "projects", selectedProjectId, "presence", userId);
        const interval = setInterval(() => {
            setDoc(presenceRef, { lastActive: Date.now() }, { merge: true }).catch(console.error);
        }, 20_000);
        setDoc(presenceRef, { lastActive: Date.now() }, { merge: true }).catch(console.error);
        return () => clearInterval(interval);
    }, [userId, selectedProjectId]);
    const sendInvite = async (email, role) => {
        if (!selectedProjectId)
            return;
        const invitesRef = collection(db, "projects", selectedProjectId, "invites");
        const inviteDoc = doc(invitesRef);
        await setDoc(inviteDoc, { email, role, status: "pending", createdAt: serverTimestamp() });
    };
    const updateRole = async (memberId, role) => {
        if (!selectedProjectId)
            return;
        const membershipRef = doc(db, "projects", selectedProjectId, "memberships", memberId);
        await updateDoc(membershipRef, { role });
    };
    const value = useMemo(() => ({ members, invites, presence, sendInvite, updateRole }), [members, invites, presence]);
    return _jsx(CollaborationContext.Provider, { value: value, children: children });
};
export const useCollaboration = () => {
    const ctx = useContext(CollaborationContext);
    if (!ctx) {
        throw new Error("useCollaboration must be used within CollaborationProvider");
    }
    return ctx;
};
