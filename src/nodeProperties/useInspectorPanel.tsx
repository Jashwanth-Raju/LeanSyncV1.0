import { useCallback } from "react";
import type { WhiteboardEdge, WhiteboardNode } from "../nodes/NodeTypes";
import { useNodeProperties } from "./useNodeProperties";
import { NodePropertiesPanel } from "./NodePropertiesPanel";

interface UseInspectorPanelArgs {
  nodes: WhiteboardNode[];
  edges: WhiteboardEdge[];
  setNodes: (updater: (nodes: WhiteboardNode[]) => WhiteboardNode[]) => void;
  setEdges: (updater: (edges: WhiteboardEdge[]) => WhiteboardEdge[]) => void;
  registerSnapshot: () => void;
  inspectorMaxHeight: string;
}

export const useInspectorPanel = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  registerSnapshot,
  inspectorMaxHeight,
}: UseInspectorPanelArgs) => {
  const inspector = useNodeProperties({
    nodes,
    edges,
    setNodes,
    setEdges,
    registerSnapshot,
  });

  const inspectorPanel = inspector.inspectorOpen ? (
    <NodePropertiesPanel
      activeNode={inspector.activeNode}
      activeEdge={inspector.activeEdge}
      inspectorMaxHeight={inspectorMaxHeight}
      onNodeMetaChange={inspector.handleNodeMetaChange}
      onEdgeVariantSelect={inspector.handleEdgeVariantSelect}
    />
  ) : null;

  const handleEdgeClick = useCallback(
    (edge: WhiteboardEdge) => {
      inspector.setActiveEdgeId(edge.id);
      inspector.setActiveNodeId(null);
    },
    [inspector]
  );

  const handleNodeClick = useCallback(
    (node: WhiteboardNode) => {
      inspector.setActiveNodeId(node.id);
      inspector.setActiveEdgeId(null);
    },
    [inspector]
  );

  return {
    ...inspector,
    inspectorPanel,
    handleEdgeClick,
    handleNodeClick,
  };
};
