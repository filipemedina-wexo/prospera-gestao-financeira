import { useState } from "react";
import { Fornecedor } from "./fornecedores/types";
import { Button } from "@/components/ui/button";
import { FornecedoresTable } from "./fornecedores/FornecedoresTable";
import { FinancialClientDialog } from "./fornecedores/FinancialClientDialog"; // Importação atualizada
import { Briefcase, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { financialClientsService, FinancialClient } from "@/services/financialClientsService";
import { Skeleton } from "@/components/ui/skeleton";

export const Fornecedores = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Partial<Fornecedor> | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

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
      };
      if (fornecedorData.id) {
        return financialClientsService.update(fornecedorData.id, payload);
      }
      return financialClientsService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_clients'] });
      toast({ title: "Sucesso!", description: `Fornecedor salvo com sucesso.` });
      setDialogOpen(false);
    },
    onError: (error: Error) => toast({ title: "Erro!", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: financialClientsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_clients'] });
      toast({
        title: 'Fornecedor removido',
        description: 'O fornecedor foi removido com sucesso.',
      });
    },
    onError: (error: Error) =>
      toast({
        title: 'Erro ao remover!',
        description: error.message,
        variant: 'destructive',
      }),
  });

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
          <Button onClick={handleAddNew}><UserPlus className="mr-2 h-4 w-4" /> Adicionar Fornecedor</Button>
        </div>
      </div>

      <Input
        placeholder="Buscar por Nome ou CNPJ..."
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <FornecedoresTable fornecedores={fornecedoresParaTabela} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <FinancialClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(data) => upsertMutation.mutate(data)}
        client={selectedFornecedor}
        title={selectedFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
      />
    </div>
  );
};
