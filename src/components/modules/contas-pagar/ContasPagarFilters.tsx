
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { categorias } from "./config";
import { gerarCompetencias } from "@/utils/competencias";

interface ContasPagarFiltersProps {
  busca: string;
  setBusca: (value: string) => void;
  filtroCompetencia: string;
  setFiltroCompetencia: (value: string) => void;
  filtroStatus: string;
  setFiltroStatus: (value: string) => void;
  filtroCategoria: string;
  setFiltroCategoria: (value: string) => void;
}

export function ContasPagarFilters({
  busca, setBusca,
  filtroCompetencia, setFiltroCompetencia,
  filtroStatus, setFiltroStatus,
  filtroCategoria, setFiltroCategoria
}: ContasPagarFiltersProps) {
  const competencias = gerarCompetencias();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros e Busca</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou fornecedor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filtroCompetencia} onValueChange={setFiltroCompetencia}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as competências" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as competências</SelectItem>
              {competencias.map((comp) => (
                <SelectItem key={comp} value={comp}>{comp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Todas as Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Categorias</SelectItem>
              {categorias.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
