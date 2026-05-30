import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
const COLUMNS = [
    { key: "cycleTime", label: "Cycle Time", width: 100 },
    { key: "processTime", label: "Process Time", width: 100 },
    { key: "setupTime", label: "Setup Time", width: 100 },
    { key: "wip", label: "WIP", width: 80 },
    { key: "oeeAvailability", label: "OEE A%", width: 80 },
    { key: "oeePerformance", label: "OEE P%", width: 80 },
    { key: "oeeQuality", label: "OEE Q%", width: 80 },
];
const cellInput = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
    color: "#e2e8f0",
    fontSize: 13,
    padding: "4px 2px",
    outline: "none",
    textAlign: "center",
};
export const QuickFillModal = ({ nodes, onUpdate, onClose }) => {
    const sorted = [...nodes].sort((a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0));
    return (_jsx("div", { style: {
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(2, 6, 23, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
        }, onClick: (e) => { if (e.target === e.currentTarget)
            onClose(); }, children: _jsxs("div", { style: {
                background: "rgba(15, 23, 42, 0.97)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: 24,
                boxShadow: "0 32px 80px rgba(2, 6, 23, 0.6)",
                width: "100%",
                maxWidth: 900,
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }, children: [_jsxs("div", { style: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "20px 28px",
                        borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                    }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 11, color: "#64748b", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }, children: "Quick Fill" }), _jsx("div", { style: { fontSize: 18, fontWeight: 700, color: "#f8fafc" }, children: "Update all node values" }), _jsxs("div", { style: { fontSize: 12, color: "#64748b", marginTop: 4 }, children: [sorted.length, " node", sorted.length !== 1 ? "s" : "", " on this canvas \u2014 sorted left to right"] })] }), _jsx("button", { onClick: onClose, style: {
                                width: 36, height: 36, borderRadius: "50%",
                                background: "rgba(148, 163, 184, 0.1)",
                                border: "1px solid rgba(148, 163, 184, 0.25)",
                                color: "#94a3b8", fontSize: 18, cursor: "pointer",
                            }, children: "\u00D7" })] }), _jsx("div", { style: { overflowY: "auto", overflowX: "auto", flex: 1 }, children: sorted.length === 0 ? (_jsx("div", { style: { padding: 48, textAlign: "center", color: "#475569", fontSize: 14 }, children: "No nodes on canvas yet. Drag some nodes from the library first." })) : (_jsxs("table", { style: {
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 13,
                            color: "#e2e8f0",
                        }, children: [_jsx("thead", { children: _jsxs("tr", { style: { borderBottom: "1px solid rgba(148, 163, 184, 0.15)" }, children: [_jsx("th", { style: {
                                                padding: "12px 20px",
                                                textAlign: "left",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                letterSpacing: 0.8,
                                                textTransform: "uppercase",
                                                color: "#64748b",
                                                position: "sticky",
                                                left: 0,
                                                background: "rgba(15, 23, 42, 0.97)",
                                                minWidth: 180,
                                            }, children: "Node" }), COLUMNS.map((col) => (_jsx("th", { style: {
                                                padding: "12px 8px",
                                                textAlign: "center",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                letterSpacing: 0.8,
                                                textTransform: "uppercase",
                                                color: "#64748b",
                                                minWidth: col.width,
                                            }, children: col.label }, col.key)))] }) }), _jsx("tbody", { children: sorted.map((node, index) => (_jsxs("tr", { style: {
                                        borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
                                        background: index % 2 === 0 ? "transparent" : "rgba(148, 163, 184, 0.03)",
                                    }, children: [_jsx("td", { style: {
                                                padding: "10px 20px",
                                                position: "sticky",
                                                left: 0,
                                                background: index % 2 === 0 ? "rgba(15, 23, 42, 0.97)" : "rgba(20, 28, 50, 0.97)",
                                            }, children: _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [_jsx("span", { style: {
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: "50%",
                                                            background: node.data.color,
                                                            flexShrink: 0,
                                                            boxShadow: `0 0 6px ${node.data.color}88`,
                                                        } }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, fontSize: 13 }, children: node.data.label }), _jsx("div", { style: { fontSize: 11, color: "#64748b", marginTop: 1 }, children: node.data.valueType === "value-added" ? "✦ Value-add" : node.data.valueType === "non-value-added" ? "✗ Non-value" : "◎ Enabler" })] })] }) }), COLUMNS.map((col) => (_jsx("td", { style: { padding: "10px 8px", textAlign: "center" }, children: _jsx("input", { type: "text", value: String(node.data[col.key] ?? ""), onChange: (e) => onUpdate(node.id, col.key, e.target.value), placeholder: "\u2014", style: cellInput }) }, col.key)))] }, node.id))) })] })) }), _jsxs("div", { style: {
                        padding: "14px 28px",
                        borderTop: "1px solid rgba(148, 163, 184, 0.12)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 12,
                        color: "#475569",
                    }, children: [_jsx("span", { children: "Changes save automatically. Click outside or press \u00D7 to close." }), _jsx("button", { onClick: onClose, style: {
                                padding: "8px 20px",
                                borderRadius: 999,
                                border: "1px solid rgba(148, 163, 184, 0.25)",
                                background: "rgba(148, 163, 184, 0.1)",
                                color: "#e2e8f0",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                            }, children: "Done" })] })] }) }));
};
