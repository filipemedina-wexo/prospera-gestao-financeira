
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
          <Select value={filtroCompetencia} onValueChange={setFiltroCompetencia}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as competências" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as competências</SelectItem>
              <SelectItem value="01/2024">01/2024</SelectItem>
              <SelectItem value="02/2024">02/2024</SelectItem>
              <SelectItem value="03/2024">03/2024</SelectItem>
              <SelectItem value="04/2024">04/2024</SelectItem>
              <SelectItem value="05/2024">05/2024</SelectItem>
              <SelectItem value="06/2024">06/2024</SelectItem>
              <SelectItem value="07/2024">07/2024</SelectItem>
              <SelectItem value="08/2024">08/2024</SelectItem>
              <SelectItem value="09/2024">09/2024</SelectItem>
              <SelectItem value="10/2024">10/2024</SelectItem>
              <SelectItem value="11/2024">11/2024</SelectItem>
              <SelectItem value="12/2024">12/2024</SelectItem>
              <SelectItem value="01/2025">01/2025</SelectItem>
              <SelectItem value="02/2025">02/2025</SelectItem>
              <SelectItem value="03/2025">03/2025</SelectItem>
              <SelectItem value="04/2025">04/2025</SelectItem>
              <SelectItem value="05/2025">05/2025</SelectItem>
              <SelectItem value="06/2025">06/2025</SelectItem>
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
