
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Wallet,
} from "lucide-react";
import { ContasPagar } from "./modules/ContasPagar";
import { ContasReceber } from "./modules/ContasReceber";
import { Comercial } from "./modules/Comercial";
import { Relatorios } from "./modules/Relatorios";
import { DRE } from "./modules/DRE";
import { Caixa } from "./modules/Caixa";
import { QuickChartsSection } from "./QuickChartsSection";

// ---- Mocked alert data (not shown for brevity, but kept for future use)

const initialAlerts = [
  {
    id: "at01",
    title: "Aluguel do Escritório",
    description: "Vencido há 2 dias",
    type: "Atrasado",
    amount: 2500,
    category: "contas-pagar",
    resolved: false,
  },
  {
    id: "at02",
    title: "Internet/Telefonia",
    description: "Vencido ontem",
    type: "Atrasado",
    amount: 390.75,
    category: "contas-pagar",
    resolved: false,
  },
  {
    id: "vh01",
    title: "Fornecedor ABC",
    description: "Vence hoje",
    type: "Vencendo hoje",
    amount: 1200.0,
    category: "contas-pagar",
    resolved: false,
  },
  {
    id: "vh02",
    title: "Contador",
    description: "Vence hoje",
    type: "Vencendo hoje",
    amount: 800.0,
    category: "contas-pagar",
    resolved: false,
  },
  {
    id: "rec01",
    title: "Cliente XYZ - Projeto",
    description: "Pagamento esperado em 3 dias",
    type: "A Receber",
    amount: 5800,
    category: "contas-receber",
    resolved: false,
  },
];

// --- Dashboard Data (mock)
const dashboardData = {
  totalReceber: 45680.5,
  totalPagar: 23450.75,
  saldoLiquido: 22229.75,
  contasVencendoHoje: 3,
  contasAtrasadas: 2,
  faturamentoMes: 89340.25,
  despesasMes: 34567.8,
};

export function Dashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");
  // Previously, alert logic here

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

  // --- The restored original dashboard ---
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão geral das suas finanças - {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        {/* A Receber */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <PiggyBank className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {dashboardData.totalReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+5.2% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        {/* A Pagar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {dashboardData.totalPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">-2.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        {/* Saldo Líquido */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {dashboardData.saldoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Saldo real disponível</p>
          </CardContent>
        </Card>
        {/* Faturamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              R$ {dashboardData.faturamentoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+8.4% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        {/* Despesas do mês */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">
              R$ {dashboardData.despesasMes.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">+1.8% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        {/* Contas Vencendo hoje */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas vencendo hoje</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {dashboardData.contasVencendoHoje}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Entre pagar e receber</p>
          </CardContent>
        </Card>
        {/* Contas Atrasadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas atrasadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {dashboardData.contasAtrasadas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Necessário atenção</p>
          </CardContent>
        </Card>
      </section>

      {/* Charts and advanced blocks */}
      <QuickChartsSection />
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
          { id: "dre", label: "DRE", icon: AlertCircle },
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
