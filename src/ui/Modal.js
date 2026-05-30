import { jsx as _jsx } from "react/jsx-runtime";
const baseStyle = {
    padding: "20px 22px",
    borderRadius: 20,
    border: "1px solid rgba(148, 163, 184, 0.3)",
    background: "linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(30, 41, 59, 0.94))",
    color: "#e2e8f0",
    backdropFilter: "blur(18px)",
    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    overflowY: "auto",
};
export const Modal = ({ width = 320, maxHeight, styleOverrides, children }) => {
    return (_jsx("aside", { style: {
            width,
            maxHeight,
            ...baseStyle,
            ...styleOverrides,
        }, children: children }));
};
