
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import { ConfigGeral } from "./configuracoes/ConfigGeral";
import { ConfigComissoes } from "./configuracoes/ConfigComissoes";
import { ConfigCategorias } from "./configuracoes/ConfigCategorias";
import { ConfigBancos } from "./configuracoes/ConfigBancos";
import { ConfigClientes } from "./configuracoes/ConfigClientes";

export const Configuracoes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="bancos">Bancos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <ConfigGeral />
        </TabsContent>

        <TabsContent value="comissoes">
          <ConfigComissoes />
        </TabsContent>

        <TabsContent value="categorias">
          <ConfigCategorias />
        </TabsContent>

        <TabsContent value="bancos">
          <ConfigBancos />
        </TabsContent>

        <TabsContent value="clientes">
          <ConfigClientes />
        </TabsContent>
      </Tabs>
    </div>
  );
};
