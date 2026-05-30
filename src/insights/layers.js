export const extractLayerValue = (metrics, path) => {
    return path.split(".").reduce((acc, segment) => {
        if (acc == null)
            return null;
        const value = acc[segment];
        if (typeof value === "number")
            return value;
        return value ?? null;
    }, metrics);
};
