import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** @jsxImportSource react */
import * as React from "react";
const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
};
const cardStyle = {
    width: "min(520px, 92vw)",
    borderRadius: 28,
    padding: "28px 32px",
    background: "linear-gradient(165deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92))",
    border: "1px solid rgba(148, 163, 184, 0.32)",
    boxShadow: "0 34px 68px rgba(15, 23, 42, 0.45)",
    color: "#e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: 26,
};
const buttonBase = {
    padding: "10px 18px",
    borderRadius: 999,
    border: "1px solid rgba(148, 163, 184, 0.3)",
    background: "rgba(15, 23, 42, 0.5)",
    color: "#e2e8f0",
    cursor: "pointer",
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    transition: "all 0.2s ease",
};
export const EmissionWizard = ({ open, stage, defaults, onAcceptTracking, onSkip, onSubmit, onClose, }) => {
    const [formValues, setFormValues] = React.useState(defaults);
    React.useEffect(() => {
        if (open && stage === "form") {
            setFormValues(defaults);
        }
    }, [open, stage, defaults]);
    if (!open)
        return null;
    if (stage === "prompt") {
        return (_jsx("div", { style: overlayStyle, children: _jsxs("div", { style: cardStyle, children: [_jsxs("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#94a3b8" }, children: "Sustainability Setup" }), _jsx("h2", { style: { margin: "8px 0 0", fontSize: 24 }, children: "Track CO\u2082 emissions for this canvas?" })] }), _jsx("button", { type: "button", onClick: onClose, style: { ...buttonBase, width: 38, height: 38, borderRadius: "50%" }, children: "\u00D7" })] }), _jsx("p", { style: { margin: 0, fontSize: 14, color: "#cbd5f5" }, children: "We can auto-populate electricity, material, and transport emission factors for every node. You can fine-tune them later in the inspector." }), _jsxs("div", { style: { display: "flex", gap: 12, justifyContent: "flex-end" }, children: [_jsx("button", { type: "button", onClick: onSkip, style: { ...buttonBase, background: "rgba(148, 163, 184, 0.12)" }, children: "No thanks" }), _jsx("button", { type: "button", onClick: onAcceptTracking, style: {
                                    ...buttonBase,
                                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4))",
                                    border: "1px solid rgba(59, 130, 246, 0.55)",
                                    boxShadow: "0 14px 28px rgba(34, 197, 94, 0.25)",
                                }, children: "Yes, configure defaults" })] })] }) }));
    }
    return (_jsx("div", { style: overlayStyle, children: _jsxs("div", { style: cardStyle, children: [_jsxs("header", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#94a3b8" }, children: "Emission Factors" }), _jsx("h2", { style: { margin: "8px 0 0", fontSize: 24 }, children: "Set your baseline factors" })] }), _jsx("button", { type: "button", onClick: onClose, style: { ...buttonBase, width: 38, height: 38, borderRadius: "50%" }, children: "\u00D7" })] }), _jsx("p", { style: { margin: 0, fontSize: 14, color: "#cbd5f5" }, children: "These values will pre-fill emission fields on every step. Adjust units or numbers as needed once the map is populated." }), _jsxs("form", { onSubmit: (event) => {
                        event.preventDefault();
                        onSubmit(formValues);
                    }, style: { display: "flex", flexDirection: "column", gap: 18 }, children: [_jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [_jsx("span", { style: { fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#bfdbfe" }, children: "Electricity factor (kg CO\u2082e / kWh)" }), _jsx("input", { type: "text", value: formValues.electricity, onChange: (event) => setFormValues((prev) => ({ ...prev, electricity: event.target.value })), placeholder: "e.g. 0.4", style: {
                                        borderRadius: 12,
                                        border: "1px solid rgba(96, 165, 250, 0.45)",
                                        background: "rgba(15, 23, 42, 0.55)",
                                        color: "#e2e8f0",
                                        padding: "10px 12px",
                                    }, required: true })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [_jsx("span", { style: { fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#fbcfe8" }, children: "Material factor (kg CO\u2082e / kg)" }), _jsx("input", { type: "text", value: formValues.materials, onChange: (event) => setFormValues((prev) => ({ ...prev, materials: event.target.value })), placeholder: "e.g. 1.8", style: {
                                        borderRadius: 12,
                                        border: "1px solid rgba(244, 114, 182, 0.4)",
                                        background: "rgba(15, 23, 42, 0.55)",
                                        color: "#e2e8f0",
                                        padding: "10px 12px",
                                    }, required: true })] }), _jsxs("label", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [_jsx("span", { style: { fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#fde68a" }, children: "Transport factor (kg CO\u2082e / tonne-km)" }), _jsx("input", { type: "text", value: formValues.transport, onChange: (event) => setFormValues((prev) => ({ ...prev, transport: event.target.value })), placeholder: "e.g. 0.09", style: {
                                        borderRadius: 12,
                                        border: "1px solid rgba(250, 204, 21, 0.4)",
                                        background: "rgba(15, 23, 42, 0.55)",
                                        color: "#e2e8f0",
                                        padding: "10px 12px",
                                    }, required: true })] }), _jsxs("div", { style: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }, children: [_jsx("button", { type: "button", onClick: onClose, style: { ...buttonBase, background: "rgba(148, 163, 184, 0.12)" }, children: "Cancel" }), _jsx("button", { type: "submit", style: {
                                        ...buttonBase,
                                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4))",
                                        border: "1px solid rgba(59, 130, 246, 0.55)",
                                        boxShadow: "0 14px 28px rgba(34, 197, 94, 0.25)",
                                    }, children: "Save & Apply" })] })] })] }) }));
};
