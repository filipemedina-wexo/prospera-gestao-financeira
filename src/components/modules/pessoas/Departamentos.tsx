
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Departamento, Cargo, Funcionario } from "./types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { useToast } from "@/hooks/use-toast";
import { DepartamentoDialog } from "./DepartamentoDialog";
import { CargoDialog } from "./CargoDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DepartamentosProps {
    departamentos: Departamento[];
    setDepartamentos: React.Dispatch<React.SetStateAction<Departamento[]>>;
    cargos: Cargo[];
    setCargos: React.Dispatch<React.SetStateAction<Cargo[]>>;
    funcionarios: Funcionario[];
}

const Departamentos = ({ departamentos, setDepartamentos, cargos, setCargos, funcionarios }: DepartamentosProps) => {
    const { toast } = useToast();
    const [isDepartamentoDialogOpen, setIsDepartamentoDialogOpen] = React.useState(false);
    const [selectedDepartamento, setSelectedDepartamento] = React.useState<Departamento | null>(null);

    const [isCargoDialogOpen, setIsCargoDialogOpen] = React.useState(false);
    const [selectedCargo, setSelectedCargo] = React.useState<Cargo | null>(null);

    const [deleteTarget, setDeleteTarget] = React.useState<{type: 'departamento' | 'cargo', id: string, name: string} | null>(null);
    
    const getResponsavelNome = (id: string) => {
        return funcionarios.find(f => f.id === id)?.nome || 'Não definido';
    }

    const handleAddDepartamento = () => {
        setSelectedDepartamento(null);
        setIsDepartamentoDialogOpen(true);
    };

    const handleEditDepartamento = (departamento: Departamento) => {
        setSelectedDepartamento(departamento);
        setIsDepartamentoDialogOpen(true);
    };

    const handleSaveDepartamento = (departamento: Departamento) => {
        setDepartamentos(prev => {
            const exists = prev.find(d => d.id === departamento.id);
            if (exists) {
                return prev.map(d => d.id === departamento.id ? departamento : d);
            }
            return [...prev, departamento];
        });
    };

    const handleDeleteDepartamento = (id: string) => {
        const departamento = departamentos.find(d => d.id === id);
        const isInUse = funcionarios.some(f => f.departamento === departamento?.nome);
        if (isInUse) {
            toast({
                title: "Erro ao excluir",
                description: "Não é possível excluir um departamento com colaboradores associados.",
                variant: "destructive",
            });
            setDeleteTarget(null);
            return;
        }
        setDepartamentos(prev => prev.filter(d => d.id !== id));
        toast({
            title: "Departamento excluído!",
            description: "O departamento foi excluído com sucesso.",
            className: "bg-green-100 text-green-800",
        });
        setDeleteTarget(null);
    };

    const handleAddCargo = () => {
        setSelectedCargo(null);
        setIsCargoDialogOpen(true);
    };

    const handleEditCargo = (cargo: Cargo) => {
        setSelectedCargo(cargo);
        setIsCargoDialogOpen(true);
    };

    const handleSaveCargo = (cargo: Cargo) => {
        setCargos(prev => {
            const exists = prev.find(c => c.id === cargo.id);
            if (exists) {
                return prev.map(c => c.id === cargo.id ? cargo : c);
            }
            return [...prev, cargo];
        });
    };

    const handleDeleteCargo = (id: string) => {
        const cargo = cargos.find(c => c.id === id);
        const isInUse = funcionarios.some(f => f.cargo === cargo?.nome);
        if (isInUse) {
            toast({
                title: "Erro ao excluir",
                description: "Não é possível excluir um cargo com colaboradores associados.",
                variant: "destructive",
            });
            setDeleteTarget(null);
            return;
        }
        setCargos(prev => prev.filter(c => c.id !== id));
        toast({
            title: "Cargo excluído!",
            description: "O cargo foi excluído com sucesso.",
            className: "bg-green-100 text-green-800",
        });
        setDeleteTarget(null);
    };
    
    const confirmDelete = () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'departamento') {
            handleDeleteDepartamento(deleteTarget.id);
        } else {
            handleDeleteCargo(deleteTarget.id);
        }
    }

    const getActionsForDepartamento = (d: Departamento): ActionItem[] => [
        { type: 'edit', label: 'Editar', onClick: () => handleEditDepartamento(d) },
        { type: 'delete', label: 'Excluir', onClick: () => setDeleteTarget({ type: 'departamento', id: d.id, name: d.nome }), variant: 'destructive' }
    ];

    const getActionsForCargo = (c: Cargo): ActionItem[] => [
        { type: 'edit', label: 'Editar', onClick: () => handleEditCargo(c) },
        { type: 'delete', label: 'Excluir', onClick: () => setDeleteTarget({ type: 'cargo', id: c.id, name: c.nome }), variant: 'destructive' }
    ];
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Departamentos</CardTitle>
                    <Button size="sm" onClick={handleAddDepartamento}>
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
                                        <ActionsDropdown actions={getActionsForDepartamento(d)} />
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
                    <Button size="sm" onClick={handleAddCargo}>
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
                                        <ActionsDropdown actions={getActionsForCargo(c)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <DepartamentoDialog 
                isOpen={isDepartamentoDialogOpen}
                setIsOpen={setIsDepartamentoDialogOpen}
                onSave={handleSaveDepartamento}
                departamento={selectedDepartamento}
                funcionarios={funcionarios}
            />

            <CargoDialog
                isOpen={isCargoDialogOpen}
                setIsOpen={setIsCargoDialogOpen}
                onSave={handleSaveCargo}
                cargo={selectedCargo}
            />
            
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o {deleteTarget?.type === 'departamento' ? 'departamento' : 'cargo'}
                            <strong> {deleteTarget?.name}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Departamentos;
