export interface KpiValueConfig {
  path: string;
  format?: "number" | "duration" | "percent" | "raw";
  suffix?: string;
}

export interface KpiCardConfig {
  title: string;
  primary: KpiValueConfig;
  accentTemplate?: string;
  footerTemplate?: string;
}

import type { LayerConfig } from "./layers";

export interface KpiConfig {
  cards: KpiCardConfig[];
  layers?: LayerConfig[];
}
