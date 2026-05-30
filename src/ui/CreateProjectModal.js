import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { PROFILE_OPTIONS, getProfileMeta } from "../profiles/meta";
export const CreateProjectModal = ({ isSubmitting, onCreate, onClose }) => {
    const [projectName, setProjectName] = useState("");
    const [profile, setProfile] = useState("manufacturing");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!projectName.trim())
            return;
        await onCreate(projectName.trim(), profile);
        setProjectName("");
    };
    const meta = getProfileMeta(profile);
    return (_jsx("div", { style: {
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(15,23,42,0.75)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
        }, children: _jsxs("form", { onSubmit: handleSubmit, style: {
                width: "100%",
                maxWidth: 420,
                borderRadius: 24,
                padding: "30px 32px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 24px 80px rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(30px)",
                color: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: 18,
            }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 24, fontWeight: 700 }, children: "New Project" }), _jsx("p", { style: { color: "#cbd5f5", marginTop: 4 }, children: "Name your workspace and choose an industry profile." })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [_jsx("span", { style: { fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8" }, children: "Project name" }), _jsx("input", { value: projectName, onChange: (event) => setProjectName(event.target.value), placeholder: "e.g. Future State VSM", style: {
                                borderRadius: 14,
                                border: "1px solid rgba(148,163,184,0.35)",
                                background: "rgba(15,23,42,0.6)",
                                color: "#f8fafc",
                                padding: "12px 14px",
                                fontSize: 15,
                            } })] }), _jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8, position: "relative" }, children: [_jsx("span", { style: { fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", color: "#94a3b8" }, children: "Industry profile" }), _jsxs("button", { type: "button", onClick: () => setDropdownOpen((open) => !open), style: {
                                borderRadius: 14,
                                border: "1px solid rgba(148,163,184,0.35)",
                                background: "rgba(15,23,42,0.6)",
                                color: "#f8fafc",
                                padding: "12px 14px",
                                fontSize: 15,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }, children: [_jsx("span", { children: _jsxs("span", { style: {
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }, children: [_jsx("span", { style: {
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: "50%",
                                                    background: meta.accent,
                                                    display: "inline-block",
                                                } }), meta.label] }) }), _jsx("span", { style: { opacity: 0.7 }, children: dropdownOpen ? "▲" : "▼" })] }), dropdownOpen && (_jsx("div", { style: {
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                marginTop: 8,
                                borderRadius: 18,
                                border: "1px solid rgba(148,163,184,0.35)",
                                background: "rgba(2, 6, 23, 0.95)",
                                boxShadow: "0 24px 60px rgba(2,6,23,0.7)",
                                maxHeight: 260,
                                overflow: "auto",
                                zIndex: 5,
                            }, children: PROFILE_OPTIONS.map((option) => (_jsxs("button", { type: "button", onClick: () => {
                                    setProfile(option.id);
                                    setDropdownOpen(false);
                                }, style: {
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "12px 18px",
                                    border: "none",
                                    background: option.id === profile ? "rgba(255,255,255,0.08)" : "transparent",
                                    color: "#f8fafc",
                                    cursor: "pointer",
                                }, children: [_jsx("div", { style: { fontWeight: 600 }, children: option.label }), _jsx("div", { style: { fontSize: 12, color: "#cbd5f5" }, children: option.description })] }, option.id))) }))] }), _jsxs("div", { style: { display: "flex", gap: 12, marginTop: 10 }, children: [_jsx("button", { type: "button", onClick: onClose, style: {
                                flex: 1,
                                borderRadius: 14,
                                border: "1px solid rgba(148,163,184,0.35)",
                                background: "transparent",
                                color: "#cbd5f5",
                                padding: "12px 0",
                                fontWeight: 600,
                                cursor: "pointer",
                            }, children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSubmitting, style: {
                                flex: 1,
                                borderRadius: 14,
                                border: "none",
                                background: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(14,165,233,0.95))",
                                color: "white",
                                padding: "12px 0",
                                fontWeight: 700,
                                letterSpacing: 0.3,
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                opacity: isSubmitting ? 0.6 : 1,
                            }, children: isSubmitting ? "Creating…" : "Create" })] })] }) }));
};
