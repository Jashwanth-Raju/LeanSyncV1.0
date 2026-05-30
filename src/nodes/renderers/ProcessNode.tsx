import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { NodeRendererProps } from "../NodeTypes";
import { getIcon } from "../../ui/Icons";
import { useTheme } from "../../theme/ThemeContext";

const baseStyles: React.CSSProperties = {
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

const InfoStack = ({ label, processTime, cycleTime }: { label: string; processTime?: string; cycleTime?: string }) => (
  <div>
    <div>{label}</div>
    {processTime && <div style={{ fontSize: 10 }}>PT: {processTime}</div>}
    {cycleTime && <div style={{ fontSize: 10 }}>CT: {cycleTime}</div>}
  </div>
);

export const ProcessNode = memo(({ data, selected }: NodeRendererProps) => {
  const theme = useTheme();
  return (
    <div
      style={{
        ...baseStyles,
        background: `linear-gradient(135deg, ${data.color}88, ${data.color})`,
        border: selected ? `2px solid ${theme.primary}` : "1px solid rgba(15,23,42,0.25)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
      <div style={{ width: 28, marginRight: 10 }}>{getIcon(data.icon)}</div>
      <InfoStack label={data.label} processTime={data.processTime} cycleTime={data.cycleTime} />
      <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
    </div>
  );
});
