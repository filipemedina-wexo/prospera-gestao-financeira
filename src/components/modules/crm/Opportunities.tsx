
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Opportunities = () => (
  <Card>
    <CardHeader>
      <CardTitle>Oportunidades</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm">Visualize e acompanhe oportunidades comerciais. (Exemplo: pipeline de vendas, status etc.)</p>
      {/* Você pode futuramente evoluir este bloco para um Kanban ou pipeline de vendas */}
    </CardContent>
  </Card>
);

export default Opportunities;
