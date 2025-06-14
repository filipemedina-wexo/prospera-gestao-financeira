
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Users, DollarSign, Building, Tags } from "lucide-react";
import { useState } from "react";

export function Configuracoes() {
  const [comissoes, setComissoes] = useState([
    { id: 1, vendedor: "João Silva", percentual: 5, meta: 10000 },
    { id: 2, vendedor: "Maria Santos", percentual: 4, meta: 8000 }
  ]);

  const [categorias, setCategorias] = useState([
    { id: 1, nome: "Marketing", descricao: "Despesas de marketing e publicidade" },
    { id: 2, nome: "Escritório", descricao: "Material de escritório e suprimentos" },
    { id: 3, nome: "Viagem", descricao: "Despesas de viagem e hospedagem" }
  ]);

  const [contas, setContas] = useState([
    { id: 1, nome: "Banco do Brasil", tipo: "Conta Corrente", saldo: 15000 },
    { id: 2, nome: "Caixa Econômica", tipo: "Poupança", saldo: 5000 }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="comissoes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="contas">Contas</TabsTrigger>
          <TabsTrigger value="geral">Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="comissoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Regras de Comissão
              </CardTitle>
              <CardDescription>
                Configure as regras de comissão para vendedores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-medium">
                <div>Vendedor</div>
                <div>Percentual (%)</div>
                <div>Meta (R$)</div>
                <div>Ações</div>
              </div>
              {comissoes.map((comissao) => (
                <div key={comissao.id} className="grid grid-cols-4 gap-4 items-center">
                  <Input value={comissao.vendedor} readOnly />
                  <Input value={comissao.percentual} type="number" />
                  <Input value={comissao.meta} type="number" />
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              ))}
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Adicionar Vendedor
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Categorias de Despesas
              </CardTitle>
              <CardDescription>
                Gerencie as categorias para classificação de despesas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 font-medium">
                <div>Nome</div>
                <div>Descrição</div>
                <div>Ações</div>
              </div>
              {categorias.map((categoria) => (
                <div key={categoria.id} className="grid grid-cols-3 gap-4 items-center">
                  <Input value={categoria.nome} />
                  <Input value={categoria.descricao} />
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              ))}
              <Button className="w-full">
                <Tags className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Contas Bancárias
              </CardTitle>
              <CardDescription>
                Configure suas contas bancárias e formas de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-medium">
                <div>Nome</div>
                <div>Tipo</div>
                <div>Saldo (R$)</div>
                <div>Ações</div>
              </div>
              {contas.map((conta) => (
                <div key={conta.id} className="grid grid-cols-4 gap-4 items-center">
                  <Input value={conta.nome} />
                  <Input value={conta.tipo} />
                  <Input value={conta.saldo} type="number" readOnly />
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              ))}
              <Button className="w-full">
                <Building className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configurações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(00) 0000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="empresa@email.com" />
                </div>
              </div>
              <Button className="w-full">Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
