
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Clients = () => (
  <Card>
    <CardHeader>
      <CardTitle>Clientes</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm">Gerencie sua base de clientes de maneira eficiente. (Exemplo: lista de clientes, adicionar, editar, buscar etc.)</p>
      {/* Aqui você pode inserir tabelas, filtros e formulários futuramente */}
    </CardContent>
  </Card>
);

export default Clients;
