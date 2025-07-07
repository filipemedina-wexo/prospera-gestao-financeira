
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Tags, Calculator } from "lucide-react";
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
import { ContaPagar } from "../contas-pagar/types";
import { useMemo } from "react";
import { parseISO } from "date-fns";

interface RelatorioDespesasCategoriaProps {
  contasAPagar: ContaPagar[];
  isLoading?: boolean;
}

export function RelatorioDespesasCategoria({ contasAPagar, isLoading }: RelatorioDespesasCategoriaProps) {
  const dadosProcessados = useMemo(() => {
    // Filtra apenas as contas pagas
    const despesasPagas = contasAPagar.filter(conta => conta.status === 'pago');
    
    if (despesasPagas.length === 0) {
      return {
        despesas: [],
        totalDespesas: 0,
        gastoMedio: 0,
        despesasPorCategoria: {},
        categoriaComMaiorGasto: '',
        pieChartData: [],
        barChartData: []
      };
    }

    // Mapear dados para o formato esperado
    const despesas = despesasPagas.map(conta => ({
      id: conta.id,
      data: conta.dataPagamento || conta.dataVencimento,
      descricao: conta.descricao,
      categoria: conta.categoria || 'Outras',
      valor: conta.valor
    }));

    const totalDespesas = despesas.reduce((acc, item) => acc + item.valor, 0);
    const gastoMedio = totalDespesas / despesas.length;

    const despesasPorCategoria = despesas.reduce((acc, despesa) => {
      const { categoria, valor } = despesa;
      if (!acc[categoria]) {
        acc[categoria] = 0;
      }
      acc[categoria] += valor;
      return acc;
    }, {} as Record<string, number>);

    const [categoriaComMaiorGasto] = Object.entries(despesasPorCategoria).sort(([, a], [, b]) => b - a)[0] || ['', 0];

    const pieChartData = Object.entries(despesasPorCategoria).map(([name, value]) => ({ name, value }));
    const barChartData = Object.entries(despesasPorCategoria)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value);

    return {
      despesas,
      totalDespesas,
      gastoMedio,
      despesasPorCategoria,
      categoriaComMaiorGasto,
      pieChartData,
      barChartData
    };
  }, [contasAPagar]);

  const { despesas, totalDespesas, gastoMedio, categoriaComMaiorGasto, pieChartData, barChartData } = dadosProcessados;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (despesas.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Aguardando dados relevantes para gerar informações</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4242'];

const categoryColorMapping: { [key: string]: string } = {
  Software: "bg-blue-100 text-blue-800 border-blue-200",
  Alimentação: "bg-orange-100 text-orange-800 border-orange-200",
  Viagem: "bg-purple-100 text-purple-800 border-purple-200",
  Marketing: "bg-pink-100 text-pink-800 border-pink-200",
  Escritório: "bg-green-100 text-green-800 border-green-200",
  Infraestrutura: "bg-gray-200 text-gray-800 border-gray-300",
  Transporte: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral das Despesas</CardTitle>
          <CardDescription>Principais indicadores de gastos do período.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  em {despesas.length} transações
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Principal Categoria</CardTitle>
                <Tags className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {categoriaComMaiorGasto}
                </div>
                <p className="text-xs text-muted-foreground">
                  Categoria com maior volume de gastos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gasto Médio</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {gastoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  por transação
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
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
            <CardTitle>Comparativo por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={250}>
               <BarChart data={barChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value as number)/1000}k`} />
                <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} interval={0} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, "Total Gasto"]}
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
          <CardTitle>Registro Detalhado de Despesas</CardTitle>
          <CardDescription>Lista de todas as transações de despesa no período.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesas.sort((a,b) => b.data.getTime() - a.data.getTime()).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{item.data.toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium">{item.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={categoryColorMapping[item.categoria] || "bg-gray-100 text-gray-800"}>
                      {item.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    - R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
