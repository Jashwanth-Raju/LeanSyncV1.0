import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { NodeRendererProps } from "../NodeTypes";
import { getIcon } from "../../ui/Icons";
import { useTheme } from "../../theme/ThemeContext";

export const InventoryNode = memo(({ data, selected }: NodeRendererProps) => {
  const theme = useTheme();
  return (
    <div
      style={{
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
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: data.color }} />
      <div style={{ width: 24, margin: "0 8px" }}>{getIcon(data.icon)}</div>
      <div>
        <div>{data.label}</div>
        {data.capacity && <div style={{ fontSize: 10 }}>Cap: {data.capacity}</div>}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: data.color }} />
    </div>
  );
});
