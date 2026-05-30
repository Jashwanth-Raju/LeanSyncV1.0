import { MarkerType } from "reactflow";
import type { Edge, Node } from "reactflow";
import type { EdgeTheme, WhiteboardEdgeData, WhiteboardNodeData } from "./types";

export const cloneNode = (
  node: Node<WhiteboardNodeData>
): Node<WhiteboardNodeData> => ({
  ...node,
  data: { ...node.data },
});

export const cloneEdge = (
  edge: Edge<WhiteboardEdgeData>
): Edge<WhiteboardEdgeData> => ({
  ...edge,
  data: edge.data ? { ...edge.data } : undefined,
});

export const parseDurationToMinutes = (input?: string | null): number | null => {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  const colonMatch = value.match(/^\s*(\d+):(\d{1,2})(?::(\d{1,2}))?\s*$/);
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
  if (!numericMatch) return null;

  const numeric = Number.parseFloat(numericMatch[1]);
  if (Number.isNaN(numeric)) return null;

  const unitFragment = value
    .slice((numericMatch.index ?? 0) + numericMatch[0].length)
    .trim()
    .toLowerCase();

  if (unitFragment.startsWith("sec") || unitFragment === "s") {
    return numeric / 60;
  }
  if (unitFragment.startsWith("hour") || unitFragment.startsWith("hr") || unitFragment === "h") {
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

export const formatMinutes = (minutes: number | null): string => {
  if (!Number.isFinite(minutes ?? NaN) || !minutes || minutes <= 0) return "0";
  if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
  if (minutes < 60) return `${parseFloat(minutes.toFixed(1))} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  const parts: string[] = [];
  if (hours) parts.push(`${hours} hr`);
  if (mins) parts.push(`${mins} min`);
  return parts.join(" ");
};

export const parseNumericValue = (input?: string | null): number | null => {
  if (!input) return null;
  const sanitized = input.replace(/,/g, "");
  const match = sanitized.match(/[-+]?\d*\.?\d+/);
  if (!match) return null;
  const value = Number.parseFloat(match[0]);
  return Number.isFinite(value) ? value : null;
};

export const decorateEdge = (
  edge: Edge<WhiteboardEdgeData>,
  edgeThemeMap: Record<string, EdgeTheme>,
  defaultVariant: string
): Edge<WhiteboardEdgeData> => {
  const variant = edge.data?.connectionType ?? defaultVariant;
  const theme = edgeThemeMap[variant] ?? edgeThemeMap[defaultVariant];

  const markerType = (() => {
    switch (theme.marker) {
      case "arrow":
        return MarkerType.Arrow;
      case "circle":
      case "square":
        return MarkerType.ArrowClosed;
      case "arrowClosed":
      default:
        return MarkerType.ArrowClosed;
    }
  })();

  return {
    ...edge,
    type: "smoothstep",
    animated: Boolean(theme.animated),
    label: theme.label ?? theme.badge ?? "Connection",
    style: {
      stroke: theme.color,
      strokeWidth: theme.width ?? 2,
      strokeDasharray: theme.dash,
      strokeLinecap: "round",
    },
    markerEnd: {
      type: markerType,
      color: theme.markerColor ?? theme.color,
      width: (theme.width ?? 2) * 5,
      height: (theme.width ?? 2) * 5,
    },
    labelBgPadding: [3, 8],
    labelBgBorderRadius: 4,
    labelBgStyle: {
      fill: "#f1f5f9",
      stroke: "transparent",
    },
    labelStyle: {
      fill: theme.color,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.3,
    },
  };
};
