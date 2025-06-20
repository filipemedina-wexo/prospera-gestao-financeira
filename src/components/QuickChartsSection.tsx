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

// Removida a palavra 'export' daqui
function QuickChartsSection() {
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
    const currentYear = getYear(today);
    
    const contasPagarProcessadas = (contasPagar || []).map(c => ({
        ...c,
        status: (isPast(parseISO(c.due_date)) && !isToday(parseISO(c.due_date)) && c.status === 'pending') ? 'atrasado' : c.status,
    }));

    const contasReceberProcessadas = (contasReceber || []).map(c => ({
        ...c,
        status: (isPast(parseISO(c.due_date)) && !isToday(parseISO(c.due_date)) && c.status === 'pending') ? 'atrasado' : c.status,
        received_date_obj: c.received_date ? parseISO(c.received_date) : null
    }));
    
    const summary = {
        totalAPagar: contasPagarProcessadas.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((sum, c) => sum + c.amount, 0),
        totalAReceber: contasReceberProcessadas.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((sum, c) => sum + c.amount, 0),
        contasPagasMes: contasPagarProcessadas.filter(c => c.status === 'paid' && c.paid_date && getMonth(parseISO(c.paid_date)) === getMonth(today) && getYear(parseISO(c.paid_date)) === getYear(today)).length,
        contasRecebidasMes: contasReceberProcessadas.filter(c => c.status === 'received' && c.received_date_obj && getMonth(c.received_date_obj) === getMonth(today) && getYear(c.received_date_obj) === getYear(today)).length
    };

    const alerts = [
      ...contasPagarProcessadas.filter(c => c.status === 'atrasado' || (c.status === 'pendente' && isToday(parseISO(c.due_date)))).map(c => ({ id: `p-${c.id}`, type: c.status === 'atrasado' ? 'Atrasado' : 'Vencendo hoje', title: c.description, description: `Vence em: ${format(parseISO(c.due_date), 'dd/MM/yyyy')}`, amount: c.amount, module: 'Contas a Pagar' })),
      ...contasReceberProcessadas.filter(c => c.status === 'atrasado' || (c.status === 'pendente' && isToday(parseISO(c.due_date)))).map(c => ({ id: `r-${c.id}`, type: c.status === 'atrasado' ? 'Atrasado' : 'Vencendo hoje', title: c.description, description: `Vence em: ${format(parseISO(c.due_date), 'dd/MM/yyyy')}`, amount: c.amount, module: 'Contas a Receber' }))
    ].sort((a, b) => (a.type === 'Atrasado' ? -1 : 1) - (b.type === 'Atrasado' ? -1 : 1));
    
    const costByCategory = (contasPagar || []).reduce((acc, conta) => {
        const category = conta.category || 'Outros';
        acc[category] = (acc[category] || 0) + conta.amount;
        return acc;
    }, {} as Record<string, number>);
    const costChartData = Object.entries(costByCategory).map(([name, value]) => ({ name, value })).slice(0, 5);

    const monthlyRevenue = Array.from({ length: 12 }).map((_, i) => {
        const monthName = format(new Date(currentYear, i, 1), 'MMM', { locale: ptBR });
        const revenue = (contasReceberProcessadas || []).filter(c => (c.status === 'received' || c.status === 'recebido') && c.received_date_obj && getYear(c.received_date_obj) === currentYear && getMonth(c.received_date_obj) === i).reduce((sum, c) => sum + c.amount, 0);
        return { mes: monthName, faturamento: revenue, faturamentoAcumulado: 0, metaAcumulada: (i + 1) * 10000 };
    });
    monthlyRevenue.reduce((acc, month) => {
        month.faturamentoAcumulado = acc + month.faturamento;
        return month.faturamentoAcumulado;
    }, 0);

    return { alerts, summary, costChartData, monthlyRevenue };
  }, [contasPagar, contasReceber]);


  if (loadingPagar || loadingReceber) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Skeleton className="h-80 w-full" /><Skeleton className="h-80 w-full" /></div>
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total a Pagar</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{processedData.summary.totalAPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total a Receber</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{processedData.summary.totalAReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Contas Pagas no Mês</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{processedData.summary.contasPagasMes}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Contas Recebidas no Mês</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{processedData.summary.contasRecebidasMes}</div></CardContent></Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Custos por Categoria</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={230}><PieChart><Pie data={processedData.costChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label>{processedData.costChartData.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />))}</Pie><Legend /><RechartsTooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} /></PieChart></ResponsiveContainer></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Faturamento vs. Meta (Ano)</CardTitle></CardHeader>
          <CardContent><ResponsiveContainer width="100%" height={230}><LineChart data={processedData.monthlyRevenue}><XAxis dataKey="mes" /><YAxis tickFormatter={(val) => `R$${val/1000}k`} /><CartesianGrid strokeDasharray="3 3" /><Line type="monotone" dataKey="faturamentoAcumulado" name="Faturamento Acumulado" stroke="#34d399" strokeWidth={2} dot activeDot={{ r: 6 }} /><Line type="monotone" dataKey="metaAcumulada" name="Meta Acumulada" stroke="#60a5fa" strokeDasharray="6 3" strokeWidth={2} dot={false} /><Legend /><RechartsTooltip formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR')}`, name]} /></LineChart></ResponsiveContainer></CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Alertas e Notificações</CardTitle><CardDescription>Itens que requerem sua atenção imediata.</CardDescription></CardHeader>
        <CardContent>
            <div className="space-y-4 max-h-96 overflow-auto">
                {processedData.alerts.length > 0 ? processedData.alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            {alert.type === 'Atrasado' ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <AlarmClock className="h-5 w-5 text-orange-500" />}
                            <div>
                                <div className="font-medium flex items-center gap-2">{alert.title} <Badge variant="outline">{alert.module}</Badge></div>
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

// Adicionada a exportação padrão aqui
export default QuickChartsSection;