/// <reference types="vite/client" />
import { createContext, useContext, useMemo } from "react";
import type { PropsWithChildren } from "react";
import type { NodeLibraryCategory } from "../nodes/NodeTypes";
import { PROFILE_OPTIONS, getProfileMeta } from "../profiles/meta";
import type { KpiConfig } from "../insights/kpiTypes";
import type { LayerConfig } from "../insights/layers";

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  nodeDefaultColor: string;
  toolbarGradient?: string[];
  cardGradient?: string[];
  sidebarGlass?: string;
  pill?: {
    saving: string;
    saved: string;
  };
}

interface ProfileAssets {
  nodes: NodeLibraryCategory[];
  theme: ThemeConfig;
  kpi: KpiConfig;
  layers: LayerConfig[];
}

interface NodeLibraryContextValue extends ProfileAssets {
  profileName: string;
  profileMetaLabel: string;
  availableProfiles: typeof PROFILE_OPTIONS;
}

const defaultTheme: ThemeConfig = {
  name: "Generic",
  primary: "#6366F1",
  secondary: "#14B8A6",
  background: "#0f172a",
  nodeDefaultColor: "#6366F1",
};

const defaultValue: NodeLibraryContextValue = {
  profileName: "manufacturing",
  profileMetaLabel: "Manufacturing",
  nodes: [],
  kpi: { cards: [] },
  theme: defaultTheme,
  layers: [],
  availableProfiles: PROFILE_OPTIONS,
};

const NodeLibraryContext = createContext<NodeLibraryContextValue>(defaultValue);

const nodeModules = import.meta.glob("../profiles/*/nodes.json", { eager: true }) as Record<string, { default: { categories: NodeLibraryCategory[] } }>;
const kpiModules = import.meta.glob("../profiles/*/kpi.json", { eager: true }) as Record<string, { default: KpiConfig }>;
const themeModules = import.meta.glob("../profiles/*/theme.json", { eager: true }) as Record<string, { default: ThemeConfig }>;

const normalizeProfileName = (path: string) => {
  const parts = path.split("/profiles/")[1]?.split("/") ?? [];
  return parts[0] ?? "generic";
};

const profileCache = new Map<string, ProfileAssets>();

const buildAssets = (profileName: string): ProfileAssets => {
  if (profileCache.has(profileName)) {
    return profileCache.get(profileName)!;
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

interface ProviderProps extends PropsWithChildren {
  profileName: string;
}

export const NodeLibraryProvider = ({ profileName, children }: ProviderProps) => {
  const assets = useMemo(() => buildAssets(profileName), [profileName]);
  const meta = getProfileMeta(profileName);

  return (
    <NodeLibraryContext.Provider
      value={{
        ...assets,
        profileName,
        profileMetaLabel: meta.label,
        availableProfiles: PROFILE_OPTIONS,
        layers: assets.layers,
      }}
    >
      {children}
    </NodeLibraryContext.Provider>
  );
};

export const useNodeLibrary = () => useContext(NodeLibraryContext);
