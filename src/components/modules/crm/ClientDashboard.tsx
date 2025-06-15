
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "./types";
import { Users, Cake, DollarSign } from "lucide-react";
import { format, getMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientDashboardProps {
  clients: Client[];
}

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export const ClientDashboard = ({ clients }: ClientDashboardProps) => {
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'Ativo').length;
  
  const currentMonth = getMonth(new Date());
  const birthdayClients = clients.filter(c => c.birthday && getMonth(parseISO(c.birthday)) === currentMonth).length;

  const allPurchases = clients.flatMap(c => c.purchaseHistory || []);
  const totalRevenue = allPurchases.reduce((sum, p) => sum + p.amount, 0);
  const averageTicket = allPurchases.length > 0 ? totalRevenue / allPurchases.length : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total de Clientes" value={totalClients} icon={Users} />
      <StatCard title="Clientes Ativos" value={`${activeClients} / ${totalClients}`} icon={Users} description={`${totalClients > 0 ? Math.round((activeClients/totalClients) * 100) : 0}% dos clientes`} />
      <StatCard title="Aniversariantes do Mês" value={birthdayClients} icon={Cake} description={`No mês de ${format(new Date(), 'MMMM', { locale: ptBR })}`} />
      <StatCard title="Ticket Médio" value={averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={DollarSign} description="Valor médio por compra" />
    </div>
  );
};
