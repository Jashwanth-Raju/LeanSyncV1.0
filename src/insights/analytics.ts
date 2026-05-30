import type { WhiteboardNode } from "../nodes/NodeTypes";
import type { KpiConfig, KpiCardConfig } from "./kpiTypes";
import { formatMinutes, parseDurationToMinutes } from "../utils/formatting";

export interface DashboardTotals {
  totalSteps: number;
  valueAddedSteps: number;
  enablerSteps: number;
  nonValueAddedSteps: number;
  processMinutes: number;
  processCount: number;
  cycleMinutes: number;
  cycleCount: number;
  leadMinutes: number;
  leadCount: number;
  setupMinutes: number;
  setupCount: number;
  taktMinutes: number;
  taktCount: number;
  valueAddedMinutes: number;
  nonValueAddedMinutes: number;
  delayMinutes: number;
}

export interface FlowMetrics {
  totals: DashboardTotals;
  averageCycle: number;
  averageLead: number;
  averageTakt: number;
  setupAverage: number;
  valueAddedRatio: number;
  taktGap: number;
}

export const computeFlowMetrics = (nodes: WhiteboardNode[]): FlowMetrics => {
  const totals: DashboardTotals = {
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
      const baseline = (process ?? 0) + (setup ?? 0);
      const delta = lead - baseline;
      if (delta > 0) totals.delayMinutes += delta;
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

  const averageCycle = totals.cycleCount ? totals.cycleMinutes / totals.cycleCount : 0;
  const averageLead = totals.leadCount ? totals.leadMinutes / totals.leadCount : 0;
  const averageTakt = totals.taktCount ? totals.taktMinutes / totals.taktCount : 0;
  const setupAverage = totals.setupCount ? totals.setupMinutes / totals.setupCount : 0;
  const valueAddedRatio = totals.leadMinutes
    ? Math.min(100, Math.max(0, (totals.valueAddedMinutes / totals.leadMinutes) * 100))
    : 0;
  const taktGap = averageCycle && averageTakt ? averageCycle - averageTakt : 0;

  return {
    totals,
    averageCycle,
    averageLead,
    averageTakt,
    setupAverage,
    valueAddedRatio,
    taktGap,
  };
};

const resolveMetricValue = (metrics: FlowMetrics, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in acc) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, metrics);
};

const inferFormat = (path: string): "duration" | "percent" | "number" | "raw" => {
  if (/minute|average|takt|lead/i.test(path)) return "duration";
  if (/ratio|percent/i.test(path)) return "percent";
  if (/total|count|steps/i.test(path)) return "number";
  return "raw";
};

const formatValue = (
  value: unknown,
  format: "number" | "duration" | "percent" | "raw" = "raw"
): string => {
  if (value == null) return "--";
  if (format === "duration" && typeof value === "number") {
    return formatMinutes(value);
  }
  if (format === "percent" && typeof value === "number") {
    return `${value.toFixed(1)}%`;
  }
  if (format === "number" && typeof value === "number") {
    return value.toLocaleString();
  }
  return String(value);
};

const renderTemplate = (template: string, metrics: FlowMetrics): string => {
  return template.replace(/\\{\\{([^}]+)\\}\\}/g, (_, token) => {
    const [formatKey, path] = token.includes(":") ? token.split(":") : [undefined, token];
    const cleanPath = path?.trim() ?? "";
    const inferredFormat = inferFormat(cleanPath);
    const metricValue = resolveMetricValue(metrics, cleanPath);
    return formatValue(metricValue, (formatKey as any) ?? inferredFormat);
  });
};

const buildCard = (config: KpiCardConfig, metrics: FlowMetrics) => {
  const metricValue = resolveMetricValue(metrics, config.primary.path);
  const format = config.primary.format ?? inferFormat(config.primary.path);
  return {
    title: config.title,
    primary: formatValue(metricValue, format),
    accent: config.accentTemplate ? renderTemplate(config.accentTemplate, metrics) : undefined,
    footer: config.footerTemplate ? renderTemplate(config.footerTemplate, metrics) : undefined,
  };
};

export const buildDashboardCards = (metrics: FlowMetrics, config: KpiConfig) => {
  if (!config?.cards?.length) {
    return [];
  }
  return config.cards.map((card) => buildCard(card, metrics));
};
