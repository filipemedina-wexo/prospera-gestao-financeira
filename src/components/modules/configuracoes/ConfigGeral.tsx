
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import { useConfig } from "@/contexts/ConfigContext";
import { useToast } from "@/hooks/use-toast";

export const ConfigGeral = () => {
  const { 
    companyName, 
    setCompanyName,
    companyEmail,
    setCompanyEmail,
    companyCNPJ,
    setCompanyCNPJ,
    companyAddress,
    setCompanyAddress,
    companyPhone,
    setCompanyPhone,
    companyLogo,
    setCompanyLogo,
    saveConfig 
  } = useConfig();
  
  const { toast } = useToast();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setCompanyLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    saveConfig();
    toast({
      title: "Configurações salvas",
      description: "As configurações gerais foram salvas com sucesso.",
    });
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
            {companyLogo && (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={companyLogo}
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
            <Input 
              id="empresa" 
              placeholder="Digite o nome da empresa" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input 
              id="cnpj" 
              placeholder="00.000.000/0000-00" 
              value={companyCNPJ}
              onChange={(e) => setCompanyCNPJ(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Textarea 
            id="endereco" 
            placeholder="Digite o endereço completo" 
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="empresa@exemplo.com" 
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input 
              id="telefone" 
              placeholder="(11) 99999-9999" 
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </CardContent>
    </Card>
  );
};
