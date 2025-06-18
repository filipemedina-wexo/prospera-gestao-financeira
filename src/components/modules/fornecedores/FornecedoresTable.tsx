
import { Fornecedor } from "./types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ActionExpandableTabs, ActionItem } from "@/components/ui/action-expandable-tabs";

interface FornecedoresTableProps {
  fornecedores: Fornecedor[];
  onEdit: (fornecedor: Fornecedor) => void;
  onDelete: (id: string) => void;
}

export const FornecedoresTable = ({ fornecedores, onEdit, onDelete }: FornecedoresTableProps) => {
  const getActionsForFornecedor = (fornecedor: Fornecedor): ActionItem[] => [
    {
      type: 'edit',
      label: 'Editar',
      onClick: () => onEdit(fornecedor),
    },
    {
      type: 'delete',
      label: 'Deletar',
      onClick: () => onDelete(fornecedor.id),
      variant: 'destructive',
    }
  ];

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
              <ActionExpandableTabs actions={getActionsForFornecedor(fornecedor)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
