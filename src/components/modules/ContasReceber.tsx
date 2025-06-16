
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
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ContaReceber } from "./contas-receber/types";
import { useToast } from "@/hooks/use-toast";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { accountsReceivableService } from "@/services/accountsReceivableService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ContasReceberProps {
  contas: ContaReceber[];
  setContas: React.Dispatch<React.SetStateAction<ContaReceber[]>>;
}

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

export function ContasReceber({ contas, setContas }: ContasReceberProps) {
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

  // Form state
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    dataVencimento: undefined as Date | undefined,
    cliente: "",
    categoria: "",
    numeroFatura: "",
    observacoes: ""
  });

  // Buscar contas do banco de dados se temos um cliente ativo
  const { data: contasDatabase, isLoading } = useQuery({
    queryKey: ['accounts-receivable', currentClientId],
    queryFn: () => currentClientId ? accountsReceivableService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId && !clientLoading,
  });

  // Use only database data, no more mock data
  const todasContas = (contasDatabase || []).map(conta => ({
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
      recebido: { variant: "default" as const, label: "Recebido", icon: CheckCircle },
      atrasado: { variant: "destructive" as const, label: "Atrasado", icon: AlertCircle },
      parcial: { variant: "outline" as const, label: "Parcial", icon: DollarSign }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
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
      conta.cliente.toLowerCase().includes(busca.toLowerCase());
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentClientId) {
      toast({
        title: "Erro",
        description: "Nenhum cliente ativo encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (contaParaEditar) {
        // Atualizar conta existente
        await accountsReceivableService.update(contaParaEditar.id, {
          description: formData.descricao,
          amount: parseFloat(formData.valor),
          due_date: format(formData.dataVencimento!, 'yyyy-MM-dd'),
          category: formData.categoria,
        });
        toast({ title: "Conta atualizada!", description: `A conta "${formData.descricao}" foi atualizada.`});
      } else {
        // Criar conta nova
        await accountsReceivableService.create({
          description: formData.descricao,
          amount: parseFloat(formData.valor),
          due_date: format(formData.dataVencimento!, 'yyyy-MM-dd'),
          status: 'pending',
          category: formData.categoria,
        });
        toast({ title: "Conta criada!", description: `A conta "${formData.descricao}" foi adicionada.`});
      }
      
      // Recarregar dados
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });
      setShowFormDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conta a receber.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmarRecebimento = async () => {
    if (!contaParaReceber || !dataRecebimento || !formaRecebimento || !currentClientId) return;

    try {
      await accountsReceivableService.markAsReceived(
        contaParaReceber.id, 
        format(dataRecebimento, 'yyyy-MM-dd')
      );
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });

      toast({ title: "Recebimento confirmado!", description: `A conta "${contaParaReceber.descricao}" foi marcada como recebida.`});

      setShowReceberDialog(false);
      setContaParaReceber(null);
      setDataRecebimento(new Date());
      setFormaRecebimento("");
    } catch (error) {
      console.error('Error marking as received:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar recebimento.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmarRemocao = async () => {
    if (!contaParaRemover || !currentClientId) return;
    
    try {
      await accountsReceivableService.delete(contaParaRemover.id);
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable', currentClientId] });
      
      toast({ title: "Conta removida!", description: `A conta "${contaParaRemover.descricao}" foi removida.`, variant: 'destructive' });
      setShowDeleteDialog(false);
      setContaParaRemover(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conta a receber.",
        variant: "destructive",
      });
    }
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
              <DialogDescription>
                {contaParaEditar ? 'Altere os dados da receita.' : 'Cadastre uma nova receita esperada da sua empresa.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição da Receita *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Ex: Venda de produto X"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Vencimento *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal w-full",
                          !formData.dataVencimento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dataVencimento ? (
                          format(formData.dataVencimento, "dd/MM/yyyy")
                        ) : (
                          "Selecione a data"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dataVencimento}
                        onSelect={(date) => setFormData({...formData, dataVencimento: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente/Devedor *</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    placeholder="Nome da empresa ou pessoa"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select 
                    value={formData.categoria} 
                    onValueChange={(value) => setFormData({...formData, categoria: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroFatura">Número da Fatura</Label>
                  <Input
                    id="numeroFatura"
                    value={formData.numeroFatura}
                    onChange={(e) => setFormData({...formData, numeroFatura: e.target.value})}
                    placeholder="FAT, NF, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>

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

      {/* Resumo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total a Receber</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <p className="text-sm font-medium text-muted-foreground">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <p className="text-sm font-medium text-muted-foreground">Contas Atrasadas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {todasContas.filter(c => c.status === 'atrasado').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Recebimento</p>
                <p className="text-2xl font-bold text-purple-600">
                  {todasContas.length > 0 ? Math.round((todasContas.filter(c => c.status === 'recebido').length / todasContas.length) * 100) : 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou cliente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Categorias</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contas a Receber</CardTitle>
          <CardDescription>
            {contasFiltradas.length} conta(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.descricao}</TableCell>
                  <TableCell>{conta.cliente}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{conta.categoria}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {format(conta.dataVencimento, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{getStatusBadge(conta.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(conta)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      {(conta.status === 'pendente' || conta.status === 'atrasado') && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => {
                          setContaParaReceber(conta);
                          setShowReceberDialog(true);
                        }}>
                          Receber
                        </Button>
                      )}
                       <Button size="sm" variant="destructive" onClick={() => {
                          setContaParaRemover(conta);
                          setShowDeleteDialog(true);
                        }}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Confirmar Recebimento */}
      <AlertDialog open={showReceberDialog} onOpenChange={setShowReceberDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Recebimento</AlertDialogTitle>
            {contaParaReceber && (
              <AlertDialogDescription>
                Você está confirmando o recebimento da conta "{contaParaReceber.descricao}" no valor de R$ {contaParaReceber.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Forma de Recebimento *</Label>
              <Select required value={formaRecebimento} onValueChange={setFormaRecebimento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma" />
                </SelectTrigger>
                <SelectContent>
                  {formasRecebimento.map(forma => (
                    <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data de Recebimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !dataRecebimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataRecebimento ? (
                      format(dataRecebimento, "dd/MM/yyyy")
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataRecebimento}
                    onSelect={setDataRecebimento}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReceberDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarRecebimento} disabled={!dataRecebimento || !formaRecebimento}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Confirmar Remoção */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja remover a conta "{contaParaRemover?.descricao}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarRemocao} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
