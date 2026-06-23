import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Node, Edge } from "reactflow";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import type { WhiteboardNodeData, WhiteboardEdgeData, EmissionFactorDefaults } from "../types";
import { cloneNode, cloneEdge } from "../utils";
import { getHistory } from "../scenarios";
import type { ScenarioKey, HistorySnapshotStore, SaveStatus } from "../scenarios";
import { withDefaultCurrentBoard, toPersistedScenarios, stripUndefined } from "../persistence";
import type { SavedWhiteboardState } from "../persistence";

type PendingSave = {
  selectedProjectId: string;
  nodes: Node<WhiteboardNodeData>[];
  edges: Edge<WhiteboardEdgeData>[];
  vsmState: SavedWhiteboardState;
  serializedState: string;
};

type UseSaveStateOptions = {
  selectedProjectId: string | null;
  nodes: Node<WhiteboardNodeData>[];
  edges: Edge<WhiteboardEdgeData>[];
  activeScenario: ScenarioKey;
  dashboardVisible: boolean;
  showCO2Layer: boolean;
  emissionDefaults: EmissionFactorDefaults;
  isCo2TrackingEnabled: boolean;
  scenarioStoreRef: MutableRefObject<Record<ScenarioKey, { nodes: Node<WhiteboardNodeData>[]; edges: Edge<WhiteboardEdgeData>[] }>>;
  scenarioHistoryRef: MutableRefObject<Record<ScenarioKey, HistorySnapshotStore>>;
  co2PromptAckRef: MutableRefObject<Record<ScenarioKey, boolean>>;
  setNodes: Dispatch<SetStateAction<Node<WhiteboardNodeData>[]>>;
  setEdges: Dispatch<SetStateAction<Edge<WhiteboardEdgeData>[]>>;
  setActiveScenario: Dispatch<SetStateAction<ScenarioKey>>;
  setDashboardVisible: Dispatch<SetStateAction<boolean>>;
  setShowCO2Layer: Dispatch<SetStateAction<boolean>>;
  setEmissionDefaults: Dispatch<SetStateAction<EmissionFactorDefaults>>;
  setIsCo2TrackingEnabled: Dispatch<SetStateAction<boolean>>;
  setActiveEdgeId: Dispatch<SetStateAction<string | null>>;
  setActiveNodeId: Dispatch<SetStateAction<string | null>>;
  setOpenSustainabilityNodeId: Dispatch<SetStateAction<string | null>>;
};

export const useSaveState = (options: UseSaveStateOptions) => {
  const {
    selectedProjectId, nodes, edges, activeScenario,
    dashboardVisible, showCO2Layer, emissionDefaults, isCo2TrackingEnabled,
    scenarioStoreRef, scenarioHistoryRef, co2PromptAckRef,
    setNodes, setEdges, setActiveScenario,
    setDashboardVisible, setShowCO2Layer, setEmissionDefaults, setIsCo2TrackingEnabled,
    setActiveEdgeId, setActiveNodeId, setOpenSustainabilityNodeId,
  } = options;

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const hasLoadedProjectRef = useRef(false);
  const isRemoteHydratingRef = useRef(false);
  const lastPersistedStateRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef<PendingSave | null>(null);

  const commitPendingSave = useCallback(async () => {
    const pending = pendingSaveRef.current;
    if (!pending) {
      setSaveStatus("saved");
      return;
    }
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setSaveStatus("saving");
    try {
      await setDoc(
        doc(db, "projects", pending.selectedProjectId),
        {
          nodes: pending.nodes,
          edges: pending.edges,
          vsmState: pending.vsmState,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      lastPersistedStateRef.current = pending.serializedState;
      if (pendingSaveRef.current?.serializedState === pending.serializedState) {
        pendingSaveRef.current = null;
      }
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save whiteboard", error);
      setSaveStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      hasLoadedProjectRef.current = false;
      return;
    }

    hasLoadedProjectRef.current = false;
    const projectRef = doc(db, "projects", selectedProjectId);
    const unsubscribe = onSnapshot(
      projectRef,
      (snapshot) => {
        const data = snapshot.data();
        const saved = data?.vsmState as SavedWhiteboardState | undefined;
        const savedScenarios = saved?.scenarios;
        setSaveStatus("saved");
        if (saved) setLastSavedAt(new Date());

        if (saved) {
          const serializedSaved = JSON.stringify(saved);
          if (serializedSaved === lastPersistedStateRef.current) {
            hasLoadedProjectRef.current = true;
            return;
          }
          lastPersistedStateRef.current = serializedSaved;
        }

        isRemoteHydratingRef.current = true;

        if (savedScenarios) {
          const currentState = withDefaultCurrentBoard(
            savedScenarios.current?.nodes,
            savedScenarios.current?.edges
          );
          const nextScenarios: Record<ScenarioKey, { nodes: Node<WhiteboardNodeData>[]; edges: Edge<WhiteboardEdgeData>[] }> = {
            current: currentState,
            future: {
              nodes: (savedScenarios.future?.nodes ?? []).map(cloneNode),
              edges: (savedScenarios.future?.edges ?? []).map(cloneEdge),
            },
            whatIf: {
              nodes: (savedScenarios.whatIf?.nodes ?? []).map(cloneNode),
              edges: (savedScenarios.whatIf?.edges ?? []).map(cloneEdge),
            },
          };
          const savedActiveScenario = saved?.activeScenario ?? "current";
          const nextActiveScenario = savedActiveScenario;
          scenarioStoreRef.current = nextScenarios;
          scenarioHistoryRef.current = {
            current: getHistory(),
            future: getHistory(),
            whatIf: getHistory(),
          };
          co2PromptAckRef.current = {
            current: Boolean(saved.co2PromptAck?.current),
            future: Boolean(saved.co2PromptAck?.future),
            whatIf: Boolean(saved.co2PromptAck?.whatIf),
          };
          setDashboardVisible(saved.dashboardVisible ?? true);
          setShowCO2Layer(saved.showCO2Layer ?? false);
          setEmissionDefaults(saved.emissionDefaults ?? { electricity: "", materials: "", transport: "" });
          setIsCo2TrackingEnabled(saved.isCo2TrackingEnabled ?? false);
          setActiveScenario(nextActiveScenario);
          setNodes(nextScenarios[nextActiveScenario].nodes.map(cloneNode));
          setEdges(nextScenarios[nextActiveScenario].edges.map(cloneEdge));
        } else {
          const legacyNodes = data?.nodes as Node<WhiteboardNodeData>[] | undefined;
          const legacyEdges = data?.edges as Edge<WhiteboardEdgeData>[] | undefined;
          const currentState = withDefaultCurrentBoard(legacyNodes, legacyEdges);
          scenarioStoreRef.current = {
            current: currentState,
            future: { nodes: [], edges: [] },
            whatIf: { nodes: [], edges: [] },
          };
          setActiveScenario("current");
          setNodes(currentState.nodes.map(cloneNode));
          setEdges(currentState.edges.map(cloneEdge));
        }

        setActiveEdgeId(null);
        setActiveNodeId(null);
        setOpenSustainabilityNodeId(null);
        hasLoadedProjectRef.current = true;
        requestAnimationFrame(() => {
          isRemoteHydratingRef.current = false;
        });
      },
      (error) => {
        console.error("Failed to load saved whiteboard", error);
        hasLoadedProjectRef.current = true;
        isRemoteHydratingRef.current = false;
      }
    );

    return () => {
      unsubscribe();
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [selectedProjectId, setNodes, setEdges]);

  useEffect(() => {
    if (!selectedProjectId || !hasLoadedProjectRef.current || isRemoteHydratingRef.current) return;

    const scenarios = {
      ...scenarioStoreRef.current,
      [activeScenario]: {
        nodes: nodes.map(cloneNode),
        edges: edges.map(cloneEdge),
      },
    };
    const persistedScenarios = toPersistedScenarios(scenarios);
    const vsmState: SavedWhiteboardState = stripUndefined({
      activeScenario,
      scenarios: persistedScenarios,
      co2PromptAck: co2PromptAckRef.current,
      dashboardVisible,
      showCO2Layer,
      emissionDefaults,
      isCo2TrackingEnabled,
    });
    const serializedState = JSON.stringify(vsmState);

    if (serializedState === lastPersistedStateRef.current) {
      if (!pendingSaveRef.current) setSaveStatus("saved");
      return;
    }

    pendingSaveRef.current = {
      selectedProjectId,
      nodes: persistedScenarios.current.nodes,
      edges: persistedScenarios.current.edges,
      vsmState,
      serializedState,
    };
    setSaveStatus("saving");

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      void commitPendingSave();
    }, 250);
  }, [
    selectedProjectId, nodes, edges, activeScenario,
    dashboardVisible, showCO2Layer, emissionDefaults, isCo2TrackingEnabled,
    commitPendingSave,
  ]);

  useEffect(() => {
    const flushPendingSave = () => {
      const pending = pendingSaveRef.current;
      if (!pending) return;
      void commitPendingSave();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushPendingSave();
    };
    window.addEventListener("beforeunload", flushPendingSave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", flushPendingSave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [commitPendingSave]);

  return { saveStatus, lastSavedAt, commitPendingSave, isRemoteHydratingRef };
};
