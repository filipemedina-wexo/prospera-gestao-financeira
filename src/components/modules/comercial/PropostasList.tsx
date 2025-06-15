
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Proposta } from "./types";
import { Eye, Edit, MoreVertical, CheckCircle, XCircle } from "lucide-react";

interface PropostasListProps {
  propostas: Proposta[];
  onStatusChange: (propostaId: string, newStatus: Proposta['status']) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    rascunho: { variant: "secondary" as const, label: "Rascunho" },
    enviada: { variant: "outline" as const, label: "Enviada" },
    aceita: { variant: "default" as const, label: "Aceita" },
    recusada: { variant: "destructive" as const, label: "Recusada" },
    perdida: { variant: "destructive" as const, label: "Perdida" },
    negociacao: { variant: "outline" as const, label: "Em Negociação" }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export function PropostasList({ propostas, onStatusChange }: PropostasListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Propostas</CardTitle>
        <CardDescription>
          Gerencie todas as suas propostas comerciais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Criação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propostas.map((proposta) => (
              <TableRow key={proposta.id}>
                <TableCell className="font-medium">{proposta.titulo}</TableCell>
                <TableCell>{proposta.cliente}</TableCell>
                <TableCell>{proposta.vendedor}</TableCell>
                <TableCell className="font-semibold">
                  R$ {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  {format(proposta.dataCriacao, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{getStatusBadge(proposta.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <span className="sr-only">Ver detalhes</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => onStatusChange(proposta.id, 'aceita')}
                          disabled={proposta.status === 'aceita' || proposta.status === 'recusada' || proposta.faturada}
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span>Aceitar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onStatusChange(proposta.id, 'recusada')}
                          disabled={proposta.status === 'aceita' || proposta.status === 'recusada'}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          <span>Recusar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
