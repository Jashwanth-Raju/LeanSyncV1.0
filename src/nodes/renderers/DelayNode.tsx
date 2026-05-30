import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { NodeRendererProps } from "../NodeTypes";
import { getIcon } from "../../ui/Icons";
import { useTheme } from "../../theme/ThemeContext";

export const DelayNode = memo(({ data, selected }: NodeRendererProps) => {
  const theme = useTheme();
  return (
    <div
      style={{
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
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: "#475569" }} />
      <div style={{ width: 28, marginRight: 10 }}>{getIcon(data.icon)}</div>
      <div>
        <div>{data.label}</div>
        {data.leadTime && <div style={{ fontSize: 10 }}>Lead: {data.leadTime}</div>}
        {data.taktTime && <div style={{ fontSize: 10 }}>Takt: {data.taktTime}</div>}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: "#475569" }} />
    </div>
  );
});
