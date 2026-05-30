import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { Handle, Position } from "reactflow";
import { getIcon } from "../../ui/Icons";
import { useTheme } from "../../theme/ThemeContext";
const baseStyles = {
    pointerEvents: "all",
    padding: 12,
    display: "flex",
    alignItems: "center",
    borderRadius: 12,
    color: "#fff",
    minWidth: 140,
    justifyContent: "flex-start",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    cursor: "pointer",
};
const InfoStack = ({ label, processTime, cycleTime }) => (_jsxs("div", { children: [_jsx("div", { children: label }), processTime && _jsxs("div", { style: { fontSize: 10 }, children: ["PT: ", processTime] }), cycleTime && _jsxs("div", { style: { fontSize: 10 }, children: ["CT: ", cycleTime] })] }));
export const ProcessNode = memo(({ data, selected }) => {
    const theme = useTheme();
    return (_jsxs("div", { style: {
            ...baseStyles,
            background: `linear-gradient(135deg, ${data.color}88, ${data.color})`,
            border: selected ? `2px solid ${theme.primary}` : "1px solid rgba(15,23,42,0.25)",
        }, children: [_jsx(Handle, { type: "target", position: Position.Top, style: { background: "#555" } }), _jsx("div", { style: { width: 28, marginRight: 10 }, children: getIcon(data.icon) }), _jsx(InfoStack, { label: data.label, processTime: data.processTime, cycleTime: data.cycleTime }), _jsx(Handle, { type: "source", position: Position.Bottom, style: { background: "#555" } })] }));
});
