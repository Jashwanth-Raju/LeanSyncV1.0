/** @jsxImportSource react */
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { CanvasContainer } from "./canvas/CanvasContainer";
import { useCanvasLogic } from "./canvas/useCanvasLogic";
import { useProjectCanvas } from "./canvas/useProjectCanvas";
import { cloneNodeData } from "./nodes";
import { useInspectorPanel } from "./nodeProperties/useInspectorPanel";
import { createInitialCanvasState } from "./data/canvasModel";
import { computeFlowMetrics, buildDashboardCards } from "./insights/analytics";
import { useProject } from "./lib/ProjectContext";
import { NodeLibraryProvider, useNodeLibrary } from "./lib/NodeLibraryContext";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";
import { CommandSidebar } from "./ui/CommandSidebar";
import { CANVAS_TOP_OFFSET, OVERLAY_PADDING, TAB_BAR_HEIGHT } from "./utils/constants";
import { formatMinutes } from "./utils/formatting";

const DEFAULT_BOARDS = [
  { id: "current", name: "Current State" },
  { id: "future", name: "Future State" },
];

const overlayTop = CANVAS_TOP_OFFSET;

const SaveStatusPill = ({ saving }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        top: overlayTop - 18,
        right: OVERLAY_PADDING,
        zIndex: 20,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        letterSpacing: 0.4,
        color: saving ? "#fef3c7" : "#bbf7d0",
        background: saving
          ? theme.pill?.saving ?? "rgba(251, 191, 36, 0.25)"
          : theme.pill?.saved ?? "rgba(34, 197, 94, 0.2)",
        border: saving
          ? "1px solid rgba(251, 191, 36, 0.4)"
          : "1px solid rgba(34, 197, 94, 0.35)",
        backdropFilter: "blur(12px)",
      }}
    >
      {saving ? "Saving…" : "All changes saved"}
    </div>
  );
};

function WhiteboardView({ selectedProjectId }) {
  const { nodes: profileNodes, kpi, layers } = useNodeLibrary();
  const theme = useTheme();
  const initialState = useMemo(() => createInitialCanvasState(), []);
  const {
    nodes: persistedNodes,
    edges: persistedEdges,
    loading: canvasLoading,
    error: canvasError,
    isSaving: canvasSaving,
    saveCanvasState,
    metadata,
  } = useProjectCanvas({
    projectId: selectedProjectId,
    fallbackNodes: initialState.nodes,
    fallbackEdges: initialState.edges,
  });
  const canvas = useCanvasLogic({
    initialNodes: initialState.nodes,
    initialEdges: initialState.edges,
  });
  const { replaceState } = canvas;
  const inspector = useInspectorPanel({
    nodes: canvas.nodes,
    edges: canvas.edges,
    setNodes: canvas.setNodes,
    setEdges: canvas.setEdges,
    registerSnapshot: canvas.registerSnapshot,
    inspectorMaxHeight: `calc(100% - ${overlayTop + 48}px)`,
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [boards, setBoards] = useState(DEFAULT_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState(DEFAULT_BOARDS[0].id);
  const [activeLayers, setActiveLayers] = useState([]);

  const categoryFilters = useMemo(
    () => ["All", ...profileNodes.map((cat) => cat.category)],
    [profileNodes]
  );

  const filteredLibrary = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return profileNodes
      .filter((cat) => categoryFilter === "All" || cat.category === categoryFilter)
      .map((cat) => ({
        ...cat,
        nodes: cat.nodes.filter((node) => {
          if (!normalized) return true;
          const haystack = `${node.label} ${node.tagline ?? ""} ${node.badge ?? ""}`.toLowerCase();
          return haystack.includes(normalized);
        }),
      }))
      .filter((cat) => cat.nodes.length > 0);
  }, [categoryFilter, profileNodes, searchTerm]);

  const sidebarNodeDragStart = useCallback(
    (event, definition) => {
      canvas.handleNodeDragStart(event, cloneNodeData(definition));
    },
    [canvas]
  );

  const handleBoardSelect = useCallback((boardId) => {
    setActiveBoardId(boardId);
  }, []);

  const handleAddBoard = useCallback(() => {
    const newBoardId = `board-${Date.now()}`;
    const newBoard = { id: newBoardId, name: `Board ${boards.length + 1}` };
    setBoards((prev) => prev.concat(newBoard));
    setActiveBoardId(newBoardId);
  }, [boards.length]);

  const metrics = useMemo(() => computeFlowMetrics(canvas.nodes), [canvas.nodes]);
  const dashboardCards = useMemo(() => buildDashboardCards(metrics, kpi), [metrics, kpi]);

  const toolbarPosition = {
    top: 24,
    right: 24,
    zIndex: 14,
  };

  const isHydratingRef = useRef(false);

  useEffect(() => {
    if (!selectedProjectId && typeof window !== "undefined") {
      if (window.location.pathname !== "/projects") {
        window.history.replaceState({}, "", "/projects");
      }
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    isHydratingRef.current = true;
    replaceState(persistedNodes, persistedEdges);
    const id = setTimeout(() => {
      isHydratingRef.current = false;
    }, 0);
    return () => clearTimeout(id);
  }, [persistedEdges, persistedNodes, replaceState, selectedProjectId]);

  useEffect(() => {
    if (metadata?.layers && Array.isArray(metadata.layers)) {
      setActiveLayers(metadata.layers);
    }
  }, [metadata]);

  useEffect(() => {
    if (!selectedProjectId) return;
    if (isHydratingRef.current) return;
    const metricsPayload = {
      totals: metrics.totals,
      averageCycle: metrics.averageCycle,
      averageLead: metrics.averageLead,
      averageTakt: metrics.averageTakt,
      setupAverage: metrics.setupAverage,
      valueAddedRatio: metrics.valueAddedRatio,
      taktGap: metrics.taktGap,
    };
    saveCanvasState(canvas.nodes, canvas.edges, { metrics: metricsPayload, layers: activeLayers });
  }, [canvas.edges, canvas.nodes, metrics, saveCanvasState, selectedProjectId, activeLayers]);

  const handleLayerToggle = useCallback((layerId) => {
    setActiveLayers((prev) => (prev.includes(layerId) ? prev.filter((id) => id !== layerId) : prev.concat(layerId)));
  }, []);

  const resolveMetricPath = useCallback((path) => {
    return path.split(".").reduce((acc, segment) => {
      if (acc == null) return null;
      return acc[segment];
    }, metrics);
  }, [metrics]);

  const layerValues = useMemo(() => {
    const map = {};
    (layers ?? []).forEach((layer) => {
      const value = resolveMetricPath(layer.metricPath);
      if (value == null) {
        map[layer.id] = "--";
        return;
      }
      if (layer.formatter === "duration") {
        map[layer.id] = formatMinutes(Number(value));
      } else if (layer.formatter === "percent") {
        map[layer.id] = `${Number(value).toFixed(1)}%`;
      } else if (layer.formatter === "number") {
        map[layer.id] = Number(value).toLocaleString();
      } else {
        map[layer.id] = String(value);
      }
    });
    return map;
  }, [layers, resolveMetricPath]);

  if (!selectedProjectId) {
    return null;
  }

  if (canvasLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: theme.background, color: "#cbd5f5" }}>
        Loading board…
      </div>
    );
  }

  if (canvasError) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: theme.background, color: "#fca5a5" }}>
        {canvasError}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: theme.background,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: TAB_BAR_HEIGHT,
          padding: "0 20px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
          background: theme.toolbarGradient
            ? `linear-gradient(90deg, ${theme.toolbarGradient[0]}, ${theme.toolbarGradient[1]})`
            : "linear-gradient(90deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85))",
          backdropFilter: "blur(14px)",
          zIndex: 8,
        }}
      >
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;
          return (
            <button
              key={board.id}
              type="button"
              onClick={() => handleBoardSelect(board.id)}
              style={{
                borderRadius: 999,
                padding: "8px 18px",
                fontSize: 13,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                border: isActive
                  ? "1px solid rgba(255, 255, 255, 0.9)"
                  : "1px solid rgba(148, 163, 184, 0.25)",
                background: isActive
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(15, 23, 42, 0.5)",
                color: "#f8fafc",
                cursor: "pointer",
              }}
            >
              {board.name}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleAddBoard}
          style={{
            marginLeft: "auto",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            border: "1px solid rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.08)",
            color: "#f8fafc",
            cursor: "pointer",
          }}
        >
          + New Board
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <CommandSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={filteredLibrary}
          categoryFilter={categoryFilter}
          categoryFilters={categoryFilters}
          onCategorySelect={setCategoryFilter}
          onNodeDragStart={sidebarNodeDragStart}
          onNodeDragEnd={canvas.handleNodeDragEnd}
          insights={dashboardCards}
          layers={layers ?? []}
          activeLayers={activeLayers}
          layerValues={layerValues}
          onLayerToggle={handleLayerToggle}
          onUndo={canvas.undo}
          onRedo={canvas.redo}
          onDelete={canvas.deleteSelected}
          canUndo={canvas.canUndo}
          canRedo={canvas.canRedo}
        />

        <div style={{ flex: 1, position: "relative" }}>
          <SaveStatusPill saving={canvasSaving} />
          <div style={{ position: "absolute", top: overlayTop + 60, right: 30, display: "flex", flexDirection: "column", gap: 12, zIndex: 15, pointerEvents: "none" }}>
            {activeLayers.map((layerId) => {
              const cfg = (layers ?? []).find((layer) => layer.id === layerId);
              if (!cfg) return null;
              return (
                <div
                  key={layerId}
                  style={{
                    borderRadius: 16,
                    padding: "12px 16px",
                    background: `${cfg.color}22`,
                    border: `1px solid ${cfg.color}`,
                    color: "#f8fafc",
                    minWidth: 180,
                  }}
                >
                  <div style={{ fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" }}>{cfg.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{layerValues[layerId] ?? "--"}</div>
                  {cfg.description && <div style={{ fontSize: 12, color: "#e2e8f0" }}>{cfg.description}</div>}
                </div>
              );
            })}
          </div>
          <CanvasContainer
            nodes={canvas.nodes}
            decoratedEdges={canvas.decoratedEdges}
            onNodesChange={canvas.onNodesChange}
            onEdgesChange={canvas.onEdgesChange}
            onConnect={canvas.onConnect}
            onSelectionChange={inspector.handleSelectionChange}
            onEdgeClick={inspector.handleEdgeClick}
            onNodeClick={inspector.handleNodeClick}
            reactFlowWrapperRef={canvas.reactFlowWrapperRef}
            onDrop={canvas.onDrop}
            onDragOver={canvas.onDragOver}
            onDragLeave={canvas.onDragLeave}
            onUndo={canvas.undo}
            onRedo={canvas.redo}
            onDelete={canvas.deleteSelected}
            canUndo={canvas.canUndo}
            canRedo={canvas.canRedo}
            setReactFlowInstance={canvas.setReactFlowInstance}
            toolbarPosition={toolbarPosition}
          >
            {inspector.inspectorOpen && (
              <div
                style={{
                  position: "absolute",
                  top: overlayTop,
                  right: OVERLAY_PADDING,
                  zIndex: 18,
                }}
              >
                {inspector.inspectorPanel}
              </div>
            )}
          </CanvasContainer>
        </div>
      </div>
    </div>
  );
}

export default function Whiteboard() {
  const { selectedProjectId, selectedProfile } = useProject();
  if (!selectedProjectId) return null;
  return (
    <NodeLibraryProvider profileName={selectedProfile}>
      <ThemeProvider>
        <WhiteboardView selectedProjectId={selectedProjectId} />
      </ThemeProvider>
    </NodeLibraryProvider>
  );
}
