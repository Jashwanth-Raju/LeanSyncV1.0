/** @jsxImportSource react */
import * as React from "react";
import { iconMap } from "../data";
import type { LibraryCategory, LibraryNode } from "../types";

export type NodeLibraryPanelProps = {
  top: number;
  offset: number;
  width: number;
  maxHeight: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: string[];
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
  library: LibraryCategory[];
  hasResults: boolean;
  onDragStart: (
    event: React.DragEvent<HTMLElement>,
    node: LibraryNode
  ) => void;
  activeCategory?: LibraryCategory | null;
  onCloseDrawer?: () => void;
};

const buttonStyle = (active: boolean): React.CSSProperties => ({
  borderRadius: 999,
  padding: "8px 16px",
  fontSize: 12,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  border: active
    ? "1px solid rgba(129, 140, 248, 0.8)"
    : "1px solid rgba(148, 163, 184, 0.25)",
  background: active
    ? "linear-gradient(135deg, rgba(129, 140, 248, 0.35), rgba(14, 165, 233, 0.3))"
    : "rgba(15, 23, 42, 0.5)",
  color: "#e2e8f0",
  cursor: "pointer",
});

export const NodeLibraryPanel: React.FC<NodeLibraryPanelProps> = ({
  top,
  offset,
  width,
  maxHeight,
  searchTerm,
  onSearchChange,
  filters,
  activeFilter,
  onFilterSelect,
  library,
  hasResults,
  onDragStart,
  activeCategory,
  onCloseDrawer,
}) => (
  <>
    <aside
      style={{
        position: "absolute",
        top,
        left: offset,
        width,
        maxHeight,
        height: maxHeight,
        padding: 20,
        borderRadius: 20,
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background: "rgba(15, 23, 42, 0.88)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
        boxShadow: "0 14px 32px rgba(15, 23, 42, 0.45)",
        zIndex: 15,
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            color: "#94a3b8",
          }}
        >
          Node Library
        </span>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "#cbd5f5",
            lineHeight: 1.4,
          }}
        >
          Drag an activity, signal, or support element onto the canvas to build your
          flow.
        </p>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search catalog"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(148, 163, 184, 0.35)",
            background: "rgba(15, 23, 42, 0.6)",
            color: "#e2e8f0",
            fontSize: 13,
            outline: "none",
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterSelect(filter)}
              style={buttonStyle(activeFilter === filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>
    </aside>

    {activeCategory && (
      <div
        style={{
          position: "absolute",
          top,
          right: 32,
          height: `calc(100% - ${top + 32}px)`,
          width: 420,
          borderRadius: 24,
          background: "rgba(15, 23, 42, 0.94)",
          border: `1px solid ${activeCategory.accent}44`,
          boxShadow: "-24px 32px 64px rgba(15, 23, 42, 0.45)",
          color: "#e2e8f0",
          display: "flex",
          flexDirection: "column",
          padding: "24px 26px",
          gap: 18,
          zIndex: 18,
          overflow: "hidden",
          transition: "all 0.25s ease",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#94a3b8" }}>
              Category
            </span>
            <h3 style={{ margin: 0, fontSize: 22 }}>{activeCategory.category}</h3>
            {activeCategory.description && (
              <p style={{ margin: 0, fontSize: 13, color: "#cbd5f5" }}>
                {activeCategory.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCloseDrawer}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              background: "rgba(15, 23, 42, 0.6)",
              color: "#e2e8f0",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </header>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "grid",
            gap: 14,
            gridTemplateColumns: "1fr",
            paddingRight: 8,
          }}
        >
          {activeCategory.nodes.map((libraryNode) => (
            <div
              key={libraryNode.label}
              role="button"
              draggable
              onDragStart={(event) => onDragStart(event, libraryNode)}
              style={{
                padding: "18px 20px",
                borderRadius: 20,
                border: `1px solid ${libraryNode.color}55`,
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(8, 14, 24, 0.92))",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                cursor: "grab",
                boxShadow: `0 18px 36px ${libraryNode.color}25`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${libraryNode.color}30, ${libraryNode.color})`,
                    color: "#0f172a",
                    fontSize: 24,
                  }}
                >
                  {iconMap[libraryNode.icon]}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <strong style={{ fontSize: 18 }}>{libraryNode.label}</strong>
                  {libraryNode.tagline && (
                    <span style={{ fontSize: 13, color: "#cbd5f5" }}>{libraryNode.tagline}</span>
                  )}
                </div>
              </div>
              {libraryNode.badge && (
                <span
                  style={{
                    alignSelf: "flex-start",
                    fontSize: 12,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: `${libraryNode.color}25`,
                    border: `1px solid ${libraryNode.color}55`,
                    color: "#f8fafc",
                  }}
                >
                  {libraryNode.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);
