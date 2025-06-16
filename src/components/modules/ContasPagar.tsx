
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";

import { ContaPagar } from "./contas-pagar/types";
import { formSchema } from "./contas-pagar/config";
import { ContasPagarSummary } from "./contas-pagar/ContasPagarSummary";
import { ContasPagarFilters } from "./contas-pagar/ContasPagarFilters";
import { ContasPagarTable } from "./contas-pagar/ContasPagarTable";
import { NovaContaDialog } from "./contas-pagar/NovaContaDialog";
import { RegistrarPagamentoDialog } from "./contas-pagar/RegistrarPagamentoDialog";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { accountsPayableService } from "@/services/accountsPayableService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ContasPagarProps {
  contas: ContaPagar[];
  setContas: React.Dispatch<React.SetStateAction<ContaPagar[]>>;
}

export function ContasPagar({ contas, setContas }: ContasPagarProps) {
  const { toast } = useToast();
  const { currentClientId, loading: clientLoading } = useMultiTenant();
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroCompetencia, setFiltroCompetencia] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [showNovaContaDialog, setShowNovaContaDialog] = useState(false);
  const [pagamentoDialogState, setPagamentoDialogState] = useState<{ open: boolean; contaId: string | null }>({ open: false, contaId: null });

  // Buscar contas do banco de dados se temos um cliente ativo
  const { data: contasDatabase, isLoading } = useQuery({
    queryKey: ['accounts-payable', currentClientId],
    queryFn: () => currentClientId ? accountsPayableService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId && !clientLoading,
  });

  // Use only database data, no more mock data
  const todasContas = (contasDatabase || []).map(conta => ({
    id: conta.id,
    descricao: conta.description,
    valor: conta.amount,
    dataVencimento: new Date(conta.due_date),
    status: conta.status as 'pendente' | 'pago' | 'atrasado' | 'parcial',
    fornecedor: conta.financial_client_id || 'Não informado',
    categoria: conta.category || 'Geral',
    numeroDocumento: '',
    dataPagamento: conta.paid_date ? new Date(conta.paid_date) : undefined,
    competencia: format(new Date(conta.due_date), 'MM/yyyy'),
  }));

  const contasFiltradas = todasContas.filter(conta => {
    const matchStatus = filtroStatus === "todos" || conta.status === filtroStatus;
    const matchCategoria = filtroCategoria === "todas" || conta.categoria === filtroCategoria;
    const matchBusca = busca === "" || 
      conta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      conta.fornecedor.toLowerCase().includes(busca.toLowerCase());
    const matchCompetencia = !filtroCompetencia || (conta.competencia && conta.competencia.includes(filtroCompetencia));
    
    return matchStatus && matchCategoria && matchBusca && matchCompetencia;
  });

  async function onSubmitNovaConta(values: z.infer<typeof formSchema>) {
    if (!currentClientId) {
      toast({
        title: "Erro",
        description: "Nenhum cliente ativo encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (values.recorrente && values.frequencia && values.numParcelas) {
        // Criar múltiplas contas recorrentes
        const dataVencimentoBase = new Date(values.dataVencimento);

        const getIncrementoMeses = (frequencia: typeof values.frequencia) => {
          switch(frequencia) {
            case 'mensal': return 1;
            case 'bimestral': return 2;
            case 'trimestral': return 3;
            case 'semestral': return 6;
            case 'anual': return 12;
            default: return 0;
          }
        };

        const incremento = getIncrementoMeses(values.frequencia);

        for (let i = 0; i < values.numParcelas; i++) {
          const vencimento = new Date(dataVencimentoBase);
          vencimento.setMonth(vencimento.getMonth() + (i * incremento));
          
          const parcelaNum = i + 1;
          
          await accountsPayableService.create({
            description: `${values.descricao} (${parcelaNum}/${values.numParcelas})`,
            amount: values.valor,
            due_date: format(vencimento, 'yyyy-MM-dd'),
            status: 'pending',
            category: values.categoria,
          });
        }
        
        toast({ 
          title: "Contas recorrentes criadas!", 
          description: `${values.numParcelas} contas foram adicionadas.` 
        });
      } else {
        // Criar conta única
        await accountsPayableService.create({
          description: values.descricao,
          amount: values.valor,
          due_date: format(values.dataVencimento, 'yyyy-MM-dd'),
          status: 'pending',
          category: values.categoria,
        });
        
        toast({ title: "Conta criada com sucesso!" });
      }

      // Recarregar dados
      queryClient.invalidateQueries({ queryKey: ['accounts-payable', currentClientId] });
      setShowNovaContaDialog(false);
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta a pagar.",
        variant: "destructive",
      });
    }
  }

  const handleRegistrarPagamento = async (dataPagamento: Date) => {
    if (!pagamentoDialogState.contaId || !currentClientId) return;

    try {
      await accountsPayableService.markAsPaid(
        pagamentoDialogState.contaId, 
        format(dataPagamento, 'yyyy-MM-dd')
      );
      queryClient.invalidateQueries({ queryKey: ['accounts-payable', currentClientId] });

      setPagamentoDialogState({ open: false, contaId: null });
      toast({
        title: "Pagamento Registrado!",
        description: "A conta foi marcada como paga com sucesso.",
      });
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento.",
        variant: "destructive",
      });
    }
  };

  const handleAbrirDialogPagamento = (contaId: string) => {
    setPagamentoDialogState({ open: true, contaId });
  };

  if (clientLoading || isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas a Pagar</h2>
          <p className="text-muted-foreground">
            Gerencie suas obrigações financeiras e evite atrasos
          </p>
        </div>
        <NovaContaDialog 
            open={showNovaContaDialog} 
            onOpenChange={setShowNovaContaDialog} 
            onSubmit={onSubmitNovaConta} 
        />
      </div>

      <ContasPagarSummary contas={todasContas} />

      <ContasPagarFilters
        busca={busca} setBusca={setBusca}
        filtroCompetencia={filtroCompetencia} setFiltroCompetencia={setFiltroCompetencia}
        filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
        filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
      />
      
      <ContasPagarTable
        contas={contasFiltradas}
        onAbrirDialogPagamento={handleAbrirDialogPagamento}
      />

      <RegistrarPagamentoDialog
        open={pagamentoDialogState.open}
        onOpenChange={(open) => setPagamentoDialogState({ ...pagamentoDialogState, open })}
        onConfirm={handleRegistrarPagamento}
      />
    </div>
  );
}
