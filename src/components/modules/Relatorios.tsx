
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
  FileText
} from "lucide-react";
import { useState } from "react";

export function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes-atual");
  const [tipoRelatorio, setTipoRelatorio] = useState("fluxo-caixa");

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
    }
  ];

  // Dados mockados para demonstração
  const dadosFluxoCaixa = {
    totalEntradas: 89340.25,
    totalSaidas: 45670.80,
    saldoLiquido: 43669.45,
    entradasPorCategoria: [
      { categoria: "Vendas de Produtos", valor: 52340.25, percentual: 58.6 },
      { categoria: "Vendas de Serviços", valor: 31000.00, percentual: 34.7 },
      { categoria: "Outras Receitas", valor: 6000.00, percentual: 6.7 }
    ],
    saidasPorCategoria: [
      { categoria: "Despesas Operacionais", valor: 18900.00, percentual: 41.4 },
      { categoria: "Custo de Mercadorias", valor: 12500.00, percentual: 27.4 },
      { categoria: "Despesas Administrativas", valor: 8970.80, percentual: 19.6 },
      { categoria: "Marketing", valor: 3200.00, percentual: 7.0 },
      { categoria: "Outras Despesas", valor: 2100.00, percentual: 4.6 }
    ]
  };

  const dadosVendas = {
    totalVendas: 83340.25,
    metaMensal: 90000.00,
    percentualMeta: 92.6,
    vendasPorVendedor: [
      { vendedor: "João Silva", vendas: 23800.00, meta: 25000.00 },
      { vendedor: "Maria Santos", vendas: 45200.00, meta: 40000.00 },
      { vendedor: "Carlos Lima", vendas: 14340.25, meta: 25000.00 }
    ],
    vendasPorProduto: [
      { produto: "Website Desenvolvimento", quantidade: 3, valor: 36000.00 },
      { produto: "Consultoria Marketing", quantidade: 5, valor: 25500.00 },
      { produto: "Sistema CRM", quantidade: 2, valor: 21840.25 }
    ]
  };

  const renderRelatorio = () => {
    switch (tipoRelatorio) {
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
