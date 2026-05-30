import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { WhiteboardEdge, WhiteboardNode } from "../nodes/NodeTypes";
import type { FlowMetrics } from "../insights/analytics";

export interface ScenarioVersion {
  id: string;
  title: string;
  notes?: string;
  createdAt?: { seconds: number };
  createdBy?: string;
  status?: "draft" | "pending" | "approved";
  metrics?: FlowMetrics;
  nodes?: WhiteboardNode[];
  edges?: WhiteboardEdge[];
  comments?: Array<{
    id: string;
    userId: string;
    text: string;
    createdAt?: { seconds: number };
  }>;
}

interface ScenarioVersionsContextValue {
  versions: ScenarioVersion[];
  selectedVersionId: string | null;
  selectVersion: (id: string | null) => void;
  freezeVersion: (payload: {
    title: string;
    notes?: string;
    status?: string;
    metrics: FlowMetrics;
    nodes: WhiteboardNode[];
    edges: WhiteboardEdge[];
    userId: string;
  }) => Promise<void>;
  addComment: (versionId: string, userId: string, text: string) => Promise<void>;
  loading: boolean;
}

const ScenarioVersionsContext = createContext<ScenarioVersionsContextValue | undefined>(undefined);

interface ProviderProps extends PropsWithChildren {
  projectId: string | null;
  scenarioId: string;
}

export const ScenarioVersionsProvider = ({ projectId, scenarioId, children }: ProviderProps) => {
  const [versions, setVersions] = useState<ScenarioVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setVersions([]);
      return;
    }
    setLoading(true);
    const versionsRef = collection(db, "projects", projectId, "scenarios", scenarioId, "versions");
    const unsubscribe = onSnapshot(
      versionsRef,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ScenarioVersion, "id">),
        }));
        setVersions(next);
        setLoading(false);
        if (next.length && !selectedVersionId) {
          setSelectedVersionId(next[0].id);
        }
      },
      () => setLoading(false)
    );
    return () => unsubscribe();
  }, [projectId, scenarioId]);

  const freezeVersion: ScenarioVersionsContextValue["freezeVersion"] = async ({
    title,
    notes,
    status = "pending",
    metrics,
    nodes,
    edges,
    userId,
  }) => {
    if (!projectId) return;
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

  const addComment: ScenarioVersionsContextValue["addComment"] = async (versionId, userId, text) => {
    if (!projectId) return;
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

  const value = useMemo(
    () => ({
      versions,
      selectedVersionId,
      selectVersion: setSelectedVersionId,
      freezeVersion,
      addComment,
      loading,
    }),
    [versions, selectedVersionId, freezeVersion, addComment, loading]
  );

  return <ScenarioVersionsContext.Provider value={value}>{children}</ScenarioVersionsContext.Provider>;
};

export const useScenarioVersions = () => {
  const ctx = useContext(ScenarioVersionsContext);
  if (!ctx) throw new Error("useScenarioVersions must be used within ScenarioVersionsProvider");
  return ctx;
};
