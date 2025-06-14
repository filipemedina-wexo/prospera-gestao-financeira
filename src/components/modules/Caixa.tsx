
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Filter, 
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface ContaBancaria {
  id: string;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  saldo: number;
  tipo: 'corrente' | 'poupanca' | 'investimento';
  ativa: boolean;
}

interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  categoria: string;
  contaId: string;
  data: Date;
  origem: 'manual' | 'conta-pagar' | 'conta-receber';
  documentoRelacionado?: string;
}

const tiposTransacao = {
  entrada: { label: "Entrada", icon: ArrowUpRight, color: "text-green-600" },
  saida: { label: "Saída", icon: ArrowDownLeft, color: "text-red-600" }
};

export function Caixa() {
  const [contas, setContas] = useState<ContaBancaria[]>([
    {
      id: "1",
      nome: "Conta Corrente Principal",
      banco: "Banco do Brasil",
      agencia: "1234-5",
      conta: "12345-6",
      saldo: 25000.00,
      tipo: "corrente",
      ativa: true
    },
    {
      id: "2", 
      nome: "Poupança Reserva",
      banco: "Itaú",
      agencia: "5678",
      conta: "98765-4",
      saldo: 50000.00,
      tipo: "poupanca",
      ativa: true
    },
    {
      id: "3",
      nome: "Conta Investimentos",
      banco: "Santander",
      agencia: "9999",
      conta: "11111-1",
      saldo: 75000.00,
      tipo: "investimento",
      ativa: true
    }
  ]);

  const [transacoes, setTransacoes] = useState<Transacao[]>([
    {
      id: "1",
      tipo: "entrada",
      valor: 5000.00,
      descricao: "Recebimento Cliente XYZ",
      categoria: "Vendas",
      contaId: "1",
      data: new Date(2024, 5, 18),
      origem: "conta-receber",
      documentoRelacionado: "FAT-001"
    },
    {
      id: "2",
      tipo: "saida", 
      valor: 2500.00,
      descricao: "Pagamento Aluguel",
      categoria: "Despesas Fixas",
      contaId: "1",
      data: new Date(2024, 5, 15),
      origem: "conta-pagar",
      documentoRelacionado: "BOL-001"
    }
  ]);

  const [showContaDialog, setShowContaDialog] = useState(false);
  const [showTransacaoDialog, setShowTransacaoDialog] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroConta, setFiltroConta] = useState<string>("todas");
  const [busca, setBusca] = useState("");

  const [formConta, setFormConta] = useState({
    nome: "",
    banco: "",
    agencia: "",
    conta: "",
    saldo: "",
    tipo: ""
  });

  const [formTransacao, setFormTransacao] = useState({
    tipo: "",
    valor: "",
    descricao: "",
    categoria: "",
    contaId: ""
  });

  const saldoTotal = contas.reduce((sum, conta) => sum + conta.saldo, 0);
  const entradasMes = transacoes
    .filter(t => t.tipo === 'entrada' && t.data.getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.valor, 0);
  const saidasMes = transacoes
    .filter(t => t.tipo === 'saida' && t.data.getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.valor, 0);

  const transacoesFiltradas = transacoes.filter(transacao => {
    const matchTipo = filtroTipo === "todos" || transacao.tipo === filtroTipo;
    const matchConta = filtroConta === "todas" || transacao.contaId === filtroConta;
    const matchBusca = busca === "" || 
      transacao.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      transacao.categoria.toLowerCase().includes(busca.toLowerCase());
    
    return matchTipo && matchConta && matchBusca;
  });

  const handleSubmitConta = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaConta: ContaBancaria = {
      id: Date.now().toString(),
      nome: formConta.nome,
      banco: formConta.banco,
      agencia: formConta.agencia,
      conta: formConta.conta,
      saldo: parseFloat(formConta.saldo),
      tipo: formConta.tipo as 'corrente' | 'poupanca' | 'investimento',
      ativa: true
    };
    
    setContas([...contas, novaConta]);
    setShowContaDialog(false);
    setFormConta({ nome: "", banco: "", agencia: "", conta: "", saldo: "", tipo: "" });
  };

  const handleSubmitTransacao = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaTransacao: Transacao = {
      id: Date.now().toString(),
      tipo: formTransacao.tipo as 'entrada' | 'saida',
      valor: parseFloat(formTransacao.valor),
      descricao: formTransacao.descricao,
      categoria: formTransacao.categoria,
      contaId: formTransacao.contaId,
      data: new Date(),
      origem: "manual"
    };
    
    setTransacoes([...transacoes, novaTransacao]);
    
    // Atualizar saldo da conta
    setContas(contas.map(conta => {
      if (conta.id === formTransacao.contaId) {
        const novoSaldo = novaTransacao.tipo === 'entrada' 
          ? conta.saldo + novaTransacao.valor
          : conta.saldo - novaTransacao.valor;
        return { ...conta, saldo: novoSaldo };
      }
      return conta;
    }));
    
    setShowTransacaoDialog(false);
    setFormTransacao({ tipo: "", valor: "", descricao: "", categoria: "", contaId: "" });
  };

  const getTipoContaBadge = (tipo: string) => {
    const tipos = {
      corrente: { label: "Corrente", variant: "default" as const },
      poupanca: { label: "Poupança", variant: "secondary" as const },
      investimento: { label: "Investimento", variant: "outline" as const }
    };
    const config = tipos[tipo as keyof typeof tipos];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Controle de Caixa</h2>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias e movimentações financeiras
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showContaDialog} onOpenChange={setShowContaDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta Bancária</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova conta bancária para controle
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitConta} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Conta *</Label>
                    <Input
                      id="nome"
                      value={formConta.nome}
                      onChange={(e) => setFormConta({...formConta, nome: e.target.value})}
                      placeholder="Ex: Conta Corrente Principal"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banco">Banco *</Label>
                    <Input
                      id="banco"
                      value={formConta.banco}
                      onChange={(e) => setFormConta({...formConta, banco: e.target.value})}
                      placeholder="Nome do banco"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agencia">Agência</Label>
                    <Input
                      id="agencia"
                      value={formConta.agencia}
                      onChange={(e) => setFormConta({...formConta, agencia: e.target.value})}
                      placeholder="1234-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conta">Conta</Label>
                    <Input
                      id="conta"
                      value={formConta.conta}
                      onChange={(e) => setFormConta({...formConta, conta: e.target.value})}
                      placeholder="12345-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select 
                      value={formConta.tipo} 
                      onValueChange={(value) => setFormConta({...formConta, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Corrente</SelectItem>
                        <SelectItem value="poupanca">Poupança</SelectItem>
                        <SelectItem value="investimento">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saldo">Saldo Inicial *</Label>
                  <Input
                    id="saldo"
                    type="number"
                    step="0.01"
                    value={formConta.saldo}
                    onChange={(e) => setFormConta({...formConta, saldo: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowContaDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Cadastrar Conta</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showTransacaoDialog} onOpenChange={setShowTransacaoDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
                <DialogDescription>
                  Registre uma entrada ou saída de dinheiro
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitTransacao} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select 
                      value={formTransacao.tipo} 
                      onValueChange={(value) => setFormTransacao({...formTransacao, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={formTransacao.valor}
                      onChange={(e) => setFormTransacao({...formTransacao, valor: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formTransacao.descricao}
                    onChange={(e) => setFormTransacao({...formTransacao, descricao: e.target.value})}
                    placeholder="Descrição da transação"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Input
                      id="categoria"
                      value={formTransacao.categoria}
                      onChange={(e) => setFormTransacao({...formTransacao, categoria: e.target.value})}
                      placeholder="Ex: Vendas, Despesas"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta *</Label>
                    <Select 
                      value={formTransacao.contaId} 
                      onValueChange={(value) => setFormTransacao({...formTransacao, contaId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {contas.map(conta => (
                          <SelectItem key={conta.id} value={conta.id}>
                            {conta.nome} - {conta.banco}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowTransacaoDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar Transação</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entradas do Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {entradasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <p className="text-sm font-medium text-muted-foreground">Saídas do Mês</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {saidasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contas Ativas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {contas.filter(c => c.ativa).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contas Bancárias */}
      <Card>
        <CardHeader>
          <CardTitle>Contas Bancárias</CardTitle>
          <CardDescription>Suas contas cadastradas e seus saldos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Conta</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Agência/Conta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.nome}</TableCell>
                  <TableCell>{conta.banco}</TableCell>
                  <TableCell>{conta.agencia} / {conta.conta}</TableCell>
                  <TableCell>{getTipoContaBadge(conta.tipo)}</TableCell>
                  <TableCell className="font-semibold">
                    R$ {conta.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conta.ativa ? "default" : "secondary"}>
                      {conta.ativa ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filtros para Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou categoria..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroConta} onValueChange={setFiltroConta}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Contas</SelectItem>
                {contas.map(conta => (
                  <SelectItem key={conta.id} value={conta.id}>{conta.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoesFiltradas.map((transacao) => {
                const conta = contas.find(c => c.id === transacao.contaId);
                const config = tiposTransacao[transacao.tipo];
                const Icon = config.icon;
                
                return (
                  <TableRow key={transacao.id}>
                    <TableCell>{format(transacao.data, "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${config.color}`}>
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{transacao.descricao}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transacao.categoria}</Badge>
                    </TableCell>
                    <TableCell>{conta?.nome}</TableCell>
                    <TableCell className={`font-semibold ${config.color}`}>
                      R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transacao.origem}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
