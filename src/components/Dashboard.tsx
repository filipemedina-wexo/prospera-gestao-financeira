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

// Mocked alert data
const initialAlerts = [
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
  const [alerts, setAlerts] = useState(initialAlerts);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Dados mockados para demonstração
  const dashboardData = {
    totalReceber: 45680.50,
    totalPagar: 23450.75,
    saldoLiquido: 22229.75,
    contasVencendoHoje: 3,
    contasAtrasadas: 2,
    faturamentoMes: 89340.25,
    despesasMes: 34567.80
  };

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const handleViewDetails = (alert: (typeof initialAlerts)[0]) => {
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
        <Badge variant="outline" className="text-green-600 border-green-200">
          <TrendingUp className="h-4 w-4 mr-1" />
          Crescimento +12%
        </Badge>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <PiggyBank className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {dashboardData.totalReceber.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +5.2% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {dashboardData.totalPagar.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              -2.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {dashboardData.saldoLiquido.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Posição atual
            </p>
          </CardContent>
        </Card>

        {/* Alertas Card - Clickable to open popup */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200"
          onClick={() => setAlertsOpen(true)}
          tabIndex={0}
          role="button"
          aria-label="Ver alertas"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                alerts.filter(a => !a.resolved && (a.type === "Atrasado" || a.type === "Vencendo hoje")).length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {
                // Detailed text
                (() => {
                  const vencendoHoje = alerts.filter(a => !a.resolved && a.type === "Vencendo hoje").length;
                  const atrasadas = alerts.filter(a => !a.resolved && a.type === "Atrasado").length;
                  return `${vencendoHoje} vencendo hoje, ${atrasadas} atrasadas`;
                })()
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso direto às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setActiveModule("caixa")}
              >
                <Wallet className="h-6 w-6" />
                <span className="text-sm">Controle de Caixa</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setActiveModule("contas-pagar")}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Nova Conta a Pagar</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setActiveModule("contas-receber")}
              >
                <PiggyBank className="h-6 w-6" />
                <span className="text-sm">Nova Conta a Receber</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setActiveModule("dre")}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Ver DRE</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
            <CardDescription>Contas que vencem nos próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Aluguel do Escritório</p>
                  <p className="text-xs text-muted-foreground">Vence hoje</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">R$ 2.500,00</p>
                  <Badge variant="destructive" className="text-xs">Atrasado</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Fornecedor ABC</p>
                  <p className="text-xs text-muted-foreground">Vence amanhã</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">R$ 1.200,00</p>
                  <Badge variant="secondary" className="text-xs">Pendente</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Cliente XYZ - Projeto</p>
                  <p className="text-xs text-muted-foreground">Receber em 3 dias</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">R$ 5.800,00</p>
                  <Badge variant="outline" className="text-xs">A Receber</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertsPopup
        open={alertsOpen}
        alerts={alerts}
        onClose={() => setAlertsOpen(false)}
        onResolve={handleResolveAlert}
        onViewDetails={handleViewDetails}
      />
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
