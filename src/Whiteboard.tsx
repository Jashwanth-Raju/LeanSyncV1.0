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
  MiniMap,
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
import "reactflow/dist/style.css";

import {
  nodeLibrary,
  edgeLibrary,
  edgeThemeMap,
  DEFAULT_EDGE_VARIANT,
  initialNodes,
  initialEdges,
  SIDEBAR_WIDTH,
  CANVAS_TOP_OFFSET,
  nodeMetaFields,
} from "./whiteboard/data";
import {
  cloneEdge,
  cloneNode,
  decorateEdge,
  formatMinutes,
  parseDurationToMinutes,
} from "./whiteboard/utils";
import { useAnalytics } from "./whiteboard/hooks/useAnalytics";
import type {
  HistorySnapshot,
  LibraryCategory,
  LibraryNode,
  ValueType,
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
import type { NodeProps } from "reactflow";
import { CustomNode } from "./whiteboard/components/CustomNode";
import { WhiteboardHeader } from "./whiteboard/components/WhiteboardHeader";
import { co2ColorScale, computeNodeCO2, parseCO2Numeric } from "./whiteboard/utils/co2";
import { EmissionWizard, type EmissionWizardStage } from "./whiteboard/components/EmissionWizard";
import { QuickFillModal } from "./whiteboard/components/QuickFillModal";
import { ValueTypeModal } from "./whiteboard/components/ValueTypeModal";
import { exportToPdf } from "./whiteboard/utils/exportPdf";
import { useProject } from "./lib/ProjectContext";
import { useSaveState } from "./whiteboard/hooks/useSaveState";

import {
  computeDashboardMetrics,
  getHistory,
  SCENARIO_META,
} from "./whiteboard/scenarios";
import type { ScenarioKey, HistorySnapshotStore } from "./whiteboard/scenarios";
import { withEmissionDefaults } from "./whiteboard/persistence";

const Whiteboard: React.FC = () => {
  const { selectedProjectId, projects } = useProject();
  const projectName = projects.find((p) => p.id === selectedProjectId)?.name ?? "LeanSync";
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
  const [openSustainabilityNodeId, setOpenSustainabilityNodeId] = useState<string | null>(null);
  const [showCO2Layer, setShowCO2Layer] = useState(false);
  const [emissionDefaults, setEmissionDefaults] = useState<EmissionFactorDefaults>({
    electricity: "",
    materials: "",
    transport: "",
  });
  const [isCo2TrackingEnabled, setIsCo2TrackingEnabled] = useState(false);
  const [emissionWizardOpen, setEmissionWizardOpen] = useState(false);
  const [quickFillOpen, setQuickFillOpen] = useState(false);
  const [valueTypeModalOpen, setValueTypeModalOpen] = useState(false);
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
  const toolbarHideTimeoutRef = useRef<number | null>(null);

  const { saveStatus, lastSavedAt, commitPendingSave, isRemoteHydratingRef } = useSaveState({
    selectedProjectId,
    nodes,
    edges,
    activeScenario,
    dashboardVisible,
    showCO2Layer,
    emissionDefaults,
    isCo2TrackingEnabled,
    scenarioStoreRef,
    scenarioHistoryRef,
    co2PromptAckRef,
    setNodes,
    setEdges,
    setActiveScenario,
    setDashboardVisible,
    setShowCO2Layer,
    setEmissionDefaults,
    setIsCo2TrackingEnabled,
    setActiveEdgeId,
    setActiveNodeId,
    setOpenSustainabilityNodeId,
  });

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


  const { cards: dashboardCards, totals } = useMemo(
    () => computeDashboardMetrics(nodes),
    [nodes]
  );

  const bottleneckNodeId = useMemo(() => {
    let maxMinutes = 0;
    let bottleneckId: string | null = null;
    nodes.forEach((node) => {
      const minutes = parseDurationToMinutes(node.data.cycleTime);
      if (minutes !== null && minutes > maxMinutes) {
        maxMinutes = minutes;
        bottleneckId = node.id;
      }
    });
    return nodes.filter((n) => parseDurationToMinutes(n.data.cycleTime) !== null).length >= 2
      ? bottleneckId
      : null;
  }, [nodes]);

  const bottleneckTaktGapLabel = useMemo(() => {
    if (!bottleneckNodeId) return null;
    const node = nodes.find((n) => n.id === bottleneckNodeId);
    if (!node) return null;
    const cycleMin = parseDurationToMinutes(node.data.cycleTime);
    if (cycleMin === null) return null;
    // prefer the node's own takt time; fall back to the average across all nodes
    let takt = parseDurationToMinutes(node.data.taktTime ?? null);
    if (takt === null) {
      let sum = 0, count = 0;
      nodes.forEach((n) => {
        const t = parseDurationToMinutes(n.data.taktTime ?? null);
        if (t !== null) { sum += t; count++; }
      });
      takt = count > 0 ? sum / count : null;
    }
    if (takt === null || cycleMin <= takt) return null;
    return `+${formatMinutes(cycleMin - takt)} over takt`;
  }, [nodes, bottleneckNodeId]);

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
      custom: (props: NodeProps<WhiteboardNodeData>) => (
        <CustomNode
          {...props}
          openSustainabilityNodeId={openSustainabilityNodeId}
          bottleneckNodeId={bottleneckNodeId}
          bottleneckTaktGapLabel={bottleneckTaktGapLabel}
          showCO2Layer={showCO2Layer}
          co2Context={co2Context}
          setOpenSustainabilityNodeId={setOpenSustainabilityNodeId}
        />
      ),
    }),
    [openSustainabilityNodeId, showCO2Layer, co2Context, bottleneckNodeId, bottleneckTaktGapLabel]
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


  const {
    valueBreakdown,
    timeMetrics,
    cycleTimeTrend,
    wipCapacitySnapshot,
    costBreakdown,
    sustainabilityDashboard,
    categoryBreakdown,
    summaryInsights,
    insightAlerts,
  } = useAnalytics(nodes, edges, totals, scenarioMeta);

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

  const handleSwitchScenario = useCallback(
    (key: ScenarioKey) => {
      if (key === activeScenario) return;
      // Save current nodes/edges into the store BEFORE React re-renders with the new
      // activeScenario value. Without this, the sync effects fire with the new scenario
      // key but the old nodes, overwriting the target scenario's data.
      scenarioStoreRef.current[activeScenario] = {
        nodes: nodes.map(cloneNode),
        edges: edges.map(cloneEdge),
      };
      isSwitchingScenarioRef.current = true;
      setActiveScenario(key);
    },
    [activeScenario, nodes, edges]
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

  const handleValueTypeUpdate = useCallback(
    (nodeId: string, valueType: ValueType) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, valueType } } : node
        )
      );
    },
    [setNodes]
  );

  const handleQuickFillUpdate = useCallback(
    (nodeId: string, key: keyof WhiteboardNodeData, value: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, [key]: value || undefined } }
            : node
        )
      );
    },
    [setNodes]
  );

  const handleExportMap = useCallback(async () => {
    if (!reactFlowWrapperRef.current) return;

    const wasOnInsights = activeTab === "insights";
    if (wasOnInsights) {
      setActiveTab("canvas");
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
    }

    const bottleneckNode = bottleneckNodeId
      ? nodes.find((n) => n.id === bottleneckNodeId)
      : null;

    try {
      await exportToPdf({
        canvasElement: reactFlowWrapperRef.current!,
        scenarioLabel: SCENARIO_META[activeScenario].label,
        dashboardCards,
        bottleneckLabel: bottleneckNode?.data.label ?? null,
      });
    } catch (err) {
      console.error("PDF export failed", err);
    }

    if (wasOnInsights) {
      setActiveTab("insights");
    }
  }, [reactFlowWrapperRef, activeTab, activeScenario, dashboardCards, bottleneckNodeId, nodes]);

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
      <WhiteboardHeader
        projectName={projectName}
        activeScenario={activeScenario}
        setActiveScenario={handleSwitchScenario}
        cloneScenario={cloneScenario}
        resetScenario={resetScenario}
        dashboardVisible={dashboardVisible}
        setDashboardVisible={setDashboardVisible}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        drawerCategory={drawerCategory}
        setDrawerCategory={setDrawerCategory}
        onQuickFill={() => setQuickFillOpen(true)}
        onValueClassify={() => setValueTypeModalOpen(true)}
        onExportMap={() => void handleExportMap()}
      />

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
          connectionRadius={50}
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

            {/* Bottom action bar — undo/redo/delete + save status */}
            <div
              aria-live="polite"
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 24,
                display: "inline-flex",
                alignItems: "stretch",
                borderRadius: 999,
                border: "1px solid rgba(148, 163, 184, 0.2)",
                background: "rgba(15, 23, 42, 0.9)",
                backdropFilter: "blur(18px)",
                boxShadow: "0 16px 40px rgba(2, 6, 23, 0.45)",
                overflow: "hidden",
              }}
            >
              {[
                { label: "↩", title: "Undo (Ctrl+Z)", onClick: undo, disabled: !(activeHistory.past.length > 0) },
                { label: "↪", title: "Redo (Ctrl+Y)", onClick: redo, disabled: !(activeHistory.future.length > 0) },
                { label: "⌫", title: "Delete selected", onClick: deleteSelected, disabled: false },
              ].map((action) => (
                <button
                  key={action.title}
                  type="button"
                  title={action.title}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  style={{
                    padding: "11px 18px",
                    border: "none",
                    borderRight: "1px solid rgba(148, 163, 184, 0.12)",
                    background: "transparent",
                    color: action.disabled ? "#334155" : "#94a3b8",
                    fontSize: 16,
                    cursor: action.disabled ? "default" : "pointer",
                  }}
                >
                  {action.label}
                </button>
              ))}
              <div style={{ width: 1, background: "rgba(148, 163, 184, 0.15)", margin: "8px 0" }} />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "11px 16px",
                  color: saveStatusConfig.color,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: saveStatusConfig.color, boxShadow: `0 0 8px ${saveStatusConfig.color}`, flexShrink: 0 }} />
                {saveStatusConfig.label}
              </div>
              <button
                type="button"
                onClick={() => void commitPendingSave()}
                style={{
                  padding: "11px 16px",
                  border: "none",
                  borderLeft: "1px solid rgba(148, 163, 184, 0.12)",
                  background: "transparent",
                  color: "#64748b",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.4,
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
      {quickFillOpen && (
        <QuickFillModal
          nodes={nodes}
          onUpdate={handleQuickFillUpdate}
          onClose={() => setQuickFillOpen(false)}
        />
      )}
      {valueTypeModalOpen && (
        <ValueTypeModal
          nodes={nodes}
          onUpdate={handleValueTypeUpdate}
          onClose={() => setValueTypeModalOpen(false)}
        />
      )}
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
