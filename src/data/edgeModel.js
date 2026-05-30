export const createEdge = (edge, edges) => {
    return edges.concat(edge);
};
export const updateEdge = (edgeId, updater, edges) => {
    return edges.map((edgeItem) => (edgeItem.id === edgeId ? updater(edgeItem) : edgeItem));
};
export const deleteEdge = (edgeId, edges) => {
    return edges.filter((edge) => edge.id !== edgeId);
};
