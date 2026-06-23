import type { Node, Edge } from "reactflow";
import type { IconKey } from "./icons";

export type ValueType = "value-added" | "enabler" | "non-value-added";

export type LibraryNode = {
  label: string;
  icon: IconKey;
  color: string;
  badge?: string;
  tagline?: string;
  category: string;
  valueType: ValueType;
  processTime?: string;
  cycleTime?: string;
  taktTime?: string;
  leadTime?: string;
  setupTime?: string;
  wip?: string;
  capacity?: string;
};

export type LibraryCategory = {
  category: string;
  description: string;
  accent: string;
  nodes: LibraryNode[];
};

export type WhiteboardNodeData = LibraryNode & {
  processTime?: string;
  cycleTime?: string;
  taktTime?: string;
  leadTime?: string;
  setupTime?: string;
  wip?: string;
  capacity?: string;
  oeeAvailability?: string;
  oeePerformance?: string;
  oeeQuality?: string;
  cost?: string;
  owner?: string;
  notes?: string;
  sustainability?: {
    energyUse?: string;
    energyUnit?: string;
    materialType?: string;
    materialWeight?: string;
    transportDistance?: string;
    transportMode?: string;
    wasteType?: string;
    wasteWeight?: string;
    scope1?: string;
    scope2?: string;
    scope3?: string;
    co2PerUnit?: string;
    electricityFactor?: string;
    materialFactor?: string;
    transportFactor?: string;
  };
};

export type WhiteboardEdgeData = {
  connectionType?: string;
};

export type EdgeTheme = {
  key: string;
  label: string;
  description: string;
  badge: string;
  color: string;
  width?: number;
  dash?: string;
  animated?: boolean;
  marker: "arrow" | "arrowClosed" | "circle" | "square";
  markerColor?: string;
  icon?: IconKey;
  iconGlyph?: string;
};

export type HistorySnapshot = {
  nodes: Node<WhiteboardNodeData>[];
  edges: Edge<WhiteboardEdgeData>[];
};

export type DashboardCard = {
  title: string;
  primary: string;
  accent?: string;
  footer?: string;
};

export type NodeMetaField = {
  key: keyof WhiteboardNodeData;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  isTime?: boolean;
};

export type EmissionFactorDefaults = {
  electricity: string;
  materials: string;
  transport: string;
};
