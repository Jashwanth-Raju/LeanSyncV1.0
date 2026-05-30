import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import ReactFlow, { Background, Controls, MiniMap, ConnectionLineType, MarkerType, } from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "../nodes";
import { SNAP_GRID } from "../utils/constants";
import { useTheme } from "../theme/ThemeContext";
export const CanvasRenderer = ({ nodes, decoratedEdges, onNodesChange, onEdgesChange, onConnect, onSelectionChange, onEdgeClick, onNodeClick, setReactFlowInstance, }) => {
    const theme = useTheme();
    return (_jsxs(ReactFlow, { nodes: nodes, edges: decoratedEdges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, nodeTypes: nodeTypes, onInit: setReactFlowInstance, onSelectionChange: onSelectionChange, onEdgeClick: (_, edge) => onEdgeClick(edge), onNodeClick: (_, node) => onNodeClick(node), fitView: true, snapToGrid: true, snapGrid: SNAP_GRID, connectionLineType: ConnectionLineType.SmoothStep, defaultEdgeOptions: {
            markerEnd: { type: MarkerType.ArrowClosed },
            type: "smoothstep",
        }, proOptions: { hideAttribution: true }, style: { width: "100%", height: "100%" }, children: [_jsx(Background, { color: "rgba(148,163,184,0.2)", gap: 24 }), _jsx(MiniMap, { pannable: true, zoomable: true, style: { background: theme.background, borderRadius: 12 }, nodeColor: (node) => node.data?.color ?? theme.nodeDefaultColor, maskColor: "rgba(15,23,42,0.5)" }), _jsx(Controls, {})] }));
};
