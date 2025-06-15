
import { useState, useMemo } from "react";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowDownAZ, ArrowUpAZ, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { ClientForm } from "./ClientForm";
import { ColumnSettingsMenu } from "./ColumnSettingsMenu";
import type { Client } from "./types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ClientListProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
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
  { key: "status", label: "Status" },
  { key: "valorTotalCompras", label: "Total Comprado" },
  { key: "dataUltimaCompra", label: "Última Compra" },
  { key: "frequenciaCompra", label: "Frequência" },
];

type SortDirection = "asc" | "desc" | null;

export function ClientList({ clients, setClients }: ClientListProps) {
  const [search, setSearch] = useState("");
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [columns, setColumns] = useState(
    allColumns.map(c => ({ 
      ...c, 
      visible: ['razaoSocial', 'nomeContato', 'telefone', 'status', 'valorTotalCompras'].includes(c.key)
    }))
  );
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const filtered = useMemo(() => {
    let arr = [...clients];
    if (search.trim()) {
      const lowercasedSearch = search.toLowerCase();
      arr = arr.filter(c => {
        const searchable = [
            c.razaoSocial, c.nomeFantasia, c.cnpj, c.endereco, c.cidade, 
            c.estado, c.nomeContato, c.email, c.telefone, c.whatsapp, 
            c.origem, c.frequenciaCompra, c.observacoes
        ].filter(Boolean).join(" ").toLowerCase();
        return searchable.includes(lowercasedSearch);
      });
    }
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

  function handleSort(colKey: string) {
    if (sortColumn !== colKey) {
      setSortColumn(colKey);
      setSortDirection("asc");
    } else {
      setSortDirection(dir => dir === "asc" ? "desc" : (dir === "desc" ? null : "asc"));
      if (sortDirection === "desc") setSortColumn(null);
    }
  }

  function handleEdit(client: Client) {
    setEditingClient(client);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditingClient(null);
    setFormOpen(true);
  }

  function handleSave(updated: Client) {
    if (editingClient) {
      setClients(clis => clis.map(c => (c.id === updated.id ? updated : c)));
    } else {
      setClients(clis => [...clis, updated]);
    }
    setFormOpen(false);
    setEditingClient(null);
  }
  
  function handleDelete(clientId: string) {
    setClients(clients.filter(c => c.id !== clientId));
  }

  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

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
            filters={{}}
            setFilters={() => {}}
          />
          <Button onClick={handleAdd} className="flex gap-2 items-center w-full md:w-auto">
            <UserPlus className="w-4 h-4" /> Novo Cliente
          </Button>
        </div>
      </div>
      <div className="rounded-lg border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map(col => (
                <TableHead
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="select-none cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
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
              <TableHead><span className="sr-only">Ações</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(client => (
                <TableRow key={client.id}>
                  {visibleColumns.map(col => (
                    <TableCell key={col.key}>
                      {col.key === "status" ? (
                        <Badge variant={client.status === 'Ativo' ? 'default' : 'secondary'}>{client.status}</Badge>
                      ) : col.key === 'valorTotalCompras' ? (
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.valorTotalCompras ?? 0)
                      ) : col.key === 'dataUltimaCompra' ? (
                        client.dataUltimaCompra ? new Date(client.dataUltimaCompra).toLocaleDateString('pt-BR') : '-'
                      ) : (
                        (client[col.key as keyof Client] as string) || "-"
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {formOpen && (
        <ClientForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingClient(null); }}
          initialValues={editingClient ?? undefined}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
