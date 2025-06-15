
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function RelatorioInadimplencia() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Inadimplência</CardTitle>
        <CardDescription>Contas em atraso e análise de risco</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Relatório de inadimplência em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
}
