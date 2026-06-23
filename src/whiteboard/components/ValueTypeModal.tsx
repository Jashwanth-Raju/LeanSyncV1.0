/** @jsxImportSource react */
import * as React from "react";
import type { Node } from "reactflow";
import type { ValueType, WhiteboardNodeData } from "../types";

type ValueTypeModalProps = {
  nodes: Node<WhiteboardNodeData>[];
  onUpdate: (nodeId: string, valueType: ValueType) => void;
  onClose: () => void;
};

const VALUE_TYPES: { key: ValueType; label: string; short: string; color: string; description: string }[] = [
  {
    key: "value-added",
    label: "Value-Added",
    short: "VA",
    color: "#10b981",
    description: "Customer pays for this — directly transforms the product",
  },
  {
    key: "enabler",
    label: "Enabler",
    short: "EN",
    color: "#f59e0b",
    description: "Necessary but not directly value-adding",
  },
  {
    key: "non-value-added",
    label: "Non-Value-Added",
    short: "NVA",
    color: "#ef4444",
    description: "Waste — candidate for elimination or reduction",
  },
];

export const ValueTypeModal: React.FC<ValueTypeModalProps> = ({ nodes, onUpdate, onClose }) => {
  const sorted = [...nodes].sort((a, b) => (a.position?.x ?? 0) - (b.position?.x ?? 0));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(2, 6, 23, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "rgba(15, 23, 42, 0.97)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(2, 6, 23, 0.6)",
          width: "100%",
          maxWidth: 760,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "24px 28px 20px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
              Analytics Configuration
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
              Value Classification
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Classify each step so the Insights panel can correctly calculate your value-added ratio and waste.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(148, 163, 184, 0.1)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              color: "#94a3b8", fontSize: 18, cursor: "pointer",
              flexShrink: 0, marginLeft: 16,
            }}
          >
            ×
          </button>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: "16px 28px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
            flexWrap: "wrap",
          }}
        >
          {VALUE_TYPES.map((vt) => (
            <div key={vt.key} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span
                style={{
                  marginTop: 3,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: vt.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${vt.color}88`,
                }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: vt.color }}>{vt.label}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{vt.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Node list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {sorted.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#475569", fontSize: 14 }}>
              No nodes on canvas yet. Drag some nodes from the library first.
            </div>
          ) : (
            sorted.map((node, index) => {
              const current = node.data.valueType ?? "enabler";
              return (
                <div
                  key={node.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 28px",
                    borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
                    background: index % 2 === 0 ? "transparent" : "rgba(148, 163, 184, 0.03)",
                    gap: 16,
                  }}
                >
                  {/* Node identity */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: node.data.color,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${node.data.color}88`,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {node.data.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                        {node.data.badge ?? node.data.category}
                      </div>
                    </div>
                  </div>

                  {/* 3-button selector */}
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      padding: 4,
                      borderRadius: 12,
                      background: "rgba(148, 163, 184, 0.08)",
                      border: "1px solid rgba(148, 163, 184, 0.15)",
                      flexShrink: 0,
                    }}
                  >
                    {VALUE_TYPES.map((vt) => {
                      const isActive = current === vt.key;
                      return (
                        <button
                          key={vt.key}
                          type="button"
                          onClick={() => onUpdate(node.id, vt.key)}
                          title={vt.description}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: 0.2,
                            transition: "all 0.15s ease",
                            background: isActive ? vt.color : "transparent",
                            color: isActive ? "#ffffff" : "#64748b",
                            boxShadow: isActive ? `0 2px 8px ${vt.color}55` : "none",
                          }}
                        >
                          {vt.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 28px",
            borderTop: "1px solid rgba(148, 163, 184, 0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
            color: "#475569",
          }}
        >
          <span>Changes apply immediately to the Insights analytics.</span>
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              borderRadius: 999,
              border: "1px solid rgba(99,102,241,0.4)",
              background: "rgba(99,102,241,0.18)",
              color: "#c7d2fe",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
