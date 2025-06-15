import { useState, useMemo } from "react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
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

type SortDirection = "asc" | "desc" | null;

export function ClientList({ onAddClient }: ClientListProps) {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>(initialClients);

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  // Controle de colunas (ordem + visibilidade)
  const [columns, setColumns] = useState(allColumns.map(c => ({ ...c, visible: true })));

  // Ordenação
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filtros por coluna (será removido)
  // const [filters, setFilters] = useState<{ [k: string]: string }>({});

  // Filtragem por busca livre
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
    // Ordenação
    if (sortColumn && sortDirection) {
      arr.sort((a, b) => {
        const aValue = String(a[sortColumn as keyof Client] ?? "").toLowerCase();
        const bValue = String(b[sortColumn as keyof Client] ?? "").toLowerCase();
        if (aValue === bValue) return 0;
        if (sortDirection === "asc") return aValue > bValue ? 1 : -1;
        return aValue < bValue ? 1 : -1;
      });
    }
    return arr;
  }, [clients, search, sortColumn, sortDirection]);

  // Clique em coluna: alterna ordem
  function handleSort(colKey: string) {
    if (sortColumn !== colKey) {
      setSortColumn(colKey);
      setSortDirection("asc");
    } else {
      setSortDirection(dir => dir === "asc" ? "desc" : (dir === "desc" ? null : "asc"));
      if (sortDirection === "desc") setSortColumn(null);
    }
  }

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
            filters={{}} // removido uso de filtros
            setFilters={() => {}} // função dummy, sem efeito
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
                <TableHead
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="select-none cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {/* Ícone de ordenação */}
                    {sortColumn === col.key ? (
                      sortDirection === "asc" ? (
                        <ArrowDownAZ className="w-4 h-4 text-primary group-hover:text-primary/80" />
                      ) : sortDirection === "desc" ? (
                        <ArrowUpAZ className="w-4 h-4 text-primary group-hover:text-primary/80" />
                      ) : null
                    ) : (
                      <ArrowDownAZ className="w-4 h-4 opacity-30" />
                    )}
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
