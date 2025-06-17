import { useState } from "react";
import { Fornecedor, TipoFornecedor } from "./fornecedores/types";
import { Button } from "@/components/ui/button";
import { FornecedoresTable } from "./fornecedores/FornecedoresTable";
import { FornecedorDialog } from "./fornecedores/FornecedorDialog";
import { GerenciarTipos } from "./fornecedores/GerenciarTipos";
import { Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { financialClientsService, FinancialClient } from "@/services/financialClientsService";
import { Skeleton } from "@/components/ui/skeleton";
import { TablesUpdate } from "@/integrations/supabase/types";

export const Fornecedores = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  
  const [tiposFornecedor, setTiposFornecedor] = useState<TipoFornecedor[]>([
    { id: '1', nome: 'Produto' },
    { id: '2', nome: 'Serviço' },
    { id: '3', nome: 'Ambos' },
  ]);

  const { data: fornecedoresData = [], isLoading } = useQuery<FinancialClient[]>({
    queryKey: ['financial_clients'],
    queryFn: financialClientsService.getAll,
  });

  const upsertMutation = useMutation({
    mutationFn: (fornecedorData: Fornecedor) => {
      const payload: Omit<TablesUpdate<'financial_clients'>, 'id'> = {
        name: fornecedorData.razaoSocial,
        document: fornecedorData.cnpj,
        email: fornecedorData.email,
        phone: fornecedorData.telefone,
        address: fornecedorData.endereco,
        city: fornecedorData.cidade,
        state: fornecedorData.estado,
        cep: fornecedorData.cep,
      };

      if (fornecedorData.id.startsWith('new-')) { // Criando novo fornecedor
        return financialClientsService.create(payload);
      } else { // Editando fornecedor existente
        return financialClientsService.update(fornecedorData.id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_clients'] });
      toast({
        title: "Sucesso!",
        description: `Fornecedor ${selectedFornecedor ? 'atualizado' : 'criado'} com sucesso.`,
      });
      setDialogOpen(false);
      setSelectedFornecedor(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: financialClientsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_clients'] });
      toast({
        title: "Fornecedor removido",
        description: "O fornecedor foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover!",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = (fornecedorData: Fornecedor) => {
    upsertMutation.mutate(fornecedorData);
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
    deleteMutation.mutate(id);
  };

  const fornecedoresParaTabela: Fornecedor[] = fornecedoresData.map(f => ({
    id: f.id,
    razaoSocial: f.name,
    nomeFantasia: f.name,
    cnpj: f.document || '',
    email: f.email || '',
    telefone: f.phone || '',
    status: 'Ativo', // Adicionar status real se existir no DB
    tipo: 'Serviço', // Adicionar tipo real se existir no DB
    dataCadastro: new Date(f.created_at),
    cep: f.cep || '',
    endereco: f.address || '',
    cidade: f.city || '',
    estado: f.state || ''
  })).filter(f => {
    const searchMatch = searchFilter === '' ||
                        f.razaoSocial.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        f.cnpj.includes(searchFilter);
    return searchMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Fornecedores</h2>
        </div>
        <div className="flex gap-2">
          <GerenciarTipos tipos={tiposFornecedor} setTipos={setTiposFornecedor} />
          <Button onClick={handleAddNew}>Adicionar Fornecedor</Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        Gerencie seus fornecedores de produtos e serviços.
      </p>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por Nome ou CNPJ..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <FornecedoresTable fornecedores={fornecedoresParaTabela} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <FornecedorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        fornecedor={selectedFornecedor}
        tiposFornecedor={tiposFornecedor}
      />
    </div>
  );
};