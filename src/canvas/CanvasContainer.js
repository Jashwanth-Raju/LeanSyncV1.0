import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ReactFlowProvider } from "reactflow";
import { CanvasRenderer } from "./CanvasRenderer";
import { CanvasToolbar } from "./CanvasToolbar";
export const CanvasContainer = ({ nodes, decoratedEdges, onNodesChange, onEdgesChange, onConnect, onSelectionChange, onEdgeClick, onNodeClick, reactFlowWrapperRef, onDrop, onDragOver, onDragLeave, onUndo, onRedo, onDelete, canUndo, canRedo, setReactFlowInstance, children, toolbarPosition, }) => {
    return (_jsx(ReactFlowProvider, { children: _jsxs("div", { style: { position: "relative", flex: 1 }, ref: reactFlowWrapperRef, onDrop: onDrop, onDragOver: onDragOver, onDragLeave: onDragLeave, children: [_jsx(CanvasRenderer, { nodes: nodes, decoratedEdges: decoratedEdges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, onSelectionChange: onSelectionChange, onEdgeClick: onEdgeClick, onNodeClick: onNodeClick, setReactFlowInstance: setReactFlowInstance }), _jsx(CanvasToolbar, { onUndo: onUndo, onRedo: onRedo, onDelete: onDelete, canUndo: canUndo, canRedo: canRedo, positionStyle: toolbarPosition }), children] }) }));
};
