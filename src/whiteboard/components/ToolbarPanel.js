import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
import { FaUndo, FaRedo, FaTrash, FaTimes } from "react-icons/fa";
import { iconPalettes, getIconButtonStyle } from "../styles";
export const ToolbarPanel = ({ top, right, visible, canUndo, canRedo, onUndo, onRedo, onDelete, onHide, }) => (_jsxs("div", { style: {
        position: "absolute",
        top,
        right,
        zIndex: 24,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 28,
        background: "rgba(15, 23, 42, 0.42)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.3)",
        backdropFilter: "blur(16px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: `translateY(${visible ? "0" : "-12px"})`,
        transition: "opacity 0.25s ease, transform 0.25s ease",
    }, children: [_jsx("button", { "aria-label": "Undo", title: "Undo", onClick: onUndo, disabled: !canUndo, style: getIconButtonStyle(iconPalettes.undo, !canUndo), children: _jsx(FaUndo, { size: 18 }) }), _jsx("button", { "aria-label": "Redo", title: "Redo", onClick: onRedo, disabled: !canRedo, style: getIconButtonStyle(iconPalettes.redo, !canRedo), children: _jsx(FaRedo, { size: 18 }) }), _jsx("button", { "aria-label": "Delete selected", title: "Delete selected", onClick: onDelete, style: getIconButtonStyle(iconPalettes.delete, false), children: _jsx(FaTrash, { size: 18 }) }), onHide && (_jsx("button", { "aria-label": "Hide toolbar", title: "Hide toolbar", onClick: onHide, style: getIconButtonStyle(iconPalettes.hide, false), children: _jsx(FaTimes, { size: 14 }) }))] }));
