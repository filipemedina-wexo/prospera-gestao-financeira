
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ClientForm } from "./ClientForm";
import { Client } from "./types";
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from "lucide-react";

interface ClientsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const Clients = ({ clients, setClients }: ClientsProps) => {
  const [openForm, setOpenForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  const handleAddClient = () => {
    setEditingClient(undefined);
    setOpenForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setOpenForm(true);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId));
  };
  
  const handleSaveClient = (client: Client) => {
    if (editingClient) {
      setClients(clients.map(c => c.id === client.id ? client : c));
    } else {
      setClients([...clients, client]);
    }
    setEditingClient(undefined);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Clientes</CardTitle>
        <Button onClick={handleAddClient}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-4">
          Gerencie sua base de clientes de maneira eficiente. Use busca, adicione e visualize clientes.
        </p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length > 0 ? clients.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.razaoSocial}</TableCell>
                  <TableCell>{client.nomeContato}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.telefone}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'Ativo' ? 'default' : 'secondary'}>{client.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClient(client.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ClientForm 
          open={openForm} 
          onClose={() => setOpenForm(false)} 
          initialValues={editingClient}
          onSave={handleSaveClient}
        />
      </CardContent>
    </Card>
  );
};

export default Clients;
