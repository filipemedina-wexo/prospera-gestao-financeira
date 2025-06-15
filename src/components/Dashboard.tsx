import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Calendar,
  DollarSign,
  CreditCard,
  PiggyBank,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { ContasPagar } from "./modules/ContasPagar";
import { ContasReceber } from "./modules/ContasReceber";
import { Comercial } from "./modules/Comercial";
import { Relatorios } from "./modules/Relatorios";
import { DRE } from "./modules/DRE";
import { Caixa } from "./modules/Caixa";
import { AlertsPopup } from "./AlertsPopup";
import { QuickChartsSection } from "./QuickChartsSection";
import ReceberBlock from "./dashboard-blocks/ReceberBlock";
import PagarBlock from "./dashboard-blocks/PagarBlock";
import { DashboardBlocks } from "./DashboardBlocks";
import type { DashboardBlock } from "@/types/dashboardBlock";

// Mocked alert data
const initialAlerts: Alert[] = [
  {
    id: "at01",
    title: "Aluguel do Escritório",
    description: "Vencido há 2 dias",
    type: "Atrasado",
    amount: 2500,
    category: "contas-pagar",
    resolved: false
  },
  {
    id: "at02",
    title: "Internet/Telefonia",
    description: "Vencido ontem",
    type: "Atrasado",
    amount: 390.75,
    category: "contas-pagar",
    resolved: false
  },
  {
    id: "vh01",
    title: "Fornecedor ABC",
    description: "Vence hoje",
    type: "Vencendo hoje",
    amount: 1200.00,
    category: "contas-pagar",
    resolved: false
  },
  {
    id: "vh02",
    title: "Contador",
    description: "Vence hoje",
    type: "Vencendo hoje",
    amount: 800.00,
    category: "contas-pagar",
    resolved: false
  },
  {
    id: "rec01",
    title: "Cliente XYZ - Projeto",
    description: "Pagamento esperado em 3 dias",
    type: "A Receber",
    amount: 5800,
    category: "contas-receber",
    resolved: false
  }
];

export function Dashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // dados mockados aqui, continuam
  const dashboardData = {
    totalReceber: 45680.50,
    totalPagar: 23450.75,
    saldoLiquido: 22229.75,
    contasVencendoHoje: 3,
    contasAtrasadas: 2,
    faturamentoMes: 89340.25,
    despesasMes: 34567.80
  };

  // New: Manage blocks order and sizes
  const initialBlocks: DashboardBlock[] = [
    {
      id: "receber",
      type: "receber",
      title: "A Receber",
      cols: 1,
      component: ReceberBlock,
      props: { value: dashboardData.totalReceber }
    },
    {
      id: "pagar",
      type: "pagar",
      title: "A Pagar",
      cols: 1,
      component: PagarBlock,
      props: { value: dashboardData.totalPagar }
    },
    // Add other blocks after initial testing!
  ];
  const [blocks, setBlocks] = useState<DashboardBlock[]>(initialBlocks);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const handleViewDetails = (alert: Alert) => {
    if (alert.category === "contas-pagar") setActiveModule("contas-pagar");
    else if (alert.category === "contas-receber") setActiveModule("contas-receber");
    setAlertsOpen(false);
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case "caixa":
        return <Caixa />;
      case "contas-pagar":
        return <ContasPagar />;
      case "contas-receber":
        return <ContasReceber />;
      case "comercial":
        return <Comercial />;
      case "relatorios":
        return <Relatorios />;
      case "dre":
        return <DRE />;
      default:
        return renderDashboard();
    }
  };

  // Updated renderDashboard: just render DashboardBlocks for now (we'll add save/cancel/edit later)
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão geral das suas finanças - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <button
          className="border px-3 py-1 rounded text-sm hover:bg-accent transition"
          onClick={() => setIsEditMode(e => !e)}
        >
          {isEditMode ? "Concluir edição" : "Editar layout"}
        </button>
      </div>
      <DashboardBlocks blocks={blocks} setBlocks={setBlocks} isEditMode={isEditMode} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm border">
        {[
          { id: "dashboard", label: "Dashboard", icon: DollarSign },
          { id: "caixa", label: "Caixa", icon: Wallet },
          { id: "contas-pagar", label: "Contas a Pagar", icon: CreditCard },
          { id: "contas-receber", label: "Contas a Receber", icon: PiggyBank },
          { id: "comercial", label: "Comercial", icon: TrendingUp },
          { id: "relatorios", label: "Relatórios", icon: Calendar },
          { id: "dre", label: "DRE", icon: AlertCircle }
        ].map((item) => (
          <Button
            key={item.id}
            variant={activeModule === item.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveModule(item.id)}
            className="flex items-center gap-2"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>

      {/* Active Module Content */}
      {renderActiveModule()}
    </div>
  );
}
