
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, History } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";
import { ContaReceber } from "../contas-receber/types";

type RelatorioInadimplenciaProps = {
  contasAReceber: ContaReceber[];
  isLoading?: boolean;
};

export function RelatorioInadimplencia({ contasAReceber, isLoading = false }: RelatorioInadimplenciaProps) {
  const dadosInadimplencia = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Contas atualmente em atraso
    const inadimplenciaAtual = contasAReceber
      .filter(conta => {
        const vencimento = new Date(conta.dataVencimento);
        vencimento.setHours(0, 0, 0, 0);
        return conta.status === 'pendente' && vencimento < hoje;
      })
      .map(conta => {
        const vencimento = new Date(conta.dataVencimento);
        vencimento.setHours(0, 0, 0, 0);
        const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        return {
          clienteId: conta.id,
          clienteNome: conta.cliente || 'Cliente não informado',
          valor: conta.valor,
          dataVencimento: conta.dataVencimento,
          diasAtraso
        };
      })
      .sort((a, b) => b.diasAtraso - a.diasAtraso);

    // Histórico de pagamentos em atraso
    const historicoAtrasos = contasAReceber
      .filter(conta => conta.status === 'recebido' && conta.dataRecebimento)
      .map(conta => {
        if (!conta.dataRecebimento) return null;
        const vencimento = new Date(conta.dataVencimento);
        const recebimento = new Date(conta.dataRecebimento);
        vencimento.setHours(0, 0, 0, 0);
        recebimento.setHours(0, 0, 0, 0);
        
        if (recebimento <= vencimento) return null; // Não estava em atraso
        
        const diasAtraso = Math.floor((recebimento.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        return {
          clienteId: conta.id,
          clienteNome: conta.cliente || 'Cliente não informado',
          valor: conta.valor,
          dataVencimento: conta.dataVencimento,
          dataPagamento: conta.dataRecebimento,
          diasAtraso
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.diasAtraso || 0) - (a?.diasAtraso || 0));

    // Análise de risco por cliente
    const clientesAnalise = contasAReceber.reduce((acc, conta) => {
      const cliente = conta.cliente || 'Cliente não informado';
      if (!acc[cliente]) {
        acc[cliente] = {
          totalContas: 0,
          contasAtrasadas: 0,
          valorTotal: 0,
          valorAtrasado: 0,
          maiorAtraso: 0
        };
      }
      
      acc[cliente].totalContas++;
      acc[cliente].valorTotal += conta.valor;
      
      const vencimento = new Date(conta.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      
      if (conta.status === 'pendente' && vencimento < hoje) {
        acc[cliente].contasAtrasadas++;
        acc[cliente].valorAtrasado += conta.valor;
        const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
        acc[cliente].maiorAtraso = Math.max(acc[cliente].maiorAtraso, diasAtraso);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const clientesRisco = Object.entries(clientesAnalise)
      .map(([nome, dados]: [string, any]) => {
        const percentualAtraso = dados.totalContas > 0 ? (dados.contasAtrasadas / dados.totalContas) * 100 : 0;
        const valorMedio = dados.valorTotal / dados.totalContas;
        
        let risco = 'Baixo';
        let motivo = 'Histórico regular de pagamentos';
        
        if (percentualAtraso > 50 || dados.maiorAtraso > 30 || dados.valorAtrasado > 10000) {
          risco = 'Alto';
          motivo = 'Atraso recorrente, valor elevado';
        } else if (percentualAtraso > 20 || dados.maiorAtraso > 10 || dados.valorAtrasado > 5000) {
          risco = 'Médio';
          motivo = 'Atrasos frequentes';
        }
        
        return {
          clienteId: nome,
          clienteNome: nome,
          risco,
          motivo,
          percentualAtraso
        };
      })
      .sort((a, b) => {
        const ordemRisco = { 'Alto': 3, 'Médio': 2, 'Baixo': 1 };
        return ordemRisco[b.risco as keyof typeof ordemRisco] - ordemRisco[a.risco as keyof typeof ordemRisco];
      });

    // Dados para o gráfico (últimos 6 meses)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mesAno = data.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      
      const valorAtrasado = contasAReceber
        .filter(conta => {
          const vencimento = new Date(conta.dataVencimento);
          return vencimento.getMonth() === data.getMonth() && 
                 vencimento.getFullYear() === data.getFullYear() &&
                 conta.status === 'pendente';
        })
        .reduce((sum, conta) => sum + conta.valor, 0);
      
      chartData.push({
        month: mesAno,
        overdue: valorAtrasado
      });
    }

    const totalInadimplente = inadimplenciaAtual.reduce((acc, item) => acc + item.valor, 0);
    const avgDiasAtraso = inadimplenciaAtual.length > 0
      ? Math.round(inadimplenciaAtual.reduce((acc, item) => acc + item.diasAtraso, 0) / inadimplenciaAtual.length)
      : 0;

    return {
      inadimplenciaAtual,
      historicoAtrasos,
      clientesRisco,
      chartData,
      totalInadimplente,
      avgDiasAtraso
    };
  }, [contasAReceber]);

  // Verificar se há dados suficientes
  const hasData = contasAReceber.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Inadimplência</CardTitle>
            <CardDescription>Carregando dados...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Inadimplência</CardTitle>
            <CardDescription>Análise de contas em atraso e histórico de pagamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aguardando dados relevantes</h3>
              <p className="text-muted-foreground">
                Aguardando dados relevantes para gerar informações sobre inadimplência.
                <br />
                Cadastre contas a receber para visualizar este relatório.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
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
                  R$ {dadosInadimplencia.totalInadimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {dadosInadimplencia.inadimplenciaAtual.length} clientes
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
                  {dadosInadimplencia.inadimplenciaAtual.length}
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
                  {dadosInadimplencia.avgDiasAtraso} dias
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
                {dadosInadimplencia.inadimplenciaAtual.map((item) => (
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
              <BarChart data={dadosInadimplencia.chartData}>
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
              {dadosInadimplencia.clientesRisco.map((cliente) => (
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
              {dadosInadimplencia.historicoAtrasos.map((item) => (
                <TableRow key={item.clienteId + item.dataVencimento.toISOString()}>
                  <TableCell className="font-medium">{item.clienteNome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.diasAtraso} dias</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.dataPagamento?.toLocaleDateString('pt-BR')}
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
