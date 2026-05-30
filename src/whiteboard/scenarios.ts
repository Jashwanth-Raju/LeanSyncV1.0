import type { Node } from "reactflow";
import type { WhiteboardNodeData, DashboardCard, HistorySnapshot } from "./types";
import { parseDurationToMinutes, formatMinutes } from "./utils";

export type ScenarioKey = "current" | "future" | "whatIf";

export const SCENARIO_META: Record<ScenarioKey, { label: string; subtitle: string; color: string }> = {
  current: { label: "Current State", subtitle: "As-is operations", color: "#3b82f6" },
  future: { label: "Future State", subtitle: "Design the next iteration", color: "#10b981" },
  whatIf: { label: "What-if Lab", subtitle: "Run experiments safely", color: "#f59e0b" },
};

export const SCENARIO_ORDER: ScenarioKey[] = ["current", "future", "whatIf"];

export type HistorySnapshotStore = {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
};

export type SaveStatus = "saved" | "saving" | "error";

export const getHistory = (): HistorySnapshotStore => ({ past: [], future: [] });

export const computeDashboardMetrics = (nodes: Node<WhiteboardNodeData>[]) => {
  const totals = {
    totalSteps: nodes.length,
    valueAddedSteps: 0,
    enablerSteps: 0,
    nonValueAddedSteps: 0,
    processMinutes: 0,
    processCount: 0,
    cycleMinutes: 0,
    cycleCount: 0,
    leadMinutes: 0,
    leadCount: 0,
    setupMinutes: 0,
    setupCount: 0,
    taktMinutes: 0,
    taktCount: 0,
    valueAddedMinutes: 0,
    nonValueAddedMinutes: 0,
    delayMinutes: 0,
  };

  nodes.forEach((node) => {
    const variant = node.data.valueType ?? "enabler";
    if (variant === "value-added") totals.valueAddedSteps += 1;
    else if (variant === "non-value-added") totals.nonValueAddedSteps += 1;
    else totals.enablerSteps += 1;

    const process = parseDurationToMinutes(node.data.processTime);
    const cycle = parseDurationToMinutes(node.data.cycleTime);
    const lead = parseDurationToMinutes(node.data.leadTime);
    const setup = parseDurationToMinutes(node.data.setupTime);
    const takt = parseDurationToMinutes(node.data.taktTime);

    if (process !== null) {
      totals.processMinutes += process;
      totals.processCount += 1;
      if (variant === "value-added") totals.valueAddedMinutes += process;
      else totals.nonValueAddedMinutes += process;
    }
    if (cycle !== null) {
      totals.cycleMinutes += cycle;
      totals.cycleCount += 1;
    }
    if (lead !== null) {
      totals.leadMinutes += lead;
      totals.leadCount += 1;
    }
    if (setup !== null) {
      totals.setupMinutes += setup;
      totals.setupCount += 1;
    }
    if (takt !== null) {
      totals.taktMinutes += takt;
      totals.taktCount += 1;
    }
  });

  const averageLead = totals.leadCount ? totals.leadMinutes / totals.leadCount : null;
  const averageCycle = totals.cycleCount ? totals.cycleMinutes / totals.cycleCount : null;
  const averageTakt = totals.taktCount ? totals.taktMinutes / totals.taktCount : null;
  const taktGap =
    averageCycle !== null && averageTakt !== null ? averageCycle - averageTakt : null;
  const setupAverage = totals.setupCount ? totals.setupMinutes / totals.setupCount : null;
  const valueAddedRatio = totals.processMinutes
    ? (totals.valueAddedMinutes / totals.processMinutes) * 100
    : null;

  const cards: DashboardCard[] = [
    {
      title: "Steps",
      primary: `${totals.totalSteps}`,
      accent: `${totals.valueAddedSteps} value-add`,
      footer: `${totals.enablerSteps} enabler · ${totals.nonValueAddedSteps} non-value`,
    },
    {
      title: "Lead Time",
      primary: formatMinutes(averageLead),
      accent: `Process ${formatMinutes(totals.processMinutes)}`,
      footer: `Cycle ${formatMinutes(totals.cycleMinutes)}`,
    },
    {
      title: "Value Mix",
      primary: valueAddedRatio ? `${valueAddedRatio.toFixed(1)}% VA` : "--",
      accent: `${formatMinutes(totals.valueAddedMinutes)} value-add`,
      footer: `${formatMinutes(totals.nonValueAddedMinutes)} non-value`,
    },
    {
      title: "Cycle vs Takt",
      primary: averageCycle ? formatMinutes(averageCycle) : "--",
      accent: averageTakt ? `Takt ${formatMinutes(averageTakt)}` : undefined,
      footer:
        averageCycle && averageTakt && taktGap !== null
          ? `${taktGap > 0 ? "+" : ""}${formatMinutes(Math.abs(taktGap))} ${
              taktGap > 0 ? "over" : taktGap < 0 ? "under" : "on"
            } takt`
          : undefined,
    },
    {
      title: "Setup & Delay",
      primary: formatMinutes(totals.delayMinutes),
      accent: totals.delayMinutes ? "Wait / queue" : undefined,
      footer: setupAverage ? `Avg setup ${formatMinutes(setupAverage)}` : undefined,
    },
  ];

  return { totals, cards };
};
