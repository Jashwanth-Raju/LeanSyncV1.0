import type { PropsWithChildren } from "react";
import { ReactFlowProvider } from "reactflow";
import type {
  Connection,
  EdgeChange,
  NodeChange,
  ReactFlowInstance,
  OnSelectionChangeParams,
} from "reactflow";
import type { WhiteboardEdge, WhiteboardEdgeData, WhiteboardNode, WhiteboardNodeData } from "../nodes/NodeTypes";
import { CanvasRenderer } from "./CanvasRenderer";
import { CanvasToolbar } from "./CanvasToolbar";

interface CanvasContainerProps {
  nodes: WhiteboardNode[];
  decoratedEdges: WhiteboardEdge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onSelectionChange: (params: OnSelectionChangeParams) => void;
  onEdgeClick: (edge: WhiteboardEdge) => void;
  onNodeClick: (node: WhiteboardNode) => void;
  reactFlowWrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  canUndo: boolean;
  canRedo: boolean;
  setReactFlowInstance: (instance: ReactFlowInstance<WhiteboardNodeData, WhiteboardEdgeData>) => void;
  toolbarPosition: React.CSSProperties;
}

export const CanvasContainer = ({
  nodes,
  decoratedEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  onEdgeClick,
  onNodeClick,
  reactFlowWrapperRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onUndo,
  onRedo,
  onDelete,
  canUndo,
  canRedo,
  setReactFlowInstance,
  children,
  toolbarPosition,
}: PropsWithChildren<CanvasContainerProps>) => {
  return (
    <ReactFlowProvider>
      <div
        style={{ position: "relative", flex: 1 }}
        ref={reactFlowWrapperRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <CanvasRenderer
          nodes={nodes}
          decoratedEdges={decoratedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          onEdgeClick={onEdgeClick}
          onNodeClick={onNodeClick}
          setReactFlowInstance={setReactFlowInstance}
        />
        <CanvasToolbar
          onUndo={onUndo}
          onRedo={onRedo}
          onDelete={onDelete}
          canUndo={canUndo}
          canRedo={canRedo}
          positionStyle={toolbarPosition}
        />
        {children}
      </div>
    </ReactFlowProvider>
  );
};
