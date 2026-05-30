import { jsx as _jsx } from "react/jsx-runtime";
/// <reference types="vite/client" />
import { createContext, useContext, useMemo } from "react";
import { PROFILE_OPTIONS, getProfileMeta } from "../profiles/meta";
const defaultTheme = {
    name: "Generic",
    primary: "#6366F1",
    secondary: "#14B8A6",
    background: "#0f172a",
    nodeDefaultColor: "#6366F1",
};
const defaultValue = {
    profileName: "manufacturing",
    profileMetaLabel: "Manufacturing",
    nodes: [],
    kpi: { cards: [] },
    theme: defaultTheme,
    layers: [],
    availableProfiles: PROFILE_OPTIONS,
};
const NodeLibraryContext = createContext(defaultValue);
const nodeModules = import.meta.glob("../profiles/*/nodes.json", { eager: true });
const kpiModules = import.meta.glob("../profiles/*/kpi.json", { eager: true });
const themeModules = import.meta.glob("../profiles/*/theme.json", { eager: true });
const normalizeProfileName = (path) => {
    const parts = path.split("/profiles/")[1]?.split("/") ?? [];
    return parts[0] ?? "generic";
};
const profileCache = new Map();
const buildAssets = (profileName) => {
    if (profileCache.has(profileName)) {
        return profileCache.get(profileName);
    }
    const nodesEntry = Object.entries(nodeModules).find(([key]) => normalizeProfileName(key) === profileName) ??
        Object.entries(nodeModules).find(([key]) => normalizeProfileName(key) === "generic");
    const kpiEntry = Object.entries(kpiModules).find(([key]) => normalizeProfileName(key) === profileName) ??
        Object.entries(kpiModules).find(([key]) => normalizeProfileName(key) === "generic");
    const themeEntry = Object.entries(themeModules).find(([key]) => normalizeProfileName(key) === profileName) ??
        Object.entries(themeModules).find(([key]) => normalizeProfileName(key) === "generic");
    const nodes = nodesEntry?.[1]?.default.categories ?? [];
    const kpi = kpiEntry?.[1]?.default ?? { cards: [], layers: [] };
    const theme = themeEntry?.[1]?.default ?? defaultTheme;
    const layers = kpi.layers ?? [];
    const assets = { nodes, kpi, theme, layers };
    profileCache.set(profileName, assets);
    return assets;
};
export const NodeLibraryProvider = ({ profileName, children }) => {
    const assets = useMemo(() => buildAssets(profileName), [profileName]);
    const meta = getProfileMeta(profileName);
    return (_jsx(NodeLibraryContext.Provider, { value: {
            ...assets,
            profileName,
            profileMetaLabel: meta.label,
            availableProfiles: PROFILE_OPTIONS,
            layers: assets.layers,
        }, children: children }));
};
export const useNodeLibrary = () => useContext(NodeLibraryContext);
