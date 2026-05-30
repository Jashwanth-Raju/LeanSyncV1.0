/** @jsxImportSource react */
import * as React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactFlow, {
  MarkerType,
  addEdge,
  Background,
  ConnectionLineType,
  Controls,
  Handle,
  MiniMap,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";
import type {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlowInstance,
} from "reactflow";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import "reactflow/dist/style.css";

import {
  nodeLibrary,
  edgeLibrary,
  edgeThemeMap,
  DEFAULT_EDGE_VARIANT,
  initialNodes,
  initialEdges,
  SIDEBAR_WIDTH,
  TAB_BAR_HEIGHT,
  CANVAS_TOP_OFFSET,
  nodeMetaFields,
  iconMap,
} from "./whiteboard/data";
import {
  cloneEdge,
  cloneNode,
  decorateEdge,
  formatMinutes,
  parseDurationToMinutes,
  parseNumericValue,
} from "./whiteboard/utils";
import type {
  DashboardCard,
  HistorySnapshot,
  LibraryCategory,
  LibraryNode,
  WhiteboardEdgeData,
  WhiteboardNodeData,
  EmissionFactorDefaults,
} from "./whiteboard/types";
import { NodeLibraryPanel } from "./whiteboard/components/NodeLibraryPanel";
import { ToolbarPanel } from "./whiteboard/components/ToolbarPanel";
import { DashboardOverlay } from "./whiteboard/components/DashboardOverlay";
import { InspectorPanel } from "./whiteboard/components/InspectorPanel";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AnalyticsPanel } from "./whiteboard/components/AnalyticsPanel";
import { SustainabilityBadge } from "./whiteboard/components/SustainabilityBadge";
import { SustainabilityPopup } from "./whiteboard/components/SustainabilityPopup";
import type { NodeProps } from "reactflow";
import { co2ColorScale, computeNodeCO2, parseCO2Numeric } from "./whiteboard/utils/co2";
import { EmissionWizard, type EmissionWizardStage } from "./whiteboard/components/EmissionWizard";
import { db } from "./firebase";
import { useProject } from "./lib/ProjectContext";

const withEmissionDefaults = (
  data: WhiteboardNodeData,
  defaults: EmissionFactorDefaults | null,
  trackingEnabled: boolean
): WhiteboardNodeData => {
  if (!trackingEnabled || !defaults) return data;
  const sustainability = { ...(data.sustainability ?? {}) };

  const applyDefault = (
    key: keyof NonNullable<WhiteboardNodeData["sustainability"]>,
    value: string
  ) => {
    const current = sustainability[key];
    if (!value) return;
    if (!current || String(current).trim().length === 0) {
      sustainability[key] = value;
    }
  };

  applyDefault("electricityFactor", defaults.electricity);
  applyDefault("materialFactor", defaults.materials);
  applyDefault("transportFactor", defaults.transport);

  return {
    ...data,
    sustainability,
  };
};

type ScenarioKey = "current" | "future" | "whatIf";

const SCENARIO_META: Record<ScenarioKey, { label: string; subtitle: string }> = {
  current: { label: "Current State", subtitle: "As-is operations" },
  future: { label: "Future State", subtitle: "Design the next iteration" },
  whatIf: { label: "What-if Lab", subtitle: "Run experiments safely" },
};

const SCENARIO_ORDER: ScenarioKey[] = ["current", "future", "whatIf"];

const computeDashboardMetrics = (
  nodes: Node<WhiteboardNodeData>[]
) => {
  const totals = {
    totalSteps: nodes.length,
    valueAddedSteps: 0,
    enablerSteps: 0,
    nonValueAddedSteps: 0,
    processMinutes: 0,
    processCount: 0,
    cycleMinutes: 0,
    cycleCount: 0,
    leadMinutes: 0,
    leadCount: 0,
    setupMinutes: 0,
    setupCount: 0,
    taktMinutes: 0,
    taktCount: 0,
    valueAddedMinutes: 0,
    nonValueAddedMinutes: 0,
    delayMinutes: 0,
  };

  nodes.forEach((node) => {
    const variant = node.data.valueType ?? "enabler";
    if (variant === "value-added") totals.valueAddedSteps += 1;
    else if (variant === "non-value-added") totals.nonValueAddedSteps += 1;
    else totals.enablerSteps += 1;

    const process = parseDurationToMinutes(node.data.processTime);
    const cycle = parseDurationToMinutes(node.data.cycleTime);
    const lead = parseDurationToMinutes(node.data.leadTime);
    const setup = parseDurationToMinutes(node.data.setupTime);
    const takt = parseDurationToMinutes(node.data.taktTime);

    if (process !== null) {
      totals.processMinutes += process;
      totals.processCount += 1;
      if (variant === "value-added") totals.valueAddedMinutes += process;
      else totals.nonValueAddedMinutes += process;
    }
    if (cycle !== null) {
      totals.cycleMinutes += cycle;
      totals.cycleCount += 1;
    }
    if (lead !== null) {
      totals.leadMinutes += lead;
      totals.leadCount += 1;
    }
    if (setup !== null) {
      totals.setupMinutes += setup;
      totals.setupCount += 1;
    }
    if (takt !== null) {
      totals.taktMinutes += takt;
      totals.taktCount += 1;
    }
  });

  const averageLead = totals.leadCount
    ? totals.leadMinutes / totals.leadCount
    : null;
  const averageCycle = totals.cycleCount
    ? totals.cycleMinutes / totals.cycleCount
    : null;
  const averageTakt = totals.taktCount
    ? totals.taktMinutes / totals.taktCount
    : null;
  const taktGap =
    averageCycle !== null && averageTakt !== null
      ? averageCycle - averageTakt
      : null;
  const setupAverage = totals.setupCount
    ? totals.setupMinutes / totals.setupCount
    : null;
  const valueAddedRatio = totals.processMinutes
    ? (totals.valueAddedMinutes / totals.processMinutes) * 100
    : null;

  const cards: DashboardCard[] = [
    {
      title: "Steps",
      primary: `${totals.totalSteps}`,
      accent: `${totals.valueAddedSteps} value-add`,
      footer: `${totals.enablerSteps} enabler · ${totals.nonValueAddedSteps} non-value`,
    },
    {
      title: "Lead Time",
      primary: formatMinutes(averageLead),
      accent: `Process ${formatMinutes(totals.processMinutes)}`,
      footer: `Cycle ${formatMinutes(totals.cycleMinutes)}`,
    },
    {
      title: "Value Mix",
      primary: valueAddedRatio ? `${valueAddedRatio.toFixed(1)}% VA` : "--",
      accent: `${formatMinutes(totals.valueAddedMinutes)} value-add`,
      footer: `${formatMinutes(totals.nonValueAddedMinutes)} non-value`,
    },
    {
      title: "Cycle vs Takt",
      primary: averageCycle ? formatMinutes(averageCycle) : "--",
      accent: averageTakt ? `Takt ${formatMinutes(averageTakt)}` : undefined,
      footer:
        averageCycle && averageTakt && taktGap !== null
          ? `${taktGap > 0 ? "+" : ""}${formatMinutes(Math.abs(taktGap))} ${
              taktGap > 0 ? "over" : taktGap < 0 ? "under" : "on"
            } takt`
          : undefined,
    },
    {
      title: "Setup & Delay",
      primary: formatMinutes(totals.delayMinutes),
      accent: totals.delayMinutes ? "Wait / queue" : undefined,
      footer: setupAverage ? `Avg setup ${formatMinutes(setupAverage)}` : undefined,
    },
  ];

  return { totals, cards };
};

const getHistory = () => ({ past: [], future: [] }) as HistorySnapshotStore;

type HistorySnapshotStore = {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
};

type SavedWhiteboardState = {
  activeScenario?: ScenarioKey;
  scenarios?: Partial<Record<ScenarioKey, { nodes: Node<WhiteboardNodeData>[]; edges: Edge<WhiteboardEdgeData>[] }>>;
  co2PromptAck?: Partial<Record<ScenarioKey, boolean>>;
  dashboardVisible?: boolean;
  showCO2Layer?: boolean;
  emissionDefaults?: EmissionFactorDefaults;
  isCo2TrackingEnabled?: boolean;
};

type SaveStatus = "saved" | "saving" | "error";

const stripUndefined = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const withDefaultCurrentBoard = (
  nodes: Node<WhiteboardNodeData>[] | undefined,
  edges: Edge<WhiteboardEdgeData>[] | undefined
) => ({
  nodes: nodes && nodes.length > 0 ? nodes.map(cloneNode) : initialNodes.map(cloneNode),
  edges: nodes && nodes.length > 0 ? (edges ?? []).map(cloneEdge) : initialEdges.map(cloneEdge),
});

const toPersistedNodes = (nodes: Node<WhiteboardNodeData>[]) =>
  nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  })) as Node<WhiteboardNodeData>[];

const toPersistedEdges = (edges: Edge<WhiteboardEdgeData>[]) =>
  edges.map((edge) => ({
    id: edge.id,
    type: edge.type,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: edge.data,
    label: edge.label,
  })) as Edge<WhiteboardEdgeData>[];

const toPersistedScenarios = (
  scenarios: Record<ScenarioKey, { nodes: Node<WhiteboardNodeData>[]; edges: Edge<WhiteboardEdgeData>[] }>
) =>
  stripUndefined({
    current: {
      nodes: toPersistedNodes(scenarios.current.nodes),
      edges: toPersistedEdges(scenarios.current.edges),
    },
    future: {
      nodes: toPersistedNodes(scenarios.future.nodes),
      edges: toPersistedEdges(scenarios.future.edges),
    },
    whatIf: {
      nodes: toPersistedNodes(scenarios.whatIf.nodes),
      edges: toPersistedEdges(scenarios.whatIf.edges),
    },
  });

const Whiteboard: React.FC = () => {
  const { selectedProjectId } = useProject();
  const [nodes, setNodes, rfOnNodesChange] = useNodesState<WhiteboardNodeData>(
    initialNodes.map(cloneNode)
  );
  const [edges, setEdges, rfOnEdgesChange] = useEdgesState<WhiteboardEdgeData>(
    initialEdges.map(cloneEdge)
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"canvas" | "insights">("canvas");
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("current");
  const [dashboardVisible, setDashboardVisible] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [openSustainabilityNodeId, setOpenSustainabilityNodeId] = useState<string | null>(null);
  const [showCO2Layer, setShowCO2Layer] = useState(false);
  const [emissionDefaults, setEmissionDefaults] = useState<EmissionFactorDefaults>({
    electricity: "",
    materials: "",
    transport: "",
  });
  const [isCo2TrackingEnabled, setIsCo2TrackingEnabled] = useState(false);
  const [emissionWizardOpen, setEmissionWizardOpen] = useState(false);
  const [emissionWizardStage, setEmissionWizardStage] =
    useState<EmissionWizardStage>("prompt");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerCategory, setDrawerCategory] = useState<LibraryCategory | null>(null);
  const reactFlowWrapperRef = useRef<HTMLDivElement | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<WhiteboardNodeData, WhiteboardEdgeData> | null>(
      null
    );
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const scenarioStoreRef = useRef<Record<ScenarioKey, { nodes: Node<WhiteboardNodeData>[]; edges: Edge<WhiteboardEdgeData>[] }>>({
    current: {
      nodes: initialNodes.map(cloneNode),
      edges: initialEdges.map(cloneEdge),
    },
    future: {
      nodes: [],
      edges: [],
    },
    whatIf: {
      nodes: [],
      edges: [],
    },
  });
  const scenarioHistoryRef = useRef<Record<ScenarioKey, HistorySnapshotStore>>({
    current: getHistory(),
    future: getHistory(),
    whatIf: getHistory(),
  });
  const co2PromptAckRef = useRef<Record<ScenarioKey, boolean>>({
    current: false,
    future: false,
    whatIf: false,
  });
  const isApplyingRef = useRef(false);
  const isSwitchingScenarioRef = useRef(false);
  const isRemoteHydratingRef = useRef(false);
  const hasLoadedProjectRef = useRef(false);
  const lastPersistedStateRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef<{
    selectedProjectId: string;
    nodes: Node<WhiteboardNodeData>[];
    edges: Edge<WhiteboardEdgeData>[];
    vsmState: SavedWhiteboardState;
    serializedState: string;
  } | null>(null);
  const toolbarHideTimeoutRef = useRef<number | null>(null);

  const bumpToolbarVisibility = useCallback(() => {
    if (toolbarCollapsed) return;
    setToolbarVisible(true);
    if (toolbarHideTimeoutRef.current) {
      window.clearTimeout(toolbarHideTimeoutRef.current);
    }
    toolbarHideTimeoutRef.current = window.setTimeout(() => {
      setToolbarVisible(false);
    }, 2500);
  }, [toolbarCollapsed]);

  const hideToolbar = useCallback(() => {
    if (toolbarHideTimeoutRef.current) {
      window.clearTimeout(toolbarHideTimeoutRef.current);
    }
    setToolbarCollapsed(true);
    setToolbarVisible(false);
  }, []);

  const showToolbar = useCallback(() => {
    setToolbarCollapsed(false);
    bumpToolbarVisibility();
  }, [bumpToolbarVisibility]);

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
    bumpToolbarVisibility();
    return () => {
      if (toolbarHideTimeoutRef.current) {
        window.clearTimeout(toolbarHideTimeoutRef.current);
      }
    };
  }, [bumpToolbarVisibility]);

  const applyScenarioState = useCallback(
    (key: ScenarioKey, state: { nodes: Node<WhiteboardNodeData>[]; edges: Edge<WhiteboardEdgeData>[] }) => {
      scenarioStoreRef.current[key] = {
        nodes: state.nodes.map(cloneNode),
        edges: state.edges.map(cloneEdge),
      };
      scenarioHistoryRef.current[key] = getHistory();
      if (key === activeScenario) {
        isSwitchingScenarioRef.current = true;
        setNodes(state.nodes.map(cloneNode));
        setEdges(state.edges.map(cloneEdge));
        setActiveEdgeId(null);
        setActiveNodeId(null);
        requestAnimationFrame(() => {
          isSwitchingScenarioRef.current = false;
        });
      }
    },
    [activeScenario, setNodes, setEdges]
  );

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
          const nextActiveScenario =
            nextScenarios[savedActiveScenario].nodes.length > 0 ? savedActiveScenario : "current";
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

  const { cards: dashboardCards, totals } = useMemo(
    () => computeDashboardMetrics(nodes),
    [nodes]
  );

  const co2Context = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeNodeCO2>>();
    let maxNodeValue = 0;
    const transportMap = new Map<string, number>();
    let maxTransport = 0;
    nodes.forEach((node) => {
      const metric = computeNodeCO2(node.data);
      if (metric) {
        map.set(node.id, metric);
        maxNodeValue = Math.max(maxNodeValue, metric.absoluteValue);
      }
      const distance = parseCO2Numeric(node.data.sustainability?.transportDistance);
      if (distance && distance > 0) {
        transportMap.set(node.id, distance);
        maxTransport = Math.max(maxTransport, distance);
      }
    });
    return { map, maxNodeValue, transportMap, maxTransport };
  }, [nodes]);

  const applyDefaultsToExistingNodes = useCallback(
    (defaults: EmissionFactorDefaults) => {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: withEmissionDefaults(node.data, defaults, true),
        }))
      );
    },
    [setNodes]
  );

  const handleEmissionWizardAccept = useCallback(() => {
    setEmissionWizardStage("form");
  }, []);

  const handleEmissionWizardSkip = useCallback(() => {
    setIsCo2TrackingEnabled(false);
    co2PromptAckRef.current[activeScenario] = true;
    setEmissionWizardOpen(false);
    setEmissionWizardStage("prompt");
  }, [activeScenario]);

  const handleEmissionWizardClose = useCallback(() => {
    setEmissionWizardOpen(false);
    setEmissionWizardStage("prompt");
    if (emissionWizardStage === "form") {
      setIsCo2TrackingEnabled(false);
      co2PromptAckRef.current[activeScenario] = true;
    } else if (!isCo2TrackingEnabled) {
      co2PromptAckRef.current[activeScenario] = true;
    }
  }, [activeScenario, emissionWizardStage, isCo2TrackingEnabled]);

  const handleEmissionWizardSubmit = useCallback(
    (values: EmissionFactorDefaults) => {
      setEmissionDefaults(values);
      setIsCo2TrackingEnabled(true);
      co2PromptAckRef.current[activeScenario] = true;
      setEmissionWizardOpen(false);
      setEmissionWizardStage("prompt");
      applyDefaultsToExistingNodes(values);
    },
    [activeScenario, applyDefaultsToExistingNodes]
  );

  const decoratedEdges = useMemo(() => {
    const baseEdges = edges.map((edge) => decorateEdge(edge, edgeThemeMap, DEFAULT_EDGE_VARIANT));
    if (!showCO2Layer) return baseEdges;

    const maxTransport = co2Context.maxTransport || 0;
    if (maxTransport <= 0) return baseEdges;

    return baseEdges.map((edge) => {
      const transportValue =
        co2Context.transportMap.get(edge.source) ?? co2Context.transportMap.get(edge.target);
      if (!transportValue || transportValue <= 0) return edge;
      const color = co2ColorScale(transportValue, maxTransport);
      const thickness = 2 + (transportValue / maxTransport) * 4;

      const markerEnd =
        edge.markerEnd && typeof edge.markerEnd === "object"
          ? ({ ...edge.markerEnd, color } as typeof edge.markerEnd)
          : edge.markerEnd;

      return {
        ...edge,
        animated: true,
        style: {
          ...edge.style,
          stroke: color,
          strokeWidth: thickness,
          opacity: 0.9,
        },
        markerEnd,
        labelBgStyle: {
          ...edge.labelBgStyle,
          fill: "rgba(15, 23, 42, 0.75)",
          stroke: color,
          color: "#f8fafc",
        },
      };
    });
  }, [edges, edgeThemeMap, showCO2Layer, co2Context]);

  const nodeTypes = useMemo(
    () => ({
      custom: (props: NodeProps<WhiteboardNodeData>) => {
        const { data, id } = props;
        const isPopupOpen = openSustainabilityNodeId === id;
        const co2Metric = showCO2Layer ? co2Context.map.get(id) : null;
        const heatColor = co2Metric
          ? co2ColorScale(co2Metric.absoluteValue, co2Context.maxNodeValue || 1)
          : data.color;
        const backgroundGradient = showCO2Layer
          ? `linear-gradient(135deg, ${heatColor}40, ${heatColor})`
          : `linear-gradient(135deg, ${data.color}88, ${data.color})`;
        const textColor = showCO2Layer ? "#0f172a" : "#ffffff";
        const secondaryColor = showCO2Layer
          ? "rgba(15, 23, 42, 0.7)"
          : "rgba(255,255,255,0.85)";
        return (
          <div
            style={{
              position: "relative",
              pointerEvents: "all",
              padding: 12,
              display: "flex",
              alignItems: "center",
              background: backgroundGradient,
              borderRadius: 12,
              color: textColor,
              minWidth: 140,
              justifyContent: "flex-start",
              fontWeight: 600,
              boxShadow: showCO2Layer
                ? `0 12px 22px ${heatColor}55`
                : "0 8px 16px rgba(0,0,0,0.18)",
              cursor: "pointer",
              border: showCO2Layer ? `1px solid ${heatColor}` : "none",
              transition: "all 0.25s ease",
              textShadow: showCO2Layer ? "none" : "0 1px 2px rgba(15, 23, 42, 0.35)",
            }}
          >
            {/* Targets on all sides to allow inbound links from any direction */}
            <Handle type="target" position={Position.Top} id="t" style={{ background: "#555" }} />
            <Handle type="target" position={Position.Bottom} id="b" style={{ background: "#555" }} />
            <Handle type="target" position={Position.Left} id="l" style={{ background: "#555" }} />
            <Handle type="target" position={Position.Right} id="r" style={{ background: "#555" }} />
            <div style={{ width: 28, marginRight: 10, color: textColor }}>
              {iconMap[data.icon]}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div>{data.label}</div>
              {data.processTime && (
                <div style={{ fontSize: 10, color: secondaryColor, fontWeight: 500 }}>
                  PT: {data.processTime}
                </div>
              )}
              {data.cycleTime && (
                <div style={{ fontSize: 10, color: secondaryColor, fontWeight: 500 }}>
                  CT: {data.cycleTime}
                </div>
              )}
              {showCO2Layer && co2Metric && (
                <div style={{ fontSize: 10, color: secondaryColor, fontWeight: 600 }}>
                  CO₂: {co2Metric.label}
                </div>
              )}
            </div>
            {/* Sources on all sides to allow outbound links in any direction */}
            <Handle type="source" position={Position.Top} id="st" style={{ background: "#555" }} />
            <Handle type="source" position={Position.Bottom} id="sb" style={{ background: "#555" }} />
            <Handle type="source" position={Position.Left} id="sl" style={{ background: "#555" }} />
            <Handle type="source" position={Position.Right} id="sr" style={{ background: "#555" }} />
            <SustainabilityBadge
              sustainability={data.sustainability}
              onClick={(event) => {
                event.stopPropagation();
                setOpenSustainabilityNodeId((prev) => (prev === id ? null : id));
              }}
            />
            {isPopupOpen && (
              <SustainabilityPopup
                sustainability={data.sustainability}
                onClose={() => setOpenSustainabilityNodeId(null)}
              />
            )}
          </div>
        );
      },
    }),
    [openSustainabilityNodeId, showCO2Layer, co2Context]
  );

  const scenarioMeta = SCENARIO_META[activeScenario];

  useEffect(() => {
    if (isSwitchingScenarioRef.current || isApplyingRef.current || isRemoteHydratingRef.current) return;
    scenarioStoreRef.current[activeScenario] = {
      ...scenarioStoreRef.current[activeScenario],
      nodes: nodes.map(cloneNode),
    };
  }, [nodes, activeScenario]);

  useEffect(() => {
    if (isSwitchingScenarioRef.current || isApplyingRef.current || isRemoteHydratingRef.current) return;
    scenarioStoreRef.current[activeScenario] = {
      ...scenarioStoreRef.current[activeScenario],
      edges: edges.map(cloneEdge),
    };
  }, [edges, activeScenario]);

  useEffect(() => {
    if (isRemoteHydratingRef.current) return;
    const scenarioState = scenarioStoreRef.current[activeScenario];
    if (!scenarioState) return;
    isSwitchingScenarioRef.current = true;
    setNodes(scenarioState.nodes.map(cloneNode));
    setEdges(scenarioState.edges.map(cloneEdge));
    setActiveEdgeId(null);
    setActiveNodeId(null);
    setOpenSustainabilityNodeId(null);
    requestAnimationFrame(() => {
      isSwitchingScenarioRef.current = false;
    });
  }, [activeScenario, setNodes, setEdges]);

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
    selectedProjectId,
    nodes,
    edges,
    activeScenario,
    dashboardVisible,
    showCO2Layer,
    emissionDefaults,
    isCo2TrackingEnabled,
    commitPendingSave,
  ]);

  useEffect(() => {
    const flushPendingSave = () => {
      const pending = pendingSaveRef.current;
      if (!pending) return;
      void commitPendingSave();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushPendingSave();
      }
    };

    window.addEventListener("beforeunload", flushPendingSave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", flushPendingSave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [commitPendingSave]);

  const activeEdge = useMemo(
    () => edges.find((edge) => edge.id === activeEdgeId) ?? null,
    [edges, activeEdgeId]
  );

  const activeNode = useMemo(
    () => nodes.find((node) => node.id === activeNodeId) ?? null,
    [nodes, activeNodeId]
  );

  const categoryFilters = useMemo(
    () => ["All", ...nodeLibrary.map((cat) => cat.category)],
    []
  );

  const { filteredLibrary, drawerCategoryData } = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    const filterNodes = (category: LibraryCategory) =>
      category.nodes.filter((node) => {
        if (!normalized) return true;
        const haystack = `${node.label} ${node.tagline ?? ""} ${node.badge ?? ""}`.toLowerCase();
        return haystack.includes(normalized);
      });

    const filtered = nodeLibrary
      .filter((cat) => categoryFilter === "All" || cat.category === categoryFilter)
      .map((cat) => ({
        ...cat,
        nodes: filterNodes(cat),
      }))
      .filter((cat) => cat.nodes.length > 0);

    const drawerData = drawerCategory
      ? (() => {
          const nodes = filterNodes(drawerCategory);
          if (nodes.length === 0) return null;
          return { ...drawerCategory, nodes } as LibraryCategory;
        })()
      : null;

    return { filteredLibrary: filtered, drawerCategoryData: drawerData };
  }, [categoryFilter, drawerCategory, searchTerm]);


  const valueBreakdown = useMemo(
    () => [
      {
        label: "Value-add",
        count: totals.valueAddedSteps,
        color: "#38bdf8",
      },
      {
        label: "Enabler",
        count: totals.enablerSteps,
        color: "#6366f1",
      },
      {
        label: "Non-value",
        count: totals.nonValueAddedSteps,
        color: "#f472b6",
      },
    ],
    [totals.enablerSteps, totals.nonValueAddedSteps, totals.valueAddedSteps]
  );

  const timeMetrics = useMemo(() => {
    const entries = [
      {
        label: "Process Time",
        value: totals.processMinutes,
        accent: formatMinutes(totals.processMinutes),
      },
      {
        label: "Cycle Time",
        value: totals.cycleMinutes,
        accent: formatMinutes(totals.cycleMinutes),
      },
      {
        label: "Lead Time",
        value: totals.leadMinutes,
        accent: formatMinutes(totals.leadMinutes),
      },
      {
        label: "Setup Time",
        value: totals.setupMinutes,
        accent: formatMinutes(totals.setupMinutes),
      },
    ];
    const max = Math.max(...entries.map((entry) => entry.value), 1);
    return entries.map((entry) => ({
      label: entry.label,
      accent: entry.accent,
      ratio: entry.value / max,
    }));
  }, [totals.processMinutes, totals.cycleMinutes, totals.leadMinutes, totals.setupMinutes]);

  const cycleTimeTrend = useMemo(() => {
    const entries = nodes
      .map((node) => {
        const minutes = parseDurationToMinutes(node.data.cycleTime);
        if (minutes === null) return null;
        return {
          label: node.data.label || "Step",
          minutes,
          x: node.position?.x ?? 0,
          y: node.position?.y ?? 0,
        };
      })
      .filter((entry): entry is { label: string; minutes: number; x: number; y: number } =>
        entry !== null
      );

    if (entries.length === 0) {
      return null;
    }

    entries.sort((a, b) => {
      if (a.x === b.x) return a.y - b.y;
      return a.x - b.x;
    });

    const labels = entries.map((entry, index) =>
      entry.label?.trim() ? entry.label : `Step ${index + 1}`
    );
    const values = entries.map((entry) => entry.minutes);
    const sum = values.reduce((acc, value) => acc + value, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const delta = values[values.length - 1] - values[0];

    return {
      labels,
      values,
      average,
      min,
      max,
      delta,
    };
  }, [nodes]);

  const wipCapacitySnapshot = useMemo(() => {
    const records = nodes
      .map((node) => {
        const capacityValue = parseCO2Numeric(node.data.capacity);
        const wipValue = parseCO2Numeric(node.data.wip);
        if (capacityValue === null && wipValue === null) return null;
        return {
          label: node.data.label || "Step",
          capacity: capacityValue ?? 0,
          wip: wipValue ?? 0,
        };
      })
      .filter(
        (entry): entry is { label: string; capacity: number; wip: number } => entry !== null
      );

    if (records.length === 0) {
      return null;
    }

    const labels = records.map((record, index) =>
      record.label.trim() ? record.label : `Step ${index + 1}`
    );
    const wipValues = records.map((record) => record.wip);
    const capacityValues = records.map((record) => record.capacity);
    const totalWip = wipValues.reduce((acc, value) => acc + value, 0);
    const totalCapacity = capacityValues.reduce((acc, value) => acc + value, 0);

    const utilizationSamples = records
      .filter((record) => record.capacity > 0)
      .map((record) => ({
        label: record.label,
        utilization: record.wip / record.capacity,
      }));

    const avgUtilization = utilizationSamples.length
      ? utilizationSamples.reduce((acc, sample) => acc + sample.utilization, 0) /
        utilizationSamples.length
      : null;

    const hotspots = utilizationSamples
      .filter((sample) => sample.utilization >= 1)
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 3);

    return {
      labels,
      wipValues,
      capacityValues,
      totalWip,
      totalCapacity,
      avgUtilization,
      hotspots,
    };
  }, [nodes]);

  const costBreakdown = useMemo(() => {
    const entries = nodes
      .map((node) => {
        const cost = parseNumericValue(node.data.cost);
        if (cost === null || cost <= 0) return null;
        return {
          label: node.data.label || "Step",
          category: node.data.category || "Other",
          cost,
        };
      })
      .filter(
        (entry): entry is { label: string; category: string; cost: number } => entry !== null
      );

    if (entries.length === 0) {
      return null;
    }

    const totals = new Map<string, number>();
    entries.forEach((entry) => {
      totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.cost);
    });

    const categories = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
    const labels = categories.map(([category]) => category);
    const values = categories.map(([, value]) => value);
    const total = values.reduce((acc, value) => acc + value, 0);
    const contributions = entries
      .slice()
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map((entry) => ({
        label: entry.label,
        category: entry.category,
        cost: entry.cost,
        percent: total > 0 ? (entry.cost / total) * 100 : 0,
      }));

    return {
      labels,
      values,
      total,
      contributions,
    };
  }, [nodes]);

  const sustainabilityDashboard = useMemo(() => {
    let scope1Total = 0;
    let scope2Total = 0;
    let scope3Total = 0;
    const records = nodes.map((node) => {
      const scope1 = parseNumericValue(node.data.sustainability?.scope1) ?? 0;
      const scope2 = parseNumericValue(node.data.sustainability?.scope2) ?? 0;
      const scope3 = parseNumericValue(node.data.sustainability?.scope3) ?? 0;
      const perUnit = parseNumericValue(node.data.sustainability?.co2PerUnit);
      const capacity = parseNumericValue(node.data.capacity);
      const total = scope1 + scope2 + scope3;
      scope1Total += scope1;
      scope2Total += scope2;
      scope3Total += scope3;
      return {
        label: node.data.label || "Step",
        scope1,
        scope2,
        scope3,
        total,
        perUnit,
        capacity: capacity ?? 0,
      };
    });

    const totalEmissions = scope1Total + scope2Total + scope3Total;
    const perUnitRecords = records.filter((record) => record.perUnit !== null && (record.perUnit ?? 0) > 0);
    const totalCapacity = perUnitRecords.reduce((acc, record) => acc + (record.capacity > 0 ? record.capacity : 0), 0);
    const weightedPerUnitSum = perUnitRecords.reduce((acc, record) => {
      const capacity = record.capacity > 0 ? record.capacity : 1;
      return acc + (record.perUnit ?? 0) * capacity;
    }, 0);
    const averagePerUnit = perUnitRecords.length
      ? weightedPerUnitSum / (totalCapacity > 0 ? totalCapacity : perUnitRecords.length)
      : null;

    const perUnitPositive = perUnitRecords.filter((record) => (record.perUnit ?? 0) > 0);
    const bestPerUnit = perUnitPositive.length
      ? [...perUnitPositive].sort((a, b) => (a.perUnit ?? 0) - (b.perUnit ?? 0))[0]
      : null;
    const worstPerUnit = perUnitPositive.length
      ? [...perUnitPositive].sort((a, b) => (b.perUnit ?? 0) - (a.perUnit ?? 0))[0]
      : null;

    const hotspots = records
      .filter((record) => record.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    if (totalEmissions <= 0 && perUnitRecords.length === 0) {
      return null;
    }

    return {
      scopeTotals: [scope1Total, scope2Total, scope3Total],
      scopeLabels: ["Scope 1", "Scope 2", "Scope 3"],
      totalEmissions,
      hotspots,
      perUnit: {
        average: averagePerUnit,
        best: bestPerUnit
          ? { label: bestPerUnit.label, value: bestPerUnit.perUnit ?? 0 }
          : null,
        worst: worstPerUnit
          ? { label: worstPerUnit.label, value: worstPerUnit.perUnit ?? 0 }
          : null,
      },
    };
  }, [nodes]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, { count: number; accent: string }>();
    nodes.forEach((node) => {
      const current = counts.get(node.data.category);
      if (current) {
        current.count += 1;
      } else {
        counts.set(node.data.category, { count: 1, accent: node.data.color });
      }
    });
    return Array.from(counts.entries())
      .map(([category, info]) => ({
        category,
        count: info.count,
        accent: info.accent,
      }))
      .sort((a, b) => b.count - a.count);
  }, [nodes]);

  const summaryInsights = useMemo(() => {
    const totalSteps = totals.totalSteps || 1;
    const valueMix = ((totals.valueAddedSteps / totalSteps) * 100).toFixed(1);
    const connectionVariants = edges.reduce((acc, edge) => {
      const variant = edge.data?.connectionType ?? DEFAULT_EDGE_VARIANT;
      acc.set(variant, (acc.get(variant) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
    const topVariant = Array.from(connectionVariants.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];
    return [
      `${scenarioMeta.label}: ${valueMix}% of steps are value-add covering ${formatMinutes(
        totals.processMinutes
      )} of process time.`,
      `${categoryBreakdown[0]?.category ?? "Operations"} leads with ${
        categoryBreakdown[0]?.count ?? 0
      } active activities.`,
      topVariant
        ? `${edgeThemeMap[topVariant[0]]?.label ?? "Flow"} dominates connections at ${topVariant[1]} link(s).`
        : `No connections yet — create flows to generate signal intelligence.`,
    ];
  }, [
    categoryBreakdown,
    edges,
    scenarioMeta.label,
    totals.processMinutes,
    totals.totalSteps,
    totals.valueAddedSteps,
  ]);

  const insightAlerts = useMemo(() => {
    const alerts: string[] = [];
    const missingTime = nodes.filter(
      (node) => !node.data.processTime && !node.data.cycleTime && !node.data.leadTime
    );
    if (missingTime.length) {
      alerts.push(
        `${missingTime.length} node${missingTime.length > 1 ? "s" : ""} lacking time metrics – add process or cycle data to sharpen analysis.`
      );
    }

    if (totals.nonValueAddedMinutes > totals.valueAddedMinutes) {
      alerts.push(
        `Non-value work (${formatMinutes(
          totals.nonValueAddedMinutes
        )}) outweighs value-add effort; prioritise waste reduction.`
      );
    }

    const taktGap =
      totals.cycleCount && totals.taktCount
        ? totals.cycleMinutes / totals.cycleCount - totals.taktMinutes / totals.taktCount
        : null;
    if (taktGap !== null && taktGap > 5) {
      alerts.push(
        `Cycle time trails takt by ${formatMinutes(taktGap)} — cadence is at risk of falling behind demand.`
      );
    }

    const longSetups = nodes.filter((node) => {
      const setup = parseDurationToMinutes(node.data.setupTime);
      return setup !== null && setup > 60;
    });
    if (longSetups.length) {
      alerts.push(
        `${longSetups.length} step${longSetups.length > 1 ? "s" : ""} with setup over one hour; consider SMED or prep staging.`
      );
    }

    const edgesWithoutLabel = edges.filter(
      (edge) => !edge.label || !edge.label.toString().trim()
    );
    if (edgesWithoutLabel.length) {
      alerts.push(
        `${edgesWithoutLabel.length} connection${
          edgesWithoutLabel.length > 1 ? "s" : ""
        } missing descriptors — add notes so teams understand the signal.`
      );
    }

    return alerts;
  }, [nodes, edges, totals]);

  const activeHistory = scenarioHistoryRef.current[activeScenario];

  useEffect(() => {
    bumpToolbarVisibility();
  }, [activeHistory.past.length, activeHistory.future.length, bumpToolbarVisibility]);

  const cloneScenario = useCallback(
    (from: ScenarioKey, to: ScenarioKey) => {
      if (from === to) return;
      const source = scenarioStoreRef.current[from];
      applyScenarioState(to, source);
      co2PromptAckRef.current[to] = co2PromptAckRef.current[from];
    },
    [applyScenarioState]
  );

  const resetScenario = useCallback(
    (key: ScenarioKey) => {
      applyScenarioState(key, { nodes: [], edges: [] });
      co2PromptAckRef.current[key] = false;
      if (key === activeScenario) {
        setIsCo2TrackingEnabled(false);
        setEmissionWizardStage("prompt");
        setEmissionWizardOpen(true);
      }
    },
    [applyScenarioState, activeScenario]
  );

  const pushSnapshot = useCallback(
    (snapshot?: HistorySnapshot) => {
      const history = scenarioHistoryRef.current[activeScenario];
      const snap =
        snapshot ?? {
          nodes: nodes.map(cloneNode),
          edges: edges.map(cloneEdge),
        };
      history.past.push(snap);
      if (history.past.length > 50) history.past.shift();
      history.future = [];
    },
    [nodes, edges, activeScenario]
  );

  useEffect(() => {
    if (activeEdgeId && !edges.some((edge) => edge.id === activeEdgeId)) {
      setActiveEdgeId(null);
    }
  }, [edges, activeEdgeId]);

  useEffect(() => {
    const scenarioState = scenarioStoreRef.current[activeScenario];
    if (
      scenarioState &&
      scenarioState.nodes.length === 0 &&
      !co2PromptAckRef.current[activeScenario]
    ) {
      setIsCo2TrackingEnabled(false);
      setEmissionWizardStage("prompt");
      setEmissionWizardOpen(true);
    }
  }, [activeScenario]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const endsDrag = changes.some(
        (change) => change.type === "position" && change.dragging === false
      );
      const nonPositionChange = changes.some((change) => change.type !== "position");
      const shouldSnapshot = endsDrag || nonPositionChange;
      if (!isApplyingRef.current && shouldSnapshot) pushSnapshot();
      rfOnNodesChange(changes);
    },
    [rfOnNodesChange, pushSnapshot]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!isApplyingRef.current) pushSnapshot();
      rfOnEdgesChange(changes);
    },
    [rfOnEdgesChange, pushSnapshot]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target) return;
      if (!isApplyingRef.current) pushSnapshot();

      const sourceNode = nodes.find((node) => node.id === source);
      const processTime = sourceNode?.data?.processTime;
      const cycleTime = sourceNode?.data?.cycleTime;
      const theme = edgeThemeMap[DEFAULT_EDGE_VARIANT];
      const label =
        processTime ||
        cycleTime ||
        theme?.label ||
        theme?.badge ||
        "";
      const newEdgeId = `${source}-${target}-${Date.now()}`;

      const newEdge: Edge<WhiteboardEdgeData> = {
        id: newEdgeId,
        type: "smoothstep",
        data: { connectionType: DEFAULT_EDGE_VARIANT },
        label,
        source,
        target,
        sourceHandle: sourceHandle ?? undefined,
        targetHandle: targetHandle ?? undefined,
      };

      setEdges((eds) => addEdge(newEdge, eds));

      requestAnimationFrame(() => {
        setActiveEdgeId(newEdgeId);
        setActiveNodeId(null);
      });
    },
    [nodes, setEdges, pushSnapshot]
  );

  const undo = useCallback(() => {
    const history = scenarioHistoryRef.current[activeScenario];
    if (history.past.length === 0) return;

    isApplyingRef.current = true;
    history.future.push({
      nodes: nodes.map(cloneNode),
      edges: edges.map(cloneEdge),
    });
    const prev = history.past.pop();
    if (prev) {
      scenarioStoreRef.current[activeScenario] = {
        nodes: prev.nodes.map(cloneNode),
        edges: prev.edges.map(cloneEdge),
      };
      setNodes(prev.nodes.map(cloneNode));
      setEdges(prev.edges.map(cloneEdge));
    }
    isApplyingRef.current = false;
  }, [nodes, edges, setNodes, setEdges, activeScenario]);

  const redo = useCallback(() => {
    const history = scenarioHistoryRef.current[activeScenario];
    if (history.future.length === 0) return;

    isApplyingRef.current = true;
    history.past.push({
      nodes: nodes.map(cloneNode),
      edges: edges.map(cloneEdge),
    });
    const next = history.future.pop();
    if (next) {
      scenarioStoreRef.current[activeScenario] = {
        nodes: next.nodes.map(cloneNode),
        edges: next.edges.map(cloneEdge),
      };
      setNodes(next.nodes.map(cloneNode));
      setEdges(next.edges.map(cloneEdge));
    }
    isApplyingRef.current = false;
  }, [nodes, edges, setNodes, setEdges, activeScenario]);

  const deleteSelected = useCallback(() => {
    if (!isApplyingRef.current) pushSnapshot();

    setNodes((nds) => {
      const removedActive =
        activeNodeId && nds.some((node) => node.id === activeNodeId && node.selected);
      if (removedActive) setActiveNodeId(null);
      return nds.filter((node) => !node.selected);
    });

    setEdges((eds) => {
      const remaining = eds.filter((edge) => !edge.selected);
      if (
        activeEdgeId &&
        eds.some((edge) => edge.id === activeEdgeId && edge.selected)
      ) {
        setActiveEdgeId(null);
      }
      return remaining;
    });
  }, [pushSnapshot, activeEdgeId, activeNodeId, setNodes, setEdges]);

  const handleEdgeVariantSelect = useCallback(
    (variant: string) => {
      if (!activeEdgeId) return;
      if (activeEdge && activeEdge.data?.connectionType === variant) return;

      const theme = edgeThemeMap[variant] ?? edgeThemeMap[DEFAULT_EDGE_VARIANT];
      if (!isApplyingRef.current) pushSnapshot();

      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === activeEdgeId
            ? {
                ...edge,
                data: { ...edge.data, connectionType: variant },
                label: `${theme?.iconGlyph ?? ""}${
                  theme?.iconGlyph ? " " : ""
                }${theme?.label ?? theme?.badge ?? edge.label ?? ""}`,
              }
            : edge
        )
      );
    },
    [activeEdgeId, activeEdge, setEdges, pushSnapshot]
  );

  const handleNodeMetaChange = useCallback(
    (key: keyof WhiteboardNodeData, value: string) => {
      if (!activeNodeId) return;
      const raw = key === "notes" || key === "owner" ? value : value.trim();
      const trimmed = raw.trim();
      const nextValue = trimmed.length === 0 ? undefined : raw;
      const currentValue = activeNode?.data?.[key];
      if ((currentValue ?? "") === (nextValue ?? "")) return;
      if (!isApplyingRef.current) pushSnapshot();

      setNodes((nds) =>
        nds.map((node) =>
          node.id === activeNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  [key]: nextValue,
                },
              }
            : node
        )
      );
    },
    [activeNodeId, activeNode, pushSnapshot, setNodes]
  );

  const handleSustainabilityChange = useCallback(
    (
      key: keyof NonNullable<WhiteboardNodeData["sustainability"]>,
      value: string
    ) => {
      if (!activeNodeId) return;
      const current = activeNode?.data?.sustainability ?? {};
      const trimmed = value.trim();
      const nextValue = trimmed.length === 0 ? undefined : value;
      if ((current[key] ?? "") === (nextValue ?? "")) return;
      if (!isApplyingRef.current) pushSnapshot();

      setNodes((nds) =>
        nds.map((node) =>
          node.id === activeNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  sustainability: {
                    ...node.data.sustainability,
                    [key]: nextValue,
                  },
                },
              }
            : node
        )
      );
    },
    [activeNodeId, activeNode, pushSnapshot, setNodes]
  );

  const handleNodeDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>, node: LibraryNode) => {
      event.dataTransfer.setData("application/reactflow", JSON.stringify(node));
      event.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleSelectionChange = useCallback((params: {
    nodes: Node<WhiteboardNodeData>[];
    edges: Edge<WhiteboardEdgeData>[];
  }) => {
    bumpToolbarVisibility();
    const selectedEdge = params.edges[0];
    const selectedNode = params.nodes[0];

    if (selectedEdge) {
      setActiveEdgeId(selectedEdge.id);
      setActiveNodeId(null);
      setOpenSustainabilityNodeId(null);
      return;
    }
    setActiveEdgeId(null);
    setActiveNodeId(selectedNode ? selectedNode.id : null);
    if (!selectedNode) setOpenSustainabilityNodeId(null);
  }, [bumpToolbarVisibility, setActiveEdgeId, setActiveNodeId, setOpenSustainabilityNodeId]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapperRef.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData("application/reactflow");
      if (!data || !reactFlowBounds || !reactFlowInstance) return;

      let node: LibraryNode;
      try {
        node = JSON.parse(data) as LibraryNode;
      } catch (error) {
        console.error("Failed to parse dropped node data", error);
        return;
      }

      if (!isApplyingRef.current) pushSnapshot();

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const baseData: WhiteboardNodeData = { ...node } as WhiteboardNodeData;
      const dataWithDefaults = withEmissionDefaults(
        baseData,
        emissionDefaults,
        isCo2TrackingEnabled
      );

      const newNode: Node<WhiteboardNodeData> = {
        id: `${Date.now()}`,
        type: "custom",
        position,
        data: dataWithDefaults,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, pushSnapshot, setNodes, emissionDefaults, isCo2TrackingEnabled]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleExportMap = useCallback(() => {
    console.log("Export map action triggered");
  }, []);

  const handleImportMap = useCallback(() => {
    console.log("Import map action triggered");
  }, []);

  const handleExportDashboards = useCallback(() => {
    console.log("Export dashboard charts action triggered");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          (target as HTMLInputElement).type === "number")
      ) {
        return;
      }
      bumpToolbarVisibility();
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected, undo, redo, bumpToolbarVisibility]);

  const inspectorOpen = Boolean(activeEdge || activeNode);
  const inspectorWidth = 320;
  const overlayPadding = 24;
  const overlayTop = CANVAS_TOP_OFFSET;
  const savedLabel = lastSavedAt
    ? `All changes saved at ${lastSavedAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`
    : "All changes saved";
  const saveStatusConfig = {
    saved: {
      label: savedLabel,
      color: "#bbf7d0",
      background: "rgba(22, 101, 52, 0.78)",
      border: "rgba(34, 197, 94, 0.55)",
    },
    saving: {
      label: "Saving...",
      color: "#fef3c7",
      background: "rgba(120, 53, 15, 0.78)",
      border: "rgba(251, 191, 36, 0.6)",
    },
    error: {
      label: "Save failed",
      color: "#fee2e2",
      background: "rgba(127, 29, 29, 0.82)",
      border: "rgba(248, 113, 113, 0.7)",
    },
  }[saveStatus];
  const libraryMaxHeight = `calc(100% - ${overlayTop + 60}px)`;
  const inspectorMaxHeight = `calc(100% - ${overlayTop + 48}px)`;

  const dashboardLeftOffset = sidebarOpen
    ? SIDEBAR_WIDTH + overlayPadding
    : overlayPadding;
  const dashboardRightOffset = inspectorOpen
    ? inspectorWidth + overlayPadding
    : overlayPadding;
  const toggleLeft = sidebarOpen ? SIDEBAR_WIDTH + overlayPadding : overlayPadding;
  const toolbarRight = inspectorOpen
    ? inspectorWidth + overlayPadding + 16
    : overlayPadding;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#0f172a",
      }}
    >
      <header
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          height: TAB_BAR_HEIGHT,
          padding: "0 24px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
          background: "linear-gradient(90deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.85))",
          backdropFilter: "blur(14px)",
          zIndex: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, rgba(129, 140, 248, 0.3), rgba(14, 165, 233, 0.35))",
              border: "1px solid rgba(129, 140, 248, 0.45)",
              boxShadow: "0 12px 24px rgba(14, 165, 233, 0.25)",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 30%, rgba(129, 140, 248, 0.85), rgba(14, 165, 233, 0.4))",
                boxShadow: "0 0 12px rgba(129, 140, 248, 0.6)",
              }}
            ></span>
            <span>LeanSync</span>
          </div>
          <span
            style={{
              fontSize: 12,
              color: "rgba(226, 232, 240, 0.75)",
              letterSpacing: 0.4,
            }}
          >
            {scenarioMeta.subtitle}
          </span>
        <div
          style={{
            display: "inline-flex",
            padding: 4,
            marginLeft: 6,
            borderRadius: 999,
            background: "rgba(148, 163, 184, 0.12)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            gap: 6,
          }}
        >
          {SCENARIO_ORDER.map((key) => {
            const meta = SCENARIO_META[key];
            const isActiveScenario = activeScenario === key;
            return (
              <button
                key={key}
                type="button"
                onClick={(event) => {
                  if (event.shiftKey && key !== activeScenario) {
                    cloneScenario(activeScenario, key);
                    setActiveScenario(key);
                    return;
                  }
                  setActiveScenario(key);
                }}
                title={
                  key === activeScenario
                    ? `${SCENARIO_META[key].label}`
                    : `${SCENARIO_META[key].label} — Shift+Click to clone current map`
                }
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: isActiveScenario
                    ? "linear-gradient(135deg, rgba(148, 163, 184, 0.35), rgba(94, 234, 212, 0.35))"
                    : "transparent",
                  color: isActiveScenario ? "#0f172a" : "#e2e8f0",
                  fontSize: 11,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  boxShadow: isActiveScenario
                    ? "0 8px 18px rgba(45, 212, 191, 0.24)"
                    : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "inline-flex",
            gap: 10,
            marginLeft: 16,
            alignItems: "center",
            color: "#cbd5f5",
          }}
        >
          <button
            type="button"
            onClick={() => resetScenario(activeScenario)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(148, 163, 184, 0.25)",
              background: "rgba(15, 23, 42, 0.4)",
              color: "#e2e8f0",
              fontSize: 11,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            New Canvas
          </button>
          {activeScenario !== "current" && (
            <button
              type="button"
              onClick={() => cloneScenario("current", activeScenario)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(15, 23, 42, 0.4)",
                color: "#e2e8f0",
                fontSize: 11,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Copy Current
            </button>
          )}
        </div>
          </div>
        <div style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              display: "inline-flex",
              padding: 4,
              borderRadius: 999,
              background: "rgba(30, 41, 59, 0.65)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              gap: 6,
            }}
          >
            {[{ key: "canvas", label: "Canvas" }, { key: "insights", label: "Insights" }].map(
              (tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key as "canvas" | "insights");
                      if (tab.key === "canvas" && drawerCategory) {
                        setDrawerCategory(null);
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      background: isActive
                        ? "linear-gradient(135deg, rgba(129, 140, 248, 0.55), rgba(14, 165, 233, 0.5))"
                        : "transparent",
                      color: isActive ? "#0f172a" : "#cbd5f5",
                      fontWeight: 600,
                      boxShadow: isActive ? "0 10px 22px rgba(14, 165, 233, 0.3)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              }
            )}
          </div>
          {activeTab === "canvas" && (
            <button
              type="button"
              onClick={() => setDashboardVisible((v) => !v)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(15, 23, 42, 0.4)",
                color: "#e2e8f0",
                fontSize: 12,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {dashboardVisible ? "Hide Dashboards" : "Show Dashboards"}
            </button>
          )}
        </div>
      </header>

      <div
        ref={reactFlowWrapperRef}
        onMouseMove={bumpToolbarVisibility}
        onTouchStart={bumpToolbarVisibility}
        style={{ position: "relative", flex: 1 }}
      >
        {activeTab === "canvas" ? (
          <>
            <ReactFlow
              nodes={nodes}
              edges={decoratedEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          onSelectionChange={handleSelectionChange}
          onEdgeClick={(_, edge) => {
            setActiveEdgeId(edge.id);
            setActiveNodeId(null);
          }}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{
            markerEnd: { type: MarkerType.ArrowClosed },
            type: "smoothstep",
          }}
          proOptions={{ hideAttribution: true }}
          style={{ width: "100%", height: "100%" }}
            >
              <Background />
              <MiniMap />
              <Controls />
            </ReactFlow>

            {(toolbarCollapsed || !toolbarVisible) && (
              <button
                type="button"
                onClick={showToolbar}
                style={{
                  position: "absolute",
                  top: overlayTop - 8,
                  right: overlayPadding,
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#e2e8f0",
                  fontSize: 12,
                  letterSpacing: 0.4,
                  cursor: "pointer",
                  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.28)",
                  backdropFilter: "blur(12px)",
                  zIndex: 23,
                }}
              >
                Show tools
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCO2Layer((value) => !value)}
              style={{
                position: "absolute",
                top: overlayTop - 12,
                right: toolbarRight,
                transform: "translateY(-100%)",
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid rgba(34, 197, 94, 0.45)",
                background: showCO2Layer
                  ? "linear-gradient(135deg, rgba(34, 197, 94, 0.35), rgba(220, 38, 38, 0.35))"
                  : "linear-gradient(135deg, rgba(148, 163, 184, 0.35), rgba(45, 212, 191, 0.3))",
                color: "#f8fafc",
                fontSize: 12,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: showCO2Layer
                  ? "0 16px 28px rgba(220, 38, 38, 0.25)"
                  : "0 12px 22px rgba(45, 212, 191, 0.22)",
                backdropFilter: "blur(14px)",
                zIndex: 18,
                transition: "all 0.25s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: showCO2Layer ? "#ef4444" : "#22c55e",
                  boxShadow: showCO2Layer
                    ? "0 0 10px rgba(239, 68, 68, 0.6)"
                    : "0 0 10px rgba(34, 197, 94, 0.6)",
                }}
              />
              {showCO2Layer ? "CO₂ Layer On" : "CO₂ Layer Off"}
            </button>

            <div
              aria-live="polite"
              style={{
                position: "absolute",
                right: overlayPadding,
                bottom: 24,
                zIndex: 24,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minWidth: 210,
                justifyContent: "space-between",
                padding: "8px 10px 8px 12px",
                borderRadius: 999,
                border: `1px solid ${saveStatusConfig.border}`,
                background: saveStatusConfig.background,
                color: saveStatusConfig.color,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                boxShadow: "0 14px 30px rgba(15, 23, 42, 0.28)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    flex: "0 0 auto",
                    borderRadius: "50%",
                    background: saveStatusConfig.color,
                    boxShadow: `0 0 10px ${saveStatusConfig.color}`,
                  }}
                />
                {saveStatusConfig.label}
              </span>
              <button
                type="button"
                onClick={() => {
                  void commitPendingSave();
                }}
                style={{
                  marginLeft: 4,
                  padding: "5px 9px",
                  borderRadius: 999,
                  border: "1px solid rgba(255, 255, 255, 0.28)",
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "inherit",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Save now
              </button>
            </div>

            {sidebarOpen && (
          <NodeLibraryPanel
            top={overlayTop}
            offset={overlayPadding}
            width={SIDEBAR_WIDTH}
            maxHeight={libraryMaxHeight}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={categoryFilters}
            activeFilter={categoryFilter}
            onFilterSelect={(filter) => {
              setCategoryFilter(filter);
              if (filter === "All") {
                setDrawerCategory(null);
                return;
              }
              const category = nodeLibrary.find((cat) => cat.category === filter);
              setDrawerCategory(category ?? null);
            }}
            library={filteredLibrary}
            hasResults={filteredLibrary.length > 0}
              onDragStart={handleNodeDragStart}
            activeCategory={drawerCategoryData}
            onCloseDrawer={() => setDrawerCategory(null)}
            />
          )}

            <button
              onClick={() => setSidebarOpen((open) => !open)}
              style={{
                position: "absolute",
                top: overlayTop - 16,
                left: toggleLeft,
                transform: "translateX(-50%)",
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.25s ease",
                zIndex: 16,
              }}
            >
              {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>

        <ToolbarPanel
          top={overlayTop}
          right={overlayPadding}
          visible={!toolbarCollapsed && toolbarVisible}
          canUndo={activeHistory.past.length > 0}
          canRedo={activeHistory.future.length > 0}
          onUndo={undo}
          onRedo={redo}
          onDelete={deleteSelected}
          onHide={hideToolbar}
        />

            {dashboardVisible && (
              <DashboardOverlay
                top={overlayTop}
                left={dashboardLeftOffset}
                right={dashboardRightOffset}
                cards={dashboardCards}
              />
            )}

            {inspectorOpen && (
              <InspectorPanel
                top={overlayTop}
                right={overlayPadding}
                width={inspectorWidth}
                maxHeight={inspectorMaxHeight}
                activeNode={activeNode}
                activeEdge={activeEdge}
                onClose={() => {
                  setActiveEdgeId(null);
                  setActiveNodeId(null);
                }}
                onMetaChange={handleNodeMetaChange}
                onSustainabilityChange={handleSustainabilityChange}
                edgeThemes={edgeLibrary}
                onVariantSelect={handleEdgeVariantSelect}
                defaultVariant={DEFAULT_EDGE_VARIANT}
                metaFields={nodeMetaFields}
              />
            )}
          </>
        ) : (
      <AnalyticsPanel
        cards={dashboardCards}
        valueBreakdown={valueBreakdown}
        timeMetrics={timeMetrics}
        cycleTimeTrend={cycleTimeTrend}
        wipCapacity={wipCapacitySnapshot}
        costBreakdown={costBreakdown}
        sustainabilityDashboard={sustainabilityDashboard}
        categoryBreakdown={categoryBreakdown}
        summary={summaryInsights}
        alerts={insightAlerts}
        onExportMap={handleExportMap}
        onImportMap={handleImportMap}
        onExportDashboards={handleExportDashboards}
      />
        )}
      </div>
      <EmissionWizard
        open={emissionWizardOpen}
        stage={emissionWizardStage}
        defaults={emissionDefaults}
        onAcceptTracking={handleEmissionWizardAccept}
        onSkip={handleEmissionWizardSkip}
        onSubmit={handleEmissionWizardSubmit}
        onClose={handleEmissionWizardClose}
      />
    </div>
  );
};

export default Whiteboard;
