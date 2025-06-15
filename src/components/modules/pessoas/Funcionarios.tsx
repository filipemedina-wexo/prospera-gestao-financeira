
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Funcionario, Departamento, Cargo } from "./types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { FuncionarioDialog } from "./FuncionarioDialog";
import { useToast } from "@/hooks/use-toast";

interface FuncionariosProps {
    funcionarios: Funcionario[];
    setFuncionarios: React.Dispatch<React.SetStateAction<Funcionario[]>>;
    departamentos: Departamento[];
    cargos: Cargo[];
}

const statusVariant: Record<Funcionario['status'], "default" | "destructive" | "secondary"> = {
    ativo: 'default',
    inativo: 'destructive',
    ferias: 'secondary',
};

const Funcionarios = ({ funcionarios, setFuncionarios, departamentos, cargos }: FuncionariosProps) => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);

    const handleSave = (funcionario: Funcionario) => {
        const isEditing = funcionarios.some(f => f.id === funcionario.id);
        if (isEditing) {
            setFuncionarios(funcionarios.map(f => f.id === funcionario.id ? funcionario : f));
        } else {
            setFuncionarios([...funcionarios, funcionario]);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza de que deseja excluir este colaborador?")) {
            setFuncionarios(funcionarios.filter(f => f.id !== id));
            toast({
                title: "Colaborador excluído!",
                description: "O colaborador foi removido com sucesso.",
                className: "bg-green-100 text-green-800",
            });
        }
    };
    
    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Colaboradores</CardTitle>
                    <Button size="sm" onClick={() => { setSelectedFuncionario(null); setIsDialogOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Colaborador
                    </Button>
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
                                <TableHead className="text-right w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {funcionarios.map(f => (
                                <TableRow key={f.id}>
                                    <TableCell className="font-medium">{f.nome}</TableCell>
                                    <TableCell>{f.departamento}</TableCell>
                                    <TableCell>{f.cargo}</TableCell>
                                    <TableCell>{format(new Date(f.dataAdmissao), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right">{f.salario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={statusVariant[f.status]}>{f.status.charAt(0).toUpperCase() + f.status.slice(1)}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedFuncionario(f); setIsDialogOpen(true); }}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {isDialogOpen && (
                <FuncionarioDialog 
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    onSave={handleSave}
                    funcionario={selectedFuncionario}
                    departamentos={departamentos}
                    cargos={cargos}
                />
            )}
        </>
    );
};

export default Funcionarios;
