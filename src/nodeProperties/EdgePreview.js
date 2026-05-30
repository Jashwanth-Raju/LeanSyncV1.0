import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { edgeThemeMap } from "../nodes/edgeThemes";
export const EdgePreview = ({ variant }) => {
    const theme = edgeThemeMap[variant];
    if (!theme)
        return null;
    const strokeWidth = theme.width ?? 2;
    const headSize = Math.max(6, strokeWidth * 4);
    const markerNode = (() => {
        if (theme.marker === "arrowClosed") {
            return (_jsx("span", { style: {
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translate(50%, -50%)",
                    width: 0,
                    height: 0,
                    borderTop: `${headSize / 2}px solid transparent`,
                    borderBottom: `${headSize / 2}px solid transparent`,
                    borderLeft: `${headSize * 0.75}px solid ${theme.markerColor ?? theme.color}`,
                } }));
        }
        if (theme.marker === "arrow") {
            return (_jsx("span", { style: {
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translate(50%, -50%) rotate(45deg)",
                    width: headSize,
                    height: headSize,
                    borderTop: `${strokeWidth}px solid ${theme.markerColor ?? theme.color}`,
                    borderRight: `${strokeWidth}px solid ${theme.markerColor ?? theme.color}`,
                    borderRadius: 2,
                } }));
        }
        if (theme.marker === "circle") {
            return (_jsx("span", { style: {
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translate(50%, -50%)",
                    width: headSize * 0.6,
                    height: headSize * 0.6,
                    borderRadius: "50%",
                    border: `${strokeWidth}px solid ${theme.markerColor ?? theme.color}`,
                    background: "rgba(255,255,255,0.04)",
                } }));
        }
        if (theme.marker === "square") {
            return (_jsx("span", { style: {
                    position: "absolute",
                    top: "50%",
                    right: 0,
                    transform: "translate(50%, -50%)",
                    width: headSize * 0.6,
                    height: headSize * 0.6,
                    borderRadius: 4,
                    border: `${strokeWidth}px solid ${theme.markerColor ?? theme.color}`,
                    background: "rgba(255,255,255,0.06)",
                } }));
        }
        return null;
    })();
    return (_jsxs("div", { style: {
            position: "relative",
            width: "100%",
            height: 18,
            marginTop: 2,
        }, children: [_jsx("span", { style: {
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    borderTop: `${strokeWidth}px ${theme.dash ? "dashed" : "solid"} ${theme.color}`,
                    transform: "translateY(-50%)",
                    opacity: 0.9,
                } }), markerNode] }));
};
