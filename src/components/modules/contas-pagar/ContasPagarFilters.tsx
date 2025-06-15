
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { categorias } from "./config";

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
          <Input
              placeholder="Competência (MM/AAAA)"
              value={filtroCompetencia}
              onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 2) {
                      value = `${value.slice(0, 2)}/${value.slice(2, 6)}`;
                  }
                  setFiltroCompetencia(value);
              }}
              maxLength={7}
              className="w-40"
          />
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
              <SelectItem value="parcial">Parcial</SelectItem>
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
