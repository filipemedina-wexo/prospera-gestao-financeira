
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export function AssinaturasManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Gestão de Assinaturas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Módulo de gestão de assinaturas SaaS em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
}
