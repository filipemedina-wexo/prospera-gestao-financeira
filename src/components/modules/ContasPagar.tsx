
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isPast, parseISO } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

export function ContasPagar() {
  const { toast } = useToast();
  const { currentClientId, loading: clientLoading } = useMultiTenant();
  const queryClient = useQueryClient();
  
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroCompetencia, setFiltroCompetencia] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [showNovaContaDialog, setShowNovaContaDialog] = useState(false);
  const [showPagamentoDialog, setShowPagamentoDialog] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<ContaPagar | null>(null);
  const [contaParaRemover, setContaParaRemover] = useState<ContaPagar | null>(null);
  const [contaParaPagar, setContaParaPagar] = useState<ContaPagar | null>(null);

  const { data: contasDatabase, isLoading } = useQuery({
    queryKey: ['accounts-payable', currentClientId],
    queryFn: () => currentClientId ? accountsPayableService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId && !clientLoading,
  });

  const { mutate: upsertMutation } = useMutation({
    mutationFn: (conta: Partial<ContaPagar>) => {
        const frontendToDbStatusMap: Record<ContaPagar['status'], string> = {
          pendente: 'pending',
          pago: 'paid',
          atrasado: 'overdue', 
          parcial: 'partial'
        };
        
        const payload: any = { 
          description: conta.descricao!, 
          amount: conta.valor!, 
          due_date: format(conta.dataVencimento!, 'yyyy-MM-dd'), 
          category: conta.categoria, 
          financial_client_id: conta.fornecedorId 
        };
        
        if (conta.id) {
          const dbStatus = conta.status ? frontendToDbStatusMap[conta.status] : undefined;
          return accountsPayableService.update(conta.id, {...payload, status: dbStatus});
        }
        return accountsPayableService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable', currentClientId] });
      setShowNovaContaDialog(false);
      setContaParaEditar(null);
      toast({ title: `Conta ${contaParaEditar ? 'atualizada' : 'criada'} com sucesso!` });
    },
    onError: (error: any) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });
  
  const { mutate: deleteMutation } = useMutation({
    mutationFn: (id: string) => accountsPayableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable', currentClientId] });
      setContaParaRemover(null);
      toast({ title: "Conta removida com sucesso!" });
    },
    onError: (error: any) => toast({ title: "Erro ao remover", description: error.message, variant: "destructive" })
  });

  const { mutate: markAsPaidMutation } = useMutation({
    mutationFn: (data: { contaId: string; paidDate: string }) => 
      accountsPayableService.markAsPaid(data.contaId, data.paidDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable', currentClientId] });
      setShowPagamentoDialog(false);
      setContaParaPagar(null);
      toast({ title: 'Pagamento registrado com sucesso!' });
    },
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const dadosProcessados = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todasContas = (contasDatabase || []).map((conta): ContaPagar => {
      const dataVencimento = parseISO(conta.due_date);
      // Map database status to frontend status
      const statusMap: Record<string, ContaPagar['status']> = {
        pending: 'pendente',
        paid: 'pago', 
        overdue: 'atrasado',
        partial: 'parcial'
      };
      
      let status = statusMap[conta.status] || 'pendente';
      if (status === 'pendente' && isPast(dataVencimento) && !isToday(dataVencimento)) {
        status = 'atrasado';
      }
      return {
        id: conta.id, descricao: conta.description, valor: conta.amount, dataVencimento, status,
        fornecedor: conta.financial_clients?.name || 'Não informado',
        fornecedorId: conta.financial_client_id || '',
        categoria: conta.category || 'Geral',
        competencia: format(dataVencimento, 'MM/yyyy'),
      };
    });
    const contasFiltradas = todasContas.filter(c => 
        (filtroStatus === 'todos' || c.status === filtroStatus) &&
        (filtroCategoria === 'todas' || c.categoria === filtroCategoria) &&
        (filtroCompetencia === 'todas' || c.competencia === filtroCompetencia) &&
        (busca === '' || c.descricao.toLowerCase().includes(busca.toLowerCase()) || c.fornecedor.toLowerCase().includes(busca.toLowerCase()))
    );
    const summary = {
      totalAPagar: todasContas.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((sum, c) => sum + c.valor, 0),
      contasAtrasadas: todasContas.filter(c => c.status === 'atrasado').length,
      contasPagas: todasContas.filter(c => c.status === 'pago').length,
    };
    return { contasFiltradas, summary };
  }, [contasDatabase, filtroStatus, filtroCategoria, filtroCompetencia, busca]);

  const handleEditConta = (conta: ContaPagar) => {
    setContaParaEditar(conta);
    setShowNovaContaDialog(true);
  };
  
  const handleConfirmarRemocao = () => {
    if (contaParaRemover) deleteMutation(contaParaRemover.id);
  };

  const handleAbrirDialogPagamento = (conta: ContaPagar) => {
    setContaParaPagar(conta);
    setShowPagamentoDialog(true);
  };

  const handleConfirmarPagamento = (dataPagamento: Date) => {
    if (!contaParaPagar) return;
    markAsPaidMutation({
      contaId: contaParaPagar.id,
      paidDate: format(dataPagamento, 'yyyy-MM-dd')
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Contas a Pagar</h2><p className="text-muted-foreground">Gerencie suas obrigações financeiras e evite atrasos</p></div>
        <NovaContaDialog
          open={showNovaContaDialog}
          onOpenChange={(isOpen) => {
            if (!isOpen) setContaParaEditar(null);
            setShowNovaContaDialog(isOpen);
          }}
          onSubmit={(values: any) => upsertMutation(values)}
          contaToEdit={contaParaEditar}
        />
      </div>

      <RegistrarPagamentoDialog
        open={showPagamentoDialog}
        onOpenChange={setShowPagamentoDialog}
        onConfirm={handleConfirmarPagamento}
      />

      {isLoading ? <Skeleton className="h-24 w-full" /> : <ContasPagarSummary {...dadosProcessados.summary} />}
      <ContasPagarFilters 
        busca={busca} 
        setBusca={setBusca} 
        filtroStatus={filtroStatus} 
        setFiltroStatus={setFiltroStatus} 
        filtroCategoria={filtroCategoria} 
        setFiltroCategoria={setFiltroCategoria}
        filtroCompetencia={filtroCompetencia}
        setFiltroCompetencia={setFiltroCompetencia}
      />
      {isLoading ? <Skeleton className="h-64 w-full" /> : <ContasPagarTable contas={dadosProcessados.contasFiltradas} onAbrirDialogPagamento={handleAbrirDialogPagamento} onEdit={handleEditConta} onDelete={(id) => setContaParaRemover({id} as ContaPagar)} />}

      <AlertDialog open={!!contaParaRemover} onOpenChange={() => setContaParaRemover(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação irá remover permanentemente a conta.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleConfirmarRemocao}>Confirmar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
