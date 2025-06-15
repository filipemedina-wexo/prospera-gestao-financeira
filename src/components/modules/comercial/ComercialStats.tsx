
import { Card, CardContent } from "@/components/ui/card";
import { Proposta, Vendedor } from "./types";
import { FileText, Users, TrendingUp, Calculator } from "lucide-react";

interface ComercialStatsProps {
  propostas: Proposta[];
  vendedores: Vendedor[];
}

export function ComercialStats({ propostas, vendedores }: ComercialStatsProps) {
  const propostasAceitas = propostas.filter(p => p.status === 'aceita');
  const taxaConversao = propostas.length > 0 ? (propostasAceitas.length / propostas.length) * 100 : 0;
  const faturamentoTotal = propostasAceitas.reduce((sum, p) => sum + p.valorTotal, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Propostas Ativas</p>
              <p className="text-2xl font-bold text-blue-600">{propostas.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa Conversão</p>
              <p className="text-2xl font-bold text-green-600">{taxaConversao.toFixed(1)}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {(faturamentoTotal / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendedores</p>
              <p className="text-2xl font-bold text-orange-600">{vendedores.length}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
