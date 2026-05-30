import { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";
import type { ThemeConfig } from "../lib/NodeLibraryContext";
import { useNodeLibrary } from "../lib/NodeLibraryContext";

const defaultTheme: ThemeConfig = {
  name: "Generic",
  primary: "#6366F1",
  secondary: "#14B8A6",
  background: "#0f172a",
  nodeDefaultColor: "#6366F1",
};

const ThemeContext = createContext<ThemeConfig>(defaultTheme);

export const ThemeProvider = ({ children }: PropsWithChildren<{}>) => {
  const { theme } = useNodeLibrary();
  return <ThemeContext.Provider value={theme ?? defaultTheme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
