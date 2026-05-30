import { IconButton } from "../ui/Buttons";
import { iconMap } from "../ui/Icons";
import { useTheme } from "../theme/ThemeContext";

interface CanvasToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  canUndo: boolean;
  canRedo: boolean;
  positionStyle?: React.CSSProperties;
}

const buildPalette = (color: string) => ({
  activeBg: `linear-gradient(135deg, ${color}, ${color}CC)`,
  borderColor: color,
  iconColor: "#f8fafc",
  shadow: `0 12px 28px ${color}55`,
  disabledBg: "rgba(148, 163, 184, 0.18)",
  disabledColor: "#a1a8b5",
});

export const CanvasToolbar = ({
  onUndo,
  onRedo,
  onDelete,
  canUndo,
  canRedo,
  positionStyle,
}: CanvasToolbarProps) => {
  const theme = useTheme();
  const undoPalette = buildPalette(theme.primary);
  const redoPalette = buildPalette(theme.secondary);
  const deletePalette = buildPalette("#F87171");

  return (
    <div
      style={{
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
      }}
    >
      <IconButton aria-label="Undo" title="Undo" onClick={onUndo} disabled={!canUndo} palette={undoPalette}>
        {iconMap.undo}
      </IconButton>
      <IconButton aria-label="Redo" title="Redo" onClick={onRedo} disabled={!canRedo} palette={redoPalette}>
        {iconMap.redo}
      </IconButton>
      <IconButton aria-label="Delete selected" title="Delete selected" onClick={onDelete} palette={deletePalette}>
        {iconMap.delete}
      </IconButton>
    </div>
  );
};
