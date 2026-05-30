import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { addDoc, arrayUnion, collection, doc, onSnapshot, serverTimestamp, updateDoc, } from "firebase/firestore";
import { db } from "../firebase";
const ScenarioVersionsContext = createContext(undefined);
export const ScenarioVersionsProvider = ({ projectId, scenarioId, children }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    useEffect(() => {
        if (!projectId) {
            setVersions([]);
            return;
        }
        setLoading(true);
        const versionsRef = collection(db, "projects", projectId, "scenarios", scenarioId, "versions");
        const unsubscribe = onSnapshot(versionsRef, (snapshot) => {
            const next = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));
            setVersions(next);
            setLoading(false);
            if (next.length && !selectedVersionId) {
                setSelectedVersionId(next[0].id);
            }
        }, () => setLoading(false));
        return () => unsubscribe();
    }, [projectId, scenarioId]);
    const freezeVersion = async ({ title, notes, status = "pending", metrics, nodes, edges, userId, }) => {
        if (!projectId)
            return;
        const versionsRef = collection(db, "projects", projectId, "scenarios", scenarioId, "versions");
        await addDoc(versionsRef, {
            title,
            notes,
            status,
            metrics,
            nodes,
            edges,
            createdBy: userId,
            createdAt: serverTimestamp(),
            comments: [],
        });
    };
    const addComment = async (versionId, userId, text) => {
        if (!projectId)
            return;
        const versionRef = doc(db, "projects", projectId, "scenarios", scenarioId, "versions", versionId);
        await updateDoc(versionRef, {
            comments: arrayUnion({
                id: crypto.randomUUID(),
                userId,
                text,
                createdAt: serverTimestamp(),
            }),
        });
    };
    const value = useMemo(() => ({
        versions,
        selectedVersionId,
        selectVersion: setSelectedVersionId,
        freezeVersion,
        addComment,
        loading,
    }), [versions, selectedVersionId, freezeVersion, addComment, loading]);
    return _jsx(ScenarioVersionsContext.Provider, { value: value, children: children });
};
export const useScenarioVersions = () => {
    const ctx = useContext(ScenarioVersionsContext);
    if (!ctx)
        throw new Error("useScenarioVersions must be used within ScenarioVersionsProvider");
    return ctx;
};
