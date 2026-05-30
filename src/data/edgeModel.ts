import type { WhiteboardEdge } from "../nodes/NodeTypes";

export const createEdge = (edge: WhiteboardEdge, edges: WhiteboardEdge[]): WhiteboardEdge[] => {
  return edges.concat(edge);
};

export const updateEdge = (
  edgeId: string,
  updater: (edge: WhiteboardEdge) => WhiteboardEdge,
  edges: WhiteboardEdge[]
): WhiteboardEdge[] => {
  return edges.map((edgeItem) => (edgeItem.id === edgeId ? updater(edgeItem) : edgeItem));
};

export const deleteEdge = (edgeId: string, edges: WhiteboardEdge[]): WhiteboardEdge[] => {
  return edges.filter((edge) => edge.id !== edgeId);
};
