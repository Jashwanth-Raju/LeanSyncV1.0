import { useMemo } from "react";
import type { NodeLibraryCategory, NodeDefinition } from "../nodes/NodeTypes";
import { iconMap } from "./Icons";
import { IconButton } from "./Buttons";
import { useTheme } from "../theme/ThemeContext";

interface CommandSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: NodeLibraryCategory[];
  categoryFilter: string;
  categoryFilters: string[];
  onCategorySelect: (filter: string) => void;
  onNodeDragStart: (event: React.DragEvent, node: NodeDefinition) => void;
  onNodeDragEnd: () => void;
  insights: Array<{ title: string; primary: string; accent?: string; footer?: string }>;
  layers: Array<{ id: string; label: string; color: string; description?: string }>;
  activeLayers: string[];
  layerValues: Record<string, string>;
  onLayerToggle: (layerId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const SectionTitle = ({ title }: { title: string }) => (
  <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }}>{title}</div>
);

export const CommandSidebar = ({
  collapsed,
  onToggle,
  searchTerm,
  onSearchChange,
  categories,
  categoryFilter,
  categoryFilters,
  onCategorySelect,
  onNodeDragStart,
  onNodeDragEnd,
  insights,
  layers,
  activeLayers,
  layerValues,
  onLayerToggle,
  onUndo,
  onRedo,
  onDelete,
  canUndo,
  canRedo,
}: CommandSidebarProps) => {
  const theme = useTheme();
  const width = collapsed ? 70 : 340;

  const filterButtons = useMemo(() => {
    if (collapsed) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {categoryFilters.map((filter) => {
          const isActive = categoryFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onCategorySelect(filter)}
              style={{
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 12,
                border: isActive ? `1px solid ${theme.primary}` : "1px solid rgba(148,163,184,0.3)",
                background: isActive ? `${theme.primary}22` : "rgba(15,23,42,0.4)",
                color: "#f8fafc",
                cursor: "pointer",
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>
    );
  }, [categoryFilter, categoryFilters, collapsed, onCategorySelect, theme.primary]);

  const renderLayerToggle = (layer: { id: string; label: string; color: string }) => {
    const isActive = activeLayers.includes(layer.id);
    return (
      <button
        key={layer.id}
        type="button"
        onClick={() => onLayerToggle(layer.id)}
        style={{
          borderRadius: 12,
          border: isActive ? `1px solid ${layer.color}` : "1px solid rgba(148,163,184,0.3)",
          background: isActive ? `${layer.color}22` : "rgba(15,23,42,0.45)",
          color: "#f8fafc",
          padding: "10px 14px",
          fontSize: 13,
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <span>{layer.label}</span>
        <span style={{ fontWeight: 600 }}>{layerValues[layer.id] ?? "--"}</span>
      </button>
    );
  };

  const renderNode = (node: NodeDefinition) => (
    <div
      key={node.label}
      draggable
      onDragStart={(event) => onNodeDragStart(event, node)}
      onDragEnd={onNodeDragEnd}
      style={{
        borderRadius: 12,
        padding: "10px 12px",
        border: `1px solid ${node.color}`,
        background: "rgba(15, 23, 42, 0.35)",
        cursor: "grab",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ color: node.color }}>{iconMap[node.icon] ?? iconMap.industry}</span>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: 600 }}>{node.label}</span>
        {node.tagline && <span style={{ fontSize: 11, color: "#cbd5f5" }}>{node.tagline}</span>}
      </div>
    </div>
  );

  return (
    <div
      style={{
        width,
        transition: "width 0.2s ease",
        background: theme.sidebarGlass ?? "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(30,41,59,0.92))",
        borderRight: "1px solid rgba(148,163,184,0.15)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: "#f8fafc",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: "absolute",
          top: 20,
          right: collapsed ? 10 : -15,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {collapsed ? ">" : "<"}
      </button>

      {collapsed ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 70 }}>
          <IconButton aria-label="Undo" title="Undo" onClick={onUndo} disabled={!canUndo}>
            {iconMap.undo}
          </IconButton>
          <IconButton aria-label="Redo" title="Redo" onClick={onRedo} disabled={!canRedo}>
            {iconMap.redo}
          </IconButton>
          <IconButton aria-label="Delete" title="Delete" onClick={onDelete}>
            {iconMap.delete}
          </IconButton>
          {layers.slice(0, 3).map((layer) => (
            <span
              key={layer.id}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: layer.color,
                opacity: activeLayers.includes(layer.id) ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ padding: "60px 20px 20px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
          <SectionTitle title="Node Library" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search catalog"
            style={{
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.35)",
              background: "rgba(15,23,42,0.6)",
              color: "#f8fafc",
              padding: "10px 12px",
              fontSize: 14,
            }}
          />
          {filterButtons}

          {categories.map((category) => (
            <div key={category.category} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 600, color: category.accent }}>{category.category}</div>
              <div style={{ fontSize: 12, color: "#cbd5f5" }}>{category.description}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {category.nodes.map((node) => renderNode(node))}
              </div>
            </div>
          ))}

          <SectionTitle title="Insights" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {insights.map((card) => (
              <div
                key={card.title}
                style={{
                  borderRadius: 16,
                  padding: "12px 16px",
                  background: theme.cardGradient
                    ? `linear-gradient(135deg, ${theme.cardGradient[0]}, ${theme.cardGradient[1]})`
                    : "rgba(15,23,42,0.5)",
                  border: "1px solid rgba(148,163,184,0.3)",
                }}
              >
                <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#cbd5f5" }}>{card.title}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{card.primary}</div>
                {card.accent && <div style={{ fontSize: 12, color: "#e2e8f0" }}>{card.accent}</div>}
                {card.footer && <div style={{ fontSize: 11, color: "#cbd5f5" }}>{card.footer}</div>}
              </div>
            ))}
          </div>

          {layers.length > 0 && (
            <>
              <SectionTitle title="Insight Layers" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {layers.map((layer) => renderLayerToggle(layer))}
              </div>
            </>
          )}

          <SectionTitle title="Canvas Controls" />
          <div style={{ display: "flex", gap: 12 }}>
            <IconButton aria-label="Undo" title="Undo" onClick={onUndo} disabled={!canUndo}>
              {iconMap.undo}
            </IconButton>
            <IconButton aria-label="Redo" title="Redo" onClick={onRedo} disabled={!canRedo}>
              {iconMap.redo}
            </IconButton>
            <IconButton aria-label="Delete" title="Delete" onClick={onDelete}>
              {iconMap.delete}
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
};
