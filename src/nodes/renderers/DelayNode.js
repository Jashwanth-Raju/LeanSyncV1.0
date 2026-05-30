import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { Handle, Position } from "reactflow";
import { getIcon } from "../../ui/Icons";
import { useTheme } from "../../theme/ThemeContext";
export const DelayNode = memo(({ data, selected }) => {
    const theme = useTheme();
    return (_jsxs("div", { style: {
            pointerEvents: "all",
            padding: 12,
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(135deg, rgba(244, 114, 182, 0.2), ${data.color})`,
            borderRadius: 16,
            border: selected ? `2px solid ${theme.primary}` : "2px dashed rgba(248, 250, 252, 0.4)",
            color: "#fff",
            minWidth: 150,
            fontWeight: 600,
            boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
        }, children: [_jsx(Handle, { type: "target", position: Position.Left, style: { background: "#475569" } }), _jsx("div", { style: { width: 28, marginRight: 10 }, children: getIcon(data.icon) }), _jsxs("div", { children: [_jsx("div", { children: data.label }), data.leadTime && _jsxs("div", { style: { fontSize: 10 }, children: ["Lead: ", data.leadTime] }), data.taktTime && _jsxs("div", { style: { fontSize: 10 }, children: ["Takt: ", data.taktTime] })] }), _jsx(Handle, { type: "source", position: Position.Right, style: { background: "#475569" } })] }));
});
