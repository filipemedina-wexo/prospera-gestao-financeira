
import type React from "react";

export type DashboardBlockType =
  | "receber"
  | "pagar"
  | "saldo"
  | "alertas"
  | "quick-charts"
  | "acoes"
  | "vencimentos"
  | "faturamento"
  | "despesas"
  | "vencendohoje"
  | "atrasadas";

export interface DashboardBlock {
  id: string;
  type: DashboardBlockType;
  title: string;
  cols: number; // 1-4 (number of columns)
  component: React.ComponentType<any>;
  props?: any;
}

