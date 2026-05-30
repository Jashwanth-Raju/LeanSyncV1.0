import type { WhiteboardEdge, WhiteboardNode } from "../nodes/NodeTypes";
import { resolveNodeType } from "../nodes";

const seedNodes: Array<Pick<WhiteboardNode["data"], "label" | "icon" | "color" | "category" | "valueType">> = [
  {
    label: "Truck",
    icon: "truck",
    color: "#FFA500",
    category: "Logistics & Distribution",
    valueType: "non-value-added",
  },
  {
    label: "Manufacturing",
    icon: "manufacturing",
    color: "#3498DB",
    category: "Production & Transformation",
    valueType: "value-added",
  },
];

export const createInitialCanvasState = (): { nodes: WhiteboardNode[]; edges: WhiteboardEdge[] } => {
  const nodes: WhiteboardNode[] = seedNodes.map((node, index) => ({
    id: String(index + 1),
    type: resolveNodeType(node.valueType),
    position: { x: 250 + index * 250, y: 150 },
    data: { ...node },
  }));
  return { nodes, edges: [] };
};
