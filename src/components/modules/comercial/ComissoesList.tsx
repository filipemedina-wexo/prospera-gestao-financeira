
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Vendedor } from "./types";

interface ComissoesListProps {
  vendedores: Vendedor[];
}

export function ComissoesList({ vendedores }: ComissoesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de Comissões</CardTitle>
        <CardDescription>
          Acompanhe o desempenho dos vendedores e comissões
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>% Comissão</TableHead>
              <TableHead>Meta Mensal</TableHead>
              <TableHead>Vendas do Mês</TableHead>
              <TableHead>% da Meta</TableHead>
              <TableHead>Comissão Acumulada</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendedores.map((vendedor) => {
              const percentualMeta = (vendedor.vendasMes / vendedor.metaMensal) * 100;
              return (
                <TableRow key={vendedor.id}>
                  <TableCell className="font-medium">{vendedor.nome}</TableCell>
                  <TableCell>{vendedor.percentualComissao}%</TableCell>
                  <TableCell>
                    R$ {vendedor.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    R$ {vendedor.vendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={percentualMeta >= 100 ? "default" : "secondary"}>
                      {percentualMeta.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    R$ {vendedor.comissaoAcumulada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={percentualMeta >= 100 ? "default" : "outline"}>
                      {percentualMeta >= 100 ? "Meta Atingida" : "Em Andamento"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
