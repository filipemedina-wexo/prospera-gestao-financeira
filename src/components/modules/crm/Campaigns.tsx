
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Campaigns = () => (
  <Card>
    <CardHeader>
      <CardTitle>Campanhas de Marketing</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm">Gerencie campanhas para atingir clientes e prospects. (Exemplo: campanhas ativas, agendadas, métricas)</p>
      {/* Futuramente adicione aqui controles para criar e editar campanhas */}
    </CardContent>
  </Card>
);

export default Campaigns;
