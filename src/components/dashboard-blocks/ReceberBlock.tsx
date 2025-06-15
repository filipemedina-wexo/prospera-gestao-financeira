
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";

interface Props {
  value: number;
}
const ReceberBlock = ({ value }: Props) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">A Receber</CardTitle>
      <PiggyBank className="h-4 w-4 text-green-600" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-green-600">
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        +5.2% em relação ao mês anterior
      </p>
    </CardContent>
  </Card>
);
export default ReceberBlock;
