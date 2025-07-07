
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ProductService } from "@/services/productsServicesService";

type FormItem = {
  produtoId: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
};

interface PropostaItensProps {
  itens: FormItem[];
  produtosServicos: ProductService[];
  adicionarItem: () => void;
  removerItem: (index: number) => void;
  atualizarItem: (index: number, campo: keyof FormItem, valor: any) => void;
  handleProductSelect: (index: number, produtoId: string) => void;
}

export function PropostaItens({
  itens,
  produtosServicos,
  adicionarItem,
  removerItem,
  atualizarItem,
  handleProductSelect,
}: PropostaItensProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Itens/Serviços da Proposta</Label>
        <Button type="button" onClick={adicionarItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {itens.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
          <div className="col-span-5">
            <Label>Descrição</Label>
            <Select value={item.produtoId} onValueChange={(value) => handleProductSelect(index, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto/serviço" />
              </SelectTrigger>
              <SelectContent>
                {produtosServicos.filter(p => p.status === 'active').map(produto => (
                  <SelectItem key={produto.id} value={produto.id}>
                    {produto.name}
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
            <Button type="button" variant="outline" size="sm" onClick={() => removerItem(index)} disabled={itens.length === 1}>
              ×
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
