import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
const MetricRow = ({ label, value, accent, }) => {
    if (!value || value.trim().length === 0)
        return null;
    return (_jsxs("div", { style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            padding: "6px 0",
            borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
        }, children: [_jsx("span", { style: { color: "#e2e8f0" }, children: label }), _jsx("span", { style: { color: accent ?? "#38bdf8", fontWeight: 600 }, children: value })] }));
};
export const SustainabilityPopup = ({ sustainability, onClose, }) => {
    if (!sustainability)
        return null;
    const { energyUse, energyUnit, materialType, materialWeight, transportDistance, transportMode, wasteType, wasteWeight, scope1, scope2, scope3, co2PerUnit, electricityFactor, materialFactor, transportFactor, } = sustainability;
    return (_jsxs("div", { style: {
            position: "absolute",
            top: -10,
            right: 60,
            width: 240,
            borderRadius: 18,
            padding: "16px 18px",
            background: "linear-gradient(160deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
            boxShadow: "0 26px 48px rgba(15, 23, 42, 0.45)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
            color: "#e2e8f0",
            zIndex: 24,
        }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [_jsx("strong", { style: { letterSpacing: 0.8, fontSize: 13, textTransform: "uppercase" }, children: "Sustainability Snapshot" }), _jsx("button", { type: "button", onClick: onClose, style: {
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: "1px solid rgba(148, 163, 184, 0.3)",
                            background: "rgba(15, 23, 42, 0.6)",
                            color: "#94a3b8",
                            cursor: "pointer",
                        }, children: "\u00D7" })] }), _jsxs("div", { style: { display: "flex", flexDirection: "column" }, children: [_jsx(MetricRow, { label: "Energy", value: energyUse ? `${energyUse} ${energyUnit ?? ""}` : undefined, accent: "#38bdf8" }), _jsx(MetricRow, { label: "Material", value: materialType ? `${materialType}${materialWeight ? ` · ${materialWeight} kg` : ""}` : undefined, accent: "#a855f7" }), _jsx(MetricRow, { label: "Transport", value: transportDistance ? `${transportDistance} km${transportMode ? ` · ${transportMode}` : ""}` : undefined, accent: "#facc15" }), _jsx(MetricRow, { label: "Waste", value: wasteType ? `${wasteType}${wasteWeight ? ` · ${wasteWeight} kg` : ""}` : undefined, accent: "#f970a6" }), _jsx(MetricRow, { label: "Scope 1", value: scope1, accent: "#f87171" }), _jsx(MetricRow, { label: "Scope 2", value: scope2, accent: "#60a5fa" }), _jsx(MetricRow, { label: "Scope 3", value: scope3, accent: "#fbbf24" }), _jsx(MetricRow, { label: "CO\u2082 / Unit", value: co2PerUnit ? `${co2PerUnit} kg` : undefined, accent: "#34d399" }), _jsx(MetricRow, { label: "Electricity Factor", value: electricityFactor, accent: "#38bdf8" }), _jsx(MetricRow, { label: "Material Factor", value: materialFactor, accent: "#a855f7" }), _jsx(MetricRow, { label: "Transport Factor", value: transportFactor, accent: "#facc15" })] })] }));
};
