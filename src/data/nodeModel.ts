import type { WhiteboardNode } from "../nodes/NodeTypes";

export const createNode = (node: WhiteboardNode, nodes: WhiteboardNode[]): WhiteboardNode[] => {
  return nodes.concat(node);
};

export const updateNode = (
  nodeId: string,
  updater: (node: WhiteboardNode) => WhiteboardNode,
  nodes: WhiteboardNode[]
): WhiteboardNode[] => {
  return nodes.map((node) => (node.id === nodeId ? updater(node) : node));
};

export const deleteNode = (nodeId: string, nodes: WhiteboardNode[]): WhiteboardNode[] => {
  return nodes.filter((node) => node.id !== nodeId);
};
