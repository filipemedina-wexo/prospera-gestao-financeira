
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, History } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

// Mock Data
const inadimplenciaAtual = [
  { clienteId: "cli-003", clienteNome: "Empresa DEF", valor: 299.90, dataVencimento: new Date(2025, 5, 10), diasAtraso: 5 },
  { clienteId: "cli-007", clienteNome: "Construtora GHI", valor: 15000.00, dataVencimento: new Date(2025, 4, 25), diasAtraso: 21 },
  { clienteId: "cli-012", clienteNome: "Consultoria JKL", valor: 1250.50, dataVencimento: new Date(2025, 5, 1), diasAtraso: 14 },
];

const historicoAtrasos = [
  { clienteId: "cli-001", clienteNome: "Cliente XYZ", valor: 5800.00, dataVencimento: new Date(2025, 4, 15), dataPagamento: new Date(2025, 4, 20), diasAtraso: 5 },
  { clienteId: "cli-008", clienteNome: "Agência MNO", valor: 450.00, dataVencimento: new Date(2025, 3, 30), dataPagamento: new Date(2025, 4, 10), diasAtraso: 10 },
  { clienteId: "cli-003", clienteNome: "Empresa DEF", valor: 299.90, dataVencimento: new Date(2025, 4, 10), dataPagamento: new Date(2025, 4, 12), diasAtraso: 2 },
];

const clientesRisco = [
  { clienteId: "cli-007", clienteNome: "Construtora GHI", risco: "Alto", motivo: "Atraso recorrente, valor elevado" },
  { clienteId: "cli-003", clienteNome: "Empresa DEF", risco: "Médio", motivo: "Atrasos frequentes, valores menores" },
  { clienteId: "cli-015", clienteNome: "Startup PQR", risco: "Baixo", motivo: "Novo cliente, monitorar primeiros pagamentos" },
];

const totalInadimplente = inadimplenciaAtual.reduce((acc, item) => acc + item.valor, 0);
const avgDiasAtraso = inadimplenciaAtual.length > 0
  ? Math.round(inadimplenciaAtual.reduce((acc, item) => acc + item.diasAtraso, 0) / inadimplenciaAtual.length)
  : 0;

const chartData = [
  { month: "Jan", overdue: 4300 },
  { month: "Fev", overdue: 3200 },
  { month: "Mar", overdue: 5100 },
  { month: "Abr", overdue: 6050 },
  { month: "Mai", overdue: 5500 },
  { month: "Jun", overdue: totalInadimplente },
];

export function RelatorioInadimplencia() {
  const getRiskBadge = (risco: string) => {
    switch (risco.toLowerCase()) {
      case 'alto':
        return <Badge variant="destructive">Alto</Badge>;
      case 'médio':
        return <Badge variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-500">Médio</Badge>;
      case 'baixo':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Baixo</Badge>;
      default:
        return <Badge variant="outline">{risco}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral da Inadimplência</CardTitle>
          <CardDescription>Principais indicadores de contas em atraso.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total em Atraso</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  R$ {totalInadimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {inadimplenciaAtual.length} clientes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Inadimplentes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inadimplenciaAtual.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  com contas vencidas atualmente
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio de Atraso</CardTitle>
                <History className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {avgDiasAtraso} dias
                </div>
                <p className="text-xs text-muted-foreground">
                  em média por conta
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inadimplência Atual</CardTitle>
            <CardDescription>Clientes com faturas vencidas e não pagas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Dias Atraso</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inadimplenciaAtual.map((item) => (
                  <TableRow key={item.clienteId}>
                    <TableCell className="font-medium">{item.clienteNome}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{item.diasAtraso} dias</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução da Inadimplência</CardTitle>
            <CardDescription>Valor total em atraso nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value as number)/1000}k`} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, "Valor em Atraso"]}
                />
                <Bar dataKey="overdue" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Risco de Inadimplência</CardTitle>
          <CardDescription>Clientes classificados pelo potencial de se tornarem inadimplentes, baseado no histórico.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Nível de Risco</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesRisco.map((cliente) => (
                <TableRow key={cliente.clienteId}>
                  <TableCell className="font-medium">{cliente.clienteNome}</TableCell>
                  <TableCell>{getRiskBadge(cliente.risco)}</TableCell>
                  <TableCell className="text-muted-foreground">{cliente.motivo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos em Atraso</CardTitle>
          <CardDescription>Clientes que pagaram suas faturas após o vencimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Dias Atraso</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Data Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicoAtrasos.map((item) => (
                <TableRow key={item.clienteId + item.dataVencimento.toISOString()}>
                  <TableCell className="font-medium">{item.clienteNome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.diasAtraso} dias</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.dataPagamento.toLocaleDateString('pt-BR')}
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
