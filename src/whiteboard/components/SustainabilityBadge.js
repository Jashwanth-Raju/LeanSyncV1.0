import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
const formatDisplay = (sustainability) => {
    if (sustainability.energyUse)
        return sustainability.energyUse;
    if (sustainability.materialWeight)
        return sustainability.materialWeight;
    if (sustainability.transportDistance)
        return sustainability.transportDistance;
    if (sustainability.wasteWeight)
        return sustainability.wasteWeight;
    return "";
};
export const SustainabilityBadge = ({ sustainability, onClick, }) => {
    if (!sustainability)
        return null;
    const displayValue = formatDisplay(sustainability);
    const hasValue = displayValue.length > 0;
    if (!hasValue)
        return null;
    return (_jsxs("button", { type: "button", onClick: onClick, style: {
            position: "absolute",
            top: -16,
            right: -16,
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(45, 212, 191, 0.9))",
            borderRadius: 16,
            minWidth: 46,
            padding: "6px 10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#0f172a",
            fontSize: 11,
            fontWeight: 700,
            border: "1px solid rgba(56, 189, 248, 0.6)",
            boxShadow: "0 14px 28px rgba(15, 23, 42, 0.35)",
            cursor: "pointer",
            letterSpacing: 0.6,
        }, children: [_jsx("span", { style: { fontSize: 9, textTransform: "uppercase" }, children: "CO\u2082" }), _jsx("span", { style: { fontSize: 11 }, children: displayValue })] }));
};
