import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  DollarSign,
  CreditCard,
  PiggyBank,
  FileText,
  List
} from "lucide-react";
import { useState } from "react";
import { format, isWithinInterval, addDays, subDays } from "date-fns";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes-atual");
  const [tipoRelatorio, setTipoRelatorio] = useState("fluxo-caixa");
  // Estados para filtro de "Extrato"
  const [extratoPeriodoInicio, setExtratoPeriodoInicio] = useState<Date | undefined>(subDays(new Date(), 15));
  const [extratoPeriodoFim, setExtratoPeriodoFim] = useState<Date | undefined>(new Date());

  // MOCK DATA for Fluxo de Caixa
  const dadosFluxoCaixa = {
    totalEntradas: 45000.00,
    totalSaidas: 23400.00,
    saldoLiquido: 21600.00,
    entradasPorCategoria: [
      { categoria: "Vendas", valor: 33000.00, percentual: 73.3 },
      { categoria: "Investimentos", valor: 8000.00, percentual: 17.8 },
      { categoria: "Outros", valor: 4000.00, percentual: 8.9 },
    ],
    saidasPorCategoria: [
      { categoria: "Fornecedores", valor: 12400.00, percentual: 53.0 },
      { categoria: "Folha de Pagamento", valor: 7600.00, percentual: 32.5 },
      { categoria: "Despesas Gerais", valor: 3400.00, percentual: 14.5 },
    ],
  };

  // MOCK DATA for Vendas
  const dadosVendas = {
    totalVendas: 38200.00,
    metaMensal: 50000.00,
    percentualMeta: 76,
    vendasPorVendedor: [
      {
        vendedor: "Ana Silva",
        vendas: 15500.00,
        meta: 20000.00
      },
      {
        vendedor: "Carlos Souza",
        vendas: 12000.00,
        meta: 15000.00
      },
      {
        vendedor: "Maria Oliveira",
        vendas: 10700.00,
        meta: 15000.00
      }
    ]
  };

  const relatoriosDisponiveis = [
    {
      id: "fluxo-caixa",
      nome: "Fluxo de Caixa",
      descricao: "Entradas e saídas de dinheiro",
      icon: DollarSign,
      cor: "blue"
    },
    {
      id: "contas-pagar",
      nome: "Contas a Pagar",
      descricao: "Análise de obrigações",
      icon: CreditCard,
      cor: "red"
    },
    {
      id: "contas-receber",
      nome: "Contas a Receber",
      descricao: "Análise de recebimentos",
      icon: PiggyBank,
      cor: "green"
    },
    {
      id: "vendas",
      nome: "Relatório de Vendas",
      descricao: "Performance comercial",
      icon: TrendingUp,
      cor: "purple"
    },
    {
      id: "despesas-categoria",
      nome: "Despesas por Categoria",
      descricao: "Classificação de gastos",
      icon: PieChart,
      cor: "orange"
    },
    {
      id: "inadimplencia",
      nome: "Relatório de Inadimplência",
      descricao: "Contas em atraso",
      icon: FileText,
      cor: "yellow"
    },
    {
      id: "extrato",
      nome: "Extrato",
      descricao: "Movimentação diária do caixa",
      icon: List,
      cor: "indigo"
    }
  ];

  // Dados mockados para extrato (para fins de demonstração)
  type ExtratoTransacao = {
    id: string;
    data: Date;
    tipo: 'entrada' | 'saida';
    descricao: string;
    valor: number;
    categoria: string;
    saldoApos: number; // saldo após a operação, para facilitar exibição
  };

  // Mock: gerar uma lista fixa de transações para o período passado
  function gerarMockExtratoTransacoes(inicio: Date, fim: Date): ExtratoTransacao[] {
    // Simula vários dias, diferentes transações (entradas e saídas)
    const baseDate = subDays(new Date(), 20);
    let saldo = 42800.00; // saldo inicial fictício
    let transacoes: ExtratoTransacao[] = [];
    // Mock: Para cada dia, gera 2 transações
    for (let i = 0; i < 30; i++) {
      const dia = addDays(baseDate, i);
      // só adicionar se estiver no intervalo
      if (isWithinInterval(dia, { start: inicio, end: fim })) {
        // Entrada
        saldo += 1000.00;
        transacoes.push({
          id: `in-${i}`,
          data: new Date(dia),
          tipo: "entrada",
          descricao: "Recebimento Cliente ABC",
          valor: 1000.00,
          categoria: "Recebimentos",
          saldoApos: saldo
        });
        // Saída
        saldo -= 300.00;
        transacoes.push({
          id: `out-${i}`,
          data: new Date(dia),
          tipo: "saida",
          descricao: "Pagamento Fornecedor XYZ",
          valor: 300.00,
          categoria: "Despesas",
          saldoApos: saldo
        });
      }
    }
    // Ordena por data crescente e tipo (entrada primeiro)
    return transacoes.sort((a, b) => {
      if (a.data.getTime() !== b.data.getTime()) return a.data.getTime() - b.data.getTime();
      if (a.tipo === b.tipo) return 0;
      return a.tipo === 'entrada' ? -1 : 1;
    });
  }

  // Gera transações do extrato baseadas no período selecionado do usuário
  const transacoesExtrato = extratoPeriodoInicio && extratoPeriodoFim
    ? gerarMockExtratoTransacoes(extratoPeriodoInicio, extratoPeriodoFim)
    : [];

  // Agrupa por dia para visual estilo extrato
  function agruparTransacoesPorDia(transacoes: ExtratoTransacao[]) {
    const agrupado: { [dia: string]: ExtratoTransacao[] } = {};
    transacoes.forEach(tx => {
      const dia = format(tx.data, "dd/MM/yyyy");
      if (!agrupado[dia]) agrupado[dia] = [];
      agrupado[dia].push(tx);
    });
    return agrupado;
  }

  const extratoAgrupado = agruparTransacoesPorDia(transacoesExtrato);

  const renderExtrato = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-indigo-600" />
            Extrato Financeiro
          </div>
        </CardTitle>
        <CardDescription>
          Visão detalhada de entradas e saídas por dia, como em extratos bancários.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Seleção de período */}
        <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b">
          <div>
            <span className="font-medium text-sm">Período:</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-40 justify-start text-left font-normal", !extratoPeriodoInicio && "text-muted-foreground")}>
                <Calendar className="mr-2 h-4 w-4" />
                {extratoPeriodoInicio ? format(extratoPeriodoInicio, "dd/MM/yyyy") : <span>Data inicial</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ShadcnCalendar
                mode="single"
                selected={extratoPeriodoInicio}
                onSelect={setExtratoPeriodoInicio}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                disabled={date => extratoPeriodoFim && date > extratoPeriodoFim}
              />
            </PopoverContent>
          </Popover>
          <span>até</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-40 justify-start text-left font-normal", !extratoPeriodoFim && "text-muted-foreground")}>
                <Calendar className="mr-2 h-4 w-4" />
                {extratoPeriodoFim ? format(extratoPeriodoFim, "dd/MM/yyyy") : <span>Data final</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ShadcnCalendar
                mode="single"
                selected={extratoPeriodoFim}
                onSelect={setExtratoPeriodoFim}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                disabled={date => extratoPeriodoInicio && date < extratoPeriodoInicio}
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Lista estilo extrato */}
        {Object.keys(extratoAgrupado).length === 0 && (
          <div className="text-center text-muted-foreground py-10">Nenhuma movimentação no período selecionado.</div>
        )}
        <div className="divide-y">
          {Object.entries(extratoAgrupado).map(([dia, transacoesDia]) => (
            <div key={dia} className="py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-blue-900">{dia}</span>
                <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-500">{transacoesDia.length} mov.</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm rounded">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-2 text-left">Horário</th>
                      <th className="px-4 py-2 text-left">Descrição</th>
                      <th className="px-4 py-2 text-left">Tipo</th>
                      <th className="px-4 py-2 text-left">Categoria</th>
                      <th className="px-4 py-2 text-right">Valor</th>
                      <th className="px-4 py-2 text-right">Saldo Após</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoesDia.map(tx => (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="px-4 py-2">{format(tx.data, "HH:mm")}</td>
                        <td className="px-4 py-2">{tx.descricao}</td>
                        <td className="px-4 py-2">
                          <Badge variant={tx.tipo === 'entrada' ? "outline" : "secondary"} className={tx.tipo === "entrada" ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}>
                            {tx.tipo === "entrada" ? "Entrada" : "Saída"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{tx.categoria}</td>
                        <td className={`px-4 py-2 text-right font-medium ${tx.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                          {tx.tipo === "entrada" ? "+" : "-"} R$ {tx.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-right text-blue-900">
                          R$ {tx.saldoApos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderFluxoCaixa = () => (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {dadosFluxoCaixa.totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {dadosFluxoCaixa.totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Líquido</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {dadosFluxoCaixa.saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Entradas por Categoria</CardTitle>
            <CardDescription>Distribuição das receitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosFluxoCaixa.entradasPorCategoria.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.categoria}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.percentual}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Saídas por Categoria</CardTitle>
            <CardDescription>Distribuição das despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosFluxoCaixa.saidasPorCategoria.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.categoria}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.percentual}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVendas = () => (
    <div className="space-y-6">
      {/* Cards de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas do Mês</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {dadosVendas.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta Mensal</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {dadosVendas.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">% da Meta</p>
                <p className="text-2xl font-bold text-green-600">
                  {dadosVendas.percentualMeta}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <PieChart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Vendedor */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Vendedor</CardTitle>
          <CardDescription>Vendas individuais vs. metas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dadosVendas.vendasPorVendedor.map((vendedor, index) => {
              const percentualMeta = (vendedor.vendas / vendedor.meta) * 100;
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{vendedor.vendedor}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              percentualMeta >= 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(percentualMeta, 100)}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant={percentualMeta >= 100 ? "default" : "secondary"}>
                        {percentualMeta.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <p className="font-semibold">
                      R$ {vendedor.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Meta: R$ {vendedor.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContasPagar = () => (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Contas a Pagar</CardTitle>
        <CardDescription>Análise detalhada das obrigações financeiras</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Relatório específico de contas a pagar em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );

  const renderContasReceber = () => (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Contas a Receber</CardTitle>
        <CardDescription>Análise detalhada dos recebimentos</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Relatório específico de contas a receber em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );

  const renderDespesasCategoria = () => (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
        <CardDescription>Classificação detalhada dos gastos</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Relatório de despesas por categoria em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );

  const renderInadimplencia = () => (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Inadimplência</CardTitle>
        <CardDescription>Contas em atraso e análise de risco</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Relatório de inadimplência em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );

  const renderRelatorio = () => {
    switch (tipoRelatorio) {
      case "extrato":
        return renderExtrato();
      case "fluxo-caixa":
        return renderFluxoCaixa();
      case "vendas":
        return renderVendas();
      case "contas-pagar":
        return renderContasPagar();
      case "contas-receber":
        return renderContasReceber();
      case "despesas-categoria":
        return renderDespesasCategoria();
      case "inadimplencia":
        return renderInadimplencia();
      default:
        return renderFluxoCaixa();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">
            Análises detalhadas para tomada de decisão
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Seleção de Relatório e Período */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Relatório</label>
          <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {relatoriosDisponiveis.map(rel => (
                <SelectItem key={rel.id} value={rel.id}>
                  <div className="flex items-center gap-2">
                    <rel.icon className="h-4 w-4" />
                    {rel.nome}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {tipoRelatorio !== "extrato" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes-atual">Mês Atual</SelectItem>
                <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
                <SelectItem value="3-meses">Últimos 3 Meses</SelectItem>
                <SelectItem value="6-meses">Últimos 6 Meses</SelectItem>
                <SelectItem value="ano-atual">Ano Atual</SelectItem>
                <SelectItem value="ano-anterior">Ano Anterior</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Grid de Tipos de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatoriosDisponiveis.map((relatorio) => (
          <Card 
            key={relatorio.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              tipoRelatorio === relatorio.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setTipoRelatorio(relatorio.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-${relatorio.cor}-100`}>
                  <relatorio.icon className={`h-6 w-6 text-${relatorio.cor}-600`} />
                </div>
                <div>
                  <h3 className="font-semibold">{relatorio.nome}</h3>
                  <p className="text-sm text-muted-foreground">{relatorio.descricao}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conteúdo do Relatório Selecionado */}
      {renderRelatorio()}
    </div>
  );
}
