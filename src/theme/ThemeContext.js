import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from "react";
import { useNodeLibrary } from "../lib/NodeLibraryContext";
const defaultTheme = {
    name: "Generic",
    primary: "#6366F1",
    secondary: "#14B8A6",
    background: "#0f172a",
    nodeDefaultColor: "#6366F1",
};
const ThemeContext = createContext(defaultTheme);
export const ThemeProvider = ({ children }) => {
    const { theme } = useNodeLibrary();
    return _jsx(ThemeContext.Provider, { value: theme ?? defaultTheme, children: children });
};
export const useTheme = () => useContext(ThemeContext);
