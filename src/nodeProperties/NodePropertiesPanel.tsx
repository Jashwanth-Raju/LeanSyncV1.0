import { edgeLibrary } from "../nodes/edgeThemes";
import { nodeMetaFields } from "./useNodeProperties";
import { EdgePreview } from "./EdgePreview";
import { Modal } from "../ui/Modal";
import type { WhiteboardEdge, WhiteboardNode } from "../nodes/NodeTypes";

interface NodePropertiesPanelProps {
  activeNode: WhiteboardNode | null;
  activeEdge: WhiteboardEdge | null;
  inspectorMaxHeight: string;
  onNodeMetaChange: (key: keyof WhiteboardNode["data"], value: string) => void;
  onEdgeVariantSelect: (variant: string) => void;
}

export const NodePropertiesPanel = ({
  activeNode,
  activeEdge,
  inspectorMaxHeight,
  onNodeMetaChange,
  onEdgeVariantSelect,
}: NodePropertiesPanelProps) => {
  if (!activeNode && !activeEdge) return null;

  if (activeEdge) {
    const activeVariant = activeEdge.data?.connectionType ?? edgeLibrary[0]?.key;
    return (
      <Modal maxHeight={inspectorMaxHeight}>
        <div>
          <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>
            Connection Type
          </h3>
          <p style={{ fontSize: 12, color: "#cbd5f5", marginBottom: 12 }}>
            Adjust handoff semantics and styling.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {edgeLibrary.map((variant) => (
              <button
                key={variant.key}
                type="button"
                onClick={() => onEdgeVariantSelect(variant.key)}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border:
                    activeVariant === variant.key
                      ? "1px solid rgba(129, 140, 248, 0.9)"
                      : "1px solid rgba(148, 163, 184, 0.35)",
                  background:
                    activeVariant === variant.key
                      ? "rgba(79, 70, 229, 0.2)"
                      : "rgba(15, 23, 42, 0.4)",
                  color: "#e2e8f0",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600 }}>{variant.label}</div>
                <EdgePreview variant={variant.key} />
                <div style={{ fontSize: 11, color: "#cbd5f5" }}>{variant.description}</div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  if (!activeNode) return null;

  return (
    <Modal maxHeight={inspectorMaxHeight}>
      <div>
        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>
          {activeNode.data.label}
        </h3>
        <p style={{ fontSize: 12, color: "#cbd5f5" }}>{activeNode.data.category}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {nodeMetaFields.map((field) => (
          <label key={field.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#cbd5f5", textTransform: "uppercase", letterSpacing: 0.6 }}>
              {field.label}
            </span>
            {field.multiline ? (
              <textarea
                value={(activeNode.data[field.key] as string) ?? ""}
                onChange={(event) => onNodeMetaChange(field.key, event.target.value)}
                rows={3}
                placeholder={field.placeholder}
                style={{
                  resize: "vertical",
                  borderRadius: 10,
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  background: "rgba(15, 23, 42, 0.4)",
                  color: "#f8fafc",
                  padding: "10px 12px",
                  fontSize: 13,
                }}
              />
            ) : (
              <input
                type="text"
                value={(activeNode.data[field.key] as string) ?? ""}
                onChange={(event) => onNodeMetaChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  background: "rgba(15, 23, 42, 0.4)",
                  color: "#f8fafc",
                  padding: "8px 10px",
                  fontSize: 13,
                }}
              />
            )}
          </label>
        ))}
      </div>
    </Modal>
  );
};
