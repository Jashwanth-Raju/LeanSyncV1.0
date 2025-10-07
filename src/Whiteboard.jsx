import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import ReactFlow, { addEdge, Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType, Handle, Position, ConnectionLineType, } from "reactflow";
import "reactflow/dist/style.css";
import { FaTruck, FaCogs, FaWarehouse, FaUserTie, FaBoxOpen, FaUndo, FaRedo, FaTrash, FaChevronLeft, FaChevronRight, FaIndustry, FaClipboardCheck, FaLaptopCode, FaTools, FaCalendarAlt, FaShippingFast, FaHandsHelping, FaChartLine, } from "react-icons/fa";
// --------------------
// Node Library
// --------------------
const nodeLibrary = [
    {
        category: "Strategic Planning",
        description: "Vision-to-plan cadence aligning demand, capacity, and business goals.",
        accent: "#6366f1",
        nodes: [
            {
                label: "Sales & Ops Planning",
                icon: "planning",
                color: "#6366f1",
                badge: "Planning",
                tagline: "Monthly cadence",
                category: "Strategic Planning",
                valueType: "enabler",
            },
            {
                label: "Master Schedule",
                icon: "planning",
                color: "#0ea5e9",
                badge: "MPS",
                tagline: "Weekly horizon",
                category: "Strategic Planning",
                valueType: "enabler",
            },
            {
                label: "Demand Forecast",
                icon: "performance",
                color: "#14b8a6",
                badge: "Analytics",
                tagline: "Scenario mix",
                category: "Strategic Planning",
                valueType: "enabler",
            },
        ],
    },
    {
        category: "Procurement & Suppliers",
        description: "Inbound flow of materials, supplier collaboration, and assurance.",
        accent: "#38bdf8",
        nodes: [
            {
                label: "Supplier Portal",
                icon: "digital",
                color: "#0ea5e9",
                badge: "Digital",
                tagline: "ASN visibility",
                category: "Procurement & Suppliers",
                valueType: "enabler",
            },
            {
                label: "Raw Material Receipt",
                icon: "truck",
                color: "#3b82f6",
                badge: "Inbound",
                tagline: "Dock-to-stock",
                category: "Procurement & Suppliers",
                valueType: "non-value-added",
            },
            {
                label: "Supplier Audit",
                icon: "quality",
                color: "#f97316",
                badge: "QA",
                tagline: "Capability review",
                category: "Procurement & Suppliers",
                valueType: "non-value-added",
            },
        ],
    },
    {
        category: "Production & Transformation",
        description: "Core value creation across fabrication, assembly, and upkeep.",
        accent: "#f59e0b",
        nodes: [
            {
                label: "Fabrication Cell",
                icon: "manufacturing",
                color: "#f97316",
                badge: "Build",
                tagline: "Cycle time",
                category: "Production & Transformation",
                valueType: "value-added",
            },
            {
                label: "Assembly Line",
                icon: "industry",
                color: "#ef4444",
                badge: "Flow",
                tagline: "Takt alignment",
                category: "Production & Transformation",
                valueType: "value-added",
            },
            {
                label: "Maintenance Station",
                icon: "maintenance",
                color: "#22c55e",
                badge: "Uptime",
                tagline: "TPM checks",
                category: "Production & Transformation",
                valueType: "enabler",
            },
        ],
    },
    {
        category: "Quality & Compliance",
        description: "Assurance layers safeguarding specification and regulatory fit.",
        accent: "#a855f7",
        nodes: [
            {
                label: "Quality Gate",
                icon: "quality",
                color: "#a855f7",
                badge: "Release",
                tagline: "Go/No-Go",
                category: "Quality & Compliance",
                valueType: "non-value-added",
            },
            {
                label: "Lab Testing",
                icon: "inspection",
                color: "#10b981",
                badge: "Validation",
                tagline: "Sample checks",
                category: "Quality & Compliance",
                valueType: "non-value-added",
            },
            {
                label: "Compliance Audit",
                icon: "support",
                color: "#ec4899",
                badge: "Audit",
                tagline: "Regulatory",
                category: "Quality & Compliance",
                valueType: "non-value-added",
            },
        ],
    },
    {
        category: "Logistics & Distribution",
        description: "Physical movement, staging, and fulfilment across the network.",
        accent: "#f97316",
        nodes: [
            {
                label: "Warehouse Buffer",
                icon: "warehouse",
                color: "#f97316",
                badge: "Stock",
                tagline: "Days on hand",
                category: "Logistics & Distribution",
                valueType: "non-value-added",
            },
            {
                label: "Staging Zone",
                icon: "inventory",
                color: "#14b8a6",
                badge: "WIP",
                tagline: "Sequenced",
                category: "Logistics & Distribution",
                valueType: "non-value-added",
            },
            {
                label: "Outbound Shipping",
                icon: "shipping",
                color: "#0ea5e9",
                badge: "Delivery",
                tagline: "Customer",
                category: "Logistics & Distribution",
                valueType: "non-value-added",
            },
        ],
    },
    {
        category: "Information Flow",
        description: "Digital signals, system updates, and decision triggers.",
        accent: "#22d3ee",
        nodes: [
            {
                label: "ERP Update",
                icon: "digital",
                color: "#38bdf8",
                badge: "System",
                tagline: "Real-time",
                category: "Information Flow",
                valueType: "enabler",
            },
            {
                label: "Andon Alert",
                icon: "performance",
                color: "#fb7185",
                badge: "Alert",
                tagline: "Issue flag",
                category: "Information Flow",
                valueType: "non-value-added",
            },
            {
                label: "Analytics Hub",
                icon: "performance",
                color: "#818cf8",
                badge: "Insights",
                tagline: "KPI pulse",
                category: "Information Flow",
                valueType: "enabler",
            },
        ],
    },
    {
        category: "Support & People",
        description: "Enablement layers keeping talent, safety, and governance in sync.",
        accent: "#f472b6",
        nodes: [
            {
                label: "Leadership Huddle",
                icon: "support",
                color: "#f472b6",
                badge: "Daily",
                tagline: "Tier meetings",
                category: "Support & People",
                valueType: "non-value-added",
            },
            {
                label: "Training Session",
                icon: "planning",
                color: "#10b981",
                badge: "Skills",
                tagline: "Standard work",
                category: "Support & People",
                valueType: "enabler",
            },
            {
                label: "Safety Walk",
                icon: "quality",
                color: "#facc15",
                badge: "Safety",
                tagline: "Gemba",
                category: "Support & People",
                valueType: "non-value-added",
            },
        ],
    },
];
const edgeLibrary = [
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
const parseDurationToMinutes = (input) => {
    if (!input)
        return null;
    const value = input.trim();
    if (!value)
        return null;
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
    if (!numericMatch)
        return null;
    const numeric = Number.parseFloat(numericMatch[1]);
    if (Number.isNaN(numeric))
        return null;
    const unitFragment = value.slice((numericMatch.index ?? 0) + numericMatch[0].length).trim().toLowerCase();
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
    // default minutes
    return numeric;
};
const formatMinutes = (minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0)
        return "0";
    if (minutes < 1) {
        return `${Math.round(minutes * 60)} sec`;
    }
    if (minutes < 60) {
        return `${parseFloat(minutes.toFixed(1))} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    const parts = [];
    if (hours)
        parts.push(`${hours} hr`);
    if (mins)
        parts.push(`${mins} min`);
    return parts.join(" ");
};
const edgeThemeMap = edgeLibrary.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
}, {});
const DEFAULT_EDGE_VARIANT = "push";
const SIDEBAR_WIDTH = 360;
const TAB_BAR_HEIGHT = 56;
const CANVAS_TOP_OFFSET = TAB_BAR_HEIGHT + 20;
const cloneNode = (node) => ({
    ...node,
    data: { ...node.data },
});
const cloneEdge = (edge) => ({
    ...edge,
    data: edge.data ? { ...edge.data } : undefined,
});
const nodeMetaFields = [
    { key: "processTime", label: "Process Time", placeholder: "e.g. 45 sec" },
    { key: "cycleTime", label: "Cycle Time", placeholder: "e.g. 55 sec" },
    { key: "taktTime", label: "Takt Time", placeholder: "e.g. 60 sec" },
    { key: "setupTime", label: "Setup Time", placeholder: "e.g. 12 min" },
    { key: "leadTime", label: "Lead Time", placeholder: "e.g. 2 days" },
    { key: "capacity", label: "Daily Capacity", placeholder: "Units/day" },
    { key: "owner", label: "Owner", placeholder: "Team or role" },
    {
        key: "notes",
        label: "Notes",
        placeholder: "Any contextual detail, bottlenecks, or improvement ideas",
        multiline: true,
    },
];
const getEdgeVariant = (edge) => {
    const variant = edge.data?.connectionType;
    return variant && edgeThemeMap[variant] ? variant : DEFAULT_EDGE_VARIANT;
};
const decorateEdge = (edge) => {
    const variant = getEdgeVariant(edge);
    const theme = edgeThemeMap[variant];
    const markerType = (() => {
        switch (theme.marker) {
            case "arrow":
                return MarkerType.Arrow;
            case "circle":
                return MarkerType.Circle;
            case "square":
                return MarkerType.Square;
            case "arrowClosed":
            default:
                return MarkerType.ArrowClosed;
        }
    })();
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
const EdgePreview = ({ theme }) => {
    const strokeWidth = theme.width ?? 2;
    const headSize = Math.max(6, strokeWidth * 4);
    const baseStyles = {
        position: "relative",
        width: "100%",
        height: 18,
        marginTop: 2,
    };
    const lineStyles = {
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        borderTop: `${strokeWidth}px ${theme.dash ? "dashed" : "solid"} ${theme.color}`,
        transform: "translateY(-50%)",
        opacity: 0.9,
    };
    const markerBase = {
        position: "absolute",
        top: "50%",
        right: 0,
        transform: "translate(50%, -50%)",
        display: "block",
    };
    let markerNode = null;
    if (theme.marker === "arrowClosed") {
        markerNode = _jsx("span", { style: {
                ...markerBase,
                width: 0,
                height: 0,
                borderTop: `${headSize / 2}px solid transparent`,
                borderBottom: `${headSize / 2}px solid transparent`,
                borderLeft: `${headSize * 0.75}px solid ${theme.markerColor ?? theme.color}`,
            } });
    }
    else if (theme.marker === "arrow") {
        markerNode = _jsx("span", { style: {
                ...markerBase,
                width: headSize,
                height: headSize,
                borderTop: `${strokeWidth}px solid ${theme.markerColor ?? theme.color}`,
                borderRight: `${strokeWidth}px solid ${theme.markerColor ?? theme.color}`,
                transform: "translate(50%, -50%) rotate(45deg)",
                borderRadius: 2,
            } });
    }
    else if (theme.marker === "circle") {
        markerNode = _jsx("span", { style: {
                ...markerBase,
                width: headSize * 0.6,
                height: headSize * 0.6,
                borderRadius: "50%",
                border: `${strokeWidth}px solid ${theme.markerColor ?? theme.color}`,
                background: "rgba(255,255,255,0.04)",
            } });
    }
    else if (theme.marker === "square") {
        markerNode = _jsx("span", { style: {
                ...markerBase,
                width: headSize * 0.6,
                height: headSize * 0.6,
                borderRadius: 4,
                border: `${strokeWidth}px solid ${theme.markerColor ?? theme.color}`,
                background: "rgba(255,255,255,0.06)",
            } });
    }
    return _jsxs("div", { style: baseStyles, children: [_jsx("span", { style: lineStyles }), markerNode] });
};
const initialNodes = [
    {
        id: "1",
        type: "custom",
        position: { x: 250, y: 150 },
        data: {
            label: "Truck",
            icon: "truck",
            color: "#FFA500",
            category: "Logistics & Distribution",
            valueType: "non-value-added",
        },
    },
    {
        id: "2",
        type: "custom",
        position: { x: 500, y: 150 },
        data: {
            label: "Manufacturing",
            icon: "manufacturing",
            color: "#3498DB",
            category: "Production & Transformation",
            valueType: "value-added",
        },
    },
];
const initialEdges = [];
// --------------------
// Icon Map
// --------------------
const iconMap = {
    truck: _jsx(FaTruck, {}),
    manufacturing: _jsx(FaCogs, {}),
    inspection: _jsx(FaUserTie, {}),
    warehouse: _jsx(FaWarehouse, {}),
    inventory: _jsx(FaBoxOpen, {}),
    industry: _jsx(FaIndustry, {}),
    quality: _jsx(FaClipboardCheck, {}),
    digital: _jsx(FaLaptopCode, {}),
    maintenance: _jsx(FaTools, {}),
    planning: _jsx(FaCalendarAlt, {}),
    shipping: _jsx(FaShippingFast, {}),
    support: _jsx(FaHandsHelping, {}),
    performance: _jsx(FaChartLine, {}),
};
// --------------------
// Custom Node Renderer
// --------------------
const CustomNode = ({ data }) => (_jsxs("div", { style: {
        pointerEvents: "all",
        padding: 12,
        display: "flex",
        alignItems: "center",
        background: `linear-gradient(135deg, ${data.color}88, ${data.color})`,
        borderRadius: 12,
        color: "#fff",
        minWidth: 140,
        justifyContent: "flex-start",
        fontWeight: 600,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        cursor: "pointer",
    }, children: [_jsx(Handle, { type: "target", position: Position.Top, style: { background: "#555" } }), _jsx("div", { style: { width: 28, marginRight: 10 }, children: iconMap[data.icon] }), _jsxs("div", { children: [data.label, data.processTime && _jsxs("div", { style: { fontSize: 10 }, children: ["PT: ", data.processTime] }), data.cycleTime && _jsxs("div", { style: { fontSize: 10 }, children: ["CT: ", data.cycleTime] })] }), _jsx(Handle, { type: "source", position: Position.Bottom, style: { background: "#555" } })] }));
const nodeTypes = { custom: CustomNode };
// --------------------
// Component
// --------------------
export default function Whiteboard() {
    const [nodes, setNodes, rfOnNodesChange] = useNodesState(initialNodes.map(cloneNode));
    const [edges, setEdges, rfOnEdgesChange] = useEdgesState(initialEdges.map(cloneEdge));
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const reactFlowWrapperRef = useRef(null);
    const draggedNodeRef = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [activeEdgeId, setActiveEdgeId] = useState(null);
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [ghostNode, setGhostNode] = useState(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const decoratedEdges = useMemo(() => edges.map((edge) => decorateEdge(edge)), [edges]);
    const activeEdge = useMemo(() => edges.find((edge) => edge.id === activeEdgeId) ?? null, [edges, activeEdgeId]);
    const activeVariant = activeEdge ? getEdgeVariant(activeEdge) : null;
    const nodeLookup = useMemo(() => {
        const lookup = new Map();
        nodes.forEach((node) => lookup.set(node.id, node));
        return lookup;
    }, [nodes]);
    const activeNode = useMemo(() => nodes.find((node) => node.id === activeNodeId) ?? null, [nodes, activeNodeId]);
    const categoryFilters = useMemo(() => ["All", ...nodeLibrary.map((cat) => cat.category)], []);
    const filteredLibrary = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        return nodeLibrary
            .filter((cat) => categoryFilter === "All" || cat.category === categoryFilter)
            .map((cat) => ({
            ...cat,
            nodes: cat.nodes.filter((node) => {
                if (!normalized)
                    return true;
                const haystack = `${node.label} ${node.tagline ?? ""} ${node.badge ?? ""}`.toLowerCase();
                return haystack.includes(normalized);
            }),
        }))
            .filter((cat) => cat.nodes.length > 0);
    }, [categoryFilter, searchTerm]);
    const handleNodeDragStart = useCallback((event, node) => {
        draggedNodeRef.current = node;
        const payload = JSON.stringify(node);
        try {
            event.dataTransfer.setData("application/reactflow", payload);
            event.dataTransfer.setData("application/json", payload);
            event.dataTransfer.setData("text/plain", payload);
            event.dataTransfer.setData("text", payload);
        }
        catch (err) {
            console.warn("Drag payload unavailable", err);
        }
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.dropEffect = "move";
        setGhostNode(node);
    }, []);
    const handleNodeDragEnd = useCallback(() => {
        draggedNodeRef.current = null;
        setGhostNode(null);
        setIsDraggingOver(false);
    }, []);
    const handleSearchChange = useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);
    const handleCategorySelect = useCallback((category) => {
        setCategoryFilter(category);
    }, []);
    const hasFilteredResults = filteredLibrary.length > 0;
    const dashboardMetrics = useMemo(() => {
        const totals = {
            totalSteps: nodes.length,
            valueAddedSteps: 0,
            enablerSteps: 0,
            nonValueAddedSteps: 0,
            processMinutes: 0,
            processCount: 0,
            cycleMinutes: 0,
            cycleCount: 0,
            leadMinutes: 0,
            leadCount: 0,
            setupMinutes: 0,
            setupCount: 0,
            taktMinutes: 0,
            taktCount: 0,
            valueAddedMinutes: 0,
            nonValueAddedMinutes: 0,
            delayMinutes: 0,
        };
        nodes.forEach((node) => {
            const variant = node.data.valueType ?? "enabler";
            if (variant === "value-added")
                totals.valueAddedSteps += 1;
            else if (variant === "non-value-added")
                totals.nonValueAddedSteps += 1;
            else
                totals.enablerSteps += 1;
            const process = parseDurationToMinutes(node.data.processTime);
            const cycle = parseDurationToMinutes(node.data.cycleTime);
            const lead = parseDurationToMinutes(node.data.leadTime);
            const setup = parseDurationToMinutes(node.data.setupTime);
            const takt = parseDurationToMinutes(node.data.taktTime);
            if (process !== null) {
                totals.processMinutes += process;
                totals.processCount += 1;
                if (variant === "value-added")
                    totals.valueAddedMinutes += process;
                else
                    totals.nonValueAddedMinutes += process;
            }
            if (cycle !== null) {
                totals.cycleMinutes += cycle;
                totals.cycleCount += 1;
            }
            if (lead !== null) {
                totals.leadMinutes += lead;
                totals.leadCount += 1;
                const baseline = (process ?? 0) + (setup ?? 0);
                const delta = lead - baseline;
                if (delta > 0)
                    totals.delayMinutes += delta;
            }
            if (setup !== null) {
                totals.setupMinutes += setup;
                totals.setupCount += 1;
            }
            if (takt !== null) {
                totals.taktMinutes += takt;
                totals.taktCount += 1;
            }
        });
        const averageCycle = totals.cycleCount ? totals.cycleMinutes / totals.cycleCount : 0;
        const averageLead = totals.leadCount ? totals.leadMinutes / totals.leadCount : 0;
        const averageTakt = totals.taktCount ? totals.taktMinutes / totals.taktCount : 0;
        const setupAverage = totals.setupCount ? totals.setupMinutes / totals.setupCount : 0;
        const valueAddedRatio = totals.leadMinutes
            ? Math.min(100, Math.max(0, (totals.valueAddedMinutes / totals.leadMinutes) * 100))
            : 0;
        const taktGap = averageCycle && averageTakt ? averageCycle - averageTakt : 0;
        return {
            totals,
            averageCycle,
            averageLead,
            averageTakt,
            setupAverage,
            valueAddedRatio,
            taktGap,
        };
    }, [nodes]);
    const { totals, averageCycle, averageLead, averageTakt, setupAverage, valueAddedRatio, taktGap } = dashboardMetrics;
    const dashboardCards = useMemo(() => {
        return [
            {
                title: "Flow Steps",
                primary: String(totals.totalSteps ?? 0),
                accent: `${totals.valueAddedSteps} value-added` +
                    (totals.nonValueAddedSteps ? ` • ${totals.nonValueAddedSteps} delays` : ""),
                footer: totals.enablerSteps ? `${totals.enablerSteps} support` : undefined,
            },
            {
                title: "Value-Added Time",
                primary: formatMinutes(totals.valueAddedMinutes),
                accent: totals.leadMinutes ? `of ${formatMinutes(totals.leadMinutes)} lead` : undefined,
                footer: `VA Ratio ${valueAddedRatio ? valueAddedRatio.toFixed(1) : "0"}%`,
            },
            {
                title: "Cycle vs Takt",
                primary: averageCycle ? formatMinutes(averageCycle) : "--",
                accent: averageTakt ? `Takt ${formatMinutes(averageTakt)}` : undefined,
                footer: averageCycle && averageTakt
                    ? `${taktGap > 0 ? "+" : ""}${formatMinutes(Math.abs(taktGap))} ` +
                        (taktGap > 0 ? "over takt" : taktGap < 0 ? "under takt" : "balanced")
                    : undefined,
            },
            {
                title: "Setup & Delay",
                primary: formatMinutes(totals.delayMinutes),
                accent: totals.delayMinutes ? "Wait / queue" : undefined,
                footer: setupAverage ? `Avg setup ${formatMinutes(setupAverage)}` : undefined,
            },
        ];
    }, [totals, averageCycle, averageTakt, valueAddedRatio, taktGap, setupAverage]);
    const inspectorOpen = Boolean(activeEdge || activeNode);
    const inspectorWidth = 320;
    const overlayPadding = 24;
    const overlayTop = CANVAS_TOP_OFFSET;
    const libraryMaxHeight = `calc(100% - ${overlayTop + 60}px)`;
    const inspectorMaxHeight = `calc(100% - ${overlayTop + 48}px)`;
    const dashboardLeftOffset = sidebarOpen ? SIDEBAR_WIDTH + overlayPadding : overlayPadding;
    const dashboardRightOffset = inspectorOpen
        ? inspectorWidth + overlayPadding
        : overlayPadding;
    const toggleLeft = sidebarOpen ? SIDEBAR_WIDTH + overlayPadding : overlayPadding;
    const toolbarRight = inspectorOpen ? inspectorWidth + overlayPadding + 16 : overlayPadding;
    const handleSelectionChange = useCallback((params) => {
        const selectedEdge = params.edges[0];
        const selectedNode = params.nodes[0];
        if (selectedEdge) {
            setActiveEdgeId(selectedEdge.id);
            setActiveNodeId(null);
            return;
        }
        setActiveEdgeId(null);
        setActiveNodeId(selectedNode ? selectedNode.id : null);
    }, []);
    const iconPalettes = {
        undo: {
            activeBg: "linear-gradient(135deg, rgba(14, 165, 233, 0.95), rgba(59, 130, 246, 0.95))",
            borderColor: "rgba(59, 130, 246, 0.6)",
            iconColor: "#f8fafc",
            shadow: "0 12px 28px rgba(37, 99, 235, 0.35)",
            disabledBg: "rgba(148, 163, 184, 0.18)",
            disabledColor: "#a1a8b5",
        },
        redo: {
            activeBg: "linear-gradient(135deg, rgba(236, 72, 153, 0.95), rgba(168, 85, 247, 0.95))",
            borderColor: "rgba(168, 85, 247, 0.55)",
            iconColor: "#fdf4ff",
            shadow: "0 12px 28px rgba(168, 85, 247, 0.35)",
            disabledBg: "rgba(148, 163, 184, 0.18)",
            disabledColor: "#a1a8b5",
        },
        delete: {
            activeBg: "linear-gradient(135deg, rgba(248, 113, 113, 0.95), rgba(239, 68, 68, 0.95))",
            borderColor: "rgba(239, 68, 68, 0.55)",
            iconColor: "#fff5f5",
            shadow: "0 12px 28px rgba(239, 68, 68, 0.35)",
            disabledBg: "rgba(148, 163, 184, 0.18)",
            disabledColor: "#a1a8b5",
        },
    };
    const getIconButtonStyle = (palette, isDisabled) => ({
        width: 44,
        height: 44,
        borderRadius: "18px",
        border: "1px solid",
        borderColor: isDisabled ? "rgba(148, 163, 184, 0.25)" : palette.borderColor,
        background: isDisabled ? palette.disabledBg : palette.activeBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
        boxShadow: isDisabled ? "none" : palette.shadow,
        color: isDisabled ? palette.disabledColor : palette.iconColor,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
        opacity: isDisabled ? 0.65 : 1,
        backdropFilter: "blur(12px)",
    });
    const historyRef = useRef({ past: [], future: [] });
    const isApplyingRef = useRef(false);
    const MAX_HISTORY = 50;
    const pushSnapshot = useCallback((snap) => {
        const history = historyRef.current;
        const snapshot = snap ?? {
            nodes: nodes.map(cloneNode),
            edges: edges.map(cloneEdge),
        };
        history.past.push(snapshot);
        if (history.past.length > MAX_HISTORY)
            history.past.shift();
        history.future = [];
    }, [nodes, edges]);
    const onNodesChange = useCallback((changes) => {
        const endsDrag = changes.some((c) => c.type === "position" && c.dragging === false);
        const nonPositionChange = changes.some((c) => c.type !== "position");
        const shouldSnapshot = endsDrag || nonPositionChange;
        if (!isApplyingRef.current && shouldSnapshot)
            pushSnapshot();
        rfOnNodesChange(changes);
    }, [rfOnNodesChange, pushSnapshot]);
    const onEdgesChange = useCallback((changes) => {
        if (!isApplyingRef.current)
            pushSnapshot();
        rfOnEdgesChange(changes);
    }, [rfOnEdgesChange, pushSnapshot]);
    const onConnect = useCallback((connection) => {
        if (!connection.source || !connection.target)
            return;
        if (!isApplyingRef.current)
            pushSnapshot();
        const sourceNode = nodes.find((node) => node.id === connection.source);
        const processTime = sourceNode?.data?.processTime;
        const cycleTime = sourceNode?.data?.cycleTime;
        const label = processTime || cycleTime || edgeThemeMap[DEFAULT_EDGE_VARIANT]?.badge || "";
        const newEdgeId = `${connection.source}-${connection.target}-${Date.now()}`;
        const newEdge = {
            ...connection,
            id: newEdgeId,
            type: "smoothstep",
            data: { connectionType: DEFAULT_EDGE_VARIANT },
            label,
        };
        setEdges((eds) => addEdge(newEdge, eds));
        requestAnimationFrame(() => {
            setActiveEdgeId(newEdgeId);
            setActiveNodeId(null);
        });
    }, [nodes, setEdges, pushSnapshot, setActiveEdgeId, setActiveNodeId]);
    const undo = useCallback(() => {
        const history = historyRef.current;
        if (history.past.length === 0)
            return;
        isApplyingRef.current = true;
        history.future.push({
            nodes: nodes.map(cloneNode),
            edges: edges.map(cloneEdge),
        });
        const prev = history.past.pop();
        setNodes(prev.nodes.map(cloneNode));
        setEdges(prev.edges.map(cloneEdge));
        isApplyingRef.current = false;
    }, [nodes, edges, setNodes, setEdges]);
    const redo = useCallback(() => {
        const history = historyRef.current;
        if (history.future.length === 0)
            return;
        isApplyingRef.current = true;
        history.past.push({
            nodes: nodes.map(cloneNode),
            edges: edges.map(cloneEdge),
        });
        const next = history.future.pop();
        setNodes(next.nodes.map(cloneNode));
        setEdges(next.edges.map(cloneEdge));
        isApplyingRef.current = false;
    }, [nodes, edges, setNodes, setEdges]);
    const canUndo = historyRef.current.past.length > 0;
    const canRedo = historyRef.current.future.length > 0;
    // --------------------
    // Delete
    // --------------------
    const deleteSelected = useCallback(() => {
        if (!isApplyingRef.current)
            pushSnapshot();
        setNodes((nds) => {
            const removedActiveNode = activeNodeId && nds.some((node) => node.id === activeNodeId && node.selected);
            if (removedActiveNode)
                setActiveNodeId(null);
            return nds.filter((n) => !n.selected);
        });
        setEdges((eds) => {
            const remaining = eds.filter((e) => !e.selected);
            if (activeEdgeId && eds.some((edge) => edge.id === activeEdgeId && edge.selected)) {
                setActiveEdgeId(null);
            }
            return remaining;
        });
    }, [setNodes, setEdges, pushSnapshot, activeEdgeId, activeNodeId]);
    const handleEdgeVariantSelect = useCallback((variant) => {
        if (!activeEdgeId)
            return;
        if (activeEdge && getEdgeVariant(activeEdge) === variant)
            return;
        if (!isApplyingRef.current)
            pushSnapshot();
        setEdges((eds) => eds.map((edge) => edge.id === activeEdgeId
            ? {
                ...edge,
                data: { ...edge.data, connectionType: variant },
            }
            : edge));
    }, [activeEdgeId, setEdges, pushSnapshot, activeEdge]);
    const handleNodeMetaChange = useCallback((key, value) => {
        if (!activeNodeId)
            return;
        const raw = key === "notes" || key === "owner" ? value : value.trim();
        const trimmed = raw.trim();
        const nextValue = trimmed.length === 0 ? undefined : raw;
        const currentValue = activeNode?.data?.[key];
        if ((currentValue ?? "") === (nextValue ?? ""))
            return;
        if (!isApplyingRef.current)
            pushSnapshot();
        setNodes((nds) => nds.map((node) => node.id === activeNodeId
            ? {
                ...node,
                data: {
                    ...node.data,
                    [key]: nextValue,
                },
            }
            : node));
    }, [activeNodeId, activeNode, pushSnapshot, setNodes]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                deleteSelected();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [deleteSelected]);
    useEffect(() => {
        if (activeEdgeId && !edges.some((edge) => edge.id === activeEdgeId)) {
            setActiveEdgeId(null);
        }
    }, [edges, activeEdgeId]);
    // --------------------
    // Drag & Drop
    // --------------------
    const onDrop = useCallback((event) => {
        event.preventDefault();
        const reactFlowBounds = reactFlowWrapperRef.current?.getBoundingClientRect();
        const data =
            event.dataTransfer.getData("application/reactflow") ||
            event.dataTransfer.getData("application/json") ||
            event.dataTransfer.getData("text/plain") ||
            event.dataTransfer.getData("text");
        if (!reactFlowBounds || !reactFlowInstance)
            return;
        let node = null;
        if (data) {
            try {
                node = JSON.parse(data);
            }
            catch (error) {
                console.error("Failed to parse dropped node data", error);
            }
        }
        if (!node && draggedNodeRef.current) {
            node = draggedNodeRef.current;
        }
        if (!node)
            return;
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });
        if (!isApplyingRef.current)
            pushSnapshot();
        const newNode = {
            id: `${Date.now()}`,
            type: "custom",
            position,
            data: {
                ...node,
            },
        };
        setNodes((nds) => nds.concat(newNode));
        draggedNodeRef.current = null;
    }, [reactFlowInstance, pushSnapshot, setNodes]);
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);
    // --------------------
    // Render
    // --------------------
    // --------------------
// Render
// --------------------
return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      background: "#0f172a",
    }}
  >
    {/* ---------- Top Tab Bar ---------- */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: TAB_BAR_HEIGHT,
        padding: "0 20px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
        background:
          "linear-gradient(90deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.85))",
        backdropFilter: "blur(14px)",
        zIndex: 8,
      }}
    >
      {boards.map((board) => {
        const isActive = board.id === activeBoardId;
        return (
          <button
            key={board.id}
            type="button"
            onClick={() => handleBoardSelect(board.id)}
            style={{
              borderRadius: 999,
              padding: "8px 18px",
              fontSize: 13,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              border: isActive
                ? "1px solid rgba(129, 140, 248, 0.9)"
                : "1px solid rgba(148, 163, 184, 0.25)",
              background: isActive
                ? "linear-gradient(135deg, rgba(129, 140, 248, 0.45), rgba(14, 165, 233, 0.35))"
                : "rgba(15, 23, 42, 0.5)",
              color: "#f8fafc",
              cursor: "pointer",
              boxShadow: isActive
                ? "0 12px 26px rgba(14, 165, 233, 0.35)"
                : "none",
            }}
          >
            {board.name}
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleAddBoard}
        style={{
          marginLeft: "auto",
          borderRadius: 999,
          padding: "8px 16px",
          fontSize: 13,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          border: "1px solid rgba(129, 140, 248, 0.5)",
          background: "rgba(15, 23, 42, 0.45)",
          color: "#cbd5f5",
          cursor: "pointer",
        }}
      >
        + New Board
      </button>
    </div>

    {/* ---------- Whiteboard + ReactFlow ---------- */}
    <div
      style={{ position: "relative", flex: 1 }}
      ref={reactFlowWrapperRef}   // 👈 added ref
      onDrop={onDrop}             // 👈 moved here
      onDragOver={onDragOver}     // 👈 moved here
      onDragLeave={onDragLeave}   // 👈 optional highlight clear
    >
      <ReactFlow
        nodes={nodes}
        edges={decoratedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        onSelectionChange={handleSelectionChange}
        onEdgeClick={(_, edge) => {
          setActiveEdgeId(edge.id);
          setActiveNodeId(null);
        }}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          markerEnd: { type: MarkerType.ArrowClosed },
          type: "smoothstep",
        }}
        proOptions={{ hideAttribution: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>

      {/* ---------- Sidebar, Dashboard, Inspector ---------- */}
      {sidebarOpen && (
        <aside
          style={{
            position: "absolute",
            top: overlayTop,
            left: overlayPadding,
            width: SIDEBAR_WIDTH,
            maxHeight: libraryMaxHeight,
            padding: "22px 22px 18px",
            borderRadius: 22,
            border: "1px solid rgba(148, 163, 184, 0.25)",
            background:
              "linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9))",
            color: "#e2e8f0",
            backdropFilter: "blur(18px)",
            boxShadow: "0 16px 34px rgba(15, 23, 42, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            overflow: "hidden",
            zIndex: 15,
          }}
        >
          {/* ... your sidebar content (search, categories, node catalog) */}
        </aside>
      )}

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen((s) => !s)}
        style={{
          position: "absolute",
          top: overlayTop - 16,
          left: toggleLeft,
          transform: "translateX(-50%)",
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.25s ease",
          zIndex: 16,
        }}
      >
        {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {/* Toolbar (Undo/Redo/Delete) */}
      <div
        style={{
          position: "absolute",
          top: overlayTop,
          right: toolbarRight,
          zIndex: 14,
          display: "flex",
          gap: 14,
          padding: "10px 16px",
          borderRadius: 20,
          background: "rgba(15, 23, 42, 0.35)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          boxShadow: "0 18px 42px rgba(15, 23, 42, 0.28)",
          backdropFilter: "blur(14px)",
        }}
      >
        <button
          aria-label="Undo"
          title="Undo"
          onClick={undo}
          disabled={!canUndo}
          style={getIconButtonStyle(iconPalettes.undo, !canUndo)}
        >
          <FaUndo size={18} />
        </button>
        <button
          aria-label="Redo"
          title="Redo"
          onClick={redo}
          disabled={!canRedo}
          style={getIconButtonStyle(iconPalettes.redo, !canRedo)}
        >
          <FaRedo size={18} />
        </button>
        <button
          aria-label="Delete selected"
          title="Delete selected"
          onClick={deleteSelected}
          style={getIconButtonStyle(iconPalettes.delete, false)}
        >
          <FaTrash size={18} />
        </button>
      </div>

      {/* Dashboard Cards */}
      <div
        style={{
          position: "absolute",
          top: overlayTop,
          left: dashboardLeftOffset,
          right: dashboardRightOffset,
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          gap: 16,
          flexWrap: "wrap",
          pointerEvents: "none",
          zIndex: 12,
        }}
      >
        {dashboardCards.map((card) => (
          <div
            key={card.title}
            style={{
              pointerEvents: "auto",
              borderRadius: 14,
              padding: "12px 16px",
              background: "rgba(15, 23, 42, 0.55)",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              boxShadow: "0 12px 24px rgba(15, 23, 42, 0.3)",
              backdropFilter: "blur(18px)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              flex: "0 1 200px",
              minWidth: 180,
              maxWidth: 240,
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                letterSpacing: 1.1,
                textTransform: "uppercase",
                color: "#cbd5f5",
              }}
            >
              {card.title}
            </span>
            <span
              style={{ fontSize: 17, fontWeight: 700, color: "#f8fafc" }}
            >
              {card.primary}
            </span>
            {card.accent && (
              <span style={{ fontSize: 11, color: "#e2e8f0" }}>
                {card.accent}
              </span>
            )}
            {card.footer && (
              <span style={{ fontSize: 10.5, color: "#cbd5f5" }}>
                {card.footer}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Inspector Panels (Edge / Node detail) ---------- */}
      {activeEdge ? (
        <aside
          style={{
            position: "absolute",
            top: overlayTop,
            right: overlayPadding,
            width: inspectorWidth,
            maxHeight: inspectorMaxHeight,
            padding: "20px 20px 24px",
            borderRadius: 20,
            border: "1px solid rgba(148, 163, 184, 0.3)",
            background:
              "linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.94))",
            color: "#e2e8f0",
            backdropFilter: "blur(18px)",
            boxShadow: "0 18px 42px rgba(15, 23, 42, 0.35)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflowY: "auto",
            zIndex: 18,
          }}
        >
          {/* ... edge inspector content */}
        </aside>
      ) : activeNode ? (
        <aside
          style={{
            position: "absolute",
            top: overlayTop,
            right: overlayPadding,
            width: inspectorWidth,
            maxHeight: inspectorMaxHeight,
            padding: "22px 22px 26px",
            borderRadius: 20,
            border: "1px solid rgba(148, 163, 184, 0.3)",
            background:
              "linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.94))",
            color: "#e2e8f0",
            backdropFilter: "blur(18px)",
            boxShadow: "0 18px 42px rgba(15, 23, 42, 0.35)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflowY: "auto",
            zIndex: 18,
          }}
        >
          {/* ... node inspector content */}
        </aside>
      ) : null}
    </div>
  </div>
);}
