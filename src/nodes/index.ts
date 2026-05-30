import type {
  NodeDefinition,
  ValueStreamVariant,
  WhiteboardNodeData,
  NodeTypeRegistry,
} from "./NodeTypes";
import { ProcessNode } from "./renderers/ProcessNode";
import { DelayNode } from "./renderers/DelayNode";
import { InventoryNode } from "./renderers/InventoryNode";

const variantNodeTypeMap: Record<ValueStreamVariant, string> = {
  "value-added": "process",
  "non-value-added": "delay",
  enabler: "inventory",
};

export const resolveNodeType = (
  variant: ValueStreamVariant = "enabler",
  explicit?: string
): string => {
  if (explicit) return explicit;
  return variantNodeTypeMap[variant] ?? "process";
};

export const nodeTypes: NodeTypeRegistry = {
  process: ProcessNode,
  delay: DelayNode,
  inventory: InventoryNode,
};

export const cloneNodeData = (definition: NodeDefinition): WhiteboardNodeData => ({
  label: definition.label,
  icon: definition.icon,
  color: definition.color,
  badge: definition.badge,
  tagline: definition.tagline,
  category: definition.category,
  valueType: definition.valueType,
  variant: definition.variant,
});
