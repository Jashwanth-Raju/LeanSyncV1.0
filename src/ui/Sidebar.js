import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../theme/ThemeContext";
export const Sidebar = ({ categories, searchTerm, onSearchChange, categoryFilter, categoryFilters, onCategorySelect, onNodeDragStart, onNodeDragEnd, maxHeight, styleOverrides, }) => {
    const theme = useTheme();
    return (_jsxs("aside", { style: {
            width: 360,
            maxHeight,
            padding: "22px 22px 18px",
            borderRadius: 22,
            border: "1px solid rgba(148, 163, 184, 0.25)",
            background: theme.sidebarGlass ?? "linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9))",
            color: "#e2e8f0",
            backdropFilter: "blur(18px)",
            boxShadow: "0 16px 34px rgba(15, 23, 42, 0.4)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            overflow: "hidden",
            zIndex: 15,
            ...styleOverrides,
        }, children: [_jsx("input", { type: "search", placeholder: "Search nodes", value: searchTerm, onChange: (event) => onSearchChange(event.target.value), style: {
                    borderRadius: 12,
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    background: "rgba(15, 23, 42, 0.4)",
                    color: "#f8fafc",
                    padding: "10px 12px",
                } }), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 }, children: categoryFilters.map((category) => {
                    const isActive = categoryFilter === category;
                    return (_jsx("button", { type: "button", onClick: () => onCategorySelect(category), style: {
                            borderRadius: 999,
                            padding: "6px 12px",
                            fontSize: 12,
                            border: isActive
                                ? "1px solid rgba(129, 140, 248, 0.9)"
                                : "1px solid rgba(148, 163, 184, 0.25)",
                            background: isActive
                                ? "linear-gradient(135deg, rgba(129, 140, 248, 0.45), rgba(14, 165, 233, 0.35))"
                                : "rgba(15, 23, 42, 0.5)",
                            color: "#f8fafc",
                            cursor: "pointer",
                        }, children: category }, category));
                }) }), _jsx("div", { style: { overflowY: "auto", flex: 1, paddingRight: 6 }, children: categories.map((category) => (_jsxs("section", { style: { marginBottom: 16 }, children: [_jsx("h4", { style: {
                                color: category.accent,
                                fontSize: 13,
                                textTransform: "uppercase",
                                letterSpacing: 0.7,
                                marginBottom: 6,
                            }, children: category.category }), _jsx("p", { style: { fontSize: 12, color: "#cbd5f5", marginBottom: 10 }, children: category.description }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: category.nodes.map((node) => (_jsxs("div", { draggable: true, onDragStart: (event) => onNodeDragStart(event, node), onDragEnd: onNodeDragEnd, style: {
                                    borderRadius: 12,
                                    padding: "10px 12px",
                                    border: `1px solid ${node.color}`,
                                    background: "rgba(15, 23, 42, 0.35)",
                                    cursor: "grab",
                                }, children: [_jsx("div", { style: { fontWeight: 600 }, children: node.label }), _jsx("div", { style: { fontSize: 11, color: "#cbd5f5" }, children: node.tagline }), node.badge && (_jsx("span", { style: {
                                            marginTop: 6,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            fontSize: 10,
                                            textTransform: "uppercase",
                                            letterSpacing: 0.6,
                                            color: node.color,
                                        }, children: node.badge }))] }, node.label))) })] }, category.category))) })] }));
};
