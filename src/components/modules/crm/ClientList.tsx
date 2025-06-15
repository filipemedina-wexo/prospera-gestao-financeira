
import { useState } from "react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Ativo" | "Inativo";
}

const initialClients: Client[] = [
  { id: "1", name: "Maria Silva", email: "maria.silva@email.com", phone: "(11) 99999-9999", status: "Ativo" },
  { id: "2", name: "João Souza", email: "joao.souza@email.com", phone: "(21) 98888-8888", status: "Ativo" },
  { id: "3", name: "Empresa Exemplo Ltda", email: "contato@exemplo.com", phone: "(31) 97777-7777", status: "Inativo" },
];

interface ClientListProps {
  onAddClient: () => void;
}

export function ClientList({ onAddClient }: ClientListProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>(initialClients);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Input
          placeholder="Buscar por nome, e-mail ou telefone..."
          value={search}
          className="w-full md:max-w-xs"
          onChange={e => setSearch(e.target.value)}
        />
        <Button onClick={onAddClient} className="flex gap-2 items-center w-full md:w-auto">
          <UserPlus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">E-mail</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(client => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                <TableCell className="hidden md:table-cell">{client.phone}</TableCell>
                <TableCell>
                  <span
                    className={
                      client.status === "Ativo"
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {client.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
