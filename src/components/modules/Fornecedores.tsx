
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FornecedoresTable } from "./fornecedores/FornecedoresTable";
import { SupplierDialog } from "./fornecedores/SupplierDialog";
import { Briefcase, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { clientsService, Client } from "@/services/clientsService";
import { Skeleton } from "@/components/ui/skeleton";

// Interface para compatibilidade com o código existente
export interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  tipo: string;
  chavePix?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  nomeContato?: string;
  observacoes?: string;
  dataCadastro: Date;
  condicaoPagamento?: string;
  proximoPagamento?: Date;
  valorProximoPagamento?: number;
}

// Função para converter Client para Fornecedor
const clientToFornecedor = (client: Client): Fornecedor => ({
  id: client.id,
  razaoSocial: client.company_name,
  nomeFantasia: client.trade_name || '',
  cnpj: client.document_number || '',
  email: client.contact_email || '',
  telefone: client.contact_phone || '',
  status: client.is_active ? 'Ativo' : 'Inativo',
  tipo: 'Fornecedor',
  endereco: client.address || '',
  cidade: client.city || '',
  estado: client.state || '',
  cep: client.zip_code || '',
  nomeContato: client.contact_name || '',
  observacoes: client.notes || '',
  dataCadastro: new Date(client.created_at),
});

// Função para converter Fornecedor para Client
const fornecedorToClient = (fornecedor: Fornecedor): Partial<Client> => ({
  company_name: fornecedor.razaoSocial,
  trade_name: fornecedor.nomeFantasia,
  document_number: fornecedor.cnpj,
  contact_email: fornecedor.email,
  contact_phone: fornecedor.telefone,
  address: fornecedor.endereco,
  city: fornecedor.cidade,
  state: fornecedor.estado,
  zip_code: fornecedor.cep,
  contact_name: fornecedor.nomeContato,
  notes: fornecedor.observacoes,
  is_active: fornecedor.status === 'Ativo',
  client_type: 'supplier',
});

export const Fornecedores = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Partial<Fornecedor> | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Primeiro, tenta migrar dados se necessário
  useEffect(() => {
    const migrateData = async () => {
      try {
        await clientsService.migrateFromFinancialClients();
      } catch (error) {
        console.error('Erro na migração:', error);
      }
    };
    migrateData();
  }, []);

  const { data: suppliersData = [], isLoading } = useQuery<Client[]>({
    queryKey: ['suppliers'],
    queryFn: clientsService.getAllSuppliers,
  });

  const upsertMutation = useMutation({
    mutationFn: (fornecedorData: Fornecedor) => {
      const clientData = fornecedorToClient(fornecedorData);
      
      if (fornecedorData.id) {
        return clientsService.update(fornecedorData.id, clientData);
      }
      return clientsService.create({
        ...clientData,
        saas_client_id: '', // Will be set by the service
        is_active: true,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Omit<Client, 'id' | 'created_at' | 'updated_at'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: "Sucesso!", description: `Fornecedor salvo com sucesso.` });
      setDialogOpen(false);
    },
    onError: (error: Error) => toast({ title: "Erro!", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: clientsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
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

  const filteredFornecedores: Fornecedor[] = suppliersData
    .map(clientToFornecedor)
    .filter(f => {
      const searchMatch = searchFilter === '' ||
                          f.razaoSocial.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          f.cnpj.includes(searchFilter);
      return searchMatch;
    });

  const handleSave = (data: Fornecedor) => {
    if (selectedFornecedor?.id) {
      upsertMutation.mutate({ ...data, id: selectedFornecedor.id });
    } else {
      // Create a complete Fornecedor object with required properties
      const completeData: Fornecedor = {
        id: '', // Will be generated by the service
        razaoSocial: data.razaoSocial || '',
        nomeFantasia: data.nomeFantasia || data.razaoSocial || '',
        cnpj: data.cnpj || '',
        email: data.email || '',
        telefone: data.telefone || '',
        status: data.status || 'Ativo',
        tipo: data.tipo || 'Fornecedor',
        dataCadastro: new Date(),
        cep: data.cep || '',
        endereco: data.endereco || '',
        cidade: data.cidade || '',
        estado: data.estado || ''
      };
      upsertMutation.mutate(completeData);
    }
  };

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
        <FornecedoresTable fornecedores={filteredFornecedores} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        supplier={selectedFornecedor}
        title={selectedFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
      />
    </div>
  );
};
