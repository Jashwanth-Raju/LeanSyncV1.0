import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { Handle, Position } from "reactflow";
import { getIcon } from "../../ui/Icons";
import { useTheme } from "../../theme/ThemeContext";
export const InventoryNode = memo(({ data, selected }) => {
    const theme = useTheme();
    return (_jsxs("div", { style: {
            pointerEvents: "all",
            padding: 10,
            display: "flex",
            alignItems: "center",
            background: `rgba(15, 23, 42, 0.8)`,
            borderRadius: 10,
            border: selected ? `2px solid ${theme.primary}` : `1px solid ${data.color}`,
            color: "#e2e8f0",
            minWidth: 130,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }, children: [_jsx(Handle, { type: "target", position: Position.Left, style: { background: data.color } }), _jsx("div", { style: { width: 24, margin: "0 8px" }, children: getIcon(data.icon) }), _jsxs("div", { children: [_jsx("div", { children: data.label }), data.capacity && _jsxs("div", { style: { fontSize: 10 }, children: ["Cap: ", data.capacity] })] }), _jsx(Handle, { type: "source", position: Position.Right, style: { background: data.color } })] }));
});
