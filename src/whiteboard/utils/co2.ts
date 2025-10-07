import type { WhiteboardNodeData } from "../types";

export type NodeCO2Metrics = {
  absoluteValue: number;
  label: string;
};

export const parseCO2Numeric = (raw?: string): number | null => {
  if (!raw) return null;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
};

export const computeNodeCO2 = (node: WhiteboardNodeData): NodeCO2Metrics | null => {
  const sustainability = node.sustainability;
  if (!sustainability) return null;
  const energy = parseCO2Numeric(sustainability.energyUse) ?? 0;
  const material = parseCO2Numeric(sustainability.materialWeight) ?? 0;
  const transport = parseCO2Numeric(sustainability.transportDistance) ?? 0;
  const waste = parseCO2Numeric(sustainability.wasteWeight) ?? 0;
  const score = energy * 0.7 + material * 0.5 + transport * 0.3 + waste * 0.4;
  if (score <= 0) return null;
  return {
    absoluteValue: score,
    label: `${score.toFixed(1)} u`,
  };
};

export const co2ColorScale = (value: number, max: number): string => {
  if (max <= 0) return "#38bdf8";
  const ratio = Math.min(value / max, 1);
  const hue = 120 - ratio * 120;
  return `hsl(${hue}, 70%, 50%)`;
};
