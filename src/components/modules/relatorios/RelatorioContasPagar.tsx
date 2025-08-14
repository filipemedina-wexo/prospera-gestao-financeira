import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, CreditCard, Clock, XCircle } from "lucide-react";
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
import { ContaPagar } from "../contas-pagar/types";

interface RelatorioContasPagarProps {
  contas: ContaPagar[];
}

export function RelatorioContasPagar({ contas }: RelatorioContasPagarProps) {
  // Verificar se há dados suficientes
  const hasData = contas.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Contas a Pagar</CardTitle>
            <CardDescription>Análise detalhada de contas a pagar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aguardando dados relevantes</h3>
              <p className="text-muted-foreground">
                Aguardando dados relevantes para gerar informações sobre contas a pagar.
                <br />
                Cadastre contas a pagar para visualizar este relatório.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculations
  const totalPago = contas.filter(c => c.status === 'pago').reduce((acc, item) => acc + item.valor, 0);
  const totalPendente = contas.filter(c => c.status === 'pendente').reduce((acc, item) => acc + item.valor, 0);
  const totalAtrasado = contas.filter(c => c.status === 'atrasado').reduce((acc, item) => acc + item.valor, 0);
  const totalAPagar = totalPendente + totalAtrasado;
  const contasAtrasadasCount = contas.filter(c => c.status === 'atrasado').length;

  const pagamentosPorCategoria = contas.reduce((acc, conta) => {
    const { categoria, valor } = conta;
    if (!categoria) return acc;
    if (!acc[categoria]) {
      acc[categoria] = 0;
    }
    acc[categoria] += valor;
    return acc;
  }, {} as Record<string, number>);

  const pagamentosPorFornecedor = contas
      .filter(c => c.status === 'pendente' || c.status === 'atrasado')
      .reduce((acc, conta) => {
          const { fornecedor, valor } = conta;
          if(!fornecedor) return acc;
          if(!acc[fornecedor]){
              acc[fornecedor] = 0;
          }
          acc[fornecedor] += valor;
          return acc;
      }, {} as Record<string, number>);

  const [fornecedorComMaiorValor] = Object.entries(pagamentosPorFornecedor).length > 0
      ? Object.entries(pagamentosPorFornecedor).sort(([, a], [, b]) => b - a)[0]
      : ["N/A"];

  const pieChartData = Object.entries(pagamentosPorCategoria).map(([name, value]) => ({ name, value }));

  const barChartData = Object.entries(pagamentosPorFornecedor)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 5); // Top 5

  const COLORS = ['#FF8042', '#00C49F', '#0088FE', '#FFBB28', '#AF19FF'];

  const categoryColorMapping: { [key: string]: string } = {
    'Despesas Fixas': "bg-blue-100 text-blue-800 border-blue-200",
    'Custos de Mercadoria': "bg-yellow-100 text-yellow-800 border-yellow-200",
    'Despesas Operacionais': "bg-indigo-100 text-indigo-800 border-indigo-200",
    'Marketing': "bg-pink-100 text-pink-800 border-pink-200",
    'Despesas Administrativas': "bg-gray-100 text-gray-800 border-gray-200",
  };

  const statusConfig: { [key: string]: { variant: "default" | "destructive" | "secondary" | "outline", label: string, icon: React.ElementType, className?: string } } = {
    pendente: { variant: "secondary", label: "Pendente", icon: Clock },
    pago: { variant: "default", label: "Pago", icon: CheckCircle, className: "bg-green-100 text-green-800 border border-green-200" },
    atrasado: { variant: "destructive", label: "Atrasado", icon: AlertCircle },
    cancelado: { variant: "outline", label: "Cancelado", icon: XCircle },
  };

  const getStatusBadge = (status: 'pendente' | 'pago' | 'atrasado' | 'cancelado') => {
    const config = statusConfig[status];
    if (!config) return null;
    const Icon = config.icon;
    
    return (
        <Badge variant={config.variant} className={cn("flex items-center gap-1 w-24 justify-center", config.className)}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* O resto do componente continua o mesmo... */}
    </div>
  );
}