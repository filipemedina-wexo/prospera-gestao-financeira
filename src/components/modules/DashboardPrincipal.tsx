
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  DollarSign,
  Calendar,
  CheckCircle,
  Wallet,
  Users
} from "lucide-react";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { alertsService } from "@/services/alertsService";
import { bankAccountsService } from "@/services/bankAccountsService";
import { accountsPayableService } from "@/services/accountsPayableService";
import { accountsReceivableService } from "@/services/accountsReceivableService";
import { financialClientsService } from "@/services/financialClientsService";
import { format, parseISO, isToday } from "date-fns";
import { ExtratoTabela } from "@/components/modules/relatorios/ExtratoTabela";
import { agruparTransacoesPorDia } from "@/components/modules/relatorios/extratoUtils";
import { Skeleton } from "@/components/ui/skeleton";

export type DashboardPrincipalProps = {
  onAlertsClick?: () => void;
};
export function DashboardPrincipal({ onAlertsClick }: DashboardPrincipalProps) {
  const { currentClientId } = useMultiTenant();

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', currentClientId],
    queryFn: () => alertsService.getAll(),
    enabled: !!currentClientId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: bankAccounts, isLoading: bankAccountsLoading } = useQuery({
    queryKey: ['bank-accounts', currentClientId],
    queryFn: () => currentClientId ? bankAccountsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const { data: contasPagar, isLoading: contasPagarLoading } = useQuery({
    queryKey: ['accounts-payable', currentClientId],
    queryFn: () => currentClientId ? accountsPayableService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const { data: contasReceber, isLoading: contasReceberLoading } = useQuery({
    queryKey: ['accounts-receivable', currentClientId],
    queryFn: () => currentClientId ? accountsReceivableService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const { data: clientes, isLoading: clientesLoading } = useQuery({
    queryKey: ['financial-clients', currentClientId],
    queryFn: () => currentClientId ? financialClientsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Atrasado':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Vencendo hoje':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'A Receber':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'Atrasado':
        return 'destructive' as const;
      case 'Vencendo hoje':
        return 'default' as const;
      case 'A Receber':
        return 'secondary' as const;
      default:
        return 'default' as const;
    }
  };

  // Calculate summary statistics
  const totalBalance = bankAccounts?.reduce((sum, account) => sum + account.balance, 0) || 0;
  const totalContasPagar = contasPagar?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0) || 0;
  const totalContasReceber = contasReceber?.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0) || 0;
  const totalClientes = clientes?.length || 0;
  const contasAtrasadas = (alerts?.filter(a => a.type === 'Atrasado').length) || 0;

  const isLoading = alertsLoading || bankAccountsLoading || contasPagarLoading || contasReceberLoading || clientesLoading;

  const extratoReceberAgrupado = agruparTransacoesPorDia(
    (contasReceber || [])
      .filter(c => c.status === 'received' && c.received_date && isToday(parseISO(c.received_date)))
      .map(c => ({
        id: c.id,
        data: parseISO(c.received_date!),
        tipo: 'entrada' as const,
        descricao: c.description,
        valor: c.amount,
        categoria: c.category || 'Geral',
        saldoApos: 0,
      }))
  );

  const extratoPagarAgrupado = agruparTransacoesPorDia(
    (contasPagar || [])
      .filter(c => c.status === 'paid' && c.paid_date && isToday(parseISO(c.paid_date)))
      .map(c => ({
        id: c.id,
        data: parseISO(c.paid_date!),
        tipo: 'saida' as const,
        descricao: c.description,
        valor: c.amount,
        categoria: c.category || 'Geral',
        saldoApos: 0,
      }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Resumo Financeiro */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalContasPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Receber</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalContasReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalClientes}</div>
            </CardContent>
          </Card>
          
          <Card onClick={onAlertsClick} className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{contasAtrasadas}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertas e Notificações
          </CardTitle>
          <CardDescription>
            Acompanhe vencimentos e pendências importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !alerts || alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhum alerta no momento!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <Alert key={alert.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <AlertTitle className="text-sm font-medium">{alert.title}</AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground">
                        {alert.description}
                      </AlertDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getAlertVariant(alert.type)}>
                      {alert.type}
                    </Badge>
                    <span className="text-sm font-semibold">
                      {alert.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </Alert>
              ))}
              {alerts.length > 10 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  E mais {alerts.length - 10} alerta(s)...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extrato Contas a Receber */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Extrato Contas a Receber
          </CardTitle>
          <CardDescription>Movimentações de hoje</CardDescription>
        </CardHeader>
        <CardContent>
          {contasReceberLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : Object.keys(extratoReceberAgrupado).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação hoje.
            </div>
          ) : (
            <ExtratoTabela extratoAgrupado={extratoReceberAgrupado} useRealData />
          )}
        </CardContent>
      </Card>

      {/* Extrato Contas a Pagar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Extrato Contas a Pagar
          </CardTitle>
          <CardDescription>Movimentações de hoje</CardDescription>
        </CardHeader>
        <CardContent>
          {contasPagarLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : Object.keys(extratoPagarAgrupado).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação hoje.
            </div>
          ) : (
            <ExtratoTabela extratoAgrupado={extratoPagarAgrupado} useRealData />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
