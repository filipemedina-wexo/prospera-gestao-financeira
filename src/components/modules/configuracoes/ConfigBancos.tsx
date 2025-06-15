
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export const ConfigBancos = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Contas Bancárias
        </CardTitle>
        <CardDescription>
          Gerencie as contas bancárias da empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Banco do Brasil - CC</h3>
              <p className="text-sm text-muted-foreground">Ag: 1234-5 • CC: 12345-6</p>
            </div>
            <Badge variant="outline">Principal</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Santander - Poupança</h3>
              <p className="text-sm text-muted-foreground">Ag: 5678-9 • CP: 98765-4</p>
            </div>
            <Badge variant="secondary">Reserva</Badge>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Nova Conta</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banco">Banco</Label>
              <Input id="banco" placeholder="Nome do banco" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agencia">Agência</Label>
              <Input id="agencia" placeholder="0000-0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conta">Conta</Label>
              <Input id="conta" placeholder="00000-0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo-conta">Tipo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo da conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Poupança</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button>Adicionar Conta</Button>
        </div>
      </CardContent>
    </Card>
  );
};
