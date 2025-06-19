import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isPast } from "date-fns";
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
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export function ContasPagar() {
  const { toast } = useToast();
  const { currentClientId, loading: clientLoading } = useMultiTenant();
  const queryClient = useQueryClient();
  
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [showNovaContaDialog, setShowNovaContaDialog] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<ContaPagar | null>(null);
  const [pagamentoDialogState, setPagamentoDialogState] = useState<{ open: boolean; contaId: string | null }>({ open: false, contaId: null });
  const [contaParaRemover, setContaParaRemover] = useState<ContaPagar | null>(null);

  const { data: contasDatabase, isLoading } = useQuery({
    queryKey: ['accounts-payable', currentClientId],
    queryFn: () => currentClientId ? accountsPayableService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId && !clientLoading,
  });

  const { mutate: upsertMutation } = useMutation({
    mutationFn: (conta: Partial<ContaPagar>) => {
        const payload: any = {
            description: conta.descricao!,
            amount: conta.valor!,
            due_date: format(conta.dataVencimento!, 'yyyy-MM-dd'),
            category: conta.categoria,
            financial_client_id: conta.fornecedorId,
        };
        if (conta.id) {
            return accountsPayableService.update(conta.id, {...payload, status: conta.status});
        }
        return accountsPayableService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable', currentClientId] });
      setShowNovaContaDialog(false);
      setContaParaEditar(null);
      toast({ title: `Conta ${contaParaEditar ? 'atualizada' : 'criada'} com sucesso!` });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  });
  
  const { mutate: deleteMutation } = useMutation({
    mutationFn: (id: string) => accountsPayableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable', currentClientId] });
      setContaParaRemover(null);
      toast({ title: "Conta removida com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    }
  });

  const dadosProcessados = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todasContas = (contasDatabase || []).map((conta): ContaPagar => {
      const dataVencimento = new Date(`${conta.due_date}T00:00:00`);
      let status = (conta.status || 'pendente') as ContaPagar['status'];
      if (status === 'pendente' && isPast(dataVencimento) && !isToday(dataVencimento)) {
        status = 'atrasado';
      }
      return {
        id: conta.id,
        descricao: conta.description,
        valor: conta.amount,
        dataVencimento: dataVencimento,
        status: status,
        fornecedor: conta.financial_clients?.name || 'Não informado',
        fornecedorId: conta.financial_client_id || '',
        categoria: conta.category || 'Geral',
        competencia: format(dataVencimento, 'MM/yyyy'),
      };
    });

    const contasFiltradas = todasContas.filter(conta => 
        (filtroStatus === "todos" || conta.status === filtroStatus) &&
        (filtroCategoria === "todas" || conta.categoria === filtroCategoria) &&
        (busca === "" || conta.descricao.toLowerCase().includes(busca.toLowerCase()) || (conta.fornecedor && conta.fornecedor.toLowerCase().includes(busca.toLowerCase())))
    );

    const summary = {
      totalAPagar: todasContas.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((sum, c) => sum + c.valor, 0),
      contasAtrasadas: todasContas.filter(c => c.status === 'atrasado').length,
      contasPagas: todasContas.filter(c => c.status === 'pago').length,
    };
    
    return { contasFiltradas, summary };
  }, [contasDatabase, filtroStatus, filtroCategoria, busca]);

  function onSubmitConta(values: z.infer<typeof formSchema>) {
    const contaPayload: Partial<ContaPagar> = {
        id: contaParaEditar?.id,
        descricao: values.descricao,
        valor: values.valor,
        dataVencimento: values.dataVencimento,
        categoria: values.categoria,
        fornecedorId: values.fornecedor,
        status: contaParaEditar?.status || 'pendente',
    };
    upsertMutation(contaPayload);
  }

  const handleEditConta = (conta: ContaPagar) => {
    setContaParaEditar(conta);
    setShowNovaContaDialog(true);
  };
  
  const handleConfirmarRemocao = () => {
    if (contaParaRemover) {
      deleteMutation(contaParaRemover.id);
    }
  };

  if (clientLoading || isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas a Pagar</h2>
          <p className="text-muted-foreground">Gerencie suas obrigações financeiras e evite atrasos</p>
        </div>
        <NovaContaDialog 
            open={showNovaContaDialog} 
            onOpenChange={(isOpen) => {
                if (!isOpen) setContaParaEditar(null);
                setShowNovaContaDialog(isOpen);
            }} 
            onSubmit={onSubmitConta} 
            contaToEdit={contaParaEditar}
        />
      </div>

      <ContasPagarSummary {...dadosProcessados.summary} />
      <ContasPagarFilters busca={busca} setBusca={setBusca} filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus} filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria} />
      <ContasPagarTable contas={dadosProcessados.contasFiltradas} onAbrirDialogPagamento={() => {}} onEdit={handleEditConta} onDelete={(id) => setContaParaRemover({id} as ContaPagar)} />

      <AlertDialog open={!!contaParaRemover} onOpenChange={() => setContaParaRemover(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação irá remover permanentemente a conta.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleConfirmarRemocao}>Confirmar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}