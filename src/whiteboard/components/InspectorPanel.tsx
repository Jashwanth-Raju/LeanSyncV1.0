/** @jsxImportSource react */
import * as React from "react";
import { useState } from "react";
import type { Node, Edge } from "reactflow";
import type {
  WhiteboardNodeData,
  WhiteboardEdgeData,
  EdgeTheme,
  NodeMetaField,
} from "../types";

export type InspectorPanelProps = {
  top: number;
  right: number;
  width: number;
  maxHeight: string;
  activeNode: Node<WhiteboardNodeData> | null;
  activeEdge: Edge<WhiteboardEdgeData> | null;
  onClose: () => void;
  onMetaChange: (key: keyof WhiteboardNodeData, value: string) => void;
  onSustainabilityChange: (
    key: keyof NonNullable<WhiteboardNodeData["sustainability"]>,
    value: string
  ) => void;
  edgeThemes: EdgeTheme[];
  onVariantSelect: (variant: string) => void;
  defaultVariant: string;
  metaFields: NodeMetaField[];
};

const TABS: { id: "times" | "flow" | "other"; label: string; keys: string[] }[] = [
  {
    id: "times",
    label: "Times",
    keys: ["processTime", "cycleTime", "taktTime", "setupTime", "leadTime"],
  },
  {
    id: "flow",
    label: "Flow & OEE",
    keys: ["wip", "capacity", "oeeAvailability", "oeePerformance", "oeeQuality"],
  },
  {
    id: "other",
    label: "Other",
    keys: ["cost", "owner", "notes"],
  },
];

const inputStyle: React.CSSProperties = {
  borderRadius: 10,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "rgba(15, 23, 42, 0.5)",
  color: "#e2e8f0",
  padding: "8px 10px",
  width: "100%",
  boxSizing: "border-box",
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  top,
  right,
  width,
  maxHeight,
  activeNode,
  activeEdge,
  onClose,
  onMetaChange,
  onSustainabilityChange,
  edgeThemes,
  onVariantSelect,
  defaultVariant,
  metaFields,
}) => {
  const [activeTab, setActiveTab] = useState<"times" | "flow" | "other">("times");

  const tabFields = metaFields.filter((f) =>
    TABS.find((t) => t.id === activeTab)?.keys.includes(f.key as string) ?? false
  );

  return (
    <aside
      style={{
        position: "absolute",
        top,
        right,
        width,
        maxHeight,
        padding: 20,
        borderRadius: 20,
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(18px)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 15,
        boxShadow: "0 18px 42px rgba(15, 23, 42, 0.35)",
      }}
    >
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: "#64748b" }}>
            Inspector
          </span>
          <strong style={{ fontSize: 16, lineHeight: 1.2 }}>
            {activeNode?.data.label ?? (activeEdge ? "Connection" : "Selection")}
          </strong>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(148, 163, 184, 0.12)",
            color: "#94a3b8",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            cursor: "pointer", fontSize: 16, lineHeight: 1,
          }}
        >
          ×
        </button>
      </header>

      {/* Node properties */}
      {activeNode && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              gap: 3,
              padding: 3,
              borderRadius: 12,
              background: "rgba(148, 163, 184, 0.08)",
              border: "1px solid rgba(148, 163, 184, 0.18)",
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    background: isActive
                      ? "linear-gradient(135deg, rgba(99,102,241,0.65), rgba(14,165,233,0.55))"
                      : "transparent",
                    color: isActive ? "#f8fafc" : "#64748b",
                    transition: "all 0.18s ease",
                    boxShadow: isActive ? "0 4px 10px rgba(99,102,241,0.25)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Fields */}
          {tabFields.map((field) => (
            <label
              key={field.key}
              style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}
            >
              <span style={{ color: "#94a3b8", letterSpacing: 0.3 }}>{field.label}</span>
              {field.multiline ? (
                <textarea
                  value={String(activeNode.data[field.key] ?? "")}
                  onChange={(e) => onMetaChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
                />
              ) : (
                <input
                  type="text"
                  value={String(activeNode.data[field.key] ?? "")}
                  onChange={(e) => onMetaChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              )}
            </label>
          ))}

          {/* Sustainability — collapsed by default */}
          <details
            style={{
              borderRadius: 12,
              border: "1px solid rgba(148, 163, 184, 0.15)",
              padding: "10px 12px",
              background: "rgba(15, 23, 42, 0.4)",
            }}
          >
            <summary
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              Sustainability / CO₂
            </summary>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>Energy Use</span>
                <div style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr 84px" }}>
                  <input type="text" value={activeNode.data.sustainability?.energyUse ?? ""} onChange={(e) => onSustainabilityChange("energyUse", e.target.value)} placeholder="e.g. 1200" style={inputStyle} />
                  <select value={activeNode.data.sustainability?.energyUnit ?? "kWh"} onChange={(e) => onSustainabilityChange("energyUnit", e.target.value)} style={{ ...inputStyle, padding: "8px 6px" }}>
                    <option value="kWh">kWh</option>
                    <option value="MJ">MJ</option>
                    <option value="mWh">mWh</option>
                  </select>
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>Material Use</span>
                <div style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr 100px" }}>
                  <input type="text" value={activeNode.data.sustainability?.materialType ?? ""} onChange={(e) => onSustainabilityChange("materialType", e.target.value)} placeholder="Material type" style={inputStyle} />
                  <input type="text" value={activeNode.data.sustainability?.materialWeight ?? ""} onChange={(e) => onSustainabilityChange("materialWeight", e.target.value)} placeholder="Weight (kg)" style={inputStyle} />
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>Transport</span>
                <div style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr 100px" }}>
                  <input type="text" value={activeNode.data.sustainability?.transportDistance ?? ""} onChange={(e) => onSustainabilityChange("transportDistance", e.target.value)} placeholder="Distance (km)" style={inputStyle} />
                  <select value={activeNode.data.sustainability?.transportMode ?? "Truck"} onChange={(e) => onSustainabilityChange("transportMode", e.target.value)} style={{ ...inputStyle, padding: "8px 6px" }}>
                    <option>Truck</option>
                    <option>Rail</option>
                    <option>Sea</option>
                    <option>Air</option>
                    <option>Pipeline</option>
                  </select>
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>Waste</span>
                <div style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr 80px" }}>
                  <input type="text" value={activeNode.data.sustainability?.wasteType ?? ""} onChange={(e) => onSustainabilityChange("wasteType", e.target.value)} placeholder="Waste type" style={inputStyle} />
                  <input type="text" value={activeNode.data.sustainability?.wasteWeight ?? ""} onChange={(e) => onSustainabilityChange("wasteWeight", e.target.value)} placeholder="kg" style={inputStyle} />
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>Scope Emissions (tCO₂e)</span>
                <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {(["scope1", "scope2", "scope3"] as const).map((scope) => (
                    <input key={scope} type="text" value={activeNode.data.sustainability?.[scope] ?? ""} onChange={(e) => onSustainabilityChange(scope, e.target.value)} placeholder={scope.toUpperCase()} style={inputStyle} />
                  ))}
                </div>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>CO₂ per Unit (kg)</span>
                <input type="text" value={activeNode.data.sustainability?.co2PerUnit ?? ""} onChange={(e) => onSustainabilityChange("co2PerUnit", e.target.value)} placeholder="e.g. 2.5" style={inputStyle} />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>Default Emission Factors</span>
                <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(3, 1fr)" }}>
                  <input type="text" value={activeNode.data.sustainability?.electricityFactor ?? ""} onChange={(e) => onSustainabilityChange("electricityFactor", e.target.value)} placeholder="Electricity" style={inputStyle} />
                  <input type="text" value={activeNode.data.sustainability?.materialFactor ?? ""} onChange={(e) => onSustainabilityChange("materialFactor", e.target.value)} placeholder="Materials" style={inputStyle} />
                  <input type="text" value={activeNode.data.sustainability?.transportFactor ?? ""} onChange={(e) => onSustainabilityChange("transportFactor", e.target.value)} placeholder="Transport" style={inputStyle} />
                </div>
              </label>

            </div>
          </details>
        </div>
      )}

      {/* Edge themes */}
      {activeEdge && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#64748b", letterSpacing: 0.8, textTransform: "uppercase" }}>Connection Style</span>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {edgeThemes.map((theme) => {
              const isActive = (activeEdge.data?.connectionType ?? defaultVariant) === theme.key;
              return (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => onVariantSelect(theme.key)}
                  style={{
                    position: "relative",
                    borderRadius: 16,
                    padding: "12px 14px",
                    textAlign: "left",
                    border: isActive ? `1px solid ${theme.color}` : "1px solid rgba(148, 163, 184, 0.2)",
                    background: isActive
                      ? `linear-gradient(135deg, ${theme.color}3d, ${theme.color}66)`
                      : "rgba(30, 41, 59, 0.7)",
                    color: "#e2e8f0",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    boxShadow: isActive ? `0 10px 24px ${theme.color}33` : "none",
                    transition: "all 0.18s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <strong style={{ fontSize: 12, letterSpacing: 0.3 }}>{theme.label}</strong>
                    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, padding: "2px 7px", borderRadius: 999, border: `1px solid ${theme.color}66`, background: `${theme.color}22`, color: "#f8fafc" }}>
                      {theme.badge}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.3 }}>{theme.description}</span>
                  <div style={{ height: 3, borderRadius: 999, background: `linear-gradient(90deg, ${theme.color}, ${theme.color}66)` }} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
