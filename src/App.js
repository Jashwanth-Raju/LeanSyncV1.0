import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** @jsxImportSource react */
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, loginWithGoogle, logout } from "./firebase";
import { ProjectProvider, useProject } from "./lib/ProjectContext";
import { CollaborationProvider } from "./lib/CollaborationContext";
import { ProjectList } from "./ui/ProjectList";
import Whiteboard from "./Whiteboard";
const Header = ({ user }) => {
    const { selectedProjectId, selectedProfile, clearProject } = useProject();
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
                        }, children: _jsx("img", { src: "/mylogo.png", alt: "LeanSync", style: { width: 26, height: 26, objectFit: "contain" } }) }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 2 }, children: [_jsx("span", { style: { fontSize: 18, fontWeight: 600, letterSpacing: 0.4 }, children: "LeanSync Value Stream" }), _jsx("span", { style: { fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: "#94a3b8" }, children: "Operational Intelligence Suite" })] })] }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [selectedProjectId && (_jsx("button", { type: "button", onClick: clearProject, style: {
                            borderRadius: 999,
                            padding: "8px 14px",
                            border: "1px solid rgba(255,255,255,0.3)",
                            background: "rgba(255,255,255,0.08)",
                            color: "#f8fafc",
                            fontSize: 12,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            cursor: "pointer",
                        }, children: "Switch Project" })), selectedProjectId && (_jsxs("span", { style: { fontSize: 12, color: "#cbd5f5" }, children: ["Profile \u00B7 ", selectedProfile] })), user ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }, children: [_jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: user.displayName ?? user.email ?? "Signed in" }), _jsx("span", { style: { fontSize: 11, color: "#94a3b8" }, children: "Connected" })] }), _jsx("div", { style: {
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
                                }, children: user.photoURL ? (_jsx("img", { src: user.photoURL, alt: "Avatar", style: { width: "100%", height: "100%", borderRadius: "50%" } })) : (userInitial ?? "?") }), _jsx("button", { onClick: logout, style: {
                                    padding: "10px 16px",
                                    borderRadius: 14,
                                    border: "1px solid rgba(248, 113, 113, 0.5)",
                                    background: "linear-gradient(135deg, rgba(248, 113, 113, 0.9), rgba(239, 68, 68, 0.85))",
                                    color: "#fff5f5",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    letterSpacing: 0.3,
                                    cursor: "pointer",
                                }, children: "Logout" })] })) : (_jsx("button", { onClick: loginWithGoogle, style: {
                            padding: "10px 16px",
                            borderRadius: 14,
                            border: "none",
                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(14, 165, 233, 0.9))",
                            color: "#fff",
                            fontWeight: 600,
                            letterSpacing: 0.3,
                            cursor: "pointer",
                        }, children: "Sign in with Google" }))] })] }));
};
const AppShell = ({ user }) => {
    const { selectedProjectId } = useProject();
    return (_jsxs("div", { style: { height: "100vh", display: "flex", flexDirection: "column" }, children: [_jsx(Header, { user: user }), _jsx("div", { style: { flexGrow: 1, background: "#0f172a", color: "#f8fafc", display: "flex" }, children: !user ? (_jsxs("div", { style: { margin: "auto", textAlign: "center" }, children: [_jsx("p", { style: { marginBottom: 16 }, children: "Sign in to access your LeanSync workspaces." }), _jsx("button", { onClick: loginWithGoogle, style: {
                                padding: "10px 20px",
                                borderRadius: 999,
                                border: "none",
                                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(14, 165, 233, 0.95))",
                                color: "#fff",
                                fontWeight: 600,
                                cursor: "pointer",
                            }, children: "Sign in with Google" })] })) : selectedProjectId ? (_jsx(CollaborationProvider, { children: _jsx(Whiteboard, {}) })) : (_jsx(ProjectList, {})) })] }));
};
const App = () => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => setUser(firebaseUser));
        return () => unsub();
    }, []);
    return (_jsx(ProjectProvider, { userId: user?.uid ?? null, children: _jsx(AppShell, { user: user }) }));
};
export default App;
