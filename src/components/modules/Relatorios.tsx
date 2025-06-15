
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
import { RelatorioExtrato } from "./relatorios/RelatorioExtrato";
import { RelatorioFluxoCaixa } from "./relatorios/RelatorioFluxoCaixa";
import { RelatorioVendas } from "./relatorios/RelatorioVendas";
import { RelatorioContasPagar } from "./relatorios/RelatorioContasPagar";
import { RelatorioContasReceber } from "./relatorios/RelatorioContasReceber";
import { RelatorioDespesasCategoria } from "./relatorios/RelatorioDespesasCategoria";
import { RelatorioInadimplencia } from "./relatorios/RelatorioInadimplencia";
import { useAppData } from "@/hooks/useAppData";

export function Relatorios() {
  const { contasAReceber, contasAPagar } = useAppData();
  const [tipoRelatorio, setTipoRelatorio] = useState("fluxo-caixa");
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes-atual");
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

  const renderRelatorio = () => {
    switch (tipoRelatorio) {
      case "extrato":
        return (
          <RelatorioExtrato
            extratoPeriodoInicio={extratoPeriodoInicio}
            extratoPeriodoFim={extratoPeriodoFim}
            setExtratoPeriodoInicio={setExtratoPeriodoInicio}
            setExtratoPeriodoFim={setExtratoPeriodoFim}
            contasAReceber={contasAReceber}
            contasAPagar={contasAPagar}
          />
        );
      case "fluxo-caixa":
        return <RelatorioFluxoCaixa dados={dadosFluxoCaixa} />;
      case "vendas":
        return <RelatorioVendas dados={dadosVendas} />;
      case "contas-pagar":
        return <RelatorioContasPagar contas={contasAPagar} />;
      case "contas-receber":
        return <RelatorioContasReceber contas={contasAReceber} />;
      case "despesas-categoria":
        return <RelatorioDespesasCategoria />;
      case "inadimplencia":
        return <RelatorioInadimplencia />;
      default:
        return <RelatorioFluxoCaixa dados={dadosFluxoCaixa} />;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatoriosDisponiveis.map((relatorio) => (
          <Card
            key={relatorio.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${tipoRelatorio === relatorio.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
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
      {renderRelatorio()}
    </div>
  );
}
