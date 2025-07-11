
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClientList } from "./crm/ClientList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Client } from "./crm/types";
import { ClientDashboard } from "./crm/ClientDashboard";
import { Segmentation } from "./crm/Segmentation";
import { financialClientsService, FinancialClient } from "@/services/financialClientsService";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface CRMProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const CRM = ({ clients: legacyClients, setClients: setLegacyClients }: CRMProps) => {
  // Load real financial clients from database
  const { data: financialClients = [], isLoading } = useQuery({
    queryKey: ['financial_clients'],
    queryFn: financialClientsService.getAll
  });

  // Transform financial clients to match Client interface
  const clients = useMemo((): Client[] => {
    return financialClients.map((fc: FinancialClient) => ({
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
      // Computed fields for compatibility
      razaoSocial: fc.name,
      nomeFantasia: fc.name,
      cnpj: fc.document || '',
      endereco: fc.address || '',
      cidade: fc.city || '',
      estado: fc.state || '',
      nomeContato: fc.name,
      telefone: fc.phone || '',
      whatsapp: fc.phone || '',
      status: 'Ativo' as const,
      dataCadastro: new Date(fc.created_at),
      origem: 'Sistema',
      observacoes: '',
      dataAniversario: undefined,
      historicoCompras: [],
      valorTotalCompras: 0,
      dataUltimaCompra: undefined,
      frequenciaCompra: 'Ocasional' as const,
      company: fc.name,
      lastContact: new Date(),
      value: 0,
      tags: [],
      notes: '',
      source: 'Sistema',
      assignedTo: 'Sistema',
      createdAt: new Date(fc.created_at),
      segment: 'standard' as const,
      industry: 'Geral',
      size: 'média' as const,
      location: fc.city && fc.state ? `${fc.city}, ${fc.state}` : '',
      website: '',
      socialMedia: {}
    }));
  }, [financialClients]);

  const setClients = (updater: React.SetStateAction<Client[]>) => {
    // For compatibility, but actual updates should go through the service
    if (typeof updater === 'function') {
      const newClients = updater(clients);
      console.log('CRM client update attempted:', newClients);
    }
  };

  return (
  <div>
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>CRM - Gestão do Relacionamento</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Tenha uma visão 360º dos seus clientes, otimize fornecedores, controle oportunidades e impulsione campanhas, tudo em um só lugar.
        </p>
      </CardContent>
    </Card>
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="clients">Clientes</TabsTrigger>
        <TabsTrigger value="segmentation">Segmentação</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard"><ClientDashboard clients={clients} /></TabsContent>
      <TabsContent value="clients"><ClientList clients={clients} setClients={setClients} /></TabsContent>
      <TabsContent value="segmentation"><Segmentation clients={clients} /></TabsContent>
    </Tabs>
  </div>
  );
};

export { CRM };
