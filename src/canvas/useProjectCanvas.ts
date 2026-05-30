import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { WhiteboardEdge, WhiteboardNode } from "../nodes/NodeTypes";

interface UseProjectCanvasArgs {
  projectId: string | null;
  fallbackNodes: WhiteboardNode[];
  fallbackEdges: WhiteboardEdge[];
}

interface ProjectCanvasResult {
  nodes: WhiteboardNode[];
  edges: WhiteboardEdge[];
  loading: boolean;
  error: string | null;
  isSaving: boolean;
  saveCanvasState: (
    nodes: WhiteboardNode[],
    edges: WhiteboardEdge[],
    metadata?: Record<string, unknown>
  ) => void;
  metadata: Record<string, unknown> | null;
}

export const useProjectCanvas = ({
  projectId,
  fallbackNodes,
  fallbackEdges,
}: UseProjectCanvasArgs): ProjectCanvasResult => {
  const [nodes, setNodes] = useState<WhiteboardNode[]>(fallbackNodes);
  const [edges, setEdges] = useState<WhiteboardEdge[]>(fallbackEdges);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [metadataState, setMetadataState] = useState<Record<string, unknown> | null>(null);
  const lastSnapshotRef = useRef<string>(JSON.stringify({ nodes: fallbackNodes, edges: fallbackEdges }));
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        const data = snapshot.data();
        const nextNodes = (data?.nodes as WhiteboardNode[]) ?? fallbackNodes;
        const nextEdges = (data?.edges as WhiteboardEdge[]) ?? fallbackEdges;
        const metadata = data?.metadata ?? {};
        setNodes(nextNodes);
        setEdges(nextEdges);
        setMetadataState(metadata);
        lastSnapshotRef.current = JSON.stringify({ nodes: nextNodes, edges: nextEdges, metadata });
        setLoading(false);
      },
      (err) => {
        console.error("Canvas listener error", err);
        setError("Unable to load board data.");
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [projectId, fallbackNodes, fallbackEdges]);

  const saveCanvasState = useCallback(
    (nextNodes: WhiteboardNode[], nextEdges: WhiteboardEdge[], metadata?: Record<string, unknown>) => {
      if (!projectId) return;
      const mergedMetadata = { ...(metadataState ?? {}), ...(metadata ?? {}) };
      const serialized = JSON.stringify({ nodes: nextNodes, edges: nextEdges, metadata: mergedMetadata });
      if (serialized === lastSnapshotRef.current) return;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await setDoc(
            doc(db, "projects", projectId),
            {
              nodes: nextNodes,
              edges: nextEdges,
              metadata: mergedMetadata,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
          lastSnapshotRef.current = serialized;
          setMetadataState(mergedMetadata);
        } catch (err) {
          console.error("Failed to save canvas", err);
          setError("Failed to save board changes.");
        } finally {
          setIsSaving(false);
        }
      }, 800);
    },
    [projectId, metadataState]
  );

  return { nodes, edges, loading, error, isSaving, saveCanvasState, metadata: metadataState };
};
