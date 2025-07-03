import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  CreditCard,
  PiggyBank,
  FileText,
  List,
  TrendingUp,
  PieChart
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";

import { RelatorioExtrato } from "./relatorios/RelatorioExtrato";
import { RelatorioFluxoCaixa } from "./relatorios/RelatorioFluxoCaixa";
import { RelatorioVendas } from "./relatorios/RelatorioVendas";
import { RelatorioContasPagar } from "./relatorios/RelatorioContasPagar";
import { RelatorioContasReceber } from "./relatorios/RelatorioContasReceber";
import { RelatorioDespesasCategoria } from "./relatorios/RelatorioDespesasCategoria";
import { RelatorioInadimplencia } from "./relatorios/RelatorioInadimplencia";

import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { accountsPayableService } from "@/services/accountsPayableService";
import { accountsReceivableService } from "@/services/accountsReceivableService";
import { ContaPagar } from "./contas-pagar/types";
import { ContaReceber } from "./contas-receber/types";
import { Skeleton } from "../ui/skeleton";

export function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState("fluxo-caixa");
  const [extratoPeriodoInicio, setExtratoPeriodoInicio] = useState<Date | undefined>(subDays(new Date(), 15));
  const [extratoPeriodoFim, setExtratoPeriodoFim] = useState<Date | undefined>(new Date());
  
  const { currentClientId } = useMultiTenant();

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
  
  const contasAPagar: ContaPagar[] = useMemo(() => (contasPagarData || []).map(c => {
    const statusMapping = {
      'pending': 'pendente',
      'paid': 'pago', 
      'overdue': 'atrasado',
      'partial': 'parcial'
    } as const;

    return {
      ...c,
      dataVencimento: new Date(c.due_date),
      valor: c.amount,
      descricao: c.description,
      categoria: c.category || '',
      fornecedor: '',
      status: statusMapping[c.status] || 'pendente',
      dataPagamento: c.paid_date ? new Date(c.paid_date) : undefined,
    };
  }), [contasPagarData]);
  
  const contasAReceber: ContaReceber[] = useMemo(() => (contasReceberData || []).map(c => {
    const statusMapping = {
      'pending': 'pendente',
      'received': 'recebido',
      'overdue': 'atrasado', 
      'partial': 'parcial'
    } as const;

    return {
      ...c,
      dataVencimento: new Date(c.due_date),
      valor: c.amount,
      descricao: c.description,
      categoria: c.category || '',
      cliente: '',
      status: statusMapping[c.status] || 'pendente',
      dataRecebimento: c.received_date ? new Date(c.received_date) : undefined,
    };
  }), [contasReceberData]);

  // Calcula os dados para o Relatório de Fluxo de Caixa
  const dadosFluxoCaixa = useMemo(() => {
    const totalEntradas = contasAReceber.filter(c => c.status === 'recebido').reduce((sum, c) => sum + c.valor, 0);
    const totalSaidas = contasAPagar.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.valor, 0);

    const entradasPorCategoria = contasAReceber.filter(c => c.status === 'recebido').reduce((acc, c) => {
        const cat = c.categoria || 'Outras';
        acc[cat] = (acc[cat] || 0) + c.valor;
        return acc;
    }, {} as Record<string, number>);

    const saidasPorCategoria = contasAPagar.filter(c => c.status === 'pago').reduce((acc, c) => {
        const cat = c.categoria || 'Outras';
        acc[cat] = (acc[cat] || 0) + c.valor;
        return acc;
    }, {} as Record<string, number>);

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido: totalEntradas - totalSaidas,
      entradasPorCategoria: Object.entries(entradasPorCategoria).map(([categoria, valor]) => ({ categoria, valor, percentual: totalEntradas > 0 ? (valor / totalEntradas) * 100 : 0 })),
      saidasPorCategoria: Object.entries(saidasPorCategoria).map(([categoria, valor]) => ({ categoria, valor, percentual: totalSaidas > 0 ? (valor / totalSaidas) * 100 : 0 })),
    }
  }, [contasAReceber, contasAPagar]);
  
  const dadosVendas = {
    totalVendas: 38200.00,
    metaMensal: 50000.00,
    percentualMeta: 76,
    vendasPorVendedor: [],
  };

  const relatoriosDisponiveis = [
    { id: "fluxo-caixa", nome: "Fluxo de Caixa", icon: DollarSign },
    { id: "contas-pagar", nome: "Contas a Pagar", icon: CreditCard },
    { id: "contas-receber", nome: "Contas a Receber", icon: PiggyBank },
    { id: "vendas", nome: "Relatório de Vendas", icon: TrendingUp },
    { id: "despesas-categoria", nome: "Despesas por Categoria", icon: PieChart },
    { id: "inadimplencia", nome: "Relatório de Inadimplência", icon: FileText },
    { id: "extrato", nome: "Extrato", icon: List }
  ];

  const renderRelatorio = () => {
    if (isLoadingPagar || isLoadingReceber) {
      return <Skeleton className="h-96 w-full" />;
    }
    
    switch (tipoRelatorio) {
      case "extrato": return <RelatorioExtrato extratoPeriodoInicio={extratoPeriodoInicio} extratoPeriodoFim={extratoPeriodoFim} setExtratoPeriodoInicio={setExtratoPeriodoInicio} setExtratoPeriodoFim={setExtratoPeriodoFim} contasAReceber={contasAReceber} contasAPagar={contasAPagar} />;
      case "fluxo-caixa": return <RelatorioFluxoCaixa dados={dadosFluxoCaixa} />;
      case "vendas": return <RelatorioVendas dados={dadosVendas} />;
      case "contas-pagar": return <RelatorioContasPagar contas={contasAPagar} />;
      case "contas-receber": return <RelatorioContasReceber contas={contasAReceber} />;
      case "despesas-categoria": return <RelatorioDespesasCategoria />;
      case "inadimplencia": return <RelatorioInadimplencia />;
      default: return <RelatorioFluxoCaixa dados={dadosFluxoCaixa} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">Análises detalhadas para tomada de decisão</p>
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
                  <div className="flex items-center gap-2"><rel.icon className="h-4 w-4" />{rel.nome}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {renderRelatorio()}
    </div>
  );
}
