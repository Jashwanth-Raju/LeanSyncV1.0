import type { ComponentType } from "react";
import type { Edge, MarkerType, Node, NodeProps, Position } from "reactflow";

export type ValueStreamVariant = "value-added" | "non-value-added" | "enabler";

export interface NodeDefinition {
  label: string;
  icon: string;
  color: string;
  badge?: string;
  tagline?: string;
  category: string;
  valueType: ValueStreamVariant;
  variant?: "process" | "delay" | "inventory";
}

export interface NodeLibraryCategory {
  category: string;
  description: string;
  accent: string;
  nodes: NodeDefinition[];
}

export interface NodeMetaField {
  key: keyof WhiteboardNodeData;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface WhiteboardNodeData {
  label: string;
  icon: string;
  color: string;
  category: string;
  valueType: ValueStreamVariant;
  variant?: "process" | "delay" | "inventory";
  badge?: string;
  tagline?: string;
  processTime?: string;
  cycleTime?: string;
  taktTime?: string;
  leadTime?: string;
  setupTime?: string;
  capacity?: string;
  owner?: string;
  notes?: string;
}

export type WhiteboardNode = Node<WhiteboardNodeData>;

export interface WhiteboardEdgeData {
  connectionType?: string;
  notes?: string;
}

export type WhiteboardEdge = Edge<WhiteboardEdgeData>;

export interface EdgeTheme {
  key: string;
  label: string;
  description: string;
  badge: string;
  color: string;
  width?: number;
  dash?: string;
  animated?: boolean;
  marker?: "arrow" | "circle" | "square" | "arrowClosed";
  markerColor?: string;
}

export interface DecoratedEdgeOptions {
  markerEnd?: {
    type: MarkerType;
    color?: string;
  };
  labelBgPadding?: [number, number];
}

export type NodeRendererProps = NodeProps<WhiteboardNodeData>;

export type NodeTypeRegistry = Record<string, ComponentType<NodeRendererProps>>;

export type HandlePositions = {
  source?: Position;
  target?: Position;
};
