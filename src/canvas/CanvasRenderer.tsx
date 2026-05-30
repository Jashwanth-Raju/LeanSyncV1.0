import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  MarkerType,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type ReactFlowInstance,
  type OnSelectionChangeParams,
} from "reactflow";
import "reactflow/dist/style.css";
import type {
  WhiteboardEdge,
  WhiteboardEdgeData,
  WhiteboardNode,
  WhiteboardNodeData,
} from "../nodes/NodeTypes";
import { nodeTypes } from "../nodes";
import { SNAP_GRID } from "../utils/constants";
import { useTheme } from "../theme/ThemeContext";

interface CanvasRendererProps {
  nodes: WhiteboardNode[];
  decoratedEdges: WhiteboardEdge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onSelectionChange: (params: OnSelectionChangeParams) => void;
  onEdgeClick: (edge: WhiteboardEdge) => void;
  onNodeClick: (node: WhiteboardNode) => void;
  setReactFlowInstance: (instance: ReactFlowInstance<WhiteboardNodeData, WhiteboardEdgeData>) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  nodes,
  decoratedEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  onEdgeClick,
  onNodeClick,
  setReactFlowInstance,
}) => {
  const theme = useTheme();
  return (
    <ReactFlow
      nodes={nodes}
      edges={decoratedEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      onInit={setReactFlowInstance}
      onSelectionChange={onSelectionChange}
      onEdgeClick={(_, edge) => onEdgeClick(edge as WhiteboardEdge)}
      onNodeClick={(_, node) => onNodeClick(node as WhiteboardNode)}
      fitView
      snapToGrid
      snapGrid={SNAP_GRID}
      connectionLineType={ConnectionLineType.SmoothStep}
      defaultEdgeOptions={{
        markerEnd: { type: MarkerType.ArrowClosed },
        type: "smoothstep",
      }}
      proOptions={{ hideAttribution: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Background color="rgba(148,163,184,0.2)" gap={24} />
      <MiniMap
        pannable
        zoomable
        style={{ background: theme.background, borderRadius: 12 }}
        nodeColor={(node) => (node.data?.color as string) ?? theme.nodeDefaultColor}
        maskColor="rgba(15,23,42,0.5)"
      />
      <Controls />
    </ReactFlow>
  );
};
