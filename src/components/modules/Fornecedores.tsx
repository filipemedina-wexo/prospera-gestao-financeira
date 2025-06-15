import { useState } from "react";
import { Fornecedor } from "./fornecedores/types";
import { Button } from "@/components/ui/button";
import { FornecedoresTable } from "./fornecedores/FornecedoresTable";
import { FornecedorDialog } from "./fornecedores/FornecedorDialog";
import { Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FornecedoresProps {
  fornecedores: Fornecedor[];
  setFornecedores: React.Dispatch<React.SetStateAction<Fornecedor[]>>;
}

export const Fornecedores = ({ fornecedores, setFornecedores }: FornecedoresProps) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [tipoFilter, setTipoFilter] = useState('Todos');
  const [searchFilter, setSearchFilter] = useState('');

  const handleSave = (fornecedor: Fornecedor) => {
    const isEditing = !!selectedFornecedor;
    if (isEditing) {
      setFornecedores(fornecedores.map(f => f.id === fornecedor.id ? fornecedor : f));
    } else {
      setFornecedores([...fornecedores, { ...fornecedor, id: Date.now().toString(), dataCadastro: new Date() }]);
    }
    toast({
        title: "Sucesso!",
        description: `Fornecedor ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
    });
    setDialogOpen(false);
    setSelectedFornecedor(null);
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setDialogOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedFornecedor(null);
    setDialogOpen(true);
  }
  
  const handleDelete = (id: string) => {
    setFornecedores(fornecedores.filter(f => f.id !== id));
    toast({
        title: "Fornecedor removido",
        description: "O fornecedor foi removido com sucesso.",
        variant: "destructive"
    });
  };

  const filteredFornecedores = fornecedores.filter(f => {
    const tipoMatch = tipoFilter === 'Todos' || f.tipo === tipoFilter;
    const searchMatch = searchFilter === '' ||
                        f.razaoSocial.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        f.cnpj.includes(searchFilter) ||
                        (f.nomeFantasia && f.nomeFantasia.toLowerCase().includes(searchFilter.toLowerCase()));
    return tipoMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Fornecedores</h2>
        </div>
        <Button onClick={handleAddNew}>Adicionar Fornecedor</Button>
      </div>
      <p className="text-muted-foreground">
        Gerencie seus fornecedores de produtos e serviços.
      </p>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por Razão Social, Nome Fantasia ou CNPJ..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os tipos</SelectItem>
            <SelectItem value="Produto">Produto</SelectItem>
            <SelectItem value="Serviço">Serviço</SelectItem>
            <SelectItem value="Ambos">Ambos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FornecedoresTable fornecedores={filteredFornecedores} onEdit={handleEdit} onDelete={handleDelete} />

      <FornecedorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        fornecedor={selectedFornecedor}
      />
    </div>
  );
};
