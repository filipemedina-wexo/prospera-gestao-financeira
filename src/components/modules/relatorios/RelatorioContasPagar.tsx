
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, AlertCircle, CheckCircle, CreditCard, TrendingUp, Clock } from "lucide-react";
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

// Mock Data for RelatorioContasPagar
const contasPagar = [
  { id: 'cp-001', fornecedor: 'Fornecedores Inc.', descricao: 'Compra de matéria-prima', valor: 7500.00, dataVencimento: new Date(2025, 4, 15), status: 'pago', categoria: 'Custos de Mercadoria', dataPagamento: new Date(2025, 4, 14) },
  { id: 'cp-002', fornecedor: 'Serviços de Nuvem SA', descricao: 'Assinatura Cloud (Maio)', valor: 450.00, dataVencimento: new Date(2025, 4, 20), status: 'pago', categoria: 'Despesas Operacionais', dataPagamento: new Date(2025, 4, 20) },
  { id: 'cp-003', fornecedor: 'Imobiliária Central', descricao: 'Aluguel Escritório (Junho)', valor: 3200.00, dataVencimento: new Date(2025, 5, 5), status: 'pendente', categoria: 'Despesas Fixas' },
  { id: 'cp-004', fornecedor: 'Agência Marketing Digital', descricao: 'Campanha Redes Sociais', valor: 2800.00, dataVencimento: new Date(2025, 5, 1), status: 'atrasado', categoria: 'Marketing' },
  { id: 'cp-005', fornecedor: 'Fornecedores Inc.', descricao: 'Compra de insumos', valor: 1800.00, dataVencimento: new Date(2025, 5, 10), status: 'pendente', categoria: 'Custos de Mercadoria' },
  { id: 'cp-006', fornecedor: 'Consultoria RH Ltda', descricao: 'Recrutamento de Vaga', valor: 4000.00, dataVencimento: new Date(2025, 5, 12), status: 'pendente', categoria: 'Despesas Administrativas' },
  { id: 'cp-007', fornecedor: 'Telecomunicações Veloz', descricao: 'Internet e Telefonia (Maio)', valor: 650.00, dataVencimento: new Date(2025, 5, 15), status: 'pendente', categoria: 'Despesas Fixas' },
  { id: 'cp-008', fornecedor: 'Gráfica Express', descricao: 'Impressão de material', valor: 950.00, dataVencimento: new Date(2025, 6, 2), status: 'pendente', categoria: 'Marketing' },
  { id: 'cp-009', fornecedor: 'Software House', descricao: 'Licença de Software', valor: 1500.00, dataVencimento: new Date(2025, 4, 28), status: 'atrasado', categoria: 'Despesas Operacionais' },
];

// Calculations
const totalPago = contasPagar.filter(c => c.status === 'pago').reduce((acc, item) => acc + item.valor, 0);
const totalPendente = contasPagar.filter(c => c.status === 'pendente').reduce((acc, item) => acc + item.valor, 0);
const totalAtrasado = contasPagar.filter(c => c.status === 'atrasado').reduce((acc, item) => acc + item.valor, 0);
const totalAPagar = totalPendente + totalAtrasado;
const contasAtrasadasCount = contasPagar.filter(c => c.status === 'atrasado').length;

const pagamentosPorCategoria = contasPagar.reduce((acc, conta) => {
  const { categoria, valor } = conta;
  if (!acc[categoria]) {
    acc[categoria] = 0;
  }
  acc[categoria] += valor;
  return acc;
}, {} as Record<string, number>);

const pagamentosPorFornecedor = contasPagar
    .filter(c => c.status === 'pendente' || c.status === 'atrasado')
    .reduce((acc, conta) => {
        const { fornecedor, valor } = conta;
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

const statusConfig: { [key: string]: { variant: "default" | "destructive" | "secondary", label: string, icon: React.ElementType, className?: string } } = {
    pendente: { variant: "secondary", label: "Pendente", icon: Clock },
    pago: { variant: "default", label: "Pago", icon: CheckCircle, className: "bg-green-100 text-green-800 border border-green-200" },
    atrasado: { variant: "destructive", label: "Atrasado", icon: AlertCircle },
};

const getStatusBadge = (status: 'pendente' | 'pago' | 'atrasado') => {
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


export function RelatorioContasPagar() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Contas a Pagar</CardTitle>
          <CardDescription>Principais indicadores de obrigações do período.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  R$ {totalAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Soma de pendentes e atrasados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pago no Período</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total já debitado da conta
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contas em Atraso</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {contasAtrasadasCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total de R$ {totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Principal Fornecedor</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fornecedorComMaiorValor}
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
            <CardTitle>Pagamentos por Categoria</CardTitle>
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
            <CardTitle>Top 5 Fornecedores com Contas em Aberto</CardTitle>
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
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, "Valor a Pagar"]}
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
          <CardTitle>Registro Detalhado de Contas a Pagar</CardTitle>
          <CardDescription>Lista de todas as contas a pagar registradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center w-32">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasPagar.sort((a,b) => b.dataVencimento.getTime() - a.dataVencimento.getTime()).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.fornecedor}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={categoryColorMapping[item.categoria] || "bg-gray-100 text-gray-800 border-gray-200"}>
                      {item.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(item.dataVencimento, 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right font-semibold text-red-600">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="flex justify-center">
                    {getStatusBadge(item.status as 'pendente' | 'pago' | 'atrasado')}
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
