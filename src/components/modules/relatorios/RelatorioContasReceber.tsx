import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, AlertCircle, TrendingUp, CheckCircle, Clock } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ContaReceber } from "../contas-receber/types";

interface RelatorioContasReceberProps {
  contas: ContaReceber[];
}

export function RelatorioContasReceber({ contas = [] }: RelatorioContasReceberProps) {
  const totalRecebido = contas.filter(c => c.status === 'recebido').reduce((acc, item) => acc + item.valor, 0);
  const totalPendente = contas.filter(c => c.status === 'pendente').reduce((acc, item) => acc + item.valor, 0);
  const totalAtrasado = contas.filter(c => c.status === 'atrasado').reduce((acc, item) => acc + item.valor, 0);
  const totalAReceber = totalPendente + totalAtrasado;
  const contasAtrasadasCount = contas.filter(c => c.status === 'atrasado').length;

  const recebimentosPorCategoria = contas.reduce((acc, conta) => {
    const { categoria, valor } = conta;
    if (!categoria) return acc;
    if (!acc[categoria]) {
      acc[categoria] = 0;
    }
    acc[categoria] += valor;
    return acc;
  }, {} as Record<string, number>);

  const recebimentosPorCliente = contas
      .filter(c => c.status === 'pendente' || c.status === 'atrasado')
      .reduce((acc, conta) => {
          const { cliente, valor } = conta;
          if(!cliente) return acc;
          if(!acc[cliente]){
              acc[cliente] = 0;
          }
          acc[cliente] += valor;
          return acc;
      }, {} as Record<string, number>);

  const [clienteComMaiorValor] = Object.entries(recebimentosPorCliente).length > 0
      ? Object.entries(recebimentosPorCliente).sort(([, a], [, b]) => b - a)[0]
      : ["N/A"];

  const pieChartData = Object.entries(recebimentosPorCategoria).map(([name, value]) => ({ name, value }));

  const barChartData = Object.entries(recebimentosPorCliente)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 5);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  const categoryColorMapping: { [key: string]: string } = {
    'Vendas de Serviços': "bg-blue-100 text-blue-800 border-blue-200",
    'Vendas de Produtos': "bg-green-100 text-green-800 border-green-200",
    'Assinaturas': "bg-purple-100 text-purple-800 border-purple-200",
  };

  const statusConfig: { [key: string]: { variant: "default" | "destructive" | "secondary", label: string, icon: React.ElementType, className?: string } } = {
    pendente: { variant: "secondary", label: "Pendente", icon: Clock },
    recebido: { variant: "default", label: "Recebido", icon: CheckCircle, className: "bg-green-100 text-green-800 border border-green-200" },
    atrasado: { variant: "destructive", label: "Atrasado", icon: AlertCircle },
    parcial: { variant: "outline", label: "Parcial", icon: DollarSign },
  };

  const getStatusBadge = (status?: ContaReceber['status']) => {
    if (!status || !statusConfig[status]) {
        return <Badge variant="outline">N/A</Badge>;
    }
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
        <Badge variant={config.variant} className={cn("flex items-center gap-1 w-28 justify-center", config.className)}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Contas a Receber</CardTitle>
          <CardDescription>Principais indicadores de recebimentos do período.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  R$ {totalAReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recebido no Período</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contas em Atraso</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {contasAtrasadasCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Principal Cliente</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clienteComMaiorValor}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}