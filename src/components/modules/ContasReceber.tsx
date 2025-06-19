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
import { useToast } from "@/hooks/use-toast";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { accountsReceivableService } from "@/services/accountsReceivableService";
import { financialClientsService } from "@/services/financialClientsService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ContasReceberTable } from "./contas-receber/ContasReceberTable";
import { NovaContaReceberDialog } from "./contas-receber/NovaContaReceberDialog";
import { ContasReceberFilters } from "./contas-receber/ContasReceberFilters";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const categorias = [ "Vendas de Produtos", "Vendas de Serviços", "Receitas Financeiras", "Outras Receitas", "Mensalidades", "Assinaturas" ];

export function ContasReceber() {
  const { toast } = useToast();
  const { currentClientId, loading: clientLoading } = useMultiTenant();
  const queryClient = useQueryClient();
  
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<ContaReceber | null>(null);
  const [contaParaRemover, setContaParaRemover] = useState<ContaReceber | null>(null);

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
          return accountsReceivableService.update(conta.id, { ...payload, status: conta.status });
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
    onError: (error) => {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });


  const todasContas: ContaReceber[] = (contasDatabase || []).map(conta => ({
    id: conta.id,
    descricao: conta.description,
    valor: conta.amount,
    dataVencimento: new Date(conta.due_date),
    status: conta.status as 'pendente' | 'recebido' | 'atrasado' | 'parcial',
    cliente: conta.financial_client_id || 'Não informado',
    categoria: conta.category || 'Geral',
    numeroFatura: '',
    dataRecebimento: conta.received_date ? new Date(conta.received_date) : undefined,
    observacoes: undefined,
  }));

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { variant: "secondary" as const, label: "Pendente", icon: Clock },
      recebido: { variant: "default" as const, label: "Recebido", icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      atrasado: { variant: "destructive" as const, label: "Atrasado", icon: AlertCircle },
      parcial: { variant: "outline" as const, label: "Parcial", icon: DollarSign }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null; // Prevenção de erro
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={cn("flex items-center gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const contasFiltradas = todasContas.filter(conta => {
    const matchStatus = filtroStatus === "todos" || conta.status === filtroStatus;
    const matchCategoria = filtroCategoria === "todas" || conta.categoria === filtroCategoria;
    const matchBusca = busca === "" || 
      conta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (conta.cliente && conta.cliente.toLowerCase().includes(busca.toLowerCase()));
    
    return matchStatus && matchCategoria && matchBusca;
  });

  const totalReceber = todasContas
    .filter(c => c.status === 'pendente' || c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const totalRecebido = todasContas
    .filter(c => c.status === 'recebido')
    .reduce((sum, c) => sum + c.valor, 0);
  
  const resetForm = () => {
    setFormData({
      descricao: "",
      valor: "",
      dataVencimento: undefined,
      cliente: "",
      categoria: "",
      numeroFatura: "",
      observacoes: ""
    });
    setContaParaEditar(null);
  }

  const handleOpenCreateDialog = () => {
    resetForm();
    setShowFormDialog(true);
  }

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
  
  const isLoading = clientLoading || isLoadingContas || isLoadingClientes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas a Receber</h2>
          <p className="text-muted-foreground">Gerencie suas receitas e controle a inadimplência</p>
        </div>
        <Dialog open={showFormDialog} onOpenChange={(isOpen) => {
            if (!isOpen) setContaParaEditar(null);
            setShowFormDialog(isOpen);
          }}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateDialog}><Plus className="mr-2 h-4 w-4" />Nova Conta a Receber</Button>
          </DialogTrigger>
          <NovaContaReceberDialog
              open={showFormDialog}
              onOpenChange={setShowFormDialog}
              onSubmit={(values) => upsertMutation(values)}
              contaToEdit={contaParaEditar}
              clientes={clientes || []}
              categorias={categorias}
          />
        </Dialog>
      </div>

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
                onReceber={(conta) => markAsReceivedMutation(conta)} 
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
