
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function RelatorioContasPagar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Contas a Pagar</CardTitle>
        <CardDescription>Análise detalhada das obrigações financeiras</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Relatório específico de contas a pagar em desenvolvimento...
        </p>
      </CardContent>
    </Card>
  );
}
