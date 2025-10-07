import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend, } from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { formatMinutes } from "../utils";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);
const COST_PALETTE = [
    "#38bdf8",
    "#6366f1",
    "#f472b6",
    "#facc15",
    "#34d399",
    "#f97316",
    "#22d3ee",
    "#a855f7",
];
const SCOPE_COLORS = ["#f87171", "#60a5fa", "#fbbf24"];
const GlassCard = ({ title, children, }) => (_jsxs("div", { style: {
        background: "rgba(15, 23, 42, 0.82)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        borderRadius: 22,
        padding: "20px 22px",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxShadow: "0 30px 60px rgba(15, 23, 42, 0.35)",
        backdropFilter: "blur(16px)",
        minWidth: 0,
    }, children: [_jsx("div", { style: {
                fontSize: 13,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#94a3b8",
            }, children: title }), children] }));
const AuroraCard = ({ title, subtitle, children, }) => (_jsxs("div", { style: {
        background: "linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(34, 197, 94, 0.16))",
        border: "1px solid rgba(56, 189, 248, 0.35)",
        borderRadius: 28,
        padding: "26px 28px",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: 22,
        boxShadow: "0 34px 64px rgba(14, 165, 233, 0.22)",
        backdropFilter: "blur(18px)",
        minWidth: 0,
    }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                fontSize: 12,
                                letterSpacing: 1,
                                textTransform: "uppercase",
                                color: "rgba(226, 232, 240, 0.7)",
                            }, children: title }), subtitle && (_jsx("div", { style: { fontSize: 12, color: "#bfdbfe", marginTop: 4 }, children: subtitle }))] }), _jsx("div", { style: {
                        padding: "4px 12px",
                        borderRadius: 999,
                        border: "1px solid rgba(59, 130, 246, 0.45)",
                        fontSize: 11,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        color: "#e0f2fe",
                    }, children: "Sustainability" })] }), children] }));
export const AnalyticsPanel = ({ cards, valueBreakdown, timeMetrics, cycleTimeTrend, wipCapacity, costBreakdown, sustainabilityDashboard, categoryBreakdown, summary, alerts, onExportMap, onImportMap, onExportDashboards, }) => {
    const cycleChartData = React.useMemo(() => {
        if (!cycleTimeTrend)
            return null;
        const averageLine = Number.parseFloat(cycleTimeTrend.average.toFixed(2));
        return {
            labels: cycleTimeTrend.labels,
            datasets: [
                {
                    label: "Cycle time",
                    data: cycleTimeTrend.values,
                    borderColor: "rgba(59, 130, 246, 0.9)",
                    backgroundColor: "rgba(59, 130, 246, 0.22)",
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: "#60a5fa",
                    pointBorderColor: "#1d4ed8",
                    pointHoverRadius: 6,
                },
                {
                    label: "Average",
                    data: cycleTimeTrend.labels.map(() => averageLine),
                    borderColor: "rgba(148, 163, 184, 0.6)",
                    borderDash: [6, 6],
                    pointRadius: 0,
                    fill: false,
                },
            ],
        };
    }, [cycleTimeTrend]);
    const cycleChartOptions = React.useMemo(() => {
        if (!cycleTimeTrend)
            return null;
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: "#e2e8f0",
                        usePointStyle: true,
                        boxWidth: 10,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label ?? "";
                            const value = formatMinutes(context.parsed.y ?? 0);
                            return label ? `${label}: ${value}` : value;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#94a3b8",
                        maxRotation: 0,
                        autoSkip: true,
                        autoSkipPadding: 12,
                    },
                    grid: {
                        color: "rgba(148, 163, 184, 0.12)",
                    },
                },
                y: {
                    ticks: {
                        color: "#94a3b8",
                        callback: (value) => {
                            const numeric = typeof value === "number" ? value : Number.parseFloat(value);
                            return formatMinutes(Number.isFinite(numeric) ? numeric : 0);
                        },
                    },
                    grid: {
                        color: "rgba(148, 163, 184, 0.12)",
                    },
                },
            },
        };
    }, [cycleTimeTrend]);
    const cycleStats = React.useMemo(() => {
        if (!cycleTimeTrend)
            return null;
        const direction = cycleTimeTrend.delta > 0 ? "up" : cycleTimeTrend.delta < 0 ? "down" : "flat";
        const deltaLabel = formatMinutes(Math.abs(cycleTimeTrend.delta));
        return {
            average: formatMinutes(cycleTimeTrend.average),
            min: formatMinutes(cycleTimeTrend.min),
            max: formatMinutes(cycleTimeTrend.max),
            direction,
            deltaLabel,
        };
    }, [cycleTimeTrend]);
    const wipChartData = React.useMemo(() => {
        if (!wipCapacity)
            return null;
        return {
            labels: wipCapacity.labels,
            datasets: [
                {
                    label: "WIP",
                    data: wipCapacity.wipValues,
                    backgroundColor: "rgba(244, 114, 182, 0.75)",
                    borderColor: "rgba(236, 72, 153, 0.9)",
                    borderWidth: 1,
                    borderRadius: 6,
                    maxBarThickness: 38,
                },
                {
                    label: "Capacity",
                    data: wipCapacity.capacityValues,
                    backgroundColor: "rgba(96, 165, 250, 0.35)",
                    borderColor: "rgba(59, 130, 246, 0.85)",
                    borderWidth: 1,
                    borderRadius: 6,
                    maxBarThickness: 38,
                },
            ],
        };
    }, [wipCapacity]);
    const wipChartOptions = React.useMemo(() => {
        if (!wipCapacity)
            return null;
        const formatNumeric = (value) => {
            if (!Number.isFinite(value))
                return "0";
            return Math.round(value).toLocaleString();
        };
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: "#e2e8f0",
                        usePointStyle: true,
                        boxWidth: 10,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label ?? "";
                            const value = formatNumeric(context.parsed.y ?? 0);
                            return label ? `${label}: ${value}` : value;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#94a3b8",
                        maxRotation: 0,
                        autoSkip: true,
                        autoSkipPadding: 12,
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#94a3b8",
                        callback: (value) => {
                            const numeric = typeof value === "number" ? value : Number.parseFloat(value);
                            return formatNumeric(Number.isFinite(numeric) ? numeric : 0);
                        },
                    },
                    grid: {
                        color: "rgba(148, 163, 184, 0.12)",
                    },
                },
            },
        };
    }, [wipCapacity]);
    const wipStats = React.useMemo(() => {
        if (!wipCapacity)
            return null;
        const formatter = new Intl.NumberFormat();
        const totalWip = formatter.format(Math.round(wipCapacity.totalWip));
        const totalCapacity = formatter.format(Math.round(wipCapacity.totalCapacity));
        const spareRaw = wipCapacity.totalCapacity - wipCapacity.totalWip;
        const spare = formatter.format(Math.round(spareRaw));
        const utilizationPercent = wipCapacity.avgUtilization !== null
            ? `${Math.round(wipCapacity.avgUtilization * 100)}%`
            : "--";
        return {
            totalWip,
            totalCapacity,
            spare,
            spareRaw,
            utilizationPercent,
            hotspots: wipCapacity.hotspots.map((spot) => ({
                label: spot.label,
                utilization: `${Math.round(spot.utilization * 100)}%`,
            })),
        };
    }, [wipCapacity]);
    const costChartData = React.useMemo(() => {
        if (!costBreakdown)
            return null;
        const backgroundColor = costBreakdown.labels.map((_, idx) => COST_PALETTE[idx % COST_PALETTE.length]);
        const borderColor = backgroundColor.map((color) => color);
        return {
            labels: costBreakdown.labels,
            datasets: [
                {
                    data: costBreakdown.values,
                    backgroundColor,
                    borderColor,
                    borderWidth: 1,
                    hoverOffset: 8,
                },
            ],
        };
    }, [costBreakdown]);
    const costChartOptions = React.useMemo(() => {
        if (!costBreakdown)
            return null;
        const formatter = new Intl.NumberFormat();
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "55%",
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label ?? "";
                            const value = typeof context.parsed === "number" ? context.parsed : 0;
                            const dataset = Array.isArray(context.dataset.data)
                                ? context.dataset.data
                                : [];
                            const total = dataset.reduce((acc, item) => {
                                const numeric = typeof item === "number" ? item : 0;
                                return acc + numeric;
                            }, 0);
                            const formatted = formatter.format(Math.round(value));
                            const percent = total > 0 ? (value / total) * 100 : 0;
                            return `${label}: ${formatted} (${percent.toFixed(1)}%)`;
                        },
                    },
                },
            },
        };
    }, [costBreakdown]);
    const costStats = React.useMemo(() => {
        if (!costBreakdown)
            return null;
        const formatter = new Intl.NumberFormat();
        const total = formatter.format(Math.round(costBreakdown.total));
        const contributions = costBreakdown.contributions.map((item) => ({
            label: item.label,
            category: item.category,
            cost: formatter.format(Math.round(item.cost)),
            percent: `${item.percent.toFixed(1)}%`,
        }));
        return { total, contributions };
    }, [costBreakdown]);
    const costLegend = React.useMemo(() => {
        if (!costBreakdown)
            return null;
        const total = costBreakdown.total;
        return costBreakdown.labels.map((label, idx) => {
            const value = costBreakdown.values[idx] ?? 0;
            const percent = total > 0 ? (value / total) * 100 : 0;
            return {
                label,
                color: COST_PALETTE[idx % COST_PALETTE.length],
                percent,
            };
        });
    }, [costBreakdown]);
    const sustainabilityScopeData = React.useMemo(() => {
        if (!sustainabilityDashboard)
            return null;
        const hasData = sustainabilityDashboard.scopeTotals.some((value) => value > 0);
        if (!hasData)
            return null;
        return {
            labels: sustainabilityDashboard.scopeLabels,
            datasets: [
                {
                    data: sustainabilityDashboard.scopeTotals,
                    backgroundColor: SCOPE_COLORS,
                    borderColor: SCOPE_COLORS,
                    borderWidth: 1,
                    hoverOffset: 8,
                },
            ],
        };
    }, [sustainabilityDashboard]);
    const sustainabilityScopeOptions = React.useMemo(() => {
        if (!sustainabilityDashboard)
            return null;
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#e2e8f0",
                        usePointStyle: true,
                        boxWidth: 10,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label ?? "";
                            const value = typeof context.parsed === "number" ? context.parsed : 0;
                            const total = sustainabilityDashboard.totalEmissions || 0;
                            const formatter = new Intl.NumberFormat();
                            const formatted = formatter.format(Number.parseFloat(value.toFixed(2)));
                            const percent = total > 0 ? (value / total) * 100 : 0;
                            return `${label}: ${formatted} t (${percent.toFixed(1)}%)`;
                        },
                    },
                },
            },
        };
    }, [sustainabilityDashboard]);
    const sustainabilityHotspotData = React.useMemo(() => {
        if (!sustainabilityDashboard)
            return null;
        if (sustainabilityDashboard.hotspots.length === 0)
            return null;
        const labels = sustainabilityDashboard.hotspots.map((item) => item.label);
        return {
            labels,
            datasets: [
                {
                    label: "Scope 1",
                    data: sustainabilityDashboard.hotspots.map((item) => item.scope1),
                    backgroundColor: `${SCOPE_COLORS[0]}aa`,
                    stack: "scopes",
                },
                {
                    label: "Scope 2",
                    data: sustainabilityDashboard.hotspots.map((item) => item.scope2),
                    backgroundColor: `${SCOPE_COLORS[1]}aa`,
                    stack: "scopes",
                },
                {
                    label: "Scope 3",
                    data: sustainabilityDashboard.hotspots.map((item) => item.scope3),
                    backgroundColor: `${SCOPE_COLORS[2]}aa`,
                    stack: "scopes",
                },
            ],
        };
    }, [sustainabilityDashboard]);
    const sustainabilityHotspotOptions = React.useMemo(() => {
        if (!sustainabilityDashboard)
            return null;
        return {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#e2e8f0",
                        usePointStyle: true,
                        boxWidth: 10,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label ?? "";
                            const value = typeof context.parsed.x === "number" ? context.parsed.x : context.parsed.y;
                            const formatter = new Intl.NumberFormat();
                            return `${label}: ${formatter.format(Number.parseFloat((value ?? 0).toFixed(2)))} t`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: "#94a3b8",
                    },
                    grid: {
                        color: "rgba(148, 163, 184, 0.12)",
                    },
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: "#cbd5f5",
                    },
                    grid: {
                        display: false,
                    },
                },
            },
        };
    }, [sustainabilityDashboard]);
    const sustainabilityStats = React.useMemo(() => {
        if (!sustainabilityDashboard)
            return null;
        const formatter = new Intl.NumberFormat();
        const total = formatter.format(Number.parseFloat(sustainabilityDashboard.totalEmissions.toFixed(2)));
        const average = sustainabilityDashboard.perUnit.average !== null
            ? Number.parseFloat(sustainabilityDashboard.perUnit.average.toFixed(2)).toString()
            : "--";
        const best = sustainabilityDashboard.perUnit.best
            ? {
                label: sustainabilityDashboard.perUnit.best.label,
                value: Number.parseFloat((sustainabilityDashboard.perUnit.best.value ?? 0).toFixed(2)).toString(),
            }
            : null;
        const worst = sustainabilityDashboard.perUnit.worst
            ? {
                label: sustainabilityDashboard.perUnit.worst.label,
                value: Number.parseFloat((sustainabilityDashboard.perUnit.worst.value ?? 0).toFixed(2)).toString(),
            }
            : null;
        return { total, average, best, worst };
    }, [sustainabilityDashboard]);
    return (_jsxs("div", { style: {
            display: "flex",
            flexDirection: "column",
            gap: 28,
            padding: 32,
            width: "100%",
            height: "100%",
            background: "linear-gradient(160deg, #0f172a, #111827)",
            overflowY: "auto",
        }, children: [_jsxs("section", { style: {
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    gap: 12,
                }, children: [_jsx("button", { type: "button", onClick: onExportMap, disabled: !onExportMap, style: {
                            padding: "10px 18px",
                            borderRadius: 999,
                            border: "1px solid rgba(129, 140, 248, 0.35)",
                            background: onExportMap
                                ? "linear-gradient(135deg, rgba(129, 140, 248, 0.25), rgba(14, 165, 233, 0.3))"
                                : "rgba(15, 23, 42, 0.4)",
                            color: onExportMap ? "#e2e8f0" : "rgba(148, 163, 184, 0.6)",
                            fontSize: 12,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            cursor: onExportMap ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease",
                            boxShadow: onExportMap ? "0 10px 20px rgba(129, 140, 248, 0.25)" : "none",
                        }, children: "Export Map" }), _jsx("button", { type: "button", onClick: onImportMap, disabled: !onImportMap, style: {
                            padding: "10px 18px",
                            borderRadius: 999,
                            border: "1px solid rgba(59, 130, 246, 0.35)",
                            background: onImportMap
                                ? "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(96, 165, 250, 0.3))"
                                : "rgba(15, 23, 42, 0.4)",
                            color: onImportMap ? "#e2e8f0" : "rgba(148, 163, 184, 0.6)",
                            fontSize: 12,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            cursor: onImportMap ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease",
                            boxShadow: onImportMap ? "0 10px 20px rgba(59, 130, 246, 0.22)" : "none",
                        }, children: "Import Map" }), _jsx("button", { type: "button", onClick: onExportDashboards, disabled: !onExportDashboards, style: {
                            padding: "10px 18px",
                            borderRadius: 999,
                            border: "1px solid rgba(244, 114, 182, 0.35)",
                            background: onExportDashboards
                                ? "linear-gradient(135deg, rgba(244, 114, 182, 0.25), rgba(236, 72, 153, 0.3))"
                                : "rgba(15, 23, 42, 0.4)",
                            color: onExportDashboards ? "#e2e8f0" : "rgba(148, 163, 184, 0.6)",
                            fontSize: 12,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            cursor: onExportDashboards ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease",
                            boxShadow: onExportDashboards ? "0 10px 20px rgba(244, 114, 182, 0.22)" : "none",
                        }, children: "Export Charts" })] }), _jsxs("section", { style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 18,
                }, children: [_jsx("div", { style: {
                            gridColumn: "1 / -1",
                            display: "flex",
                            justifyContent: "flex-end",
                        }, children: _jsx("div", { style: {
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 16px",
                                borderRadius: 999,
                                background: "rgba(30, 41, 59, 0.55)",
                                border: "1px solid rgba(148, 163, 184, 0.3)",
                                color: "#e2e8f0",
                                fontSize: 12,
                                letterSpacing: 0.6,
                                textTransform: "uppercase",
                                boxShadow: "0 10px 20px rgba(129, 140, 248, 0.18)",
                            }, children: _jsx("span", { children: "Insights Actions" }) }) }), cards.map((card) => (_jsxs(GlassCard, { title: card.title, children: [_jsx("div", { style: { fontSize: 28, fontWeight: 700 }, children: card.primary }), card.accent && (_jsx("div", { style: { fontSize: 13, color: "#cbd5f5" }, children: card.accent })), card.footer && (_jsx("div", { style: { fontSize: 12, color: "#94a3b8" }, children: card.footer }))] }, card.title)))] }), _jsx(GlassCard, { title: "Alerts", children: _jsx("ul", { style: {
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        fontSize: 13,
                        color: "#f8fafc",
                    }, children: alerts.length > 0 ? (alerts.map((alert, idx) => (_jsxs("li", { style: {
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            background: "rgba(30, 41, 59, 0.55)",
                            padding: "12px 14px",
                            borderRadius: 16,
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            boxShadow: "0 12px 26px rgba(15, 23, 42, 0.28)",
                        }, children: [_jsx("span", { style: {
                                    display: "inline-flex",
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    marginTop: 6,
                                    background: "linear-gradient(135deg, #facc15, #f97316)",
                                    boxShadow: "0 0 12px rgba(250, 204, 21, 0.35)",
                                } }), _jsx("span", { children: alert })] }, idx)))) : (_jsx("li", { style: {
                            padding: "12px 14px",
                            borderRadius: 16,
                            background: "rgba(30, 41, 59, 0.45)",
                            color: "#cbd5f5",
                        }, children: "No outstanding alerts \u2014 great job keeping the flow healthy." })) }) }), _jsxs("section", { style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 22,
                }, children: [_jsx(GlassCard, { title: "Value Stream Mix", children: _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: valueBreakdown.map((item) => {
                                const total = valueBreakdown.reduce((sum, it) => sum + it.count, 0) || 1;
                                const width = Math.round((item.count / total) * 100);
                                return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [_jsxs("div", { style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                fontSize: 13,
                                            }, children: [_jsx("span", { children: item.label }), _jsx("span", { children: item.count })] }), _jsx("div", { style: {
                                                height: 8,
                                                borderRadius: 999,
                                                background: "rgba(148, 163, 184, 0.2)",
                                                overflow: "hidden",
                                            }, children: _jsx("div", { style: {
                                                    width: `${width}%`,
                                                    background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                                                    height: "100%",
                                                } }) })] }, item.label));
                            }) }) }), _jsx(GlassCard, { title: "Time Footprint", children: _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: timeMetrics.map((metric) => {
                                const width = Math.max(metric.ratio <= 0 ? 0 : metric.ratio * 100, metric.ratio <= 0 ? 0 : 6);
                                return (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13 }, children: [_jsx("span", { children: metric.label }), _jsx("span", { children: metric.accent })] }), _jsx("div", { style: {
                                                height: 10,
                                                borderRadius: 12,
                                                background: "rgba(148, 163, 184, 0.15)",
                                                overflow: "hidden",
                                            }, children: _jsx("div", { style: {
                                                    width: `${width}%`,
                                                    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
                                                    height: "100%",
                                                } }) })] }, metric.label));
                            }) }) }), _jsx(GlassCard, { title: "Cycle Time Trend", children: cycleChartData && cycleChartOptions ? (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 18 }, children: [_jsx("div", { style: {
                                        position: "relative",
                                        height: 220,
                                        padding: 12,
                                        borderRadius: 18,
                                        background: "rgba(30, 41, 59, 0.65)",
                                        border: "1px solid rgba(148, 163, 184, 0.22)",
                                        boxShadow: "inset 0 0 18px rgba(15, 23, 42, 0.35)",
                                    }, children: _jsx(Line, { data: cycleChartData, options: cycleChartOptions }) }), cycleStats && (_jsxs("div", { style: {
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                                        gap: 12,
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.6,
                                        color: "#94a3b8",
                                    }, children: [_jsxs("div", { children: [_jsx("div", { style: { color: "#cbd5f5", fontSize: 22, fontWeight: 600 }, children: cycleStats.average }), _jsx("div", { children: "Avg Cycle" })] }), _jsxs("div", { children: [_jsx("div", { style: { color: "#f8fafc", fontSize: 14 }, children: cycleStats.min }), _jsx("div", { children: "Fastest" })] }), _jsxs("div", { children: [_jsx("div", { style: { color: "#f8fafc", fontSize: 14 }, children: cycleStats.max }), _jsx("div", { children: "Slowest" })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                                        color: cycleStats.direction === "down"
                                                            ? "#34d399"
                                                            : cycleStats.direction === "up"
                                                                ? "#f59e0b"
                                                                : "#cbd5f5",
                                                        fontSize: 14,
                                                    }, children: cycleStats.direction === "flat" ? "Stable" : cycleStats.deltaLabel }), _jsxs("div", { children: ["Trend ", cycleStats.direction === "down" ? "↓" : cycleStats.direction === "up" ? "↑" : "→"] })] })] }))] })) : (_jsx("div", { style: { fontSize: 13, color: "#cbd5f5" }, children: "Not enough cycle time data yet \u2014 add cycle values to steps to unlock the trend view." })) }), _jsx(GlassCard, { title: "WIP vs Capacity", children: wipChartData && wipChartOptions ? (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 18 }, children: [_jsx("div", { style: {
                                        position: "relative",
                                        height: 220,
                                        padding: 12,
                                        borderRadius: 18,
                                        background: "rgba(30, 41, 59, 0.65)",
                                        border: "1px solid rgba(148, 163, 184, 0.22)",
                                        boxShadow: "inset 0 0 18px rgba(15, 23, 42, 0.35)",
                                    }, children: _jsx(Bar, { data: wipChartData, options: wipChartOptions }) }), wipStats && (_jsxs("div", { style: {
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                                        gap: 14,
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.6,
                                        color: "#94a3b8",
                                    }, children: [_jsxs("div", { children: [_jsx("div", { style: { color: "#f8fafc", fontSize: 20, fontWeight: 600 }, children: wipStats.totalWip }), _jsx("div", { children: "Units In WIP" })] }), _jsxs("div", { children: [_jsx("div", { style: { color: "#f8fafc", fontSize: 20, fontWeight: 600 }, children: wipStats.totalCapacity }), _jsx("div", { children: "Total Capacity" })] }), _jsxs("div", { children: [_jsx("div", { style: { color: "#f8fafc", fontSize: 20, fontWeight: 600 }, children: wipStats.utilizationPercent }), _jsx("div", { children: "Avg Utilisation" })] }), _jsxs("div", { children: [_jsx("div", { style: {
                                                        color: wipStats.spareRaw >= 0 ? "#34d399" : "#f87171",
                                                        fontSize: 16,
                                                        fontWeight: 600,
                                                    }, children: wipStats.spare }), _jsx("div", { children: "Spare Capacity" })] })] })), wipStats && wipStats.hotspots.length > 0 && (_jsxs("div", { style: {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                        fontSize: 12,
                                        color: "#cbd5f5",
                                    }, children: [_jsx("div", { style: { color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }, children: "Over Capacity Hotspots" }), wipStats.hotspots.map((spot) => (_jsxs("div", { style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "8px 10px",
                                                borderRadius: 12,
                                                background: "rgba(148, 163, 184, 0.12)",
                                                border: "1px solid rgba(148, 163, 184, 0.2)",
                                            }, children: [_jsx("span", { children: spot.label }), _jsx("span", { style: { color: "#f59e0b" }, children: spot.utilization })] }, spot.label)))] }))] })) : (_jsx("div", { style: { fontSize: 13, color: "#cbd5f5" }, children: "Add WIP and capacity metadata to your steps to visualise flow load versus available headroom." })) }), _jsx(GlassCard, { title: "Cost Breakdown", children: costChartData && costChartOptions ? (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 18 }, children: [_jsx("div", { style: {
                                        position: "relative",
                                        minHeight: 220,
                                        padding: 12,
                                        borderRadius: 18,
                                        background: "rgba(30, 41, 59, 0.65)",
                                        border: "1px solid rgba(148, 163, 184, 0.22)",
                                        boxShadow: "inset 0 0 18px rgba(15, 23, 42, 0.35)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }, children: _jsxs("div", { style: { position: "relative", width: "100%", maxWidth: 280, height: 200, margin: "0 auto" }, children: [_jsx(Doughnut, { data: costChartData, options: costChartOptions }), costStats && (_jsxs("div", { style: {
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    color: "#f8fafc",
                                                }, children: [_jsx("span", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: "#94a3b8" }, children: "Total Cost" }), _jsx("span", { style: { fontSize: 20, fontWeight: 700 }, children: costStats.total })] }))] }) }), costLegend && costLegend.length > 0 && (_jsx("div", { style: {
                                        display: "flex",
                                        flexWrap: "wrap",
                                        justifyContent: "center",
                                        gap: 10,
                                        padding: "0 8px",
                                        fontSize: 11,
                                        color: "#cbd5f5",
                                    }, children: costLegend.map((item) => (_jsxs("div", { style: {
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "6px 10px",
                                            borderRadius: 999,
                                            background: "rgba(148, 163, 184, 0.12)",
                                            border: "1px solid rgba(148, 163, 184, 0.18)",
                                        }, children: [_jsx("span", { style: {
                                                    display: "inline-flex",
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    background: item.color,
                                                    boxShadow: `0 0 10px ${item.color}55`,
                                                } }), _jsx("span", { children: item.label }), _jsxs("span", { style: { color: "#94a3b8" }, children: [item.percent.toFixed(1), "%"] })] }, item.label))) })), costStats && (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10, fontSize: 12, color: "#cbd5f5" }, children: [_jsx("div", { style: { textTransform: "uppercase", letterSpacing: 0.5, color: "#94a3b8" }, children: "Top Contributors" }), costStats.contributions.map((item) => (_jsxs("div", { style: {
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 4,
                                                padding: "10px 12px",
                                                borderRadius: 14,
                                                background: "rgba(148, 163, 184, 0.12)",
                                                border: "1px solid rgba(148, 163, 184, 0.22)",
                                                boxShadow: "0 10px 20px rgba(15, 23, 42, 0.25)",
                                            }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#f8fafc" }, children: [_jsx("span", { children: item.label }), _jsx("span", { children: item.cost })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }, children: [_jsx("span", { children: item.category }), _jsx("span", { children: item.percent })] })] }, item.label))), costStats.contributions.length === 0 && (_jsx("div", { style: { fontSize: 13, color: "#94a3b8" }, children: "No standout cost centres yet." }))] }))] })) : (_jsx("div", { style: { fontSize: 13, color: "#cbd5f5" }, children: "Add cost metadata to steps to reveal how spend concentrates across your flow." })) })] }), _jsx(AuroraCard, { title: "Sustainability Dashboard", subtitle: "Operational emissions mix & intensity", children: sustainabilityDashboard ? (_jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 26 }, children: [_jsxs("div", { style: {
                                display: "grid",
                                gap: 24,
                                gridTemplateColumns: "minmax(240px, 320px) minmax(220px, 1fr)",
                                alignItems: "stretch",
                            }, children: [_jsx("div", { style: {
                                        position: "relative",
                                        minHeight: 240,
                                        borderRadius: 24,
                                        padding: 18,
                                        background: "rgba(15, 23, 42, 0.55)",
                                        border: "1px solid rgba(56, 189, 248, 0.35)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }, children: sustainabilityScopeData && sustainabilityScopeOptions ? (_jsxs("div", { style: { position: "relative", width: "100%", maxWidth: 280, height: 220 }, children: [_jsx(Doughnut, { data: sustainabilityScopeData, options: sustainabilityScopeOptions }), sustainabilityStats && (_jsxs("div", { style: {
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    color: "#f8fafc",
                                                }, children: [_jsx("span", { style: { fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#bfdbfe" }, children: "Total" }), _jsx("span", { style: { fontSize: 30, fontWeight: 700 }, children: sustainabilityStats.total }), _jsx("span", { style: { fontSize: 12, color: "#bae6fd" }, children: "tCO\u2082e" })] }))] })) : (_jsx("div", { style: { color: "#cbd5f5", fontSize: 13 }, children: "Add scope data to view distribution." })) }), sustainabilityStats && (_jsxs("div", { style: {
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 18,
                                        borderRadius: 24,
                                        padding: 22,
                                        background: "rgba(15, 23, 42, 0.55)",
                                        border: "1px solid rgba(45, 212, 191, 0.35)",
                                        boxShadow: "0 20px 40px rgba(34, 197, 94, 0.25)",
                                    }, children: [_jsx("div", { style: { fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#5eead4" }, children: "CO\u2082 Intensity" }), _jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-end" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 36, fontWeight: 700, color: "#34d399" }, children: sustainabilityStats.average }), _jsx("div", { style: { fontSize: 12, color: "#a7f3d0" }, children: "Average kg / unit" })] }), sustainabilityStats.best && (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 12, color: "#94a3b8" }, children: "Best Performer" }), _jsxs("div", { style: { fontSize: 16, fontWeight: 600, color: "#38bdf8" }, children: [sustainabilityStats.best.value, " kg"] }), _jsx("div", { style: { fontSize: 12, color: "#cbd5f5" }, children: sustainabilityStats.best.label })] })), sustainabilityStats.worst && (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 12, color: "#94a3b8" }, children: "Watch List" }), _jsxs("div", { style: { fontSize: 16, fontWeight: 600, color: "#f97316" }, children: [sustainabilityStats.worst.value, " kg"] }), _jsx("div", { style: { fontSize: 12, color: "#cbd5f5" }, children: sustainabilityStats.worst.label })] }))] })] }))] }), _jsx("div", { style: {
                                position: "relative",
                                height: 260,
                                borderRadius: 24,
                                padding: 18,
                                background: "rgba(15, 23, 42, 0.55)",
                                border: "1px solid rgba(56, 189, 248, 0.35)",
                            }, children: sustainabilityHotspotData && sustainabilityHotspotOptions ? (_jsx(Bar, { data: sustainabilityHotspotData, options: sustainabilityHotspotOptions })) : (_jsx("div", { style: { color: "#cbd5f5", fontSize: 13 }, children: "Populate scope data to highlight emission hotspots by process." })) })] })) : (_jsx("div", { style: { fontSize: 13, color: "#f0f9ff" }, children: "Provide scope emissions on nodes to activate the sustainability dashboard." })) }), _jsx(GlassCard, { title: "Narrative Insights", children: _jsx("ul", { style: {
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        fontSize: 13,
                        color: "#cbd5f5",
                    }, children: summary.map((line, idx) => (_jsxs("li", { style: {
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                        }, children: [_jsx("span", { style: {
                                    display: "inline-flex",
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "rgba(148, 163, 184, 0.6)",
                                    marginTop: 6,
                                } }), _jsx("span", { children: line })] }, idx))) }) }), _jsx(GlassCard, { title: "Category Activity", children: _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: categoryBreakdown.map((item) => (_jsxs("div", { style: {
                            display: "grid",
                            gridTemplateColumns: "auto 1fr auto",
                            alignItems: "center",
                            gap: 12,
                            fontSize: 13,
                        }, children: [_jsx("span", { style: {
                                    display: "inline-flex",
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: item.accent,
                                    boxShadow: `0 0 12px ${item.accent}77`,
                                } }), _jsx("span", { children: item.category }), _jsx("span", { style: { color: "#cbd5f5" }, children: item.count })] }, item.category))) }) })] }));
};
