
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Pessoas = () => {
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
      <div className="text-center text-muted-foreground p-8 border rounded-lg">
        <p>Módulo de Gestão de Pessoas em desenvolvimento.</p>
      </div>
    </div>
  );
};

export { Pessoas };
