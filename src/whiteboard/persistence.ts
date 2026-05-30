import type { Node, Edge } from "reactflow";
import type { WhiteboardNodeData, WhiteboardEdgeData, EmissionFactorDefaults } from "./types";
import { cloneNode, cloneEdge } from "./utils";
import { initialNodes, initialEdges } from "./data";
import type { ScenarioKey } from "./scenarios";

export type SavedWhiteboardState = {
  activeScenario?: ScenarioKey;
  scenarios?: Partial<Record<ScenarioKey, { nodes: Node<WhiteboardNodeData>[]; edges: Edge<WhiteboardEdgeData>[] }>>;
  co2PromptAck?: Partial<Record<ScenarioKey, boolean>>;
  dashboardVisible?: boolean;
  showCO2Layer?: boolean;
  emissionDefaults?: EmissionFactorDefaults;
  isCo2TrackingEnabled?: boolean;
};

export const stripUndefined = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const withEmissionDefaults = (
  data: WhiteboardNodeData,
  defaults: EmissionFactorDefaults | null,
  trackingEnabled: boolean
): WhiteboardNodeData => {
  if (!trackingEnabled || !defaults) return data;
  const sustainability = { ...(data.sustainability ?? {}) };

  const applyDefault = (
    key: keyof NonNullable<WhiteboardNodeData["sustainability"]>,
    value: string
  ) => {
    const current = sustainability[key];
    if (!value) return;
    if (!current || String(current).trim().length === 0) {
      sustainability[key] = value;
    }
  };

  applyDefault("electricityFactor", defaults.electricity);
  applyDefault("materialFactor", defaults.materials);
  applyDefault("transportFactor", defaults.transport);

  return { ...data, sustainability };
};

export const withDefaultCurrentBoard = (
  nodes: Node<WhiteboardNodeData>[] | undefined,
  edges: Edge<WhiteboardEdgeData>[] | undefined
) => ({
  nodes: nodes && nodes.length > 0 ? nodes.map(cloneNode) : initialNodes.map(cloneNode),
  edges: nodes && nodes.length > 0 ? (edges ?? []).map(cloneEdge) : initialEdges.map(cloneEdge),
});

export const toPersistedNodes = (nodes: Node<WhiteboardNodeData>[]) =>
  nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  })) as Node<WhiteboardNodeData>[];

export const toPersistedEdges = (edges: Edge<WhiteboardEdgeData>[]) =>
  edges.map((edge) => ({
    id: edge.id,
    type: edge.type,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: edge.data,
    label: edge.label,
  })) as Edge<WhiteboardEdgeData>[];

export const toPersistedScenarios = (
  scenarios: Record<ScenarioKey, { nodes: Node<WhiteboardNodeData>[]; edges: Edge<WhiteboardEdgeData>[] }>
) =>
  stripUndefined({
    current: {
      nodes: toPersistedNodes(scenarios.current.nodes),
      edges: toPersistedEdges(scenarios.current.edges),
    },
    future: {
      nodes: toPersistedNodes(scenarios.future.nodes),
      edges: toPersistedEdges(scenarios.future.edges),
    },
    whatIf: {
      nodes: toPersistedNodes(scenarios.whatIf.nodes),
      edges: toPersistedEdges(scenarios.whatIf.edges),
    },
  });
