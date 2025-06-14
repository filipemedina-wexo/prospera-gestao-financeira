
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  BarChart3,
  PieChart
} from "lucide-react";
import { useState } from "react";

interface LinhasDRE {
  receita_bruta: number;
  deducoes_receita: number;
  receita_liquida: number;
  custo_mercadorias: number;
  lucro_bruto: number;
  despesas_vendas: number;
  despesas_administrativas: number;
  outras_despesas: number;
  resultado_operacional: number;
  despesas_financeiras: number;
  receitas_financeiras: number;
  resultado_antes_impostos: number;
  impostos: number;
  lucro_liquido: number;
}

export function DRE() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes-atual");
  const [tipoVisualizacao, setTipoVisualizacao] = useState("detalhado");

  // Dados mockados para demonstração - em produção viriam da API
  const dadosDRE: LinhasDRE = {
    receita_bruta: 125800.00,
    deducoes_receita: 8900.00,
    receita_liquida: 116900.00,
    custo_mercadorias: 45600.00,
    lucro_bruto: 71300.00,
    despesas_vendas: 12500.00,
    despesas_administrativas: 18900.00,
    outras_despesas: 3200.00,
    resultado_operacional: 36700.00,
    despesas_financeiras: 2100.00,
    receitas_financeiras: 800.00,
    resultado_antes_impostos: 35400.00,
    impostos: 5800.00,
    lucro_liquido: 29600.00
  };

  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatPercentual = (valor: number, base: number) => {
    if (base === 0) return "0.0%";
    return `${((valor / base) * 100).toFixed(1)}%`;
  };

  const getPeriodoLabel = (periodo: string) => {
    const periodos: { [key: string]: string } = {
      "mes-atual": "Junho 2024",
      "mes-anterior": "Maio 2024",
      "3-meses": "Abr-Jun 2024", 
      "6-meses": "Jan-Jun 2024",
      "ano-atual": "2024",
      "ano-anterior": "2023"
    };
    return periodos[periodo] || "Período";
  };

  const margemLiquida = (dadosDRE.lucro_liquido / dadosDRE.receita_liquida) * 100;
  const margemBruta = (dadosDRE.lucro_bruto / dadosDRE.receita_liquida) * 100;

  const linhasDREDetalhadas = [
    {
      categoria: "RECEITA BRUTA DE VENDAS",
      valor: dadosDRE.receita_bruta,
      nivel: 0,
      tipo: "receita"
    },
    {
      categoria: "(-) DEDUÇÕES DA RECEITA BRUTA",
      valor: -dadosDRE.deducoes_receita,
      nivel: 1,
      tipo: "deducao"
    },
    {
      categoria: "= RECEITA LÍQUIDA DE VENDAS",
      valor: dadosDRE.receita_liquida,
      nivel: 0,
      tipo: "subtotal",
      destaque: true
    },
    {
      categoria: "(-) CUSTO DOS PRODUTOS/SERVIÇOS VENDIDOS",
      valor: -dadosDRE.custo_mercadorias,
      nivel: 1,
      tipo: "custo"
    },
    {
      categoria: "= LUCRO BRUTO",
      valor: dadosDRE.lucro_bruto,
      nivel: 0,
      tipo: "subtotal",
      destaque: true
    },
    {
      categoria: "(-) DESPESAS OPERACIONAIS",
      valor: 0,
      nivel: 0,
      tipo: "titulo"
    },
    {
      categoria: "    Despesas com Vendas",
      valor: -dadosDRE.despesas_vendas,
      nivel: 2,
      tipo: "despesa"
    },
    {
      categoria: "    Despesas Administrativas",
      valor: -dadosDRE.despesas_administrativas,
      nivel: 2,
      tipo: "despesa"
    },
    {
      categoria: "    Outras Despesas Operacionais",
      valor: -dadosDRE.outras_despesas,
      nivel: 2,
      tipo: "despesa"
    },
    {
      categoria: "= RESULTADO OPERACIONAL",
      valor: dadosDRE.resultado_operacional,
      nivel: 0,
      tipo: "subtotal",
      destaque: true
    },
    {
      categoria: "(-) DESPESAS FINANCEIRAS LÍQUIDAS",
      valor: -(dadosDRE.despesas_financeiras - dadosDRE.receitas_financeiras),
      nivel: 1,
      tipo: "financeiro"
    },
    {
      categoria: "= RESULTADO ANTES DOS IMPOSTOS",
      valor: dadosDRE.resultado_antes_impostos,
      nivel: 0,
      tipo: "subtotal",
      destaque: true
    },
    {
      categoria: "(-) IMPOSTOS SOBRE O LUCRO",
      valor: -dadosDRE.impostos,
      nivel: 1,
      tipo: "imposto"
    },
    {
      categoria: "= LUCRO/PREJUÍZO LÍQUIDO DO PERÍODO",
      valor: dadosDRE.lucro_liquido,
      nivel: 0,
      tipo: "resultado_final",
      destaque: true
    }
  ];

  const getRowStyle = (linha: any) => {
    let classes = "";
    
    if (linha.destaque) {
      classes += "font-bold bg-slate-50 ";
    }
    
    if (linha.tipo === "resultado_final") {
      classes += linha.valor >= 0 ? "text-green-700 bg-green-50 " : "text-red-700 bg-red-50 ";
    } else if (linha.tipo === "subtotal") {
      classes += "font-semibold border-t border-b ";
    } else if (linha.nivel === 2) {
      classes += "text-sm text-muted-foreground ";
    }
    
    return classes;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">DRE - Demonstrativo de Resultado</h2>
          <p className="text-muted-foreground">
            Análise da performance econômica da empresa
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Gráficos
          </Button>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Visualização</label>
          <Select value={tipoVisualizacao} onValueChange={setTipoVisualizacao}>
            <SelectTrigger className="w-48">
              <FileText className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detalhado">Detalhado</SelectItem>
              <SelectItem value="resumido">Resumido</SelectItem>
              <SelectItem value="comparativo">Comparativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Líquida</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(dadosDRE.receita_liquida)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Bruto</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dadosDRE.lucro_bruto)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Margem: {margemBruta.toFixed(1)}%
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
                <p className="text-sm font-medium text-muted-foreground">Resultado Operacional</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(dadosDRE.resultado_operacional)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${dadosDRE.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dadosDRE.lucro_liquido)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Margem: {margemLiquida.toFixed(1)}%
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                dadosDRE.lucro_liquido >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {dadosDRE.lucro_liquido >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DRE Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            DRE - {getPeriodoLabel(periodoSelecionado)}
          </CardTitle>
          <CardDescription>
            Demonstrativo detalhado do resultado do exercício
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/3">Descrição</TableHead>
                  <TableHead className="text-right">Valor (R$)</TableHead>
                  <TableHead className="text-right">% da Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhasDREDetalhadas.map((linha, index) => (
                  <TableRow key={index} className={getRowStyle(linha)}>
                    <TableCell className={linha.tipo === "titulo" ? "font-semibold" : ""}>
                      {linha.categoria}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {linha.valor !== 0 ? formatCurrency(Math.abs(linha.valor)) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {linha.valor !== 0 && dadosDRE.receita_liquida > 0 ? 
                        formatPercentual(Math.abs(linha.valor), dadosDRE.receita_liquida) : 
                        "-"
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Análise e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Performance</CardTitle>
            <CardDescription>Principais indicadores e insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Margem Bruta</p>
                <p className="text-sm text-green-600">Indica eficiência operacional</p>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-200">
                {margemBruta.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Margem Líquida</p>
                <p className="text-sm text-blue-600">Lucratividade final</p>
              </div>
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                {margemLiquida.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-800">Despesas Operacionais</p>
                <p className="text-sm text-orange-600">% da receita líquida</p>
              </div>
              <Badge variant="outline" className="text-orange-700 border-orange-200">
                {formatPercentual(dadosDRE.despesas_vendas + dadosDRE.despesas_administrativas + dadosDRE.outras_despesas, dadosDRE.receita_liquida)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composição de Custos</CardTitle>
            <CardDescription>Distribuição percentual dos principais custos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Custo de Mercadorias</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500"
                      style={{ width: `${(dadosDRE.custo_mercadorias / dadosDRE.receita_liquida) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {formatPercentual(dadosDRE.custo_mercadorias, dadosDRE.receita_liquida)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Despesas de Vendas</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${(dadosDRE.despesas_vendas / dadosDRE.receita_liquida) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {formatPercentual(dadosDRE.despesas_vendas, dadosDRE.receita_liquida)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Despesas Administrativas</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${(dadosDRE.despesas_administrativas / dadosDRE.receita_liquida) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {formatPercentual(dadosDRE.despesas_administrativas, dadosDRE.receita_liquida)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
