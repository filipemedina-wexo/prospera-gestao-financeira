
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, BarChart3, Activity, Settings2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { ClientesManagement } from './ClientesManagement';
import { PlanosManagement } from './PlanosManagement';
import { AssinaturasManagement } from './AssinaturasManagement';
import { OnboardingManagement } from './OnboardingManagement';
import { AnalyticsManagement } from './AnalyticsManagement';
import { AuditLog } from './AuditLog';

export default function GestaoSaaS() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!hasPermission('saas.manage')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você não tem permissão para acessar a gestão SaaS.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestão SaaS</h2>
        <p className="text-muted-foreground">
          Gerencie clientes, planos, assinaturas e monitore o sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="planos" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="assinaturas" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Assinaturas
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SuperAdminDashboard />
        </TabsContent>

        <TabsContent value="clientes">
          <ClientesManagement />
        </TabsContent>

        <TabsContent value="onboarding">
          <OnboardingManagement />
        </TabsContent>

        <TabsContent value="planos">
          <PlanosManagement />
        </TabsContent>

        <TabsContent value="assinaturas">
          <AssinaturasManagement />
        </TabsContent>

        <TabsContent value="auditoria">
          <AuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}
