
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Clients from "./crm/Clients";
import Suppliers from "./crm/Suppliers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CRM = () => (
  <div>
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>CRM - Gestão do Relacionamento</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Tenha uma visão 360º dos seus clientes, otimize fornecedores, controle oportunidades e impulsione campanhas, tudo em um só lugar.
        </p>
      </CardContent>
    </Card>
    <Tabs defaultValue="clients" className="w-full">
      <TabsList>
        <TabsTrigger value="clients">Clientes</TabsTrigger>
        <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
      </TabsList>
      <TabsContent value="clients"><Clients /></TabsContent>
      <TabsContent value="suppliers"><Suppliers /></TabsContent>
    </Tabs>
  </div>
);

export { CRM };
