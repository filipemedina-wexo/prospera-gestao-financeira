import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Client } from "./crm/types";
import { ComercialStats } from "./comercial/ComercialStats";
import { ComissoesList } from "./comercial/ComissoesList";
import { NovaPropostaDialog } from "./comercial/NovaPropostaDialog";
import { EditarPropostaDialog } from "./comercial/EditarPropostaDialog";
import { PropostasListRefactored } from "./comercial/PropostasListRefactored";
import { proposalsService, Proposal } from "@/services/proposalsService";
import { sellersService, Seller } from "@/services/sellersService";
import { financialClientsService } from "@/services/financialClientsService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ComercialProps {
  propostas: any[];
  setPropostas: React.Dispatch<React.SetStateAction<any[]>>;
  vendedores: any[];
  onPropostaAceita: (proposta: any) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ComercialRefactored = ({ onPropostaAceita }: ComercialProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('propostas');
  const [propostaParaEditar, setPropostaParaEditar] = useState<Proposal | null>(null);
  const queryClient = useQueryClient();

  // Load real data from database
  const { data: proposals = [], isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: proposalsService.getAll
  });

  const { data: sellers = [], isLoading: loadingSellers } = useQuery({
    queryKey: ['sellers'],
    queryFn: sellersService.getAll
  });

  const { data: financialClients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['financial_clients'],
    queryFn: financialClientsService.getAll
  });

  // Transform financial clients to match expected Client interface
  const clients: Client[] = financialClients.map(fc => ({
    id: fc.id,
    name: fc.name,
    email: fc.email,
    phone: fc.phone,
    document: fc.document,
    address: fc.address,
    city: fc.city,
    state: fc.state,
    cep: fc.cep,
    saas_client_id: fc.saas_client_id,
    created_at: fc.created_at,
    updated_at: fc.updated_at,
    razaoSocial: fc.name,
    nomeFantasia: fc.name,
    status: 'Ativo' as const
  }));

  const handleSaveProposta = async (propostaData: any) => {
    try {
      await proposalsService.create({
        title: propostaData.titulo,
        description: propostaData.descricao,
        client_id: propostaData.cliente,
        seller_id: propostaData.vendedor,
        expires_at: propostaData.prazoValidade,
        notes: propostaData.observacoes,
        items: propostaData.itens || []
      });

      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsDialogOpen(false);
      toast.success("Proposta criada com sucesso!");
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
      toast.error("Erro ao criar proposta");
    }
  };

  const handleStatusChange = async (propostaId: string, newStatus: string) => {
    try {
      await proposalsService.updateStatus(propostaId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['accounts_receivable'] });
      
      if (newStatus === 'aceita') {
        toast.success("Proposta aceita! Conta a receber criada automaticamente.");
      } else {
        toast.success("Status da proposta atualizado!");
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao atualizar status da proposta");
    }
  };

  const handleEditProposta = (proposta: Proposal) => {
    setPropostaParaEditar(proposta);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedProposta = async (propostaData: any) => {
    try {
      if (propostaParaEditar?.id) {
        await proposalsService.update(propostaParaEditar.id, {
          title: propostaData.titulo,
          description: propostaData.descricao,
          client_id: propostaData.cliente,
          seller_id: propostaData.vendedor,
          expires_at: propostaData.prazoValidade,
          notes: propostaData.observacoes
        });

        queryClient.invalidateQueries({ queryKey: ['proposals'] });
        setIsEditDialogOpen(false);
        setPropostaParaEditar(null);
        toast.success("Proposta atualizada com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao atualizar proposta:', error);
      toast.error("Erro ao atualizar proposta");
    }
  };

  // Transform data for legacy compatibility
  const legacyVendedores = sellers.map(s => ({
    id: s.id,
    nome: s.name,
    email: s.email,
    telefone: s.phone,
    percentualComissao: s.commission_rate,
    metaMensal: 10000,
    vendasMes: 0,
    comissaoAcumulada: 0,
    ativo: s.is_active
  }));

  const legacyPropostas = proposals.map(p => ({
    id: p.id,
    titulo: p.title,
    cliente: p.client?.company_name || 'Cliente não identificado',
    vendedor: p.seller?.name || 'Vendedor não identificado',
    valor: p.total_value,
    valorTotal: p.total_value,
    status: p.status === 'aceita' ? 'aceita' : 
            p.status === 'rejeitada' ? 'rejeitada' : 
            p.status === 'expirada' ? 'expirada' : 'pendente',
    dataCriacao: new Date(p.created_at),
    descricao: p.description || '',
    prazoValidade: p.expires_at ? new Date(p.expires_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    itens: p.items || []
  }));

  return (
    <div>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Comercial - Gestão de Propostas</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Gerencie propostas comerciais, acompanhe vendas e controle comissões em tempo real.
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Button>
        </CardHeader>
      </Card>

      <NovaPropostaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveProposta}
        clients={clients}
        vendedores={legacyVendedores}
        setClients={() => {}} // Not used in refactored version
      />

      <EditarPropostaDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setPropostaParaEditar(null);
        }}
        onSave={handleSaveEditedProposta}
        proposta={propostaParaEditar ? {
          id: propostaParaEditar.id,
          titulo: propostaParaEditar.title,
          cliente: propostaParaEditar.client?.company_name || 'Cliente não identificado',
          vendedor: propostaParaEditar.seller?.name || 'Vendedor não identificado',
          valorTotal: propostaParaEditar.total_value,
          dataCriacao: new Date(propostaParaEditar.created_at),
          dataValidade: propostaParaEditar.expires_at ? new Date(propostaParaEditar.expires_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: propostaParaEditar.status as any,
          itens: propostaParaEditar.items?.map(item => ({
            id: item.id,
            descricao: item.description,
            quantidade: item.quantity,
            valorUnitario: item.unit_price,
            valorTotal: item.total_price
          })) || [],
          observacoes: propostaParaEditar.notes
        } : null}
        clients={clients}
        vendedores={legacyVendedores}
        setClients={() => {}} // Not used in refactored version
      />

      <Tabs defaultValue="propostas" className="w-full">
        <TabsList>
          <TabsTrigger value="propostas">Propostas</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
        </TabsList>
        <TabsContent value="propostas">
          <PropostasListRefactored 
            propostas={proposals}
            onStatusChange={handleStatusChange}
            onEditProposta={handleEditProposta}
            isLoading={loadingProposals}
          />
        </TabsContent>
        <TabsContent value="comissoes">
          <ComissoesList vendedores={legacyVendedores} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { ComercialRefactored };