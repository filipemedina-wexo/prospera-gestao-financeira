import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Trash,
  Edit
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ContaReceber } from "./contas-receber/types";
import { useToast } from "@/hooks/use-toast";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { accountsReceivableService } from "@/services/accountsReceivableService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const categorias = [
  "Vendas de Produtos",
  "Vendas de Serviços",
  "Receitas Financeiras",
  "Outras Receitas",
  "Mensalidades",
  "Assinaturas"
];

const formasRecebimento = [
  "Boleto",
  "Transferência",
  "Cartão de Crédito",
  "PIX",
  "Dinheiro",
  "Cheque"
];

export function ContasReceber() {
  const { toast } = useToast();
  const { currentClientId, loading: clientLoading } = useMultiTenant();
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showReceberDialog, setShowReceberDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [contaParaEditar, setContaParaEditar] = useState<ContaReceber | null>(null);
  const [contaParaReceber, setContaParaReceber] = useState<ContaReceber | null>(null);
  const [contaParaRemover, setContaParaRemover] = useState<ContaReceber | null>(null);

  const [dataRecebimento, setDataRecebimento] = useState<Date | undefined>(new Date());
  const [formaRecebimento, setFormaRecebimento] = useState<string>("");

  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    dataVencimento: undefined as Date | undefined,
    cliente: "",
    categoria: "",
    numeroFatura: "",
    observacoes: ""
  });

  const { data: contasDatabase, isLoading } = useQuery({
    queryKey: ['accounts-receivable', currentClientId],
    queryFn: () => currentClientId ? accountsReceivableService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId && !clientLoading,
  });

  const upsertMutation = useMutation({
    mutationFn: (conta: Partial<ContaReceber>) => {
        if(conta.id && !conta.id.startsWith('new-')){
            return accountsReceivableService.update(conta.id, {
                description: conta.descricao,
                amount: conta.valor,
                due_date: conta.dataVencimento ? format(conta.dataVencimento, 'yyyy-MM-dd') : undefined,
                category: conta.categoria,
                financial_client_id: conta.cliente,
            });
        }
        return accountsReceivableService.create({
            description: conta.descricao!,
            amount: conta.valor!,
            due_date: conta.dataVencimento ? format(conta.dataVencimento, 'yyyy-MM-dd') : new Date().toISOString(),
            status: 'pending',
            category: conta.categoria,
            financial_client_id: conta.cliente
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });
        setShowFormDialog(false);
        toast({ title: `Conta ${contaParaEditar ? 'atualizada' : 'criada'} com sucesso!` });
    },
    onError: (error) => {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: accountsReceivableService.delete,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });
        setShowDeleteDialog(false);
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
    if (!config) return null;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className || ""}>
        <Icon className="h-3 w-3 mr-1" />
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
    setFormData({
      descricao: conta.descricao,
      valor: String(conta.valor),
      dataVencimento: conta.dataVencimento,
      cliente: conta.cliente,
      categoria: conta.categoria,
      numeroFatura: conta.numeroFatura || "",
      observacoes: conta.observacoes || ""
    });
    setShowFormDialog(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
        id: contaParaEditar?.id || `new-${Date.now()}`,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        dataVencimento: formData.dataVencimento,
        cliente: formData.cliente,
        categoria: formData.categoria,
    };
    upsertMutation.mutate(dataToSave);
  };

  const handleConfirmarRecebimento = async () => {
    if (!contaParaReceber || !dataRecebimento || !currentClientId) return;

    try {
      await accountsReceivableService.markAsReceived(
        contaParaReceber.id, 
        format(dataRecebimento, 'yyyy-MM-dd')
      );
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });
      toast({ title: "Recebimento confirmado!", description: `A conta "${contaParaReceber.descricao}" foi marcada como recebida.`});
      setShowReceberDialog(false);
    } catch (error) {
      console.error('Error marking as received:', error);
      toast({ title: "Erro", description: "Erro ao registrar recebimento.", variant: "destructive" });
    }
  };

  const handleConfirmarRemocao = () => {
    if (!contaParaRemover) return;
    deleteMutation.mutate(contaParaRemover.id);
  }

  if (clientLoading || isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas a Receber</h2>
          <p className="text-muted-foreground">
            Gerencie suas receitas e controle a inadimplência
          </p>
        </div>
        <Dialog open={showFormDialog} onOpenChange={(isOpen) => {
          setShowFormDialog(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Receber
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{contaParaEditar ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form fields here */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowFormDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {contaParaEditar ? 'Salvar Alterações' : 'Cadastrar Conta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
              <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Total a Receber</p>
                  <p className="text-2xl font-bold text-blue-600">
                  R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
              </CardContent>
          </Card>
          <Card>
              <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Recebido no Mês</p>
                  <p className="text-2xl font-bold text-green-600">
                  R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
              </CardContent>
          </Card>
          <Card>
              <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Contas Atrasadas</p>
                  <p className="text-2xl font-bold text-orange-600">
                  {todasContas.filter(c => c.status === 'atrasado').length}
                  </p>
              </CardContent>
          </Card>
          <Card>
              <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Recebimento</p>
                  <p className="text-2xl font-bold text-purple-600">
                  {todasContas.length > 0 ? Math.round((todasContas.filter(c => c.status === 'recebido').length / todasContas.length) * 100) : 0}%
                  </p>
              </CardContent>
          </Card>
      </div>
      
      {/* Tabela de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Receber</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.descricao}</TableCell>
                  <TableCell>{getStatusBadge(conta.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(conta)}>
                        <Edit className="h-4 w-4"/>
                    </Button>
                    {(conta.status === 'pendente' || conta.status === 'atrasado') && (
                      <Button size="sm" className="ml-2" onClick={() => {
                        setContaParaReceber(conta);
                        setShowReceberDialog(true);
                      }}>
                        Receber
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => {
                        setContaParaRemover(conta);
                        setShowDeleteDialog(true);
                    }}>
                        <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AlertDialog open={showReceberDialog} onOpenChange={setShowReceberDialog}>
        {/* ... conteúdo do dialog ... */}
      </AlertDialog>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                  <AlertDialogDescription>
                      Deseja realmente remover a conta "{contaParaRemover?.descricao}"?
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmarRemocao}>Remover</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
