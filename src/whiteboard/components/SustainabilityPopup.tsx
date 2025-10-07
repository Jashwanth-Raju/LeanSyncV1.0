/** @jsxImportSource react */
import * as React from "react";
import type { WhiteboardNodeData } from "../types";

export type SustainabilityPopupProps = {
  sustainability?: WhiteboardNodeData["sustainability"];
  onClose: () => void;
};

const MetricRow: React.FC<{ label: string; value?: string; accent?: string }> = ({
  label,
  value,
  accent,
}) => {
  if (!value || value.trim().length === 0)
    return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 13,
        padding: "6px 0",
        borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
      }}
    >
      <span style={{ color: "#e2e8f0" }}>{label}</span>
      <span style={{ color: accent ?? "#38bdf8", fontWeight: 600 }}>{value}</span>
    </div>
  );
};

export const SustainabilityPopup: React.FC<SustainabilityPopupProps> = ({
  sustainability,
  onClose,
}) => {
  if (!sustainability)
    return null;
  const {
    energyUse,
    energyUnit,
    materialType,
    materialWeight,
    transportDistance,
    transportMode,
    wasteType,
    wasteWeight,
    scope1,
    scope2,
    scope3,
    co2PerUnit,
    electricityFactor,
    materialFactor,
    transportFactor,
  } = sustainability;
  return (
    <div
      style={{
        position: "absolute",
        top: -10,
        right: 60,
        width: 240,
        borderRadius: 18,
        padding: "16px 18px",
        background: "linear-gradient(160deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
        boxShadow: "0 26px 48px rgba(15, 23, 42, 0.45)",
        border: "1px solid rgba(59, 130, 246, 0.25)",
        color: "#e2e8f0",
        zIndex: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <strong style={{ letterSpacing: 0.8, fontSize: 13, textTransform: "uppercase" }}>
          Sustainability Snapshot
        </strong>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "1px solid rgba(148, 163, 184, 0.3)",
            background: "rgba(15, 23, 42, 0.6)",
            color: "#94a3b8",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <MetricRow label="Energy" value={energyUse ? `${energyUse} ${energyUnit ?? ""}` : undefined} accent="#38bdf8" />
        <MetricRow label="Material" value={materialType ? `${materialType}${materialWeight ? ` · ${materialWeight} kg` : ""}` : undefined} accent="#a855f7" />
        <MetricRow label="Transport" value={transportDistance ? `${transportDistance} km${transportMode ? ` · ${transportMode}` : ""}` : undefined} accent="#facc15" />
        <MetricRow label="Waste" value={wasteType ? `${wasteType}${wasteWeight ? ` · ${wasteWeight} kg` : ""}` : undefined} accent="#f970a6" />
        <MetricRow label="Scope 1" value={scope1} accent="#f87171" />
        <MetricRow label="Scope 2" value={scope2} accent="#60a5fa" />
        <MetricRow label="Scope 3" value={scope3} accent="#fbbf24" />
        <MetricRow label="CO₂ / Unit" value={co2PerUnit ? `${co2PerUnit} kg` : undefined} accent="#34d399" />
        <MetricRow label="Electricity Factor" value={electricityFactor} accent="#38bdf8" />
        <MetricRow label="Material Factor" value={materialFactor} accent="#a855f7" />
        <MetricRow label="Transport Factor" value={transportFactor} accent="#facc15" />
      </div>
    </div>
  );
};
