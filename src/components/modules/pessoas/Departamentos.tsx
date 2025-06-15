
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Departamento, Cargo, Funcionario } from "./types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

interface DepartamentosProps {
    departamentos: Departamento[];
    setDepartamentos: React.Dispatch<React.SetStateAction<Departamento[]>>;
    cargos: Cargo[];
    setCargos: React.Dispatch<React.SetStateAction<Cargo[]>>;
    funcionarios: Funcionario[];
}

const Departamentos = ({ departamentos, cargos, funcionarios }: DepartamentosProps) => {
    
    const getResponsavelNome = (id: string) => {
        return funcionarios.find(f => f.id === id)?.nome || 'Não definido';
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Departamentos</CardTitle>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Departamento
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead className="w-[100px] text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departamentos.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.nome}</TableCell>
                                    <TableCell>{getResponsavelNome(d.responsavelId)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Cargos</CardTitle>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Cargo
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="w-[100px] text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cargos.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.nome}</TableCell>
                                    <TableCell>{c.descricao}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Departamentos;
