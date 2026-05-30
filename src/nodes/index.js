import { ProcessNode } from "./renderers/ProcessNode";
import { DelayNode } from "./renderers/DelayNode";
import { InventoryNode } from "./renderers/InventoryNode";
const variantNodeTypeMap = {
    "value-added": "process",
    "non-value-added": "delay",
    enabler: "inventory",
};
export const resolveNodeType = (variant = "enabler", explicit) => {
    if (explicit)
        return explicit;
    return variantNodeTypeMap[variant] ?? "process";
};
export const nodeTypes = {
    process: ProcessNode,
    delay: DelayNode,
    inventory: InventoryNode,
};
export const cloneNodeData = (definition) => ({
    label: definition.label,
    icon: definition.icon,
    color: definition.color,
    badge: definition.badge,
    tagline: definition.tagline,
    category: definition.category,
    valueType: definition.valueType,
    variant: definition.variant,
});
