import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Proposta, Vendedor } from "./comercial/types";
import { useToast } from "@/hooks/use-toast";
import { Client } from "./crm/types";
import { NovaPropostaDialog } from "./comercial/NovaPropostaDialog";
import { EditarPropostaDialog } from "./comercial/EditarPropostaDialog";
import { ComercialStats } from "./comercial/ComercialStats";
import { PropostasList } from "./comercial/PropostasList";
import { ComissoesList } from "./comercial/ComissoesList";

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [propostaParaEditar, setPropostaParaEditar] = useState<Proposta | null>(null);
  const [activeTab, setActiveTab] = useState("propostas");
  const { toast } = useToast();

  const handleSaveProposta = (propostaData: any) => {
    const newProposta: Proposta = {
      id: `prop-${Date.now()}`,
      titulo: propostaData.titulo,
      cliente: propostaData.cliente,
      valorTotal: propostaData.valorTotal,
      dataCriacao: new Date(),
      dataValidade: new Date(propostaData.dataValidade.replace(/-/g, '\/')),
      status: 'enviada',
      vendedor: propostaData.vendedor,
      itens: propostaData.itens.map((item: any, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        valorTotal: item.quantidade * item.valorTotal,
      })),
      observacoes: propostaData.observacoes,
      faturada: false,
    };

    setPropostas(prevPropostas => [...prevPropostas, newProposta]);

    toast({
      title: "Proposta criada!",
      description: `A proposta "${newProposta.titulo}" foi criada com sucesso.`,
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

  const handleEditProposta = (proposta: Proposta) => {
    setPropostaParaEditar(proposta);
    setShowEditDialog(true);
  };

  const handleSaveEditedProposta = (propostaData: Proposta) => {
    setPropostas(prev => 
      prev.map(proposta => 
        proposta.id === propostaData.id 
          ? propostaData
          : proposta
      )
    );
    
    toast({
      title: "Proposta atualizada",
      description: `A proposta "${propostaData.titulo}" foi atualizada com sucesso.`,
      className: "bg-green-100 text-green-800"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Módulo Comercial</h2>
          <p className="text-muted-foreground">
            Gerencie propostas, calcule comissões e acompanhe vendas
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Proposta
        </Button>
      </div>
      
      <NovaPropostaDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={handleSaveProposta}
        vendedores={vendedores}
        clients={clients}
        setClients={setClients}
      />
      <EditarPropostaDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveEditedProposta}
        vendedores={vendedores}
        clients={clients}
        setClients={setClients}
        proposta={propostaParaEditar}
      />

      <ComercialStats propostas={propostas} vendedores={vendedores} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="propostas">Propostas</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="propostas" className="space-y-4">
          <PropostasList propostas={propostas} onStatusChange={handleStatusChange} onEditProposta={handleEditProposta} />
        </TabsContent>

        <TabsContent value="comissoes" className="space-y-4">
          <ComissoesList vendedores={vendedores} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
