export const parseDurationToMinutes = (input) => {
    if (!input)
        return null;
    const value = input.trim();
    if (!value)
        return null;
    const colonMatch = value.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
    if (colonMatch) {
        if (colonMatch[3]) {
            const hours = Number.parseInt(colonMatch[1], 10);
            const mins = Number.parseInt(colonMatch[2], 10);
            const secs = Number.parseInt(colonMatch[3], 10);
            return hours * 60 + mins + secs / 60;
        }
        const mins = Number.parseInt(colonMatch[1], 10);
        const secs = Number.parseInt(colonMatch[2], 10);
        return mins + secs / 60;
    }
    const numericMatch = value.match(/([-+]?\d*\.?\d+)/);
    if (!numericMatch)
        return null;
    const numeric = Number.parseFloat(numericMatch[1]);
    if (Number.isNaN(numeric))
        return null;
    const unitFragment = value
        .slice((numericMatch.index ?? 0) + numericMatch[0].length)
        .trim()
        .toLowerCase();
    if (unitFragment.startsWith("sec") || unitFragment === "s") {
        return numeric / 60;
    }
    if (unitFragment.startsWith("hour") ||
        unitFragment.startsWith("hr") ||
        unitFragment === "h") {
        return numeric * 60;
    }
    if (unitFragment.startsWith("day") || unitFragment === "d") {
        return numeric * 60 * 24;
    }
    if (unitFragment.startsWith("week") || unitFragment === "w") {
        return numeric * 60 * 24 * 7;
    }
    return numeric;
};
export const formatMinutes = (minutes) => {
    if (!Number.isFinite(minutes) || (minutes ?? 0) <= 0)
        return "0";
    const safeMinutes = minutes;
    if (safeMinutes < 1) {
        return `${Math.round(safeMinutes * 60)} sec`;
    }
    if (safeMinutes < 60) {
        return `${parseFloat(safeMinutes.toFixed(1))} min`;
    }
    const hours = Math.floor(safeMinutes / 60);
    const mins = Math.round(safeMinutes % 60);
    const parts = [];
    if (hours)
        parts.push(`${hours} hr`);
    if (mins)
        parts.push(`${mins} min`);
    return parts.join(" ");
};
