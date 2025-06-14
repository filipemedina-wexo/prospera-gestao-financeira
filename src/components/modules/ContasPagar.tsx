
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'parcial';
  fornecedor: string;
  categoria: string;
  numeroDocumento?: string;
  dataPagamento?: Date;
  formaPagamento?: string;
}

const categorias = [
  "Despesas Fixas",
  "Despesas Variáveis", 
  "Despesas Administrativas",
  "Despesas Operacionais",
  "Marketing",
  "Custos de Mercadoria",
  "Despesas Financeiras"
];

const formasPagamento = [
  "Boleto",
  "Transferência",
  "Cartão de Crédito",
  "PIX",
  "Dinheiro",
  "Cheque"
];

export function ContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([
    {
      id: "1",
      descricao: "Aluguel do Escritório",
      valor: 2500.00,
      dataVencimento: new Date(2024, 5, 15),
      status: "atrasado",
      fornecedor: "Imobiliária Silva",
      categoria: "Despesas Fixas",
      numeroDocumento: "BOL-001"
    },
    {
      id: "2", 
      descricao: "Fornecedor ABC - Material",
      valor: 1200.00,
      dataVencimento: new Date(2024, 5, 16),
      status: "pendente",
      fornecedor: "ABC Materiais",
      categoria: "Custos de Mercadoria",
      numeroDocumento: "NF-12345"
    },
    {
      id: "3",
      descricao: "Conta de Luz",
      valor: 450.75,
      dataVencimento: new Date(2024, 5, 20),
      status: "pago",
      fornecedor: "Eletropaulo",
      categoria: "Despesas Operacionais",
      numeroDocumento: "FAT-789",
      dataPagamento: new Date(2024, 5, 18),
      formaPagamento: "PIX"
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    dataVencimento: undefined as Date | undefined,
    fornecedor: "",
    categoria: "",
    numeroDocumento: "",
    observacoes: ""
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { variant: "secondary" as const, label: "Pendente", icon: Clock },
      pago: { variant: "default" as const, label: "Pago", icon: CheckCircle },
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

  const contasFiltradas = contas.filter(conta => {
    const matchStatus = filtroStatus === "todos" || conta.status === filtroStatus;
    const matchCategoria = filtroCategoria === "todas" || conta.categoria === filtroCategoria;
    const matchBusca = busca === "" || 
      conta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      conta.fornecedor.toLowerCase().includes(busca.toLowerCase());
    
    return matchStatus && matchCategoria && matchBusca;
  });

  const totalPendente = contas
    .filter(c => c.status === 'pendente' || c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaConta: ContaPagar = {
      id: Date.now().toString(),
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      dataVencimento: formData.dataVencimento!,
      status: 'pendente',
      fornecedor: formData.fornecedor,
      categoria: formData.categoria,
      numeroDocumento: formData.numeroDocumento || undefined
    };
    
    setContas([...contas, novaConta]);
    setShowDialog(false);
    
    // Reset form
    setFormData({
      descricao: "",
      valor: "",
      dataVencimento: undefined,
      fornecedor: "",
      categoria: "",
      numeroDocumento: "",
      observacoes: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contas a Pagar</h2>
          <p className="text-muted-foreground">
            Gerencie suas obrigações financeiras e evite atrasos
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Pagar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Conta a Pagar</DialogTitle>
              <DialogDescription>
                Cadastre uma nova obrigação financeira da sua empresa
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição da Despesa *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Ex: Aluguel do escritório"
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
                  <Label htmlFor="fornecedor">Fornecedor/Credor *</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
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
                  <Label htmlFor="numeroDocumento">Número do Documento</Label>
                  <Input
                    id="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
                    placeholder="NF, Boleto, etc."
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
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Cadastrar Conta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total a Pagar</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
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
                  {contas.filter(c => c.status === 'atrasado').length}
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
                <p className="text-sm font-medium text-muted-foreground">Contas Pagas</p>
                <p className="text-2xl font-bold text-green-600">
                  {contas.filter(c => c.status === 'pago').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
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
                  placeholder="Buscar por descrição ou fornecedor..."
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
                <SelectItem value="pago">Pago</SelectItem>
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
          <CardTitle>Lista de Contas a Pagar</CardTitle>
          <CardDescription>
            {contasFiltradas.length} conta(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasFiltradas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.descricao}</TableCell>
                  <TableCell>{conta.fornecedor}</TableCell>
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
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
                      {conta.status === 'pendente' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Pagar
                        </Button>
                      )}
                    </div>
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
