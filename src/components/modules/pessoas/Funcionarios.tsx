
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Funcionario } from "./types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface FuncionariosProps {
    funcionarios: Funcionario[];
}

const statusVariant: Record<Funcionario['status'], 'success' | 'destructive' | 'secondary'> = {
    ativo: 'success',
    inativo: 'destructive',
    ferias: 'secondary',
};

const Funcionarios = ({ funcionarios }: FuncionariosProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Colaboradores</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Departamento</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Data de Admissão</TableHead>
                            <TableHead className="text-right">Salário</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {funcionarios.map(f => (
                            <TableRow key={f.id}>
                                <TableCell className="font-medium">{f.nome}</TableCell>
                                <TableCell>{f.departamento}</TableCell>
                                <TableCell>{f.cargo}</TableCell>
                                <TableCell>{format(f.dataAdmissao, 'dd/MM/yyyy')}</TableCell>
                                <TableCell className="text-right">{f.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={statusVariant[f.status]}>{f.status.charAt(0).toUpperCase() + f.status.slice(1)}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default Funcionarios;
