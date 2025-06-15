import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText,
  Users,
  TrendingUp,
  Calculator,
  Eye,
  Edit,
  Send,
  MoreVertical,
  CheckCircle,
  XCircle,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Proposta, Vendedor } from "./comercial/types";
import { useToast } from "@/hooks/use-toast";
import { Client } from "./crm/types";
import { ClientForm } from "./crm/ClientForm";

interface ComercialProps {
  propostas: Proposta[];
  setPropostas: React.Dispatch<React.SetStateAction<Proposta[]>>;
  vendedores: Vendedor[];
  onPropostaAceita: (proposta: Proposta) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

export function Comercial({ propostas, setPropostas, vendedores, onPropostaAceita, clients, setClients }: ComercialProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("propostas");
  const { toast } = useToast();

  // Form state para nova proposta
  const [formData, setFormData] = useState({
    titulo: "",
    cliente: "",
    vendedor: "",
    dataValidade: "",
    observacoes: "",
    itens: [{ descricao: "", quantidade: 1, valorUnitario: 0 }]
  });

  const handleClientSave = (client: Client) => {
    setClients(prevClients => [...prevClients, client]);
    setFormData(prevFormData => ({ ...prevFormData, cliente: client.razaoSocial }));
    toast({
      title: "Cliente criado!",
      description: `O cliente "${client.razaoSocial}" foi criado com sucesso.`,
      className: "bg-green-100 text-green-800",
    });
  };

  const handleStatusChange = (propostaId: string, newStatus: Proposta['status']) => {
    const proposta = propostas.find(p => p.id === propostaId);
    if (!proposta) return;

    if (newStatus === 'aceita' && proposta.faturada) {
        toast({
            title: "Atenção",
            description: "Esta proposta já foi faturada.",
            variant: "default",
        });
        return;
    }
    
    const updatedPropostas = propostas.map(p => 
      p.id === propostaId 
        ? { ...p, status: newStatus, faturada: newStatus === 'aceita' ? true : p.faturada } 
        : p
    );
    setPropostas(updatedPropostas);

    if (newStatus === 'aceita') {
      const updatedProposta = updatedPropostas.find(p => p.id === propostaId);
      if(updatedProposta) {
        onPropostaAceita(updatedProposta);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      rascunho: { variant: "secondary" as const, label: "Rascunho" },
      enviada: { variant: "outline" as const, label: "Enviada" },
      aceita: { variant: "default" as const, label: "Aceita" },
      recusada: { variant: "destructive" as const, label: "Recusada" },
      perdida: { variant: "destructive" as const, label: "Perdida" },
      negociacao: { variant: "outline" as const, label: "Em Negociação" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { descricao: "", quantidade: 1, valorUnitario: 0 }]
    });
  };

  const removerItem = (index: number) => {
    const novosItens = formData.itens.filter((_, i) => i !== index);
    setFormData({ ...formData, itens: novosItens });
  };

  const atualizarItem = (index: number, campo: string, valor: any) => {
    const novosItens = [...formData.itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setFormData({ ...formData, itens: novosItens });
  };

  const calcularValorTotal = () => {
    return formData.itens.reduce((total, item) => total + (item.quantidade * item.valorUnitario), 0);
  };

  const propostasAceitas = propostas.filter(p => p.status === 'aceita');
  const taxaConversao = propostas.length > 0 ? (propostasAceitas.length / propostas.length) * 100 : 0;
  const faturamentoTotal = propostasAceitas.reduce((sum, p) => sum + p.valorTotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Módulo Comercial</h2>
          <p className="text-muted-foreground">
            Gerencie propostas, calcule comissões e acompanhe vendas
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Proposta Comercial</DialogTitle>
              <DialogDescription>
                Crie uma nova proposta para seus clientes
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Proposta *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Ex: Proposta para Projeto X"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente *</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.cliente}
                      onValueChange={(value) => setFormData({ ...formData, cliente: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.razaoSocial}>
                            {client.razaoSocial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" type="button">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <ClientForm 
                        open={showClientDialog} 
                        onClose={() => setShowClientDialog(false)} 
                        onSave={(client) => {
                          handleClientSave(client);
                          setShowClientDialog(false);
                        }}
                      />
                    </Dialog>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vendedor Responsável *</Label>
                  <Select 
                    value={formData.vendedor} 
                    onValueChange={(value) => setFormData({...formData, vendedor: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendedores.map(vendedor => (
                        <SelectItem key={vendedor.id} value={vendedor.nome}>
                          {vendedor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataValidade">Validade da Proposta</Label>
                  <Input
                    id="dataValidade"
                    type="date"
                    value={formData.dataValidade}
                    onChange={(e) => setFormData({...formData, dataValidade: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Itens/Serviços da Proposta</Label>
                  <Button type="button" onClick={adicionarItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {formData.itens.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-5">
                      <Label>Descrição</Label>
                      <Input
                        value={item.descricao}
                        onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                        placeholder="Descrição do item/serviço"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Valor Unitário</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.valorUnitario}
                        onChange={(e) => atualizarItem(index, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <Input
                        value={(item.quantidade * item.valorUnitario).toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                        disabled
                      />
                    </div>
                    <div className="col-span-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removerItem(index)}
                        disabled={formData.itens.length === 1}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end p-4 bg-muted rounded-lg">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor Total da Proposta</p>
                    <p className="text-2xl font-bold text-green-600">
                      {calcularValorTotal().toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Informações adicionais, prazos, condições..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="button" variant="outline">
                  Salvar Rascunho
                </Button>
                <Button type="submit">
                  Criar Proposta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Propostas Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{propostas.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa Conversão</p>
                <p className="text-2xl font-bold text-green-600">{taxaConversao.toFixed(1)}%</p>
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
                <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {(faturamentoTotal / 1000).toFixed(0)}k
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendedores</p>
                <p className="text-2xl font-bold text-orange-600">{vendedores.length}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Propostas e Comissões */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="propostas">Propostas</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="propostas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Propostas</CardTitle>
              <CardDescription>
                Gerencie todas as suas propostas comerciais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Criação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propostas.map((proposta) => (
                    <TableRow key={proposta.id}>
                      <TableCell className="font-medium">{proposta.titulo}</TableCell>
                      <TableCell>{proposta.cliente}</TableCell>
                      <TableCell>{proposta.vendedor}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {format(proposta.dataCriacao, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(proposta.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <span className="sr-only">Ver detalhes</span>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(proposta.id, 'aceita')}
                                disabled={proposta.status === 'aceita' || proposta.status === 'recusada' || proposta.faturada}
                              >
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>Aceitar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(proposta.id, 'recusada')}
                                disabled={proposta.status === 'aceita' || proposta.status === 'recusada'}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span>Recusar</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comissoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Comissões</CardTitle>
              <CardDescription>
                Acompanhe o desempenho dos vendedores e comissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>% Comissão</TableHead>
                    <TableHead>Meta Mensal</TableHead>
                    <TableHead>Vendas do Mês</TableHead>
                    <TableHead>% da Meta</TableHead>
                    <TableHead>Comissão Acumulada</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendedores.map((vendedor) => {
                    const percentualMeta = (vendedor.vendasMes / vendedor.metaMensal) * 100;
                    return (
                      <TableRow key={vendedor.id}>
                        <TableCell className="font-medium">{vendedor.nome}</TableCell>
                        <TableCell>{vendedor.percentualComissao}%</TableCell>
                        <TableCell>
                          R$ {vendedor.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          R$ {vendedor.vendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={percentualMeta >= 100 ? "default" : "secondary"}>
                            {percentualMeta.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          R$ {vendedor.comissaoAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={percentualMeta >= 100 ? "default" : "outline"}>
                            {percentualMeta >= 100 ? "Meta Atingida" : "Em Andamento"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
