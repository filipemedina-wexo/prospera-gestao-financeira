
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Suppliers = () => (
  <Card>
    <CardHeader>
      <CardTitle>Fornecedores</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm">Administre seus fornecedores. (Exemplo: lista, histórico e classificação estratégica)</p>
      {/* Aqui você pode inserir funcionalidades para gestão de fornecedores */}
    </CardContent>
  </Card>
);

export default Suppliers;
