
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Funcionario, Departamento } from "./types";
import { Users, Building, UserCheck, UserX, Plane } from 'lucide-react';

interface DashboardPessoasProps {
    funcionarios: Funcionario[];
    departamentos: Departamento[];
}

const DashboardPessoas = ({ funcionarios, departamentos }: DashboardPessoasProps) => {

    const totalFuncionarios = funcionarios.length;
    const totalAtivos = funcionarios.filter(f => f.status === 'ativo').length;
    const totalInativos = funcionarios.filter(f => f.status === 'inativo').length;
    const totalFerias = funcionarios.filter(f => f.status === 'ferias').length;
    const totalDepartamentos = departamentos.length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalFuncionarios}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalAtivos}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inativos</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalInativos}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Férias</CardTitle>
                <Plane className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalFerias}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalDepartamentos}</div>
            </CardContent>
        </Card>
    </div>
  );
};

export default DashboardPessoas;
