
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { ContaPagar } from "./types";

interface ContasPagarSummaryProps {
  contas: ContaPagar[];
}

export function ContasPagarSummary({ contas }: ContasPagarSummaryProps) {
  const totalPendente = contas
    .filter(c => c.status === 'pendente' || c.status === 'atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  const contasAtrasadas = contas.filter(c => c.status === 'atrasado').length;
  const contasPagas = contas.filter(c => c.status === 'pago').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total a Pagar</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contas Atrasadas</p>
              <p className="text-2xl font-bold text-orange-600">
                {contasAtrasadas}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contas Pagas</p>
              <p className="text-2xl font-bold text-green-600">
                {contasPagas}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
