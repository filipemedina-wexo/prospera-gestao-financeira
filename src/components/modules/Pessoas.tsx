
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Departamento, Funcionario } from "./pessoas/types";
import DashboardPessoas from "./pessoas/DashboardPessoas";
import Funcionarios from "./pessoas/Funcionarios";
import Departamentos from "./pessoas/Departamentos";
import FolhaPagamento from "./pessoas/FolhaPagamento";
import GestaoFerias from "./pessoas/GestaoFerias";
import RelatoriosPessoas from "./pessoas/RelatoriosPessoas";

interface PessoasProps {
    funcionarios: Funcionario[];
    setFuncionarios: React.Dispatch<React.SetStateAction<Funcionario[]>>;
    departamentos: Departamento[];
    setDepartamentos: React.Dispatch<React.SetStateAction<Departamento[]>>;
}

const Pessoas = ({ funcionarios }: PessoasProps) => {
  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Gestão de Pessoas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Gerencie colaboradores, folhas de pagamento, férias e muito mais.
          </p>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="funcionarios" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="funcionarios">Colaboradores</TabsTrigger>
          <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
          <TabsTrigger value="folha">Folha</TabsTrigger>
          <TabsTrigger value="ferias">Férias</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <DashboardPessoas />
        </TabsContent>
        <TabsContent value="funcionarios">
          <Funcionarios funcionarios={funcionarios} />
        </TabsContent>
        <TabsContent value="departamentos">
          <Departamentos />
        </TabsContent>
        <TabsContent value="folha">
          <FolhaPagamento />
        </TabsContent>
        <TabsContent value="ferias">
          <GestaoFerias />
        </TabsContent>
        <TabsContent value="relatorios">
          <RelatoriosPessoas />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { Pessoas };
