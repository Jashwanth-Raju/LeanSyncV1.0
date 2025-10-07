import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import ReactFlow, { addEdge, Background, Controls, MiniMap, MarkerType, ConnectionLineType, Handle, Position, applyNodeChanges, applyEdgeChanges, } from "reactflow";
import "reactflow/dist/style.css";
import { FaTruck, FaCogs, FaWarehouse, FaUserTie, FaBoxOpen, FaUndo, FaRedo, FaSave, FaFolderOpen, FaTrash, FaChevronLeft, FaChevronRight, } from "react-icons/fa";
import { auth, loginWithGoogle, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Whiteboard from "./Whiteboard";
/* ------------ Node Library ------------ */
const nodeLibrary = [
    {
        category: "Transport",
        nodes: [
            { type: "truck", label: "Truck", icon: "truck", color: "#FFA500" },
            { type: "van", label: "Van", icon: "truck", color: "#FFB347" },
        ],
    },
    {
        category: "Process",
        nodes: [
            { type: "manufacturing", label: "Manufacturing", icon: "manufacturing", color: "#3498DB" },
            { type: "inspection", label: "Inspection", icon: "inspection", color: "#1ABC9C" },
        ],
    },
    {
        category: "Storage",
        nodes: [
            { type: "warehouse", label: "Warehouse", icon: "warehouse", color: "#2ECC71" },
            { type: "inventory", label: "Inventory", icon: "inventory", color: "#27AE60" },
        ],
    },
];
/* ------------ Icons ------------ */
const iconMap = {
    truck: _jsx(FaTruck, {}),
    manufacturing: _jsx(FaCogs, {}),
    inspection: _jsx(FaUserTie, {}),
    warehouse: _jsx(FaWarehouse, {}),
    inventory: _jsx(FaBoxOpen, {}),
};
/* ------------ Custom Node ------------ */
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
    }, children: [_jsx(Handle, { type: "target", position: Position.Top, style: { background: "#555" } }), _jsx("div", { style: { width: 28, marginRight: 10 }, children: iconMap[data.icon] }), _jsx("div", { children: data.label }), _jsx(Handle, { type: "source", position: Position.Bottom, style: { background: "#555" } })] }));
const nodeTypes = { custom: CustomNode };
/* ------------ Header ------------ */
const Header = ({ user }) => {
    const userInitial = user?.displayName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase();
    return (_jsxs("header", { style: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            background: "linear-gradient(115deg, rgba(15, 23, 42, 0.92), rgba(59, 130, 246, 0.35))",
            borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.35)",
            backdropFilter: "blur(18px)",
            color: "#e2e8f0",
            zIndex: 10,
        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 14 }, children: [_jsx("div", { style: {
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(14, 165, 233, 0.9))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 14px 30px rgba(37, 99, 235, 0.35)",
                        }, children: _jsx("img", { src: "/mylogo.png", alt: "Company logo", style: { width: 26, height: 26, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(15, 23, 42, 0.35))" } }) }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 2 }, children: [_jsx("span", { style: { fontSize: 18, fontWeight: 600, letterSpacing: 0.4 }, children: "LeanSync Value Stream" }), _jsx("span", { style: { fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: "#94a3b8" }, children: "Operational Intelligence Suite" })] })] }), _jsx("div", { style: { display: "flex", alignItems: "center", gap: 14 }, children: user && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }, children: [_jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: user.displayName ?? user.email ?? "Signed in" }), _jsx("span", { style: { fontSize: 11, color: "#94a3b8" }, children: "Connected" })] }), _jsx("div", { style: {
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: "rgba(15, 23, 42, 0.8)",
                                color: "#cbd5f5",
                                border: "1px solid rgba(148, 163, 184, 0.35)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                                fontWeight: 600,
                                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.35)",
                            }, children: user.photoURL ? (_jsx("img", { src: user.photoURL, alt: user.displayName ?? user.email ?? "User avatar", style: { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" } })) : (userInitial ?? "?") }), _jsx("button", { onClick: logout, style: {
                                padding: "10px 16px",
                                borderRadius: 14,
                                border: "1px solid rgba(248, 113, 113, 0.5)",
                                background: "linear-gradient(135deg, rgba(248, 113, 113, 0.9), rgba(239, 68, 68, 0.85))",
                                color: "#fff5f5",
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: 0.3,
                                cursor: "pointer",
                                boxShadow: "0 12px 28px rgba(239, 68, 68, 0.3)",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                            }, children: "Logout" })] })) })] }));
};
/* ------------ Icon Button ------------ */
const iconBtnStyle = (bg) => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: bg,
    color: "#fff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 14,
});
/* ------------ Main App ------------ */
const App = () => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => setUser(firebaseUser));
        return () => unsub();
    }, []);
    return (_jsxs("div", { style: { height: "100vh", display: "flex", flexDirection: "column" }, children: [_jsx(Header, { user: user }), !user ? (_jsx("div", { style: { flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }, children: _jsx("button", { onClick: loginWithGoogle, style: {
                        padding: 12,
                        fontSize: 16,
                        background: "#4285F4",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                    }, children: "Sign in with Google" }) })) : (_jsx("div", { style: { flexGrow: 1, background: "#fafafa", display: "flex" }, children: _jsx(Whiteboard, {}) }))] }));
};
export default App;
