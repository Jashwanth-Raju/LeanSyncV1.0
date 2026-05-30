import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type ReactFlowInstance,
} from "reactflow";
import type {
  WhiteboardEdge,
  WhiteboardEdgeData,
  WhiteboardNode,
  WhiteboardNodeData,
  ValueStreamVariant,
} from "../nodes/NodeTypes";
import { decorateEdge, edgeThemeMap, DEFAULT_EDGE_VARIANT } from "../nodes/edgeThemes";
import { HISTORY_LIMIT, SNAP_GRID } from "../utils/constants";
import { resolveNodeType } from "../nodes";

interface UseCanvasLogicArgs {
  initialNodes: WhiteboardNode[];
  initialEdges: WhiteboardEdge[];
}

interface HistorySnapshot {
  nodes: WhiteboardNode[];
  edges: WhiteboardEdge[];
}

const cloneNode = (node: WhiteboardNode): WhiteboardNode => ({
  ...node,
  data: { ...node.data },
});

const cloneEdge = (edge: WhiteboardEdge): WhiteboardEdge => ({
  ...edge,
  data: edge.data ? { ...edge.data } : undefined,
});

export const useCanvasLogic = ({ initialNodes, initialEdges }: UseCanvasLogicArgs) => {
  const [nodes, setNodes, rfOnNodesChange] = useNodesState<WhiteboardNodeData>(
    initialNodes.map(cloneNode)
  );
  const [edges, setEdges, rfOnEdgesChange] = useEdgesState<WhiteboardEdgeData>(
    initialEdges.map(cloneEdge)
  );
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<WhiteboardNodeData, WhiteboardEdgeData> | null>(null);
  const reactFlowWrapperRef = useRef<HTMLDivElement | null>(null);
  const draggedNodeRef = useRef<WhiteboardNodeData | null>(null);
  const historyRef = useRef<{ past: HistorySnapshot[]; future: HistorySnapshot[] }>({
    past: [],
    future: [],
  });
  const isApplyingRef = useRef(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [ghostNode, setGhostNode] = useState<WhiteboardNodeData | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const decoratedEdges = useMemo(() => edges.map((edge) => decorateEdge(edge)), [edges]);

  const pushSnapshot = useCallback(
    (snapshot?: HistorySnapshot) => {
      const snap =
        snapshot ?? {
          nodes: nodes.map(cloneNode),
          edges: edges.map(cloneEdge),
        };
      historyRef.current.past.push(snap);
      if (historyRef.current.past.length > HISTORY_LIMIT) {
        historyRef.current.past.shift();
      }
      historyRef.current.future = [];
    },
    [nodes, edges]
  );

  const registerSnapshot = useCallback(() => {
    if (isApplyingRef.current) return;
    pushSnapshot();
  }, [pushSnapshot]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const endsDrag = changes.some((c) => c.type === "position" && c.dragging === false);
      const nonPositionChange = changes.some((c) => c.type !== "position");
      const shouldSnapshot = endsDrag || nonPositionChange;
      if (!isApplyingRef.current && shouldSnapshot) {
        pushSnapshot();
      }
      rfOnNodesChange(changes);
    },
    [pushSnapshot, rfOnNodesChange]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!isApplyingRef.current) {
        pushSnapshot();
      }
      rfOnEdgesChange(changes);
    },
    [pushSnapshot, rfOnEdgesChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (!isApplyingRef.current) pushSnapshot();
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const processTime = sourceNode?.data?.processTime;
      const cycleTime = sourceNode?.data?.cycleTime;
      const label = processTime || cycleTime || edgeThemeMap[DEFAULT_EDGE_VARIANT]?.badge || "";
      const newEdgeId = `${connection.source}-${connection.target}-${Date.now()}`;
      const newEdge: WhiteboardEdge = {
        id: newEdgeId,
        type: "smoothstep",
        data: { connectionType: DEFAULT_EDGE_VARIANT },
        label,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [nodes, pushSnapshot, setEdges]
  );

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.past.length === 0) return;
    isApplyingRef.current = true;
    history.future.push({
      nodes: nodes.map(cloneNode),
      edges: edges.map(cloneEdge),
    });
    const prev = history.past.pop();
    if (prev) {
      setNodes(prev.nodes.map(cloneNode));
      setEdges(prev.edges.map(cloneEdge));
    }
    isApplyingRef.current = false;
  }, [nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    if (history.future.length === 0) return;
    isApplyingRef.current = true;
    history.past.push({
      nodes: nodes.map(cloneNode),
      edges: edges.map(cloneEdge),
    });
    const next = history.future.pop();
    if (next) {
      setNodes(next.nodes.map(cloneNode));
      setEdges(next.edges.map(cloneEdge));
    }
    isApplyingRef.current = false;
  }, [nodes, edges, setNodes, setEdges]);

  const deleteSelected = useCallback(() => {
    registerSnapshot();
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [registerSnapshot, setNodes, setEdges]);

  const replaceState = useCallback(
    (nextNodes: WhiteboardNode[], nextEdges: WhiteboardEdge[]) => {
      isApplyingRef.current = true;
      historyRef.current = { past: [], future: [] };
      setNodes(nextNodes.map(cloneNode));
      setEdges(nextEdges.map(cloneEdge));
      isApplyingRef.current = false;
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore delete/backspace shortcuts while typing in form fields
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          (target as HTMLInputElement).type === "number")
      ) {
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected]);

  const handleNodeDragStart = useCallback((event: React.DragEvent, node: WhiteboardNodeData) => {
    draggedNodeRef.current = node;
    const payload = JSON.stringify(node);
    try {
      event.dataTransfer.setData("application/reactflow", payload);
      event.dataTransfer.setData("application/json", payload);
      event.dataTransfer.setData("text/plain", payload);
      event.dataTransfer.setData("text", payload);
    } catch (error) {
      console.warn("Drag payload unavailable", error);
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    setGhostNode(node);
  }, []);

  const handleNodeDragEnd = useCallback(() => {
    draggedNodeRef.current = null;
    setGhostNode(null);
    setIsDraggingOver(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapperRef.current?.getBoundingClientRect();
      const data =
        event.dataTransfer.getData("application/reactflow") ||
        event.dataTransfer.getData("application/json") ||
        event.dataTransfer.getData("text/plain") ||
        event.dataTransfer.getData("text");
      if (!reactFlowBounds || !reactFlowInstance) return;
      let node: WhiteboardNodeData | null = null;
      if (data) {
        try {
          node = JSON.parse(data);
        } catch (error) {
          console.error("Failed to parse dropped node data", error);
        }
      }
      if (!node && draggedNodeRef.current) {
        node = draggedNodeRef.current;
      }
      if (!node) return;
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      registerSnapshot();
      const newNode: WhiteboardNode = {
        id: `${Date.now()}`,
        type: resolveNodeType(node.valueType as ValueStreamVariant, node.variant),
        position,
        data: { ...node },
      };
      setNodes((nds) => nds.concat(newNode));
      draggedNodeRef.current = null;
      setGhostNode(null);
      setIsDraggingOver(false);
    },
    [reactFlowInstance, registerSnapshot, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
    setCursorPos({ x: event.clientX, y: event.clientY });
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    decoratedEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    deleteSelected,
    undo,
    redo,
    canUndo: historyRef.current.past.length > 0,
    canRedo: historyRef.current.future.length > 0,
    reactFlowWrapperRef,
    onDrop,
    onDragOver,
    onDragLeave,
    handleNodeDragStart,
    handleNodeDragEnd,
    registerSnapshot,
    isDraggingOver,
    ghostNode,
    cursorPos,
    reactFlowInstance,
    setReactFlowInstance,
    replaceState,
  };
};
