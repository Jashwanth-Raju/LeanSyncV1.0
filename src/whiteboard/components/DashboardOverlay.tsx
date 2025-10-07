/** @jsxImportSource react */
import * as React from "react";
import type { DashboardCard } from "../types";

export type DashboardOverlayProps = {
  top: number;
  left: number;
  right: number;
  cards: DashboardCard[];
};

export const DashboardOverlay: React.FC<DashboardOverlayProps> = ({
  top,
  left,
  right,
  cards,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      right,
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
      gap: 16,
      flexWrap: "wrap",
      pointerEvents: "none",
      zIndex: 12,
    }}
  >
    {cards.map((card) => (
      <div
        key={card.title}
        style={{
          pointerEvents: "auto",
          borderRadius: 14,
          padding: "12px 16px",
          background: "rgba(15, 23, 42, 0.55)",
          border: "1px solid rgba(148, 163, 184, 0.35)",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.3)",
          backdropFilter: "blur(18px)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: "0 1 200px",
          minWidth: 180,
          color: "#e2e8f0",
        }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          {card.title}
        </span>
        <strong style={{ fontSize: 22 }}>{card.primary}</strong>
        {card.accent && (
          <span style={{ fontSize: 12.5, color: "#cbd5f5" }}>{card.accent}</span>
        )}
        {card.footer && (
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{card.footer}</span>
        )}
      </div>
    ))}
  </div>
);
