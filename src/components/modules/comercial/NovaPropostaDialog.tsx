import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Vendedor } from "./types";
import { Client } from "../crm/types";
import { ProdutoServico } from "../produtos-servicos/types";
import { useToast } from "@/hooks/use-toast";
import { PropostaFormHeader } from "./PropostaFormHeader";
import { PropostaItens } from "./PropostaItens";

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
          <PropostaFormHeader
            formData={formData}
            setFormData={setFormData}
            vendedores={vendedores}
            clients={clients}
            showClientDialog={showClientDialog}
            setShowClientDialog={setShowClientDialog}
            handleClientSave={handleClientSave}
          />

          <PropostaItens
            itens={formData.itens}
            produtosServicos={produtosServicos}
            adicionarItem={adicionarItem}
            removerItem={removerItem}
            atualizarItem={atualizarItem}
            handleProductSelect={handleProductSelect}
          />

          <div className="flex justify-end p-4 bg-muted rounded-lg">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Total da Proposta</p>
              <p className="text-2xl font-bold text-green-600">
                {calcularValorTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
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
