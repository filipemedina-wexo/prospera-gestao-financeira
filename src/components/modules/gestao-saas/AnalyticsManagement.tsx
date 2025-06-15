
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function AnalyticsManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics SaaS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Módulo de analytics SaaS em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
}
