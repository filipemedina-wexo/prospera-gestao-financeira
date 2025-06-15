
import { useState } from "react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export interface Client {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  nomeContato?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  status: "Ativo" | "Inativo";
}

const initialClients: Client[] = [
  {
    id: "1",
    razaoSocial: "Maria Silva ME",
    nomeFantasia: "Maria Silva Doces",
    cnpj: "12.345.678/0001-99",
    endereco: "Rua das Flores, 123",
    cidade: "São Paulo",
    estado: "SP",
    nomeContato: "Maria Silva",
    email: "maria@email.com",
    telefone: "(11) 99999-9999",
    whatsapp: "(11) 98888-8888",
    status: "Ativo",
  },
  {
    id: "2",
    razaoSocial: "João Souza Comércio Ltda",
    nomeFantasia: "Açougue Souza",
    cnpj: "98.765.432/0001-00",
    endereco: "Av. Central, 500",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    nomeContato: "João Souza",
    email: "joao@email.com",
    telefone: "(21) 98888-8888",
    whatsapp: "",
    status: "Ativo",
  },
  {
    id: "3",
    razaoSocial: "Empresa Exemplo Ltda",
    nomeFantasia: "",
    cnpj: "11.222.333/0001-44",
    endereco: "Praça Sete, 77",
    cidade: "Belo Horizonte",
    estado: "MG",
    nomeContato: "Cláudia Alves",
    email: "contato@exemplo.com",
    telefone: "(31) 97777-7777",
    whatsapp: "",
    status: "Inativo",
  },
];

interface ClientListProps {
  onAddClient: () => void;
}

export function ClientList({ onAddClient }: ClientListProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>(initialClients);

  const filtered = clients.filter(c =>
    [c.razaoSocial, c.nomeFantasia, c.cnpj, c.endereco, c.cidade, c.estado, c.nomeContato, c.email, c.telefone, c.whatsapp]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Input
          placeholder="Buscar por qualquer campo..."
          value={search}
          className="w-full md:max-w-xs"
          onChange={e => setSearch(e.target.value)}
        />
        <Button onClick={onAddClient} className="flex gap-2 items-center w-full md:w-auto">
          <UserPlus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>
      <div className="rounded-lg border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead className="hidden md:table-cell">Apelido/Fantasia</TableHead>
              <TableHead className="hidden md:table-cell">CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="hidden md:table-cell">WhatsApp</TableHead>
              <TableHead className="hidden md:table-cell">Cidade</TableHead>
              <TableHead className="hidden md:table-cell">Estado</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(client => (
              <TableRow key={client.id}>
                <TableCell>{client.razaoSocial}</TableCell>
                <TableCell className="hidden md:table-cell">{client.nomeFantasia}</TableCell>
                <TableCell className="hidden md:table-cell">{client.cnpj}</TableCell>
                <TableCell>{client.nomeContato}</TableCell>
                <TableCell className="hidden md:table-cell">{client.telefone}</TableCell>
                <TableCell className="hidden md:table-cell">{client.whatsapp}</TableCell>
                <TableCell className="hidden md:table-cell">{client.cidade}</TableCell>
                <TableCell className="hidden md:table-cell">{client.estado}</TableCell>
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
