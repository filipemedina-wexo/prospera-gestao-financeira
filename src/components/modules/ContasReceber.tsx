
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { format, isToday, isPast, parseISO } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ContaReceber } from "./contas-receber/types";
import { mapFrontendReceivableToDatabase, mapDatabaseReceivableToFrontend } from "@/utils/statusMappings";
import { useToast } from "@/hooks/use-toast";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { accountsReceivableService } from "@/services/accountsReceivableService";
import { financialClientsService } from "@/services/financialClientsService";
import { bankAccountsService } from "@/services/bankAccountsService";
import type { Database } from "@/integrations/supabase/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ContasReceberTable } from "./contas-receber/ContasReceberTable";
import { NovaContaReceberDialog } from "./contas-receber/NovaContaReceberDialog";
import { ContasReceberFilters } from "./contas-receber/ContasReceberFilters";
import { Dialog } from "@/components/ui/dialog";
import { RegistrarRecebimentoDialog } from "./contas-receber/RegistrarRecebimentoDialog";

const categorias = [ "Vendas de Produtos", "Vendas de Serviços", "Receitas Financeiras", "Outras Receitas", "Mensalidades", "Assinaturas" ];

export function ContasReceber() {
  const { toast } = useToast();
  const { currentClientId, loading: clientLoading } = useMultiTenant();
  const queryClient = useQueryClient();
  
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showReceberDialog, setShowReceberDialog] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<ContaReceber | null>(null);
  const [contaParaRemover, setContaParaRemover] = useState<ContaReceber | null>(null);
  const [contaParaReceber, setContaParaReceber] = useState<ContaReceber | null>(null);

  const { data: contasDatabase, isLoading: isLoadingContas } = useQuery({
    queryKey: ['accounts-receivable', currentClientId],
    queryFn: () => currentClientId ? accountsReceivableService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });
  
  const { data: clientes, isLoading: isLoadingClientes } = useQuery({
    queryKey: ['financial-clients', currentClientId],
    queryFn: () => currentClientId ? financialClientsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const { data: bankAccounts, isLoading: isLoadingBankAccounts } = useQuery({
    queryKey: ['bank-accounts', currentClientId],
    queryFn: () => currentClientId ? bankAccountsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const { mutate: upsertMutation } = useMutation({
    mutationFn: (conta: Partial<ContaReceber>) => {
      const payload: any = {
          description: conta.descricao!,
          amount: conta.valor!,
          due_date: format(conta.dataVencimento!, 'yyyy-MM-dd'),
          category: conta.categoria,
          financial_client_id: conta.clienteId,
          competencia: conta.competencia
      };

      if (conta.id) {
          const status = conta.status ? mapFrontendReceivableToDatabase(conta.status) : undefined;
          return accountsReceivableService.update(conta.id, { ...payload, status });
      }
      return accountsReceivableService.create(payload);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });
        setShowFormDialog(false);
        setContaParaEditar(null);
        toast({ title: `Conta ${contaParaEditar ? 'atualizada' : 'criada'} com sucesso!` });
    },
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });
  
  const { mutate: deleteMutation } = useMutation({
    mutationFn: (id: string) => accountsReceivableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });
      setContaParaRemover(null);
      toast({ title: 'Conta removida com sucesso!' });
    },
    onError: (error: any) => toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' }),
  });
  
  const { mutate: markAsReceivedMutation } = useMutation({
    mutationFn: (data: { contaId: string; receivedDate: string; bankAccountId: string }) =>
      accountsReceivableService.markAsReceived(data.contaId, data.receivedDate, data.bankAccountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', currentClientId] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions', currentClientId] });
      setShowReceberDialog(false);
      toast({ title: 'Conta marcada como recebida!' });
    },
    onError: (error: any) =>
      toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const dadosProcessados = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todasContas = (contasDatabase || []).map((conta): ContaReceber => {
        const dataVencimento = parseISO(conta.due_date);
        let status = mapDatabaseReceivableToFrontend(conta.status);
        if (status === 'pendente' && isPast(dataVencimento) && !isToday(dataVencimento)) {
            status = 'atrasado';
        }

        return {
            id: conta.id,
            descricao: conta.description,
            valor: conta.amount,
            dataVencimento,
            status,
            cliente: conta.financial_clients?.name || 'Cliente não vinculado',
            clienteId: conta.financial_client_id || '',
            categoria: conta.category || 'Geral',
            competencia: (conta as any).competencia || format(dataVencimento, 'MM/yyyy'),
            dataRecebimento: conta.received_date ? parseISO(conta.received_date) : undefined,
        };
    });

    const contasFiltradas = todasContas.filter(conta => 
        (filtroStatus === "todos" || conta.status === filtroStatus) &&
        (filtroCategoria === "todas" || conta.categoria === filtroCategoria) &&
        (busca === "" || conta.descricao.toLowerCase().includes(busca.toLowerCase()) || (conta.cliente && conta.cliente.toLowerCase().includes(busca.toLowerCase())))
    );

    const summary = {
      totalAReceber: todasContas
        .filter(c => c.status === 'pendente' || c.status === 'atrasado')
        .reduce((sum, c) => sum + c.valor, 0),
      totalRecebido: todasContas
        .filter(
          c =>
            c.status === 'recebido' &&
            c.dataRecebimento &&
            c.dataRecebimento.getMonth() === today.getMonth() &&
            c.dataRecebimento.getFullYear() === today.getFullYear()
        )
        .reduce((sum, c) => sum + c.valor, 0),
      contasAtrasadas: todasContas.filter(c => c.status === 'atrasado').length,
      taxaRecebimento:
        todasContas.length > 0
          ? Math.round(
              (todasContas.filter(c => c.status === 'recebido').length / todasContas.length) * 100
            )
          : 0,
    };
    
    return { contasFiltradas, summary };
  }, [contasDatabase, filtroStatus, filtroCategoria, busca]);
  
  const handleOpenEditDialog = (conta: ContaReceber) => {
    setContaParaEditar(conta);
    setShowFormDialog(true);
  };
  
  const handleOpenCreateDialog = () => {
    setContaParaEditar(null);
    setShowFormDialog(true);
  };
  
  const handleConfirmarRemocao = () => {
    if (contaParaRemover) {
      deleteMutation(contaParaRemover.id);
    }
  };

  const handleOpenReceberDialog = (conta: ContaReceber) => {
    setContaParaReceber(conta);
    setShowReceberDialog(true);
  };
  
  const handleConfirmarRecebimento = (data: { receivedDate: Date; bankAccountId: string }) => {
    if (!contaParaReceber) return;
    markAsReceivedMutation({
      contaId: contaParaReceber.id,
      receivedDate: format(data.receivedDate, 'yyyy-MM-dd'),
      bankAccountId: data.bankAccountId
    });
  };
  
  const isLoading = clientLoading || isLoadingContas || isLoadingClientes || isLoadingBankAccounts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas a Receber</h2>
          <p className="text-muted-foreground">Gerencie suas receitas e controle a inadimplência</p>
        </div>
        <Button onClick={handleOpenCreateDialog}><Plus className="mr-2 h-4 w-4" />Nova Conta a Receber</Button>
      </div>

      <NovaContaReceberDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
          onSubmit={(values) => upsertMutation(values)}
          contaToEdit={contaParaEditar}
          clientes={clientes || []}
          categorias={categorias}
      />
      
      <RegistrarRecebimentoDialog
        open={showReceberDialog}
        onOpenChange={setShowReceberDialog}
        onConfirm={handleConfirmarRecebimento}
        conta={contaParaReceber}
        bankAccounts={bankAccounts || []}
      />

      {isLoading ? <Skeleton className="h-24 w-full" /> : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total a Receber</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-blue-600">{dadosProcessados.summary.totalAReceber.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Recebido no Mês</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{dadosProcessados.summary.totalRecebido.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Contas Atrasadas</CardTitle><AlertCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-orange-600">{dadosProcessados.summary.contasAtrasadas}</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Taxa de Recebimento</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
              <CardContent><div className="text-2xl font-bold text-purple-600">{dadosProcessados.summary.taxaRecebimento}%</div></CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <ContasReceberFilters 
            busca={busca} setBusca={setBusca}
            filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
            filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
            categorias={categorias}
          />
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : 
            <ContasReceberTable 
                contas={dadosProcessados.contasFiltradas} 
                onEdit={handleOpenEditDialog} 
                onDelete={(conta) => setContaParaRemover(conta)} 
                onReceber={handleOpenReceberDialog} 
            />}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!contaParaRemover} onOpenChange={() => setContaParaRemover(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar Remoção</AlertDialogTitle><AlertDialogDescription>Deseja remover a conta "{contaParaRemover?.descricao}"?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleConfirmarRemocao}>Remover</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
