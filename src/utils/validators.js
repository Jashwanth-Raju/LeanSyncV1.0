export const isNonEmpty = (value) => {
    if (!value)
        return false;
    return value.trim().length > 0;
};
export const clamp = (value, min = 0, max = 1) => {
    return Math.min(max, Math.max(min, value));
};
