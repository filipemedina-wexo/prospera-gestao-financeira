import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlarmClock, DollarSign, TrendingUp, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { accountsPayableService } from "@/services/accountsPayableService";
import { accountsReceivableService } from "@/services/accountsReceivableService";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { Skeleton } from "./ui/skeleton";
import { format, isToday, isPast, getMonth, getYear, parseISO } from 'date-fns';
import { useMemo } from "react";
import { ptBR } from "date-fns/locale";

const COLORS = ["#34d399", "#60a5fa", "#f59e42", "#f43f5e", "#818cf8"];

export function QuickChartsSection() {
  const { currentClientId } = useMultiTenant();

  const { data: contasPagar, isLoading: loadingPagar } = useQuery({
    queryKey: ['accounts-payable', currentClientId],
    queryFn: () => accountsPayableService.getAll(),
    enabled: !!currentClientId,
  });

  const { data: contasReceber, isLoading: loadingReceber } = useQuery({
    queryKey: ['accounts-receivable', currentClientId],
    queryFn: () => accountsReceivableService.getAll(),
    enabled: !!currentClientId,
  });

  const processedData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const contasPagarProcessadas = (contasPagar || []).map(c => ({
        ...c,
        status: (isPast(parseISO(c.due_date)) && !isToday(parseISO(c.due_date)) && c.status === 'pending') ? 'atrasado' : c.status,
        due_date_obj: parseISO(c.due_date)
    }));

    const contasReceberProcessadas = (contasReceber || []).map(c => ({
        ...c,
        status: (isPast(parseISO(c.due_date)) && !isToday(parseISO(c.due_date)) && c.status === 'pending') ? 'atrasado' : c.status,
        due_date_obj: parseISO(c.due_date),
        received_date_obj: c.received_date ? parseISO(c.received_date) : null
    }));
    
    const summary = {
        totalAPagar: contasPagarProcessadas.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((sum, c) => sum + c.amount, 0),
        totalAReceber: contasReceberProcessadas.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((sum, c) => sum + c.amount, 0),
        contasPagasMes: contasPagarProcessadas.filter(c => c.status === 'paid' && c.paid_date && getMonth(parseISO(c.paid_date)) === getMonth(today) && getYear(parseISO(c.paid_date)) === getYear(today)).length,
        contasRecebidasMes: contasReceberProcessadas.filter(c => c.status === 'received' && c.received_date_obj && getMonth(c.received_date_obj) === getMonth(today) && getYear(c.received_date_obj) === getYear(today)).length
    };

    const alerts = [
      ...contasPagarProcessadas.filter(c => c.status === 'atrasado' || (c.status === 'pendente' && isToday(c.due_date_obj))).map(c => ({ id: `p-${c.id}`, type: c.status === 'atrasado' ? 'Atrasado' : 'Vencendo hoje', title: c.description, description: `Vence em: ${format(c.due_date_obj, 'dd/MM/yyyy')}`, amount: c.amount, module: 'Contas a Pagar' })),
      ...contasReceberProcessadas.filter(c => c.status === 'atrasado' || (c.status === 'pendente' && isToday(c.due_date_obj))).map(c => ({ id: `r-${c.id}`, type: c.status === 'atrasado' ? 'Atrasado' : 'Vencendo hoje', title: c.description, description: `Vence em: ${format(c.due_date_obj, 'dd/MM/yyyy')}`, amount: c.amount, module: 'Contas a Receber' }))
    ].sort((a, b) => (a.type === 'Atrasado' ? -1 : 1) - (b.type === 'Atrasado' ? -1 : 1));

    return { alerts, summary };
  }, [contasPagar, contasReceber]);


  if (loadingPagar || loadingReceber) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total a Pagar</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{processedData.summary.totalAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total a Receber</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{processedData.summary.totalAReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Contas Pagas no Mês</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{processedData.summary.contasPagasMes}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Contas Recebidas no Mês</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{processedData.summary.contasRecebidasMes}</div></CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
            <CardTitle>Alertas e Notificações</CardTitle>
            <CardDescription>Itens que requerem sua atenção imediata.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4 max-h-96 overflow-auto">
                {processedData.alerts.length > 0 ? processedData.alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            {alert.type === 'Atrasado' ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <AlarmClock className="h-5 w-5 text-orange-500" />}
                            <div>
                                <span className="font-medium">{alert.title} </span><Badge variant="outline">{alert.module}</Badge>
                                <p className="text-sm text-muted-foreground">{alert.description}</p>
                            </div>
                        </div>
                        <div className={`font-bold ${alert.type === 'Atrasado' ? 'text-red-600' : 'text-orange-600'}`}>
                            {alert.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </div>
                )) : <p className="text-sm text-center text-muted-foreground py-4">Nenhum alerta no momento.</p>}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuickChartsSection;