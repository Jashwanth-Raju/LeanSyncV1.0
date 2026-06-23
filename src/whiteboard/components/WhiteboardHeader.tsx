/** @jsxImportSource react */
import * as React from "react";
import type { Dispatch, SetStateAction } from "react";
import { TAB_BAR_HEIGHT } from "../data";
import { SCENARIO_META, SCENARIO_ORDER } from "../scenarios";
import type { ScenarioKey } from "../scenarios";
import type { LibraryCategory } from "../types";

type Props = {
  activeScenario: ScenarioKey;
  setActiveScenario: (key: ScenarioKey) => void;
  cloneScenario: (from: ScenarioKey, to: ScenarioKey) => void;
  resetScenario: (key: ScenarioKey) => void;
  dashboardVisible: boolean;
  setDashboardVisible: Dispatch<SetStateAction<boolean>>;
  activeTab: "canvas" | "insights";
  setActiveTab: Dispatch<SetStateAction<"canvas" | "insights">>;
  drawerCategory: LibraryCategory | null;
  setDrawerCategory: Dispatch<SetStateAction<LibraryCategory | null>>;
  onQuickFill: () => void;
  onExportMap: () => void;
};

export const WhiteboardHeader: React.FC<Props> = ({
  activeScenario,
  setActiveScenario,
  cloneScenario,
  resetScenario,
  dashboardVisible,
  setDashboardVisible,
  activeTab,
  setActiveTab,
  drawerCategory,
  setDrawerCategory,
  onQuickFill,
  onExportMap,
}) => {
  const scenarioMeta = SCENARIO_META[activeScenario];

  return (
    <header
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        height: TAB_BAR_HEIGHT,
        padding: "0 24px",
        borderBottom: `2px solid ${scenarioMeta.color}`,
        background: "linear-gradient(90deg, #0f172a, #1e293b)",
        zIndex: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#f8fafc" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(99, 102, 241, 0.2)",
            border: "1px solid rgba(99, 102, 241, 0.45)",
            boxShadow: "0 0 12px rgba(99, 102, 241, 0.2)",
            fontWeight: 700,
            fontSize: 14,
            color: "#e0e7ff",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#3b82f6",
              boxShadow: "0 0 6px rgba(59, 130, 246, 0.6)",
            }}
          />
          <span>LeanSync</span>
        </div>

        <span style={{ fontSize: 12, color: scenarioMeta.color, fontWeight: 600, letterSpacing: 0.2 }}>
          {scenarioMeta.subtitle}
        </span>

        <div
          style={{
            display: "inline-flex",
            padding: 3,
            marginLeft: 6,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            gap: 4,
          }}
        >
          {SCENARIO_ORDER.map((key) => {
            const meta = SCENARIO_META[key];
            const isActive = activeScenario === key;
            return (
              <button
                key={key}
                type="button"
                onClick={(event) => {
                  if (event.shiftKey && key !== activeScenario) {
                    cloneScenario(activeScenario, key);
                    setActiveScenario(key);
                    return;
                  }
                  setActiveScenario(key);
                }}
                title={
                  key === activeScenario
                    ? meta.label
                    : `${meta.label} — Shift+Click to clone current map`
                }
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? meta.color : "transparent",
                  color: isActive ? "#ffffff" : meta.color,
                  fontSize: 12,
                  letterSpacing: 0.2,
                  fontWeight: 600,
                  boxShadow: isActive ? `0 4px 12px ${meta.color}50` : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "inline-flex",
            gap: 10,
            marginLeft: 16,
            alignItems: "center",
            color: "#cbd5f5",
          }}
        >
          <button
            type="button"
            onClick={() => resetScenario(activeScenario)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.08)",
              color: "#94a3b8",
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            New Canvas
          </button>
          {activeScenario !== "current" && (
            <button
              type="button"
              onClick={() => cloneScenario("current", activeScenario)}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#64748b",
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Copy Current
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={onQuickFill}
          style={{
            padding: "7px 14px",
            borderRadius: 999,
            border: "1px solid rgba(99,102,241,0.4)",
            background: "rgba(99,102,241,0.18)",
            color: "#c7d2fe",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Quick Fill
        </button>
        <button
          type="button"
          onClick={onExportMap}
          style={{
            padding: "7px 14px",
            borderRadius: 999,
            border: "1px solid rgba(16,185,129,0.35)",
            background: "rgba(16,185,129,0.15)",
            color: "#6ee7b7",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Export PDF
        </button>

        <div
          style={{
            display: "inline-flex",
            padding: 3,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            gap: 4,
          }}
        >
          {(["canvas", "insights"] as const).map((key) => {
            const isActive = activeTab === key;
            const label = key === "canvas" ? "Canvas" : "Insights";
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveTab(key);
                  if (key === "canvas" && drawerCategory) setDrawerCategory(null);
                }}
                style={{
                  padding: "7px 16px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  background: isActive ? "#6366f1" : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  fontWeight: 600,
                  boxShadow: isActive ? "0 4px 10px rgba(99,102,241,0.3)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === "canvas" && (
          <button
            type="button"
            onClick={() => setDashboardVisible((v) => !v)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.08)",
              color: "#94a3b8",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {dashboardVisible ? "Hide Dashboards" : "Show Dashboards"}
          </button>
        )}
      </div>
    </header>
  );
};
