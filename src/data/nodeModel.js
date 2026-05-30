export const createNode = (node, nodes) => {
    return nodes.concat(node);
};
export const updateNode = (nodeId, updater, nodes) => {
    return nodes.map((node) => (node.id === nodeId ? updater(node) : node));
};
export const deleteNode = (nodeId, nodes) => {
    return nodes.filter((node) => node.id !== nodeId);
};
