
import { useState, useMemo } from "react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Filter } from "lucide-react";
import { ClientForm } from "./ClientForm";
import { ColumnSettingsMenu } from "./ColumnSettingsMenu";

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

const allColumns = [
  { key: "razaoSocial", label: "Razão Social" },
  { key: "nomeFantasia", label: "Apelido/Fantasia" },
  { key: "cnpj", label: "CNPJ" },
  { key: "nomeContato", label: "Contato" },
  { key: "telefone", label: "Telefone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" },
  { key: "status", label: "Status" }
];

export function ClientList({ onAddClient }: ClientListProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>(initialClients);

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  // Controle de colunas (ordem + visibilidade)
  const [columns, setColumns] = useState(allColumns.map(c => ({ ...c, visible: true })));

  // Filtros por coluna
  const [filters, setFilters] = useState<{ [k: string]: string }>({});

  // Filtragem por busca livre + por coluna
  const filtered = useMemo(() => {
    let arr = [...clients];
    // Filtro por termo livre
    if (search.trim()) {
      arr = arr.filter(c =>
        [c.razaoSocial, c.nomeFantasia, c.cnpj, c.endereco, c.cidade, c.estado, c.nomeContato, c.email, c.telefone, c.whatsapp]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }
    // Filtro por coluna específica
    Object.entries(filters).forEach(([key, val]) => {
      if (val) {
        arr = arr.filter(c => (c[key as keyof Client] ?? "").toLowerCase().includes(val.toLowerCase()));
      }
    });
    return arr;
  }, [clients, search, filters]);

  // Lida com clique em linha para editar
  function handleRowClick(client: Client) {
    setEditClient(client);
    setEditOpen(true);
  }

  // Lida com salvamento do formulário de edição
  function handleSaveEdit(updated: Client) {
    setClients(clis =>
      clis.map(c => (c.id === updated.id ? updated : c))
    );
    setEditOpen(false);
    setEditClient(null);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Input
          placeholder="Buscar por qualquer campo..."
          value={search}
          className="w-full md:max-w-xs"
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <ColumnSettingsMenu
            columns={columns}
            setColumns={setColumns}
            filters={filters}
            setFilters={setFilters}
          />
          <Button onClick={onAddClient} className="flex gap-2 items-center w-full md:w-auto">
            <UserPlus className="w-4 h-4" /> Novo Cliente
          </Button>
        </div>
      </div>
      <div className="rounded-lg border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.filter(c => c.visible).map(col => (
                <TableHead key={col.key}>
                  <div className="flex flex-col">
                    <span>{col.label}</span>
                    {/* Barra de filtro por coluna */}
                    <Input
                      value={filters[col.key] || ""}
                      onChange={e => setFilters(f => ({ ...f, [col.key]: e.target.value }))}
                      placeholder="Filtrar"
                      className="h-6 px-2 mt-1 text-xs"
                    />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.filter(c => c.visible).length} className="text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(client => (
              <TableRow
                key={client.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(client)}
                tabIndex={0}
                aria-label="Editar cliente"
              >
                {columns.filter(c => c.visible).map(col => (
                  <TableCell key={col.key}>
                    {/* Status com cor, resto valor literal */}
                    {col.key === "status" ? (
                      <span
                        className={
                          client.status === "Ativo"
                            ? "text-green-600 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {client.status}
                      </span>
                    ) : (
                      client[col.key as keyof Client] || "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editOpen && editClient && (
        <ClientForm
          open={editOpen}
          onClose={() => { setEditOpen(false); setEditClient(null); }}
          initialValues={editClient}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
