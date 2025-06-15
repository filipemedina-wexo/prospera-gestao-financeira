
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export const ConfigClientes = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Clientes
        </CardTitle>
        <CardDescription>
          Gerencie o cadastro de clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">João Silva</h3>
              <p className="text-sm text-muted-foreground">CPF: 123.456.789-00</p>
            </div>
            <Badge>Ativo</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Maria Santos</h3>
              <p className="text-sm text-muted-foreground">CPF: 987.654.321-00</p>
            </div>
            <Badge>Ativo</Badge>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Novo Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente-nome">Nome</Label>
              <Input id="cliente-nome" placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente-cpf">CPF/CNPJ</Label>
              <Input id="cliente-cpf" placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente-email">E-mail</Label>
              <Input id="cliente-email" type="email" placeholder="cliente@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente-telefone">Telefone</Label>
              <Input id="cliente-telefone" placeholder="(11) 99999-9999" />
            </div>
          </div>
          <Button>Adicionar Cliente</Button>
        </div>
      </CardContent>
    </Card>
  );
};
