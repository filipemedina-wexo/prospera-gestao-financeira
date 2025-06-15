
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, CreditCard, BarChart3 } from 'lucide-react';
import { ClientesManagement } from './ClientesManagement';
import { PlanosManagement } from './PlanosManagement';
import { AssinaturasManagement } from './AssinaturasManagement';
import { AnalyticsManagement } from './AnalyticsManagement';

export function GestaoSaaS() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Gestão SaaS
          </h2>
          <p className="text-muted-foreground">
            Gerencie clientes, planos, assinaturas e métricas do sistema SaaS.
          </p>
        </div>
      </div>

      <Tabs defaultValue="clientes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="planos" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="assinaturas" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Assinaturas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes">
          <ClientesManagement />
        </TabsContent>

        <TabsContent value="planos">
          <PlanosManagement />
        </TabsContent>

        <TabsContent value="assinaturas">
          <AssinaturasManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
