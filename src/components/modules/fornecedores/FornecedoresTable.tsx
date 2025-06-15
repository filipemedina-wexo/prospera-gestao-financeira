
import { Fornecedor } from "./types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface FornecedoresTableProps {
  fornecedores: Fornecedor[];
  onEdit: (fornecedor: Fornecedor) => void;
  onDelete: (id: string) => void;
}

export const FornecedoresTable = ({ fornecedores, onEdit, onDelete }: FornecedoresTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Razão Social</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Próximo Pagamento</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead>Data de Cadastro</TableHead>
          <TableHead><span className="sr-only">Ações</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fornecedores.map((fornecedor) => (
          <TableRow key={fornecedor.id}>
            <TableCell className="font-medium">
              <div>{fornecedor.razaoSocial}</div>
              <div className="text-sm text-muted-foreground">{fornecedor.nomeFantasia}</div>
            </TableCell>
            <TableCell>{fornecedor.cnpj}</TableCell>
            <TableCell>
              <Badge variant={fornecedor.status === 'Ativo' ? 'default' : 'destructive'}>{fornecedor.status}</Badge>
            </TableCell>
            <TableCell>
              {fornecedor.proximoPagamento
                ? format(new Date(fornecedor.proximoPagamento), "dd/MM/yyyy")
                : '-'}
            </TableCell>
            <TableCell className="text-right">
              {fornecedor.valorProximoPagamento
                ? fornecedor.valorProximoPagamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '-'}
            </TableCell>
            <TableCell>{format(new Date(fornecedor.dataCadastro), "dd/MM/yyyy")}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(fornecedor)}>Editar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(fornecedor.id)} className="text-red-600">Deletar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
