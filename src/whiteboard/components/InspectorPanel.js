import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
export const InspectorPanel = ({ top, right, width, maxHeight, activeNode, activeEdge, onClose, onMetaChange, onSustainabilityChange, edgeThemes, onVariantSelect, defaultVariant, metaFields, }) => (_jsxs("aside", { style: {
        position: "absolute",
        top,
        right,
        width,
        maxHeight,
        padding: 22,
        borderRadius: 22,
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background: "rgba(15, 23, 42, 0.9)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 15,
        boxShadow: "0 18px 42px rgba(15, 23, 42, 0.35)",
    }, children: [_jsxs("header", { style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }, children: [_jsxs("div", { style: { display: "flex", flexDirection: "column" }, children: [_jsx("span", { style: {
                                fontSize: 12,
                                letterSpacing: 1.4,
                                textTransform: "uppercase",
                                color: "#94a3b8",
                            }, children: "Inspector" }), _jsx("strong", { style: { fontSize: 18 }, children: activeNode?.data.label ?? activeEdge?.label ?? "Selection" })] }), _jsx("button", { onClick: onClose, style: {
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(148, 163, 184, 0.15)",
                        color: "#e2e8f0",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        cursor: "pointer",
                    }, children: "\u00D7" })] }), activeNode && (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [_jsx("span", { style: { fontSize: 12, color: "#94a3b8" }, children: "Node Properties" }), metaFields.map((field) => (_jsxs("label", { style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        fontSize: 12,
                    }, children: [_jsx("span", { style: { color: "#cbd5f5", letterSpacing: 0.4 }, children: field.label }), field.multiline ? (_jsx("textarea", { value: String(activeNode.data[field.key] ?? ""), onChange: (event) => onMetaChange(field.key, event.target.value), placeholder: field.placeholder, style: {
                                resize: "vertical",
                                minHeight: 80,
                                borderRadius: 10,
                                border: "1px solid rgba(148, 163, 184, 0.35)",
                                background: "rgba(15, 23, 42, 0.5)",
                                color: "#e2e8f0",
                                padding: "8px 10px",
                            } })) : (_jsx("input", { type: "text", value: String(activeNode.data[field.key] ?? ""), onChange: (event) => onMetaChange(field.key, event.target.value), placeholder: field.placeholder, style: {
                                borderRadius: 10,
                                border: "1px solid rgba(148, 163, 184, 0.35)",
                                background: "rgba(15, 23, 42, 0.5)",
                                color: "#e2e8f0",
                                padding: "8px 10px",
                            } }))] }, field.key))), _jsxs("details", { style: {
                        borderRadius: 16,
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        padding: "12px 14px",
                        background: "rgba(15, 23, 42, 0.55)",
                        color: "inherit",
                    }, children: [_jsx("summary", { style: {
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: 0.6,
                                textTransform: "uppercase",
                                cursor: "pointer",
                            }, children: "Sustainability / CO\u2082" }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }, children: [_jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }, children: [_jsx("span", { children: "Energy Use" }), _jsxs("div", { style: {
                                                display: "grid",
                                                gap: 8,
                                                gridTemplateColumns: "minmax(0, 1fr) 90px",
                                                alignItems: "center",
                                            }, children: [_jsx("input", { type: "text", value: activeNode.data.sustainability?.energyUse ?? "", onChange: (event) => onSustainabilityChange("energyUse", event.target.value), placeholder: "e.g. 1200", style: {
                                                        flex: 1,
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } }), _jsxs("select", { value: activeNode.data.sustainability?.energyUnit ?? "kWh", onChange: (event) => onSustainabilityChange("energyUnit", event.target.value), style: {
                                                        width: "100%",
                                                        padding: "8px 10px",
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                    }, children: [_jsx("option", { value: "kWh", children: "kWh" }), _jsx("option", { value: "MJ", children: "MJ" }), _jsx("option", { value: "mWh", children: "mWh" })] })] })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }, children: [_jsx("span", { children: "Material Use" }), _jsxs("div", { style: {
                                                display: "grid",
                                                gap: 8,
                                                gridTemplateColumns: "minmax(0, 1fr) 110px",
                                                alignItems: "center",
                                            }, children: [_jsx("input", { type: "text", value: activeNode.data.sustainability?.materialType ?? "", onChange: (event) => onSustainabilityChange("materialType", event.target.value), placeholder: "Material type", style: {
                                                        flex: 1,
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } }), _jsx("input", { type: "text", value: activeNode.data.sustainability?.materialWeight ?? "", onChange: (event) => onSustainabilityChange("materialWeight", event.target.value), placeholder: "Weight (kg)", style: {
                                                        width: "100%",
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } })] })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }, children: [_jsx("span", { children: "Transport" }), _jsxs("div", { style: {
                                                display: "grid",
                                                gap: 8,
                                                gridTemplateColumns: "minmax(0, 1fr) 110px",
                                                alignItems: "center",
                                            }, children: [_jsx("input", { type: "text", value: activeNode.data.sustainability?.transportDistance ?? "", onChange: (event) => onSustainabilityChange("transportDistance", event.target.value), placeholder: "Distance (km)", style: {
                                                        flex: 1,
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } }), _jsxs("select", { value: activeNode.data.sustainability?.transportMode ?? "Truck", onChange: (event) => onSustainabilityChange("transportMode", event.target.value), style: {
                                                        width: "100%",
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    }, children: [_jsx("option", { children: "Truck" }), _jsx("option", { children: "Rail" }), _jsx("option", { children: "Sea" }), _jsx("option", { children: "Air" }), _jsx("option", { children: "Pipeline" })] })] })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }, children: [_jsx("span", { children: "Waste" }), _jsxs("div", { style: {
                                                display: "grid",
                                                gap: 8,
                                                gridTemplateColumns: "minmax(0, 1fr) 90px",
                                                alignItems: "center",
                                            }, children: [_jsx("input", { type: "text", value: activeNode.data.sustainability?.wasteType ?? "", onChange: (event) => onSustainabilityChange("wasteType", event.target.value), placeholder: "Waste type", style: {
                                                        flex: 1,
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } }), _jsx("input", { type: "text", value: activeNode.data.sustainability?.wasteWeight ?? "", onChange: (event) => onSustainabilityChange("wasteWeight", event.target.value), placeholder: "kg", style: {
                                                        width: "100%",
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } })] })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }, children: [_jsx("span", { children: "Scope Emissions (tCO\u2082e)" }), _jsx("div", { style: {
                                                display: "grid",
                                                gap: 8,
                                                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                                alignItems: "center",
                                            }, children: ["scope1", "scope2", "scope3"].map((scope) => (_jsx("input", { type: "text", value: activeNode.data.sustainability?.[scope] ?? "", onChange: (event) => onSustainabilityChange(scope, event.target.value), placeholder: scope.toUpperCase(), style: {
                                                    borderRadius: 10,
                                                    border: "1px solid rgba(148, 163, 184, 0.35)",
                                                    background: "rgba(15, 23, 42, 0.5)",
                                                    color: "#e2e8f0",
                                                    padding: "8px 10px",
                                                } }, scope))) })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }, children: [_jsx("span", { children: "CO\u2082 per Unit (kg)" }), _jsx("input", { type: "text", value: activeNode.data.sustainability?.co2PerUnit ?? "", onChange: (event) => onSustainabilityChange("co2PerUnit", event.target.value), placeholder: "e.g. 2.5", style: {
                                                borderRadius: 10,
                                                border: "1px solid rgba(148, 163, 184, 0.35)",
                                                background: "rgba(15, 23, 42, 0.5)",
                                                color: "#e2e8f0",
                                                padding: "8px 10px",
                                            } })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }, children: [_jsx("span", { children: "Default Emission Factors" }), _jsxs("div", { style: {
                                                display: "grid",
                                                gap: 10,
                                                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                            }, children: [_jsx("input", { type: "text", value: activeNode.data.sustainability?.electricityFactor ?? "", onChange: (event) => onSustainabilityChange("electricityFactor", event.target.value), placeholder: "Electricity", style: {
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } }), _jsx("input", { type: "text", value: activeNode.data.sustainability?.materialFactor ?? "", onChange: (event) => onSustainabilityChange("materialFactor", event.target.value), placeholder: "Materials", style: {
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } }), _jsx("input", { type: "text", value: activeNode.data.sustainability?.transportFactor ?? "", onChange: (event) => onSustainabilityChange("transportFactor", event.target.value), placeholder: "Transport", style: {
                                                        borderRadius: 10,
                                                        border: "1px solid rgba(148, 163, 184, 0.35)",
                                                        background: "rgba(15, 23, 42, 0.5)",
                                                        color: "#e2e8f0",
                                                        padding: "8px 10px",
                                                    } })] })] })] })] })] })), activeEdge && (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [_jsx("span", { style: { fontSize: 12, color: "#94a3b8" }, children: "Connection Style" }), _jsx("div", { style: {
                        display: "grid",
                        gap: 14,
                        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                    }, children: edgeThemes.map((theme) => {
                        const isActive = (activeEdge.data?.connectionType ?? defaultVariant) === theme.key;
                        const baseBorder = isActive
                            ? `1px solid ${theme.color}`
                            : "1px solid rgba(148, 163, 184, 0.25)";
                        const baseBackground = isActive
                            ? `linear-gradient(135deg, ${theme.color}3d, ${theme.color}66)`
                            : "linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(17, 24, 39, 0.85))";
                        return (_jsxs("button", { type: "button", onClick: () => onVariantSelect(theme.key), style: {
                                position: "relative",
                                borderRadius: 20,
                                padding: "14px 16px",
                                textAlign: "left",
                                border: baseBorder,
                                background: baseBackground,
                                color: "#e2e8f0",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                boxShadow: isActive
                                    ? `0 14px 30px ${theme.color}33`
                                    : "0 8px 18px rgba(15, 23, 42, 0.32)",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                                overflow: "hidden",
                            }, children: [isActive && (_jsx("span", { style: {
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: 20,
                                        background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0))",
                                        opacity: 0.6,
                                        pointerEvents: "none",
                                    } })), _jsxs("div", { style: {
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 8,
                                        zIndex: 1,
                                    }, children: [_jsx("strong", { style: { fontSize: 13.5, letterSpacing: 0.4 }, children: theme.label }), _jsx("span", { style: {
                                                fontSize: 10,
                                                textTransform: "uppercase",
                                                letterSpacing: 0.9,
                                                padding: "3px 9px",
                                                borderRadius: 999,
                                                border: `1px solid ${theme.color}88`,
                                                background: `${theme.color}26`,
                                                color: "#f8fafc",
                                            }, children: theme.badge })] }), _jsx("span", { style: {
                                        position: "relative",
                                        fontSize: 11.5,
                                        color: "#cbd5f5",
                                        zIndex: 1,
                                    }, children: theme.description }), _jsx("div", { style: {
                                        position: "relative",
                                        zIndex: 1,
                                        height: 4,
                                        borderRadius: 999,
                                        background: `linear-gradient(90deg, ${theme.color}, ${theme.color}88)`,
                                        opacity: 0.85,
                                    } })] }, theme.key));
                    }) })] }))] }));
