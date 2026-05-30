/** @jsxImportSource react */
import * as React from "react";
import type { Node } from "reactflow";
import type { WhiteboardNodeData } from "../types";

type QuickFillModalProps = {
  nodes: Node<WhiteboardNodeData>[];
  onUpdate: (nodeId: string, key: keyof WhiteboardNodeData, value: string) => void;
  onClose: () => void;
};

const COLUMNS: { key: keyof WhiteboardNodeData; label: string; width: number }[] = [
  { key: "cycleTime",       label: "Cycle Time",   width: 100 },
  { key: "processTime",     label: "Process Time", width: 100 },
  { key: "setupTime",       label: "Setup Time",   width: 100 },
  { key: "wip",             label: "WIP",          width: 80  },
  { key: "oeeAvailability", label: "OEE A%",       width: 80  },
  { key: "oeePerformance",  label: "OEE P%",       width: 80  },
  { key: "oeeQuality",      label: "OEE Q%",       width: 80  },
];

const cellInput: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  color: "#e2e8f0",
  fontSize: 13,
  padding: "4px 2px",
  outline: "none",
  textAlign: "center",
};

export const QuickFillModal: React.FC<QuickFillModalProps> = ({ nodes, onUpdate, onClose }) => {
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
          maxWidth: 900,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 28px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
              Quick Fill
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
              Update all node values
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              {sorted.length} node{sorted.length !== 1 ? "s" : ""} on this canvas — sorted left to right
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(148, 163, 184, 0.1)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              color: "#94a3b8", fontSize: 18, cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", overflowX: "auto", flex: 1 }}>
          {sorted.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#475569", fontSize: 14 }}>
              No nodes on canvas yet. Drag some nodes from the library first.
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                color: "#e2e8f0",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.15)" }}>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      color: "#64748b",
                      position: "sticky",
                      left: 0,
                      background: "rgba(15, 23, 42, 0.97)",
                      minWidth: 180,
                    }}
                  >
                    Node
                  </th>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        color: "#64748b",
                        minWidth: col.width,
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((node, index) => (
                  <tr
                    key={node.id}
                    style={{
                      borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
                      background: index % 2 === 0 ? "transparent" : "rgba(148, 163, 184, 0.03)",
                    }}
                  >
                    {/* Node name cell */}
                    <td
                      style={{
                        padding: "10px 20px",
                        position: "sticky",
                        left: 0,
                        background: index % 2 === 0 ? "rgba(15, 23, 42, 0.97)" : "rgba(20, 28, 50, 0.97)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: node.data.color,
                            flexShrink: 0,
                            boxShadow: `0 0 6px ${node.data.color}88`,
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{node.data.label}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
                            {node.data.valueType === "value-added" ? "✦ Value-add" : node.data.valueType === "non-value-added" ? "✗ Non-value" : "◎ Enabler"}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Editable KPI cells */}
                    {COLUMNS.map((col) => (
                      <td key={col.key} style={{ padding: "10px 8px", textAlign: "center" }}>
                        <input
                          type="text"
                          value={String(node.data[col.key] ?? "")}
                          onChange={(e) => onUpdate(node.id, col.key, e.target.value)}
                          placeholder="—"
                          style={cellInput}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
          <span>Changes save automatically. Click outside or press × to close.</span>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: 999,
              border: "1px solid rgba(148, 163, 184, 0.25)",
              background: "rgba(148, 163, 184, 0.1)",
              color: "#e2e8f0",
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
