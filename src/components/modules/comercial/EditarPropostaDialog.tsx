import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Vendedor, Proposta } from "./types";
import { Client } from "../crm/types";
import { useToast } from "@/hooks/use-toast";
import { useProductsServices } from "@/hooks/useProductsServices";
import { PropostaFormHeader } from "./PropostaFormHeader";
import { PropostaItens } from "./PropostaItens";

interface EditarPropostaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (propostaData: any) => void;
  vendedores: Vendedor[];
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  proposta: Proposta | null;
}

type FormItem = {
  produtoId: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
};

export function EditarPropostaDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  vendedores, 
  clients, 
  setClients, 
  proposta 
}: EditarPropostaDialogProps) {
  const { products: produtosServicos } = useProductsServices();
  const [showClientDialog, setShowClientDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    titulo: "",
    cliente: "",
    vendedor: "",
    dataValidade: "",
    observacoes: "",
    itens: [{ produtoId: "", descricao: "", quantidade: 1, valorUnitario: 0 }] as FormItem[]
  });

  useEffect(() => {
    if (open && proposta) {
      const formattedDate = proposta.dataValidade.toISOString().split('T')[0];
      setFormData({
        titulo: proposta.titulo,
        cliente: proposta.cliente,
        vendedor: proposta.vendedor,
        dataValidade: formattedDate,
        observacoes: proposta.observacoes || "",
        itens: proposta.itens.map(item => ({
          produtoId: item.id,
          descricao: item.descricao,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario
        }))
      });
    }
  }, [open, proposta]);

  const handleClientSave = (client: Client) => {
    setClients(prev => [...prev, client]);
    setFormData(prev => ({ ...prev, cliente: client.razaoSocial }));
    setShowClientDialog(false);
  };

  const adicionarItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { produtoId: "", descricao: "", quantidade: 1, valorUnitario: 0 }]
    }));
  };

  const removerItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const atualizarItem = (index: number, campo: keyof FormItem, valor: any) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map((item, i) => 
        i === index ? { ...item, [campo]: valor } : item
      )
    }));
  };

  const handleProductSelect = (index: number, produtoId: string) => {
    const produto = produtosServicos.find(p => p.id === produtoId);
    if (produto) {
      atualizarItem(index, "produtoId", produtoId);
      atualizarItem(index, "descricao", produto.name);
      atualizarItem(index, "valorUnitario", produto.sale_price || 0);
    }
  };

  const calcularValorTotal = () => {
    return formData.itens.reduce((total, item) => total + (item.quantidade * item.valorUnitario), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.cliente || !formData.vendedor || !formData.dataValidade) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const propostaData = {
      ...proposta,
      titulo: formData.titulo,
      cliente: formData.cliente,
      vendedor: formData.vendedor,
      dataValidade: new Date(formData.dataValidade),
      observacoes: formData.observacoes,
      valorTotal: calcularValorTotal(),
      itens: formData.itens.map((item, index) => ({
        id: `item-${index}`,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.quantidade * item.valorUnitario,
      }))
    };

    onSave(propostaData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proposta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <PropostaFormHeader 
            formData={formData}
            setFormData={setFormData}
            clients={clients}
            vendedores={vendedores}
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

          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total da Proposta:</span>
              <span className="text-2xl text-blue-600">
                R$ {calcularValorTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais..."
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}