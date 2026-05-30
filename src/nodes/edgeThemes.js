import { MarkerType } from "reactflow";
export const edgeLibrary = [
    {
        key: "push",
        label: "Push Flow",
        description: "Scheduled material movement driven by upstream planning cues.",
        badge: "Physical",
        color: "#38bdf8",
        width: 2.6,
        marker: "arrowClosed",
    },
    {
        key: "pull",
        label: "Pull Signal",
        description: "Downstream demand triggers replenishment via kanban loops.",
        badge: "Kanban",
        color: "#facc15",
        dash: "6 4",
        animated: true,
        width: 2.4,
        marker: "arrow",
    },
    {
        key: "communication",
        label: "Communication",
        description: "Meetings, huddles, and voice-of-process feedback signals.",
        badge: "Voice",
        color: "#f472b6",
        dash: "2 4",
        width: 2.2,
        marker: "circle",
        markerColor: "#f472b6",
    },
    {
        key: "signal",
        label: "Electronic Signal",
        description: "Automated data updates or system-to-system triggers.",
        badge: "Digital",
        color: "#34d399",
        dash: "1 6",
        animated: true,
        width: 2.2,
        marker: "square",
        markerColor: "#4ade80",
    },
];
export const edgeThemeMap = edgeLibrary.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
}, {});
export const DEFAULT_EDGE_VARIANT = "push";
export const getEdgeVariant = (edge) => {
    const variant = edge.data?.connectionType;
    return variant && edgeThemeMap[variant] ? variant : DEFAULT_EDGE_VARIANT;
};
export const decorateEdge = (edge) => {
    const variant = getEdgeVariant(edge);
    const theme = edgeThemeMap[variant];
    const markerType = theme.marker === "arrow" ? MarkerType.Arrow : MarkerType.ArrowClosed;
    return {
        ...edge,
        type: "smoothstep",
        animated: Boolean(theme.animated),
        label: edge.label ?? theme.badge,
        style: {
            stroke: theme.color,
            strokeWidth: theme.width ?? 2,
            strokeDasharray: theme.dash,
            strokeLinecap: "round",
        },
        markerEnd: {
            type: markerType,
            color: theme.markerColor ?? theme.color,
            width: (theme.width ?? 2) * 1.15,
            height: (theme.width ?? 2) * 1.15,
        },
        labelBgPadding: [6, 10],
        labelStyle: {
            fill: "#0f172a",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 0.4,
        },
    };
};
