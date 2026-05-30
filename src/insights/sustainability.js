export const computeSustainability = (nodes) => {
    return {
        co2eTotal: nodes.length * 0,
        trackedNodes: nodes.filter((node) => Boolean(node.data.notes)).length,
    };
};
