/** @jsxImportSource react */
import * as React from "react";
import type { WhiteboardNodeData } from "../types";

export type SustainabilityBadgeProps = {
  sustainability?: WhiteboardNodeData["sustainability"];
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const formatDisplay = (sustainability: NonNullable<WhiteboardNodeData["sustainability"]>) => {
  if (sustainability.energyUse) return sustainability.energyUse;
  if (sustainability.materialWeight) return sustainability.materialWeight;
  if (sustainability.transportDistance) return sustainability.transportDistance;
  if (sustainability.wasteWeight) return sustainability.wasteWeight;
  return "";
};

export const SustainabilityBadge: React.FC<SustainabilityBadgeProps> = ({
  sustainability,
  onClick,
}) => {
  if (!sustainability)
    return null;
  const displayValue = formatDisplay(sustainability);
  const hasValue = displayValue.length > 0;
  if (!hasValue)
    return null;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "absolute",
        top: -16,
        right: -16,
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(45, 212, 191, 0.9))",
        borderRadius: 16,
        minWidth: 46,
        padding: "6px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#0f172a",
        fontSize: 11,
        fontWeight: 700,
        border: "1px solid rgba(56, 189, 248, 0.6)",
        boxShadow: "0 14px 28px rgba(15, 23, 42, 0.35)",
        cursor: "pointer",
        letterSpacing: 0.6,
      }}
    >
      <span style={{ fontSize: 9, textTransform: "uppercase" }}>CO₂</span>
      <span style={{ fontSize: 11 }}>{displayValue}</span>
    </button>
  );
};
