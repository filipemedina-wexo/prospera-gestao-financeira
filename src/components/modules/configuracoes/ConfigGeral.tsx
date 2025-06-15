
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";

export const ConfigGeral = () => {
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações Gerais
        </CardTitle>
        <CardDescription>
          Configure as informações básicas do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="logo">Logotipo da Empresa</Label>
          <div className="flex items-center gap-4 mt-2">
            <Input
              id="logo"
              type="file"
              accept="image/*"
              className="w-auto"
              onChange={handleLogoChange}
            />
            {logo && (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={logo}
                  alt="Prévia do logo"
                  className="w-24 h-24 object-cover border rounded shadow"
                />
                <span className="text-xs text-muted-foreground">Prévia</span>
              </div>
            )}
          </div>
          <span className="block text-xs text-muted-foreground mt-2">
            Arquivo recomendado: PNG ou JPG. Máx. 1MB.
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="empresa">Nome da Empresa</Label>
            <Input id="empresa" placeholder="Digite o nome da empresa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0000-00" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Textarea id="endereco" placeholder="Digite o endereço completo" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="empresa@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" placeholder="(11) 99999-9999" />
          </div>
        </div>
        <Button>Salvar Configurações</Button>
      </CardContent>
    </Card>
  );
};
