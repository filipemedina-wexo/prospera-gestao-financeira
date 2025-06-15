
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function RelatorioDespesasCategoria() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
        <CardDescription>Classificação detalhada dos gastos</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Relatório de despesas por categoria em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
}
