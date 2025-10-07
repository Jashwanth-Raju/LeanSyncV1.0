import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
export const DashboardOverlay = ({ top, left, right, cards, }) => (_jsx("div", { style: {
        position: "absolute",
        top,
        left,
        right,
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        gap: 16,
        flexWrap: "wrap",
        pointerEvents: "none",
        zIndex: 12,
    }, children: cards.map((card) => (_jsxs("div", { style: {
            pointerEvents: "auto",
            borderRadius: 14,
            padding: "12px 16px",
            background: "rgba(15, 23, 42, 0.55)",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.3)",
            backdropFilter: "blur(18px)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            flex: "0 1 200px",
            minWidth: 180,
            color: "#e2e8f0",
        }, children: [_jsx("span", { style: {
                    fontSize: 12,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: "#94a3b8",
                }, children: card.title }), _jsx("strong", { style: { fontSize: 22 }, children: card.primary }), card.accent && (_jsx("span", { style: { fontSize: 12.5, color: "#cbd5f5" }, children: card.accent })), card.footer && (_jsx("span", { style: { fontSize: 11.5, color: "#94a3b8" }, children: card.footer }))] }, card.title))) }));
