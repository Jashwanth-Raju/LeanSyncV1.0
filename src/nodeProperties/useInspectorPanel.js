import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from "react";
import { useNodeProperties } from "./useNodeProperties";
import { NodePropertiesPanel } from "./NodePropertiesPanel";
export const useInspectorPanel = ({ nodes, edges, setNodes, setEdges, registerSnapshot, inspectorMaxHeight, }) => {
    const inspector = useNodeProperties({
        nodes,
        edges,
        setNodes,
        setEdges,
        registerSnapshot,
    });
    const inspectorPanel = inspector.inspectorOpen ? (_jsx(NodePropertiesPanel, { activeNode: inspector.activeNode, activeEdge: inspector.activeEdge, inspectorMaxHeight: inspectorMaxHeight, onNodeMetaChange: inspector.handleNodeMetaChange, onEdgeVariantSelect: inspector.handleEdgeVariantSelect })) : null;
    const handleEdgeClick = useCallback((edge) => {
        inspector.setActiveEdgeId(edge.id);
        inspector.setActiveNodeId(null);
    }, [inspector]);
    const handleNodeClick = useCallback((node) => {
        inspector.setActiveNodeId(node.id);
        inspector.setActiveEdgeId(null);
    }, [inspector]);
    return {
        ...inspector,
        inspectorPanel,
        handleEdgeClick,
        handleNodeClick,
    };
};
