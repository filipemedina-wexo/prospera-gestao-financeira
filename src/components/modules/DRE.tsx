import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  BarChart3
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { accountsPayableService } from "@/services/accountsPayableService";
import { accountsReceivableService } from "@/services/accountsReceivableService";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { subMonths, format, getYear, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "../ui/skeleton";

export function DRE() {
  const { currentClientId } = useMultiTenant();
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes-atual");

  const { data: contasPagarData, isLoading: isLoadingPagar } = useQuery({
    queryKey: ['accounts-payable', currentClientId],
    queryFn: () => accountsPayableService.getAll(),
    enabled: !!currentClientId,
  });

  const { data: contasReceberData, isLoading: isLoadingReceber } = useQuery({
    queryKey: ['accounts-receivable', currentClientId],
    queryFn: () => accountsReceivableService.getAll(),
    enabled: !!currentClientId,
  });

  const dadosDRE = useMemo(() => {
    const now = new Date();
    let inicio: Date, fim: Date;

    switch (periodoSelecionado) {
      case "mes-anterior":
        inicio = startOfMonth(subMonths(now, 1));
        fim = endOfMonth(subMonths(now, 1));
        break;
      case "ano-atual":
        inicio = startOfYear(now);
        fim = endOfYear(now);
        break;
      case "ano-anterior":
        inicio = startOfYear(subMonths(now, 12));
        fim = endOfYear(subMonths(now, 12));
        break;
      case "mes-atual":
      default:
        inicio = startOfMonth(now);
        fim = endOfMonth(now);
        break;
    }

    const contasPagarFiltradas = (contasPagarData || []).filter(c =>
      c.status === 'paid' && c.paid_date && isWithinInterval(new Date(c.paid_date), { start: inicio, end: fim })
    );

    const contasReceberFiltradas = (contasReceberData || []).filter(c =>
      c.status === 'received' && c.received_date && isWithinInterval(new Date(c.received_date), { start: inicio, end: fim })
    );

    const receitas = contasReceberFiltradas.reduce((acc, conta) => {
        const categoria = conta.category?.toLowerCase() || '';
        if (categoria.includes('venda')) acc.bruta += conta.amount;
        else if (categoria.includes('financeira')) acc.financeiras += conta.amount;
        else acc.bruta += conta.amount; // Considera outras receitas como brutas
        return acc;
    }, { bruta: 0, financeiras: 0, deducoes: 0 });

    const despesas = contasPagarFiltradas.reduce((acc, conta) => {
        const categoria = conta.category?.toLowerCase() || '';
        if (categoria.includes('custo')) acc.custo_mercadorias += conta.amount;
        else if (categoria.includes('venda')) acc.despesas_vendas += conta.amount;
        else if (categoria.includes('administrativa')) acc.despesas_administrativas += conta.amount;
        else if (categoria.includes('financeira')) acc.despesas_financeiras += conta.amount;
        else acc.outras_despesas += conta.amount; // Outras despesas operacionais
        return acc;
    }, { custo_mercadorias: 0, despesas_vendas: 0, despesas_administrativas: 0, outras_despesas: 0, despesas_financeiras: 0, impostos: 0 });

    const receitaLiquida = receitas.bruta - receitas.deducoes;
    const lucroBruto = receitaLiquida - despesas.custo_mercadorias;
    const resultadoOperacional = lucroBruto - despesas.despesas_vendas - despesas.despesas_administrativas - despesas.outras_despesas;
    const resultadoAntesImpostos = resultadoOperacional + receitas.financeiras - despesas.despesas_financeiras;
    const lucroLiquido = resultadoAntesImpostos - despesas.impostos;

    return {
      receitaLiquida,
      lucroBruto,
      resultadoOperacional,
      lucroLiquido,
      linhas: [
        { label: "Receita Operacional Bruta", valor: receitas.bruta, tipo: 'receita' },
        { label: "(-) Deduções da Receita", valor: -receitas.deducoes, tipo: 'deducao' },
        { label: "= Receita Operacional Líquida", valor: receitaLiquida, tipo: 'subtotal', destaque: true },
        { label: "(-) Custo de Mercadorias/Serviços", valor: -despesas.custo_mercadorias, tipo: 'custo' },
        { label: "= Lucro Bruto", valor: lucroBruto, tipo: 'subtotal', destaque: true },
        { label: "(-) Despesas com Vendas", valor: -despesas.despesas_vendas, tipo: 'despesa' },
        { label: "(-) Despesas Administrativas", valor: -despesas.despesas_administrativas, tipo: 'despesa' },
        { label: "(-) Outras Despesas Operacionais", valor: -despesas.outras_despesas, tipo: 'despesa' },
        { label: "= Resultado Operacional (EBITDA)", valor: resultadoOperacional, tipo: 'subtotal', destaque: true },
        { label: "(+) Receitas Financeiras", valor: receitas.financeiras, tipo: 'receita' },
        { label: "(-) Despesas Financeiras", valor: -despesas.despesas_financeiras, tipo: 'despesa' },
        { label: "= Resultado Antes dos Impostos", valor: resultadoAntesImpostos, tipo: 'subtotal' },
        { label: "(-) Impostos", valor: -despesas.impostos, tipo: 'imposto' },
        { label: "= Lucro/Prejuízo do Período", valor: lucroLiquido, tipo: 'resultado_final', destaque: true },
      ]
    };
  }, [contasPagarData, contasReceberData, periodoSelecionado]);

  const formatCurrency = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const getPeriodoLabel = (periodo: string) => {
    const now = new Date();
    const periodos: { [key: string]: string } = {
      "mes-atual": format(now, "MMMM yyyy", { locale: ptBR }),
      "mes-anterior": format(subMonths(now, 1), "MMMM yyyy", { locale: ptBR }),
      "ano-atual": format(now, "yyyy"),
      "ano-anterior": String(getYear(now) - 1)
    };
    return periodos[periodo] || "Período";
  };
  
  if (isLoadingPagar || isLoadingReceber) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2"><FileText /> DRE - Demonstrativo de Resultados</CardTitle>
                    <CardDescription>Regime de Caixa - {getPeriodoLabel(periodoSelecionado)}</CardDescription>
                </div>
                <div className="w-48">
                <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mes-atual">Mês Atual</SelectItem>
                        <SelectItem value="mes-anterior">Mês Anterior</SelectItem>
                        <SelectItem value="ano-atual">Ano Atual</SelectItem>
                        <SelectItem value="ano-anterior">Ano Anterior</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Receita Líquida</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{formatCurrency(dadosDRE.receitaLiquida)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{formatCurrency(dadosDRE.lucroBruto)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Resultado Operacional</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{formatCurrency(dadosDRE.resultadoOperacional)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle><TrendingUp className="h-4 w-4 text-green-500" /></CardHeader>
                        <CardContent><div className={`text-2xl font-bold ${dadosDRE.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(dadosDRE.lucroLiquido)}</div></CardContent>
                    </Card>
                </div>

                <Table>
                    <TableHeader><TableRow><TableHead className="w-2/3">Descrição</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {dadosDRE.linhas.map((linha, index) => (
                            <TableRow key={index} className={linha.destaque ? "font-bold bg-gray-50" : ""}>
                                <TableCell className={linha.tipo === 'resultado_final' ? 'text-lg' : ''}>{linha.label}</TableCell>
                                <TableCell className={`text-right font-mono ${linha.valor < 0 ? "text-red-600" : ""}`}>
                                    {formatCurrency(linha.valor)}
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