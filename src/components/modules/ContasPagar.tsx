import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  competencia?: string; // "MM/YYYY"
  recorrente?: boolean;
  frequencia?: 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  numParcelas?: number;
  parcelaAtual?: number;
  idGrupoRecorrencia?: string;
}

const formSchema = z.object({
  descricao: z.string().min(1, { message: "Descrição é obrigatória." }),
  valor: z.preprocess(
    (a) => parseFloat(String(a).replace(",", ".")),
    z.number().positive({ message: "O valor deve ser positivo." })
  ),
  dataVencimento: z.date({ required_error: "Data de vencimento é obrigatória." }),
  fornecedor: z.string().min(1, "Fornecedor é obrigatório."),
  categoria: z.string({ required_error: "Categoria é obrigatória." }).min(1, "Categoria é obrigatória."),
  numeroDocumento: z.string().optional(),
  observacoes: z.string().optional(),
  competencia: z.string().regex(/^(|\d{2}\/\d{4})$/, "Formato inválido (MM/AAAA)").optional(),
  recorrente: z.boolean().default(false),
  frequencia: z.enum(['mensal', 'bimestral', 'trimestral', 'semestral', 'anual']).optional(),
  numParcelas: z.preprocess(
    (a) => a ? parseInt(String(a), 10) : undefined,
    z.number().int().positive().optional()
  ),
}).superRefine((data, ctx) => {
    if (data.recorrente) {
        if (!data.frequencia) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["frequencia"],
                message: "Frequência é obrigatória para contas recorrentes.",
            });
        }
        if (!data.numParcelas || data.numParcelas <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["numParcelas"],
                message: "Número de parcelas é obrigatório.",
            });
        }
    }
});

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

const opcoesFrequencia = [
    { value: 'mensal' as const, label: 'Mensal' },
    { value: 'bimestral' as const, label: 'Bimestral' },
    { value: 'trimestral' as const, label: 'Trimestral' },
    { value: 'semestral' as const, label: 'Semestral' },
    { value: 'anual' as const, label: 'Anual' },
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export function ContasPagar() {
  const { toast } = useToast();
  const [contas, setContas] = useState<ContaPagar[]>([
    {
      id: "1",
      descricao: "Aluguel do Escritório",
      valor: 2500.00,
      dataVencimento: new Date(2025, 5, 15),
      status: "atrasado",
      fornecedor: "Imobiliária Silva",
      categoria: "Despesas Fixas",
      numeroDocumento: "BOL-001",
      competencia: "06/2025"
    },
    {
      id: "2", 
      descricao: "Fornecedor ABC - Material",
      valor: 1200.00,
      dataVencimento: new Date(2025, 5, 16),
      status: "pendente",
      fornecedor: "ABC Materiais",
      categoria: "Custos de Mercadoria",
      numeroDocumento: "NF-12345",
      competencia: "06/2025"
    },
    {
      id: "3",
      descricao: "Conta de Luz",
      valor: 450.75,
      dataVencimento: new Date(2025, 5, 20),
      status: "pago",
      fornecedor: "Eletropaulo",
      categoria: "Despesas Operacionais",
      numeroDocumento: "FAT-789",
      dataPagamento: new Date(2025, 5, 18),
      formaPagamento: "PIX",
      competencia: "05/2025"
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroCompetencia, setFiltroCompetencia] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [pagamentoDialogState, setPagamentoDialogState] = useState<{ open: boolean; contaId: string | null }>({ open: false, contaId: null });
  const [dataPagamentoSelecionada, setDataPagamentoSelecionada] = useState<Date | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        descricao: "",
        valor: undefined,
        dataVencimento: undefined,
        fornecedor: "",
        categoria: "",
        numeroDocumento: "",
        observacoes: "",
        competencia: "",
        recorrente: false,
    },
  });

  const isRecorrente = form.watch("recorrente");

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
    const matchCompetencia = !filtroCompetencia || (conta.competencia && conta.competencia.includes(filtroCompetencia));
    
    return matchStatus && matchCategoria && matchBusca && matchCompetencia;
  });

  const totalPendente = contas
    .filter(c => c.status === 'pendente' || c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.recorrente && values.frequencia && values.numParcelas) {
        const novasContas: ContaPagar[] = [];
        const idGrupo = Date.now().toString();
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
            const novaConta: ContaPagar = {
                id: `${idGrupo}-${parcelaNum}`,
                descricao: `${values.descricao} (${parcelaNum}/${values.numParcelas})`,
                valor: values.valor,
                dataVencimento: vencimento,
                status: 'pendente',
                fornecedor: values.fornecedor,
                categoria: values.categoria,
                numeroDocumento: values.numeroDocumento,
                competencia: format(vencimento, 'MM/yyyy'),
                recorrente: true,
                frequencia: values.frequencia,
                numParcelas: values.numParcelas,
                parcelaAtual: parcelaNum,
                idGrupoRecorrencia: idGrupo,
            };
            novasContas.push(novaConta);
        }
        setContas(prev => [...prev, ...novasContas]);
        toast({ title: "Contas recorrentes criadas!", description: `${values.numParcelas} contas foram adicionadas.` });
    } else {
        const novaConta: ContaPagar = {
            id: Date.now().toString(),
            descricao: values.descricao,
            valor: values.valor,
            dataVencimento: values.dataVencimento,
            status: 'pendente',
            fornecedor: values.fornecedor,
            categoria: values.categoria,
            numeroDocumento: values.numeroDocumento,
            competencia: values.competencia || format(values.dataVencimento, 'MM/yyyy'),
        };
        setContas(prev => [...prev, novaConta]);
        toast({ title: "Conta criada com sucesso!" });
    }
    setShowDialog(false);
    form.reset();
  }

  const handleRegistrarPagamento = () => {
    if (!pagamentoDialogState.contaId || !dataPagamentoSelecionada) return;

    setContas(contas.map(c =>
      c.id === pagamentoDialogState.contaId
        ? { ...c, status: 'pago', dataPagamento: dataPagamentoSelecionada }
        : c
    ));

    setPagamentoDialogState({ open: false, contaId: null });
    setDataPagamentoSelecionada(undefined);

    toast({
      title: "Pagamento Registrado!",
      description: "A conta foi marcada como paga com sucesso.",
    });
  };

  const handleAbrirDialogPagamento = (contaId: string) => {
    setPagamentoDialogState({ open: true, contaId });
    setDataPagamentoSelecionada(new Date());
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
        <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) form.reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Pagar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Conta a Pagar</DialogTitle>
              <DialogDescription>
                Cadastre uma nova obrigação financeira da sua empresa
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="descricao" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descrição da Despesa *</FormLabel>
                        <FormControl><Input placeholder="Ex: Aluguel do escritório" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="valor" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Valor *</FormLabel>
                        <FormControl>
                            <Input 
                                type="text"
                                placeholder="R$ 0,00"
                                value={field.value !== undefined ? currencyFormatter.format(field.value) : ''}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/\D/g, '');
                                    if (!rawValue) {
                                        field.onChange(undefined);
                                        return;
                                    }
                                    const numberValue = parseInt(rawValue, 10) / 100;
                                    field.onChange(numberValue);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField control={form.control} name="dataVencimento" render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                        <FormLabel>Data de Vencimento *</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" className={cn("justify-start text-left font-normal w-full", !field.value && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione a data"}
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="competencia" render={({ field }) => (
                    <FormItem className="pt-2">
                        <FormLabel>Competência (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MM/AAAA"
                            maxLength={7}
                            {...field}
                            onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length > 2) {
                                    value = `${value.slice(0, 2)}/${value.slice(2, 6)}`;
                                }
                                field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="fornecedor" render={({ field }) => (
                    <FormItem className="pt-2">
                        <FormLabel>Fornecedor/Credor *</FormLabel>
                        <FormControl><Input placeholder="Nome da empresa ou pessoa" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="categoria" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {categorias.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="numeroDocumento" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Número do Documento</FormLabel>
                        <FormControl><Input placeholder="NF, Boleto, etc." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>
              
              <div className="space-y-2 pt-4">
                 <FormField control={form.control} name="recorrente" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Conta Recorrente?</FormLabel>
                            <FormDescription>Marque se esta conta se repete por vários meses.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )} />
              </div>

              {isRecorrente && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                      <FormField control={form.control} name="frequencia" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Frequência *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {opcoesFrequencia.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                               <FormMessage />
                          </FormItem>
                      )} />
                      <FormField control={form.control} name="numParcelas" render={({ field }) => (
                           <FormItem>
                               <FormLabel>Nº de Parcelas *</FormLabel>
                               <FormControl><Input type="number" placeholder="Ex: 12" {...field} onChange={e => field.onChange(e.target.value)} /></FormControl>
                               <FormMessage />
                           </FormItem>
                      )} />
                  </div>
              )}

              <FormField control={form.control} name="observacoes" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl><Textarea placeholder="Informações adicionais..." rows={3} {...field} /></FormControl>
                      <FormMessage />
                  </FormItem>
              )} />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {setShowDialog(false); form.reset();}}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Cadastrar Conta
                </Button>
              </div>
            </form>
            </Form>
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
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
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
            <Input
                placeholder="Competência (MM/AAAA)"
                value={filtroCompetencia}
                onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 2) {
                        value = `${value.slice(0, 2)}/${value.slice(2, 6)}`;
                    }
                    setFiltroCompetencia(value);
                }}
                maxLength={7}
                className="w-40"
            />
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
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Todas as Categorias" />
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
          <ScrollArea className="h-[450px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasFiltradas.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                            Nenhuma conta encontrada.
                        </TableCell>
                    </TableRow>
                ) : (
                    contasFiltradas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-medium">{conta.descricao}</TableCell>
                      <TableCell>{conta.fornecedor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{conta.categoria}</Badge>
                      </TableCell>
                      <TableCell>{conta.competencia || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {currencyFormatter.format(conta.valor)}
                      </TableCell>
                      <TableCell>
                        {format(conta.dataVencimento, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(conta.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                          {(conta.status === 'pendente' || conta.status === 'atrasado') && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAbrirDialogPagamento(conta.id)}>
                              Pagar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={pagamentoDialogState.open} onOpenChange={(open) => setPagamentoDialogState({ ...pagamentoDialogState, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione a data de pagamento para registrar a quitação desta conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="dataPagamento">Data de Pagamento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full mt-2",
                    !dataPagamentoSelecionada && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataPagamentoSelecionada ? (
                    format(dataPagamentoSelecionada, "dd/MM/yyyy")
                  ) : (
                    "Selecione a data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataPagamentoSelecionada}
                  onSelect={setDataPagamentoSelecionada}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPagamentoDialogState({ open: false, contaId: null })}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegistrarPagamento} disabled={!dataPagamentoSelecionada}>Confirmar Pagamento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
