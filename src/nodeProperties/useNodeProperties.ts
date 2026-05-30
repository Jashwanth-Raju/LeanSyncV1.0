import { useCallback, useEffect, useMemo, useState } from "react";
import type { OnSelectionChangeParams } from "reactflow";
import type { WhiteboardNode, WhiteboardEdge, NodeMetaField } from "../nodes/NodeTypes";
import { edgeThemeMap } from "../nodes/edgeThemes";

export const nodeMetaFields: NodeMetaField[] = [
  { key: "processTime", label: "Process Time", placeholder: "e.g. 45 sec" },
  { key: "cycleTime", label: "Cycle Time", placeholder: "e.g. 55 sec" },
  { key: "taktTime", label: "Takt Time", placeholder: "e.g. 60 sec" },
  { key: "setupTime", label: "Setup Time", placeholder: "e.g. 12 min" },
  { key: "leadTime", label: "Lead Time", placeholder: "e.g. 2 days" },
  { key: "capacity", label: "Daily Capacity", placeholder: "Units/day" },
  { key: "owner", label: "Owner", placeholder: "Team or role" },
  {
    key: "notes",
    label: "Notes",
    placeholder: "Any contextual detail, bottlenecks, or improvement ideas",
    multiline: true,
  },
];

type SetNodesFn = (updater: (nodes: WhiteboardNode[]) => WhiteboardNode[]) => void;
type SetEdgesFn = (updater: (edges: WhiteboardEdge[]) => WhiteboardEdge[]) => void;

interface HookArgs {
  nodes: WhiteboardNode[];
  edges: WhiteboardEdge[];
  setNodes: SetNodesFn;
  setEdges: SetEdgesFn;
  registerSnapshot: () => void;
}

export const useNodeProperties = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  registerSnapshot,
}: HookArgs) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);

  const activeNode = useMemo(
    () => nodes.find((node) => node.id === activeNodeId) ?? null,
    [nodes, activeNodeId]
  );
  const activeEdge = useMemo(
    () => edges.find((edge) => edge.id === activeEdgeId) ?? null,
    [edges, activeEdgeId]
  );

  const inspectorOpen = Boolean(activeNode || activeEdge);

  const handleSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const selectedEdge = params.edges[0];
      const selectedNode = params.nodes[0];
      if (selectedEdge) {
        setActiveEdgeId(selectedEdge.id);
        setActiveNodeId(null);
        return;
      }
      setActiveEdgeId(null);
      setActiveNodeId(selectedNode ? selectedNode.id : null);
    },
    []
  );

  const handleNodeMetaChange = useCallback(
    (key: keyof WhiteboardNode["data"], value: string) => {
      if (!activeNodeId) return;
      const raw = key === "notes" || key === "owner" ? value : value.trim();
      const trimmed = raw.trim();
      const nextValue = trimmed.length === 0 ? undefined : raw;
      const currentValue = activeNode?.data?.[key];
      if ((currentValue ?? "") === (nextValue ?? "")) return;
      registerSnapshot();
      setNodes((nodesState) =>
        nodesState.map((node) =>
          node.id === activeNodeId
            ? {
                ...node,
                data: { ...node.data, [key]: nextValue },
              }
            : node
        )
      );
    },
    [activeNodeId, activeNode, registerSnapshot, setNodes]
  );

  const handleEdgeVariantSelect = useCallback(
    (variant: string) => {
      if (!activeEdgeId) return;
      if (!edgeThemeMap[variant]) return;
      const current = activeEdge?.data?.connectionType;
      if (current === variant) return;
      registerSnapshot();
      setEdges((edgesState) =>
        edgesState.map((edge) =>
          edge.id === activeEdgeId
            ? { ...edge, data: { ...edge.data, connectionType: variant } }
            : edge
        )
      );
    },
    [activeEdge, activeEdgeId, registerSnapshot, setEdges]
  );

  const clearActive = useCallback(() => {
    setActiveNodeId(null);
    setActiveEdgeId(null);
  }, []);

  useEffect(() => {
    if (activeEdgeId && !edges.some((edge) => edge.id === activeEdgeId)) {
      setActiveEdgeId(null);
    }
  }, [edges, activeEdgeId]);

  useEffect(() => {
    if (activeNodeId && !nodes.some((node) => node.id === activeNodeId)) {
      setActiveNodeId(null);
    }
  }, [nodes, activeNodeId]);

  return {
    activeNode,
    activeEdge,
    inspectorOpen,
    handleSelectionChange,
    handleNodeMetaChange,
    handleEdgeVariantSelect,
    activeNodeId,
    activeEdgeId,
    clearActive,
    setActiveNodeId,
    setActiveEdgeId,
  };
};
