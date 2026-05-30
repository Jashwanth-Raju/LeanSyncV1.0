import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from "react";
import { iconMap } from "./Icons";
import { IconButton } from "./Buttons";
import { useTheme } from "../theme/ThemeContext";
const SectionTitle = ({ title }) => (_jsx("div", { style: { fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#94a3b8", marginBottom: 10 }, children: title }));
export const CommandSidebar = ({ collapsed, onToggle, searchTerm, onSearchChange, categories, categoryFilter, categoryFilters, onCategorySelect, onNodeDragStart, onNodeDragEnd, insights, layers, activeLayers, layerValues, onLayerToggle, onUndo, onRedo, onDelete, canUndo, canRedo, }) => {
    const theme = useTheme();
    const width = collapsed ? 70 : 340;
    const filterButtons = useMemo(() => {
        if (collapsed)
            return null;
        return (_jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 }, children: categoryFilters.map((filter) => {
                const isActive = categoryFilter === filter;
                return (_jsx("button", { type: "button", onClick: () => onCategorySelect(filter), style: {
                        borderRadius: 999,
                        padding: "6px 12px",
                        fontSize: 12,
                        border: isActive ? `1px solid ${theme.primary}` : "1px solid rgba(148,163,184,0.3)",
                        background: isActive ? `${theme.primary}22` : "rgba(15,23,42,0.4)",
                        color: "#f8fafc",
                        cursor: "pointer",
                    }, children: filter }, filter));
            }) }));
    }, [categoryFilter, categoryFilters, collapsed, onCategorySelect, theme.primary]);
    const renderLayerToggle = (layer) => {
        const isActive = activeLayers.includes(layer.id);
        return (_jsxs("button", { type: "button", onClick: () => onLayerToggle(layer.id), style: {
                borderRadius: 12,
                border: isActive ? `1px solid ${layer.color}` : "1px solid rgba(148,163,184,0.3)",
                background: isActive ? `${layer.color}22` : "rgba(15,23,42,0.45)",
                color: "#f8fafc",
                padding: "10px 14px",
                fontSize: 13,
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
            }, children: [_jsx("span", { children: layer.label }), _jsx("span", { style: { fontWeight: 600 }, children: layerValues[layer.id] ?? "--" })] }, layer.id));
    };
    const renderNode = (node) => (_jsxs("div", { draggable: true, onDragStart: (event) => onNodeDragStart(event, node), onDragEnd: onNodeDragEnd, style: {
            borderRadius: 12,
            padding: "10px 12px",
            border: `1px solid ${node.color}`,
            background: "rgba(15, 23, 42, 0.35)",
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            gap: 10,
        }, children: [_jsx("span", { style: { color: node.color }, children: iconMap[node.icon] ?? iconMap.industry }), _jsxs("div", { style: { display: "flex", flexDirection: "column" }, children: [_jsx("span", { style: { fontWeight: 600 }, children: node.label }), node.tagline && _jsx("span", { style: { fontSize: 11, color: "#cbd5f5" }, children: node.tagline })] })] }, node.label));
    return (_jsxs("div", { style: {
            width,
            transition: "width 0.2s ease",
            background: theme.sidebarGlass ?? "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(30,41,59,0.92))",
            borderRight: "1px solid rgba(148,163,184,0.15)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            color: "#f8fafc",
            position: "relative",
        }, children: [_jsx("button", { type: "button", onClick: onToggle, style: {
                    position: "absolute",
                    top: 20,
                    right: collapsed ? 10 : -15,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    cursor: "pointer",
                }, children: collapsed ? ">" : "<" }), collapsed ? (_jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 70 }, children: [_jsx(IconButton, { "aria-label": "Undo", title: "Undo", onClick: onUndo, disabled: !canUndo, children: iconMap.undo }), _jsx(IconButton, { "aria-label": "Redo", title: "Redo", onClick: onRedo, disabled: !canRedo, children: iconMap.redo }), _jsx(IconButton, { "aria-label": "Delete", title: "Delete", onClick: onDelete, children: iconMap.delete }), layers.slice(0, 3).map((layer) => (_jsx("span", { style: {
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: layer.color,
                            opacity: activeLayers.includes(layer.id) ? 1 : 0.3,
                        } }, layer.id)))] })) : (_jsxs("div", { style: { padding: "60px 20px 20px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }, children: [_jsx(SectionTitle, { title: "Node Library" }), _jsx("input", { value: searchTerm, onChange: (event) => onSearchChange(event.target.value), placeholder: "Search catalog", style: {
                            borderRadius: 14,
                            border: "1px solid rgba(148,163,184,0.35)",
                            background: "rgba(15,23,42,0.6)",
                            color: "#f8fafc",
                            padding: "10px 12px",
                            fontSize: 14,
                        } }), filterButtons, categories.map((category) => (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [_jsx("div", { style: { fontWeight: 600, color: category.accent }, children: category.category }), _jsx("div", { style: { fontSize: 12, color: "#cbd5f5" }, children: category.description }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: category.nodes.map((node) => renderNode(node)) })] }, category.category))), _jsx(SectionTitle, { title: "Insights" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: insights.map((card) => (_jsxs("div", { style: {
                                borderRadius: 16,
                                padding: "12px 16px",
                                background: theme.cardGradient
                                    ? `linear-gradient(135deg, ${theme.cardGradient[0]}, ${theme.cardGradient[1]})`
                                    : "rgba(15,23,42,0.5)",
                                border: "1px solid rgba(148,163,184,0.3)",
                            }, children: [_jsx("div", { style: { fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#cbd5f5" }, children: card.title }), _jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: card.primary }), card.accent && _jsx("div", { style: { fontSize: 12, color: "#e2e8f0" }, children: card.accent }), card.footer && _jsx("div", { style: { fontSize: 11, color: "#cbd5f5" }, children: card.footer })] }, card.title))) }), layers.length > 0 && (_jsxs(_Fragment, { children: [_jsx(SectionTitle, { title: "Insight Layers" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: layers.map((layer) => renderLayerToggle(layer)) })] })), _jsx(SectionTitle, { title: "Canvas Controls" }), _jsxs("div", { style: { display: "flex", gap: 12 }, children: [_jsx(IconButton, { "aria-label": "Undo", title: "Undo", onClick: onUndo, disabled: !canUndo, children: iconMap.undo }), _jsx(IconButton, { "aria-label": "Redo", title: "Redo", onClick: onRedo, disabled: !canRedo, children: iconMap.redo }), _jsx(IconButton, { "aria-label": "Delete", title: "Delete", onClick: onDelete, children: iconMap.delete })] })] }))] }));
};
