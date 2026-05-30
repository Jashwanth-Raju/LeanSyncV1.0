import type { FlowMetrics } from "./analytics";

export interface LayerConfig {
  id: string;
  label: string;
  description?: string;
  color: string;
  metricPath: string;
  formatter?: "number" | "duration" | "percent" | "raw";
}

export const extractLayerValue = (metrics: FlowMetrics, path: string): number | null => {
  return path.split(".").reduce<number | null>((acc, segment) => {
    if (acc == null) return null;
    const value = (acc as any)[segment];
    if (typeof value === "number") return value;
    return value ?? null;
  }, (metrics as unknown) as number | null);
};
