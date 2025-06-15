
import { Alert } from "@/types/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  DollarSign,
  CreditCard,
  PiggyBank,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { AlertsPopup } from "./AlertsPopup";
import { QuickChartsSection } from "./QuickChartsSection";
import { ContaPagar } from "./modules/contas-pagar/types";
import { ContaReceber } from "./modules/contas-receber/types";
import { isToday, isWithinInterval, addDays, startOfDay } from "date-fns";

interface DashboardProps {
  onNavigate: (module: string) => void;
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
}

export function Dashboard({ onNavigate, contasPagar = [], contasReceber = [] }: DashboardProps) {
  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>([]);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Calculate summary data
  const totalReceber = contasReceber
    .filter(c => c.status === 'pendente' || c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalPagar = contasPagar
    .filter(c => c.status === 'pendente' || c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const saldoLiquido = totalReceber - totalPagar;

  // Generate alerts dynamically
  const today = startOfDay(new Date());

  const contasPagarAlerts: Alert[] = contasPagar
    .filter(c => (c.status === 'atrasado' || (c.status === 'pendente' && isToday(new Date(c.dataVencimento)))))
    .map(c => ({
      id: c.id,
      title: c.fornecedor,
      description: c.status === 'atrasado' ? `Vencido` : `Vence hoje`,
      type: c.status === 'atrasado' ? 'Atrasado' : 'Vencendo hoje',
      amount: c.valor,
      category: 'contas-pagar',
      resolved: false,
    }));

  const contasReceberAlerts: Alert[] = contasReceber
    .filter(c => (c.status === 'pendente' || c.status === 'atrasado') && isWithinInterval(new Date(c.dataVencimento), { start: today, end: addDays(today, 3) }))
    .map(c => ({
        id: c.id,
        title: c.cliente,
        description: `Pagamento esperado`,
        type: 'A Receber',
        amount: c.valor,
        category: 'contas-receber',
        resolved: false,
    }));
    
  const allAlerts = [...contasPagarAlerts, ...contasReceberAlerts];
  const activeAlerts = allAlerts.filter(a => !resolvedAlertIds.includes(a.id));

  const handleResolveAlert = (id: string) => {
    setResolvedAlertIds(prev => [...prev, id]);
  };

  const handleViewDetails = (alert: Alert) => {
    if (alert.category === "contas-pagar") onNavigate("contas-pagar");
    else if (alert.category === "contas-receber") onNavigate("contas-receber");
    setAlertsOpen(false);
  };
  
  // Próximos Vencimentos
  const proximos7dias = { start: today, end: addDays(today, 7) };
  
  const proximosVencimentosPagar = contasPagar
      .filter(c => (c.status === 'pendente' || c.status === 'atrasado') && isWithinInterval(new Date(c.dataVencimento), proximos7dias))
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
  
  const proximosVencimentosReceber = contasReceber
      .filter(c => (c.status === 'pendente' || c.status === 'atrasado') && isWithinInterval(new Date(c.dataVencimento), proximos7dias))
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
  
  const todosProximosVencimentos = [
      ...proximosVencimentosPagar.map(c => ({...c, tipo: 'pagar' as const})),
      ...proximosVencimentosReceber.map(c => ({...c, tipo: 'receber' as const})),
  ].sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()).slice(0, 3);


  return (
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
        {/* Card A Receber */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <PiggyBank className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold text-green-600 cursor-pointer hover:underline"
              onClick={() => onNavigate("contas-receber")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigate("contas-receber")}
            >
              R$ {totalReceber.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total em aberto
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold text-red-600 cursor-pointer hover:underline"
              onClick={() => onNavigate("contas-pagar")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigate("contas-pagar")}
            >
              R$ {totalPagar.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total em aberto
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Previsto</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {saldoLiquido.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receber - Pagar
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
                activeAlerts.filter(a => a.type === "Atrasado" || a.type === "Vencendo hoje").length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {
                (() => {
                  const vencendoHoje = activeAlerts.filter(a => a.type === "Vencendo hoje").length;
                  const atrasadas = activeAlerts.filter(a => a.type === "Atrasado").length;
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
                onClick={() => onNavigate("caixa")}
              >
                <Wallet className="h-6 w-6" />
                <span className="text-sm">Controle de Caixa</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => onNavigate("contas-pagar")}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Nova Conta a Pagar</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => onNavigate("contas-receber")}
              >
                <PiggyBank className="h-6 w-6" />
                <span className="text-sm">Nova Conta a Receber</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => onNavigate("dre")}
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
              {todosProximosVencimentos.length > 0 ? todosProximosVencimentos.map(item => {
                const isPagar = item.tipo === 'pagar';
                const vencimentoDate = new Date(item.dataVencimento);
                const diffDays = Math.ceil((startOfDay(vencimentoDate).getTime() - today.getTime()) / (1000 * 3600 * 24));
                
                let vencimentoText = `Vence em ${diffDays} dias`;
                if (diffDays === 0) vencimentoText = "Vence hoje";
                else if (diffDays === 1) vencimentoText = "Vence amanhã";
                else if (diffDays < 0) vencimentoText = `Venceu há ${Math.abs(diffDays)} dias`;
                
                if (!isPagar) {
                    vencimentoText = vencimentoText.replace('Vence', 'Receber');
                }

                return (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${
                    isPagar ? (item.status === 'atrasado' ? 'bg-red-50' : 'bg-orange-50') : 'bg-blue-50'
                }`}>
                    <div>
                    <p className="font-medium text-sm">{isPagar ? (item as ContaPagar).fornecedor : (item as ContaReceber).cliente}</p>
                    <p className="text-xs text-muted-foreground">{vencimentoText}</p>
                    </div>
                    <div className="text-right">
                    <p className={`font-semibold ${isPagar ? 'text-red-600' : 'text-blue-600'}`}>
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant={isPagar ? (item.status === 'atrasado' ? 'destructive' : 'secondary') : 'outline'} className="text-xs capitalize">
                        {isPagar ? item.status : 'A Receber'}
                    </Badge>
                    </div>
                </div>
                );
              }) : <p className="text-muted-foreground text-sm text-center">Nenhum vencimento nos próximos 7 dias.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nova Seção: Gráficos Rápidos */}
      <QuickChartsSection />
      
      <AlertsPopup
        open={alertsOpen}
        alerts={activeAlerts}
        onClose={() => setAlertsOpen(false)}
        onResolve={handleResolveAlert}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
