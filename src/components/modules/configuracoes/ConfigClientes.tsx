
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financialClientsService, FinancialClient } from "@/services/financialClientsService";
import { useToast } from "@/hooks/use-toast";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ConfigClientes = () => {
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<FinancialClient | null>(null);
  const [clientToDelete, setClientToDelete] = useState<FinancialClient | null>(null);
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    city: '',
    state: '',
    cep: ''
  });

  const { currentClientId } = useMultiTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['financial-clients', currentClientId],
    queryFn: () => currentClientId ? financialClientsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof clientData) => financialClientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-clients'] });
      toast({
        title: "Cliente criado com sucesso!",
        description: "O cliente foi adicionado à sua lista.",
      });
      resetDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof clientData> }) => 
      financialClientsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-clients'] });
      toast({
        title: "Cliente atualizado com sucesso!",
        description: "As informações do cliente foram atualizadas.",
      });
      resetDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialClientsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-clients'] });
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido da sua lista.",
      });
      setClientToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetDialog = () => {
    setShowClientDialog(false);
    setClientToEdit(null);
    setClientData({
      name: '',
      email: '',
      phone: '',
      document: '',
      address: '',
      city: '',
      state: '',
      cep: ''
    });
  };

  const handleAddClient = () => {
    setClientToEdit(null);
    setShowClientDialog(true);
  };

  const handleEditClient = (client: FinancialClient) => {
    setClientToEdit(client);
    setClientData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      document: client.document || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      cep: client.cep || ''
    });
    setShowClientDialog(true);
  };

  const handleSaveClient = () => {
    if (!clientData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do cliente.",
        variant: "destructive",
      });
      return;
    }

    if (clientToEdit) {
      updateMutation.mutate({ id: clientToEdit.id, data: clientData });
    } else {
      createMutation.mutate(clientData);
    }
  };

  const getActionsForClient = (client: FinancialClient): ActionItem[] => [
    { type: 'edit', label: 'Editar', onClick: () => handleEditClient(client) },
    { type: 'delete', label: 'Excluir', onClick: () => setClientToDelete(client), variant: 'destructive' }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando clientes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes
          </CardTitle>
          <CardDescription>
            Gerencie o cadastro de clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Clientes Cadastrados</h3>
            <Button onClick={handleAddClient}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
          
          <div className="space-y-4">
            {clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cliente cadastrado</p>
                <p className="text-sm">Clique em "Novo Cliente" para adicionar o primeiro cliente.</p>
              </div>
            ) : (
              clients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {client.document && <span>Doc: {client.document}</span>}
                      {client.email && <span>Email: {client.email}</span>}
                      {client.phone && <span>Tel: {client.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>Ativo</Badge>
                    <ActionsDropdown actions={getActionsForClient(client)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar cliente */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {clientToEdit ? 'Atualize as informações do cliente.' : 'Preencha os dados do novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nome *</Label>
                <Input
                  id="client-name"
                  placeholder="Nome completo"
                  value={clientData.name}
                  onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-document">CPF/CNPJ</Label>
                <Input
                  id="client-document"
                  placeholder="000.000.000-00"
                  value={clientData.document}
                  onChange={(e) => setClientData(prev => ({ ...prev, document: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-email">E-mail</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={clientData.email}
                  onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">Telefone</Label>
                <Input
                  id="client-phone"
                  placeholder="(11) 99999-9999"
                  value={clientData.phone}
                  onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-address">Endereço</Label>
              <Input
                id="client-address"
                placeholder="Rua, número, complemento"
                value={clientData.address}
                onChange={(e) => setClientData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-city">Cidade</Label>
                <Input
                  id="client-city"
                  placeholder="Cidade"
                  value={clientData.city}
                  onChange={(e) => setClientData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-state">Estado</Label>
                <Input
                  id="client-state"
                  placeholder="UF"
                  value={clientData.state}
                  onChange={(e) => setClientData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-cep">CEP</Label>
                <Input
                  id="client-cep"
                  placeholder="00000-000"
                  value={clientData.cep}
                  onChange={(e) => setClientData(prev => ({ ...prev, cep: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={resetDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveClient}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para confirmação de exclusão */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o cliente "{clientToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => clientToDelete && deleteMutation.mutate(clientToDelete.id)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
