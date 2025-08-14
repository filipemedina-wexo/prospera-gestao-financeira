import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ContasReceberFiltersProps {
  busca: string;
  setBusca: (value: string) => void;
  filtroStatus: string;
  setFiltroStatus: (value: string) => void;
  filtroCategoria: string;
  setFiltroCategoria: (value: string) => void;
  categorias: string[];
}

export function ContasReceberFilters({
  busca, setBusca,
  filtroStatus, setFiltroStatus,
  filtroCategoria, setFiltroCategoria,
  categorias
}: ContasReceberFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Buscar por descrição ou cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
            />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
        </Select>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="todas">Todas Categorias</SelectItem>
                {categorias.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
        </Select>
    </div>
  );
}