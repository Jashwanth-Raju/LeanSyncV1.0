import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
export const useProjectCanvas = ({ projectId, fallbackNodes, fallbackEdges, }) => {
    const [nodes, setNodes] = useState(fallbackNodes);
    const [edges, setEdges] = useState(fallbackEdges);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [metadataState, setMetadataState] = useState(null);
    const lastSnapshotRef = useRef(JSON.stringify({ nodes: fallbackNodes, edges: fallbackEdges }));
    const saveTimerRef = useRef(null);
    useEffect(() => {
        if (!projectId) {
            setNodes(fallbackNodes);
            setEdges(fallbackEdges);
            setLoading(false);
            setError(null);
            lastSnapshotRef.current = JSON.stringify({ nodes: fallbackNodes, edges: fallbackEdges });
            return;
        }
        setLoading(true);
        setError(null);
        const docRef = doc(db, "projects", projectId);
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            const data = snapshot.data();
            const nextNodes = data?.nodes ?? fallbackNodes;
            const nextEdges = data?.edges ?? fallbackEdges;
            const metadata = data?.metadata ?? {};
            setNodes(nextNodes);
            setEdges(nextEdges);
            setMetadataState(metadata);
            lastSnapshotRef.current = JSON.stringify({ nodes: nextNodes, edges: nextEdges, metadata });
            setLoading(false);
        }, (err) => {
            console.error("Canvas listener error", err);
            setError("Unable to load board data.");
            setLoading(false);
        });
        return () => {
            unsubscribe();
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }
        };
    }, [projectId, fallbackNodes, fallbackEdges]);
    const saveCanvasState = useCallback((nextNodes, nextEdges, metadata) => {
        if (!projectId)
            return;
        const mergedMetadata = { ...(metadataState ?? {}), ...(metadata ?? {}) };
        const serialized = JSON.stringify({ nodes: nextNodes, edges: nextEdges, metadata: mergedMetadata });
        if (serialized === lastSnapshotRef.current)
            return;
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(async () => {
            try {
                setIsSaving(true);
                await setDoc(doc(db, "projects", projectId), {
                    nodes: nextNodes,
                    edges: nextEdges,
                    metadata: mergedMetadata,
                    updatedAt: serverTimestamp(),
                }, { merge: true });
                lastSnapshotRef.current = serialized;
                setMetadataState(mergedMetadata);
            }
            catch (err) {
                console.error("Failed to save canvas", err);
                setError("Failed to save board changes.");
            }
            finally {
                setIsSaving(false);
            }
        }, 800);
    }, [projectId, metadataState]);
    return { nodes, edges, loading, error, isSaving, saveCanvasState, metadata: metadataState };
};
