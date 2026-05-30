import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { edgeLibrary } from "../nodes/edgeThemes";
import { nodeMetaFields } from "./useNodeProperties";
import { EdgePreview } from "./EdgePreview";
import { Modal } from "../ui/Modal";
export const NodePropertiesPanel = ({ activeNode, activeEdge, inspectorMaxHeight, onNodeMetaChange, onEdgeVariantSelect, }) => {
    if (!activeNode && !activeEdge)
        return null;
    if (activeEdge) {
        const activeVariant = activeEdge.data?.connectionType ?? edgeLibrary[0]?.key;
        return (_jsx(Modal, { maxHeight: inspectorMaxHeight, children: _jsxs("div", { children: [_jsx("h3", { style: { fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }, children: "Connection Type" }), _jsx("p", { style: { fontSize: 12, color: "#cbd5f5", marginBottom: 12 }, children: "Adjust handoff semantics and styling." }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: edgeLibrary.map((variant) => (_jsxs("button", { type: "button", onClick: () => onEdgeVariantSelect(variant.key), style: {
                                textAlign: "left",
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: activeVariant === variant.key
                                    ? "1px solid rgba(129, 140, 248, 0.9)"
                                    : "1px solid rgba(148, 163, 184, 0.35)",
                                background: activeVariant === variant.key
                                    ? "rgba(79, 70, 229, 0.2)"
                                    : "rgba(15, 23, 42, 0.4)",
                                color: "#e2e8f0",
                                cursor: "pointer",
                            }, children: [_jsx("div", { style: { fontWeight: 600 }, children: variant.label }), _jsx(EdgePreview, { variant: variant.key }), _jsx("div", { style: { fontSize: 11, color: "#cbd5f5" }, children: variant.description })] }, variant.key))) })] }) }));
    }
    if (!activeNode)
        return null;
    return (_jsxs(Modal, { maxHeight: inspectorMaxHeight, children: [_jsxs("div", { children: [_jsx("h3", { style: { fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }, children: activeNode.data.label }), _jsx("p", { style: { fontSize: 12, color: "#cbd5f5" }, children: activeNode.data.category })] }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: nodeMetaFields.map((field) => (_jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [_jsx("span", { style: { fontSize: 11, color: "#cbd5f5", textTransform: "uppercase", letterSpacing: 0.6 }, children: field.label }), field.multiline ? (_jsx("textarea", { value: activeNode.data[field.key] ?? "", onChange: (event) => onNodeMetaChange(field.key, event.target.value), rows: 3, placeholder: field.placeholder, style: {
                                resize: "vertical",
                                borderRadius: 10,
                                border: "1px solid rgba(148, 163, 184, 0.35)",
                                background: "rgba(15, 23, 42, 0.4)",
                                color: "#f8fafc",
                                padding: "10px 12px",
                                fontSize: 13,
                            } })) : (_jsx("input", { type: "text", value: activeNode.data[field.key] ?? "", onChange: (event) => onNodeMetaChange(field.key, event.target.value), placeholder: field.placeholder, style: {
                                borderRadius: 10,
                                border: "1px solid rgba(148, 163, 184, 0.35)",
                                background: "rgba(15, 23, 42, 0.4)",
                                color: "#f8fafc",
                                padding: "8px 10px",
                                fontSize: 13,
                            } }))] }, field.key))) })] }));
};
