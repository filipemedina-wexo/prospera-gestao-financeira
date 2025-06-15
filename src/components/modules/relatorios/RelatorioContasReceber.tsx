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

export function RelatorioContasReceber({ contas }: RelatorioContasReceberProps) {
  // Calculations
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
      .slice(0, 5); // Top 5

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
  };

  const getStatusBadge = (status: 'pendente' | 'recebido' | 'atrasado') => {
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
                <p className="text-xs text-muted-foreground">
                  Soma de pendentes e atrasados
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Total já creditado na conta
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Total de R$ {totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Com maior valor em aberto
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recebimentos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={1}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name]}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
           <CardHeader>
            <CardTitle>Top 5 Clientes com Contas em Aberto</CardTitle>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={250}>
               <BarChart data={barChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value as number)/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={120} interval={0} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, "Valor a Receber"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro Detalhado de Contas a Receber</CardTitle>
          <CardDescription>Lista de todas as contas a receber registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center w-36">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.sort((a,b) => b.dataVencimento.getTime() - a.dataVencimento.getTime()).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.cliente}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(categoryColorMapping[item.categoria], !categoryColorMapping[item.categoria] && "bg-gray-100 text-gray-800")}>
                      {item.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(item.dataVencimento, 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="flex justify-center">
                    {getStatusBadge(item.status as 'pendente' | 'recebido' | 'atrasado')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
