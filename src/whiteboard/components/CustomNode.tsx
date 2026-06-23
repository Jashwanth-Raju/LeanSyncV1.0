/** @jsxImportSource react */
import * as React from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";
import type { WhiteboardNodeData } from "../types";
import { co2ColorScale } from "../utils/co2";
import type { NodeCO2Metrics } from "../utils/co2";
import { iconMap } from "../data";
import { SustainabilityBadge } from "./SustainabilityBadge";
import { SustainabilityPopup } from "./SustainabilityPopup";

type Co2Context = {
  map: Map<string, NodeCO2Metrics | null>;
  maxNodeValue: number;
  transportMap: Map<string, number>;
  maxTransport: number;
};

export type CustomNodeExtraProps = {
  openSustainabilityNodeId: string | null;
  bottleneckNodeId: string | null;
  bottleneckTaktGapLabel: string | null;
  showCO2Layer: boolean;
  co2Context: Co2Context;
  setOpenSustainabilityNodeId: React.Dispatch<React.SetStateAction<string | null>>;
};

type Props = NodeProps<WhiteboardNodeData> & CustomNodeExtraProps;

export const CustomNode: React.FC<Props> = ({
  data,
  id,
  openSustainabilityNodeId,
  bottleneckNodeId,
  bottleneckTaktGapLabel,
  showCO2Layer,
  co2Context,
  setOpenSustainabilityNodeId,
}) => {
  const isPopupOpen = openSustainabilityNodeId === id;
  const isBottleneck = id === bottleneckNodeId;
  const a = parseFloat(data.oeeAvailability ?? "");
  const p = parseFloat(data.oeePerformance ?? "");
  const q = parseFloat(data.oeeQuality ?? "");
  const oeeValue =
    !isNaN(a) && !isNaN(p) && !isNaN(q)
      ? ((a / 100) * (p / 100) * (q / 100) * 100).toFixed(1)
      : null;
  const co2Metric = showCO2Layer ? co2Context.map.get(id) : null;
  const heatColor = co2Metric
    ? co2ColorScale(co2Metric.absoluteValue, co2Context.maxNodeValue || 1)
    : data.color;
  const backgroundGradient = showCO2Layer
    ? `linear-gradient(135deg, ${heatColor}40, ${heatColor})`
    : `linear-gradient(135deg, ${data.color}88, ${data.color})`;
  const textColor = showCO2Layer ? "#0f172a" : "#ffffff";
  const secondaryColor = showCO2Layer
    ? "rgba(15, 23, 42, 0.7)"
    : "rgba(255,255,255,0.85)";

  return (
    <div
      style={{
        position: "relative",
        pointerEvents: "all",
        padding: 12,
        display: "flex",
        alignItems: "center",
        background: backgroundGradient,
        borderRadius: 12,
        color: textColor,
        minWidth: 140,
        justifyContent: "flex-start",
        fontWeight: 600,
        boxShadow: isBottleneck
          ? "0 0 0 3px #ef4444, 0 0 24px rgba(239,68,68,0.55)"
          : showCO2Layer
          ? `0 12px 22px ${heatColor}55`
          : "0 8px 16px rgba(0,0,0,0.18)",
        cursor: "pointer",
        border: isBottleneck
          ? "2px solid #ef4444"
          : showCO2Layer
          ? `1px solid ${heatColor}`
          : "none",
        transition: "all 0.25s ease",
        textShadow: showCO2Layer ? "none" : "0 1px 2px rgba(15, 23, 42, 0.35)",
      }}
    >
      <Handle type="target" position={Position.Top} id="t" style={{ background: "#6366f1", width: 12, height: 12, border: "2px solid #e0e7ff" }} />
      <Handle type="target" position={Position.Bottom} id="b" style={{ background: "#6366f1", width: 12, height: 12, border: "2px solid #e0e7ff" }} />
      <Handle type="target" position={Position.Left} id="l" style={{ background: "#6366f1", width: 12, height: 12, border: "2px solid #e0e7ff" }} />
      <Handle type="target" position={Position.Right} id="r" style={{ background: "#6366f1", width: 12, height: 12, border: "2px solid #e0e7ff" }} />
      <div style={{ width: 28, marginRight: 10, color: textColor }}>
        {iconMap[data.icon]}
      </div>
      <div style={{ lineHeight: 1.2 }}>
        <div>{data.label}</div>
        {data.processTime && (
          <div style={{ fontSize: 10, color: secondaryColor, fontWeight: 500 }}>
            PT: {data.processTime}
          </div>
        )}
        {data.cycleTime && (
          <div style={{ fontSize: 10, color: secondaryColor, fontWeight: 500 }}>
            CT: {data.cycleTime}
          </div>
        )}
        {oeeValue && (
          <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 700 }}>
            OEE: {oeeValue}%
          </div>
        )}
        {isBottleneck && (
          <div style={{ marginTop: 3 }}>
            <div
              style={{
                fontSize: 9,
                color: "#fca5a5",
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              ⚠ Bottleneck
            </div>
            {bottleneckTaktGapLabel && (
              <div
                style={{
                  fontSize: 9,
                  color: "#fbbf24",
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  marginTop: 1,
                }}
              >
                {bottleneckTaktGapLabel}
              </div>
            )}
          </div>
        )}
        {showCO2Layer && co2Metric && (
          <div style={{ fontSize: 10, color: secondaryColor, fontWeight: 600 }}>
            CO₂: {co2Metric.label}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Top} id="st" style={{ background: "#10b981", width: 12, height: 12, border: "2px solid #d1fae5" }} />
      <Handle type="source" position={Position.Bottom} id="sb" style={{ background: "#10b981", width: 12, height: 12, border: "2px solid #d1fae5" }} />
      <Handle type="source" position={Position.Left} id="sl" style={{ background: "#10b981", width: 12, height: 12, border: "2px solid #d1fae5" }} />
      <Handle type="source" position={Position.Right} id="sr" style={{ background: "#10b981", width: 12, height: 12, border: "2px solid #d1fae5" }} />
      <SustainabilityBadge
        sustainability={data.sustainability}
        onClick={(event) => {
          event.stopPropagation();
          setOpenSustainabilityNodeId((prev) => (prev === id ? null : id));
        }}
      />
      {isPopupOpen && (
        <SustainabilityPopup
          sustainability={data.sustainability}
          onClose={() => setOpenSustainabilityNodeId(null)}
        />
      )}
    </div>
  );
};
