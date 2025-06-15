
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface Props {
  value: number;
}
const PagarBlock = ({ value }: Props) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
      <CreditCard className="h-4 w-4 text-red-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-red-600">
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        -2.1% em relação ao mês anterior
      </p>
    </CardContent>
  </Card>
);
export default PagarBlock;
