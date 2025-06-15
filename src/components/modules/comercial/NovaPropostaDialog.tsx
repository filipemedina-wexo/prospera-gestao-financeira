
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, UserPlus } from "lucide-react";
import { Vendedor } from "./types";
import { Client } from "../crm/types";
import { ProdutoServico } from "../produtos-servicos/types";
import { ClientForm } from "../crm/ClientForm";
import { useToast } from "@/hooks/use-toast";

interface NovaPropostaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (propostaData: any) => void;
  vendedores: Vendedor[];
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  produtosServicos: ProdutoServico[];
}

type FormItem = {
  produtoId: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
};

const initialFormData = {
  titulo: "",
  cliente: "",
  vendedor: "",
  dataValidade: "",
  observacoes: "",
  itens: [{ produtoId: "", descricao: "", quantidade: 1, valorUnitario: 0 }]
};

export function NovaPropostaDialog({ open, onOpenChange, onSave, vendedores, clients, setClients, produtosServicos }: NovaPropostaDialogProps) {
  const [showClientDialog, setShowClientDialog] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
    }
  }, [open]);

  const handleClientSave = (client: Client) => {
    setClients(prevClients => [...prevClients, client]);
    setFormData(prevFormData => ({ ...prevFormData, cliente: client.razaoSocial }));
    toast({
      title: "Cliente criado!",
      description: `O cliente "${client.razaoSocial}" foi criado com sucesso.`,
      className: "bg-green-100 text-green-800",
    });
  };

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { produtoId: "", descricao: "", quantidade: 1, valorUnitario: 0 }]
    });
  };

  const removerItem = (index: number) => {
    const novosItens = formData.itens.filter((_, i) => i !== index);
    setFormData({ ...formData, itens: novosItens });
  };

  const atualizarItem = (index: number, campo: keyof FormItem, valor: any) => {
    const novosItens = [...formData.itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setFormData({ ...formData, itens: novosItens });
  };

  const handleProductSelect = (index: number, produtoId: string) => {
    const produto = produtosServicos.find(p => p.id === produtoId);
    if (produto) {
      const novosItens = [...formData.itens];
      novosItens[index] = {
        ...novosItens[index],
        produtoId: produto.id,
        descricao: produto.nome,
        valorUnitario: produto.preco
      };
      setFormData({ ...formData, itens: novosItens });
    }
  };

  const calcularValorTotal = () => {
    return formData.itens.reduce((total, item) => total + (item.quantidade * item.valorUnitario), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, valorTotal: calcularValorTotal() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Proposta Comercial</DialogTitle>
          <DialogDescription>
            Crie uma nova proposta para seus clientes
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Proposta *</Label>
              <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ex: Proposta para Projeto X" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <div className="flex items-center gap-2">
                <Select value={formData.cliente} onValueChange={(value) => setFormData({ ...formData, cliente: value })} required>
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
              <Select value={formData.vendedor} onValueChange={(value) => setFormData({ ...formData, vendedor: value })}>
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
              <Input id="dataValidade" type="date" value={formData.dataValidade} onChange={(e) => setFormData({ ...formData, dataValidade: e.target.value })} />
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
                  <Select value={item.produtoId} onValueChange={(value) => handleProductSelect(index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto/serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtosServicos.filter(p => p.status === 'Ativo').map(produto => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Quantidade</Label>
                  <Input type="number" value={item.quantidade} onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value) || 1)} min="1" />
                </div>
                <div className="col-span-2">
                  <Label>Valor Unitário</Label>
                  <Input type="number" step="0.01" value={item.valorUnitario} onChange={(e) => atualizarItem(index, 'valorUnitario', parseFloat(e.target.value) || 0)} placeholder="0,00" />
                </div>
                <div className="col-span-2">
                  <Label>Total</Label>
                  <Input value={(item.quantidade * item.valorUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} disabled />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => removerItem(index)} disabled={formData.itens.length === 1}>
                    ×
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end p-4 bg-muted rounded-lg">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Total da Proposta</p>
                <p className="text-2xl font-bold text-green-600">
                  {calcularValorTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} placeholder="Informações adicionais, prazos, condições..." rows={4} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Proposta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
