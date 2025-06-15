
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
import { DashboardBlocks } from "./DashboardBlocks";
import ReceberBlock from "./dashboard-blocks/ReceberBlock";
import PagarBlock from "./dashboard-blocks/PagarBlock";

// --- Mocked dashboard data ---
const dashboardData = {
  totalReceber: 45680.5,
  totalPagar: 23450.75,
  saldoLiquido: 22229.75,
  contasVencendoHoje: 3,
  contasAtrasadas: 2,
  faturamentoMes: 89340.25,
  despesasMes: 34567.8,
};

type Block = {
  id: string;
  type: string;
  cols: number;
  component: React.ComponentType<any>;
  props?: any;
};

// Montando os blocos dos cards principais do dashboard para edição
const initialBlocks: Block[] = [
  {
    id: "receber",
    type: "receber",
    cols: 1,
    component: ReceberBlock,
    props: { value: dashboardData.totalReceber },
  },
  {
    id: "pagar",
    type: "pagar",
    cols: 1,
    component: PagarBlock,
    props: { value: dashboardData.totalPagar },
  },
  {
    id: "saldo",
    type: "saldo",
    cols: 1,
    // Inline: mesmo layout do card original
    component: () => (
      <Card className="hover:shadow-lg transition-shadow">
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
    ),
  },
  {
    id: "faturamento",
    type: "faturamento",
    cols: 1,
    component: () => (
      <Card className="hover:shadow-lg transition-shadow">
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
    ),
  },
  {
    id: "despesas",
    type: "despesas",
    cols: 1,
    component: () => (
      <Card className="hover:shadow-lg transition-shadow">
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
    ),
  },
  {
    id: "vencendohoje",
    type: "vencendohoje",
    cols: 1,
    component: () => (
      <Card className="hover:shadow-lg transition-shadow">
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
    ),
  },
  {
    id: "atrasadas",
    type: "atrasadas",
    cols: 1,
    component: () => (
      <Card className="hover:shadow-lg transition-shadow">
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
    ),
  },
];

export function Dashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [isEditMode, setIsEditMode] = useState(false);

  // State dos blocos para o modo de edição
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

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
            Visão geral das suas finanças - {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div>
          <Button
            variant={isEditMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(v => !v)}
          >
            {isEditMode ? "Fechar edição" : "Editar dashboard"}
          </Button>
        </div>
      </div>

      {/* Cards grid OU grid editável */}
      {!isEditMode ? (
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
      ) : (
        // Modo edição: dashboardBlocks com drag/resize
        <DashboardBlocks
          blocks={blocks}
          setBlocks={setBlocks}
          isEditMode={isEditMode}
        />
      )}

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

// O arquivo está ficando muito extenso (mais de 250 linhas). Após conferir esta alteração, recomenda-se considerar refatorar em componentes menores se for necessário adicionar novas funcionalidades ou facilitar manutenibilidade.

