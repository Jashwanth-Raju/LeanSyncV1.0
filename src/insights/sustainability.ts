import type { WhiteboardNode } from "../nodes/NodeTypes";

export interface SustainabilityMetrics {
  co2eTotal: number;
  trackedNodes: number;
}

export const computeSustainability = (nodes: WhiteboardNode[]): SustainabilityMetrics => {
  return {
    co2eTotal: nodes.length * 0,
    trackedNodes: nodes.filter((node) => Boolean(node.data.notes)).length,
  };
};
