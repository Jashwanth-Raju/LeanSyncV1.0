import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconButton } from "../ui/Buttons";
import { iconMap } from "../ui/Icons";
import { useTheme } from "../theme/ThemeContext";
const buildPalette = (color) => ({
    activeBg: `linear-gradient(135deg, ${color}, ${color}CC)`,
    borderColor: color,
    iconColor: "#f8fafc",
    shadow: `0 12px 28px ${color}55`,
    disabledBg: "rgba(148, 163, 184, 0.18)",
    disabledColor: "#a1a8b5",
});
export const CanvasToolbar = ({ onUndo, onRedo, onDelete, canUndo, canRedo, positionStyle, }) => {
    const theme = useTheme();
    const undoPalette = buildPalette(theme.primary);
    const redoPalette = buildPalette(theme.secondary);
    const deletePalette = buildPalette("#F87171");
    return (_jsxs("div", { style: {
            position: "absolute",
            display: "flex",
            gap: 14,
            padding: "10px 16px",
            borderRadius: 20,
            background: theme.toolbarGradient
                ? `linear-gradient(135deg, ${theme.toolbarGradient[0]}, ${theme.toolbarGradient[1]})`
                : "rgba(15, 23, 42, 0.35)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            boxShadow: "0 18px 42px rgba(15, 23, 42, 0.28)",
            backdropFilter: "blur(14px)",
            ...positionStyle,
        }, children: [_jsx(IconButton, { "aria-label": "Undo", title: "Undo", onClick: onUndo, disabled: !canUndo, palette: undoPalette, children: iconMap.undo }), _jsx(IconButton, { "aria-label": "Redo", title: "Redo", onClick: onRedo, disabled: !canRedo, palette: redoPalette, children: iconMap.redo }), _jsx(IconButton, { "aria-label": "Delete selected", title: "Delete selected", onClick: onDelete, palette: deletePalette, children: iconMap.delete })] }));
};
