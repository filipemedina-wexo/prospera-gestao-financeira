
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export function PlanosManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gestão de Planos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Módulo de gestão de planos SaaS em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
}
