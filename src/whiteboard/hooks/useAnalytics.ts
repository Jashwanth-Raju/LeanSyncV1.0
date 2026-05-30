import { useMemo } from "react";
import type { Node, Edge } from "reactflow";
import type { WhiteboardNodeData, WhiteboardEdgeData } from "../types";
import { parseDurationToMinutes, formatMinutes, parseNumericValue } from "../utils";
import { parseCO2Numeric } from "../utils/co2";
import { edgeThemeMap, DEFAULT_EDGE_VARIANT } from "../data";
import type { computeDashboardMetrics } from "../scenarios";

type Totals = ReturnType<typeof computeDashboardMetrics>["totals"];
type ScenarioMeta = { label: string; subtitle: string; color: string };

export const useAnalytics = (
  nodes: Node<WhiteboardNodeData>[],
  edges: Edge<WhiteboardEdgeData>[],
  totals: Totals,
  scenarioMeta: ScenarioMeta
) => {
  const valueBreakdown = useMemo(
    () => [
      { label: "Value-add", count: totals.valueAddedSteps, color: "#38bdf8" },
      { label: "Enabler", count: totals.enablerSteps, color: "#6366f1" },
      { label: "Non-value", count: totals.nonValueAddedSteps, color: "#f472b6" },
    ],
    [totals.enablerSteps, totals.nonValueAddedSteps, totals.valueAddedSteps]
  );

  const timeMetrics = useMemo(() => {
    const entries = [
      { label: "Process Time", value: totals.processMinutes, accent: formatMinutes(totals.processMinutes) },
      { label: "Cycle Time", value: totals.cycleMinutes, accent: formatMinutes(totals.cycleMinutes) },
      { label: "Lead Time", value: totals.leadMinutes, accent: formatMinutes(totals.leadMinutes) },
      { label: "Setup Time", value: totals.setupMinutes, accent: formatMinutes(totals.setupMinutes) },
    ];
    const max = Math.max(...entries.map((entry) => entry.value), 1);
    return entries.map((entry) => ({
      label: entry.label,
      accent: entry.accent,
      ratio: entry.value / max,
    }));
  }, [totals.processMinutes, totals.cycleMinutes, totals.leadMinutes, totals.setupMinutes]);

  const cycleTimeTrend = useMemo(() => {
    const entries = nodes
      .map((node) => {
        const minutes = parseDurationToMinutes(node.data.cycleTime);
        if (minutes === null) return null;
        return {
          label: node.data.label || "Step",
          minutes,
          x: node.position?.x ?? 0,
          y: node.position?.y ?? 0,
        };
      })
      .filter((entry): entry is { label: string; minutes: number; x: number; y: number } =>
        entry !== null
      );

    if (entries.length === 0) return null;

    entries.sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

    const labels = entries.map((entry, index) =>
      entry.label?.trim() ? entry.label : `Step ${index + 1}`
    );
    const values = entries.map((entry) => entry.minutes);
    const sum = values.reduce((acc, value) => acc + value, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const delta = values[values.length - 1] - values[0];

    return { labels, values, average, min, max, delta };
  }, [nodes]);

  const wipCapacitySnapshot = useMemo(() => {
    const records = nodes
      .map((node) => {
        const capacityValue = parseCO2Numeric(node.data.capacity);
        const wipValue = parseCO2Numeric(node.data.wip);
        if (capacityValue === null && wipValue === null) return null;
        return {
          label: node.data.label || "Step",
          capacity: capacityValue ?? 0,
          wip: wipValue ?? 0,
        };
      })
      .filter((entry): entry is { label: string; capacity: number; wip: number } => entry !== null);

    if (records.length === 0) return null;

    const labels = records.map((record, index) =>
      record.label.trim() ? record.label : `Step ${index + 1}`
    );
    const wipValues = records.map((record) => record.wip);
    const capacityValues = records.map((record) => record.capacity);
    const totalWip = wipValues.reduce((acc, value) => acc + value, 0);
    const totalCapacity = capacityValues.reduce((acc, value) => acc + value, 0);

    const utilizationSamples = records
      .filter((record) => record.capacity > 0)
      .map((record) => ({ label: record.label, utilization: record.wip / record.capacity }));

    const avgUtilization = utilizationSamples.length
      ? utilizationSamples.reduce((acc, sample) => acc + sample.utilization, 0) /
        utilizationSamples.length
      : null;

    const hotspots = utilizationSamples
      .filter((sample) => sample.utilization >= 1)
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 3);

    return { labels, wipValues, capacityValues, totalWip, totalCapacity, avgUtilization, hotspots };
  }, [nodes]);

  const costBreakdown = useMemo(() => {
    const entries = nodes
      .map((node) => {
        const cost = parseNumericValue(node.data.cost);
        if (cost === null || cost <= 0) return null;
        return {
          label: node.data.label || "Step",
          category: node.data.category || "Other",
          cost,
        };
      })
      .filter((entry): entry is { label: string; category: string; cost: number } => entry !== null);

    if (entries.length === 0) return null;

    const totalsMap = new Map<string, number>();
    entries.forEach((entry) => {
      totalsMap.set(entry.category, (totalsMap.get(entry.category) ?? 0) + entry.cost);
    });

    const categories = Array.from(totalsMap.entries()).sort((a, b) => b[1] - a[1]);
    const labels = categories.map(([category]) => category);
    const values = categories.map(([, value]) => value);
    const total = values.reduce((acc, value) => acc + value, 0);
    const contributions = entries
      .slice()
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map((entry) => ({
        label: entry.label,
        category: entry.category,
        cost: entry.cost,
        percent: total > 0 ? (entry.cost / total) * 100 : 0,
      }));

    return { labels, values, total, contributions };
  }, [nodes]);

  const sustainabilityDashboard = useMemo(() => {
    let scope1Total = 0;
    let scope2Total = 0;
    let scope3Total = 0;
    const records = nodes.map((node) => {
      const scope1 = parseNumericValue(node.data.sustainability?.scope1) ?? 0;
      const scope2 = parseNumericValue(node.data.sustainability?.scope2) ?? 0;
      const scope3 = parseNumericValue(node.data.sustainability?.scope3) ?? 0;
      const perUnit = parseNumericValue(node.data.sustainability?.co2PerUnit);
      const capacity = parseNumericValue(node.data.capacity);
      const total = scope1 + scope2 + scope3;
      scope1Total += scope1;
      scope2Total += scope2;
      scope3Total += scope3;
      return { label: node.data.label || "Step", scope1, scope2, scope3, total, perUnit, capacity: capacity ?? 0 };
    });

    const totalEmissions = scope1Total + scope2Total + scope3Total;
    const perUnitRecords = records.filter((record) => record.perUnit !== null && (record.perUnit ?? 0) > 0);
    const totalCapacity = perUnitRecords.reduce((acc, record) => acc + (record.capacity > 0 ? record.capacity : 0), 0);
    const weightedPerUnitSum = perUnitRecords.reduce((acc, record) => {
      const capacity = record.capacity > 0 ? record.capacity : 1;
      return acc + (record.perUnit ?? 0) * capacity;
    }, 0);
    const averagePerUnit = perUnitRecords.length
      ? weightedPerUnitSum / (totalCapacity > 0 ? totalCapacity : perUnitRecords.length)
      : null;

    const perUnitPositive = perUnitRecords.filter((record) => (record.perUnit ?? 0) > 0);
    const bestPerUnit = perUnitPositive.length
      ? [...perUnitPositive].sort((a, b) => (a.perUnit ?? 0) - (b.perUnit ?? 0))[0]
      : null;
    const worstPerUnit = perUnitPositive.length
      ? [...perUnitPositive].sort((a, b) => (b.perUnit ?? 0) - (a.perUnit ?? 0))[0]
      : null;

    const hotspots = records
      .filter((record) => record.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    if (totalEmissions <= 0 && perUnitRecords.length === 0) return null;

    return {
      scopeTotals: [scope1Total, scope2Total, scope3Total],
      scopeLabels: ["Scope 1", "Scope 2", "Scope 3"],
      totalEmissions,
      hotspots,
      perUnit: {
        average: averagePerUnit,
        best: bestPerUnit ? { label: bestPerUnit.label, value: bestPerUnit.perUnit ?? 0 } : null,
        worst: worstPerUnit ? { label: worstPerUnit.label, value: worstPerUnit.perUnit ?? 0 } : null,
      },
    };
  }, [nodes]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, { count: number; accent: string }>();
    nodes.forEach((node) => {
      const current = counts.get(node.data.category);
      if (current) {
        current.count += 1;
      } else {
        counts.set(node.data.category, { count: 1, accent: node.data.color });
      }
    });
    return Array.from(counts.entries())
      .map(([category, info]) => ({ category, count: info.count, accent: info.accent }))
      .sort((a, b) => b.count - a.count);
  }, [nodes]);

  const summaryInsights = useMemo(() => {
    const totalSteps = totals.totalSteps || 1;
    const valueMix = ((totals.valueAddedSteps / totalSteps) * 100).toFixed(1);
    const connectionVariants = edges.reduce((acc, edge) => {
      const variant = edge.data?.connectionType ?? DEFAULT_EDGE_VARIANT;
      acc.set(variant, (acc.get(variant) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
    const topVariant = Array.from(connectionVariants.entries()).sort((a, b) => b[1] - a[1])[0];
    return [
      `${scenarioMeta.label}: ${valueMix}% of steps are value-add covering ${formatMinutes(totals.processMinutes)} of process time.`,
      `${categoryBreakdown[0]?.category ?? "Operations"} leads with ${categoryBreakdown[0]?.count ?? 0} active activities.`,
      topVariant
        ? `${edgeThemeMap[topVariant[0]]?.label ?? "Flow"} dominates connections at ${topVariant[1]} link(s).`
        : `No connections yet — create flows to generate signal intelligence.`,
    ];
  }, [categoryBreakdown, edges, scenarioMeta.label, totals.processMinutes, totals.totalSteps, totals.valueAddedSteps]);

  const insightAlerts = useMemo(() => {
    const alerts: string[] = [];
    const missingTime = nodes.filter(
      (node) => !node.data.processTime && !node.data.cycleTime && !node.data.leadTime
    );
    if (missingTime.length) {
      alerts.push(
        `${missingTime.length} node${missingTime.length > 1 ? "s" : ""} lacking time metrics – add process or cycle data to sharpen analysis.`
      );
    }

    if (totals.nonValueAddedMinutes > totals.valueAddedMinutes) {
      alerts.push(
        `Non-value work (${formatMinutes(totals.nonValueAddedMinutes)}) outweighs value-add effort; prioritise waste reduction.`
      );
    }

    const taktGap =
      totals.cycleCount && totals.taktCount
        ? totals.cycleMinutes / totals.cycleCount - totals.taktMinutes / totals.taktCount
        : null;
    if (taktGap !== null && taktGap > 5) {
      alerts.push(
        `Cycle time trails takt by ${formatMinutes(taktGap)} — cadence is at risk of falling behind demand.`
      );
    }

    const longSetups = nodes.filter((node) => {
      const setup = parseDurationToMinutes(node.data.setupTime);
      return setup !== null && setup > 60;
    });
    if (longSetups.length) {
      alerts.push(
        `${longSetups.length} step${longSetups.length > 1 ? "s" : ""} with setup over one hour; consider SMED or prep staging.`
      );
    }

    const edgesWithoutLabel = edges.filter(
      (edge) => !edge.label || !edge.label.toString().trim()
    );
    if (edgesWithoutLabel.length) {
      alerts.push(
        `${edgesWithoutLabel.length} connection${edgesWithoutLabel.length > 1 ? "s" : ""} missing descriptors — add notes so teams understand the signal.`
      );
    }

    return alerts;
  }, [nodes, edges, totals]);

  return {
    valueBreakdown,
    timeMetrics,
    cycleTimeTrend,
    wipCapacitySnapshot,
    costBreakdown,
    sustainabilityDashboard,
    categoryBreakdown,
    summaryInsights,
    insightAlerts,
  };
};
