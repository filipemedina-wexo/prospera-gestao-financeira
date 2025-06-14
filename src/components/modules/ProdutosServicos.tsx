
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export function ProdutosServicos() {
  const [produtos, setProdutos] = useState([
    { 
      id: 1, 
      nome: "Website Institucional", 
      tipo: "Serviço", 
      preco: 2500, 
      descricao: "Desenvolvimento de website institucional completo",
      categoria: "Desenvolvimento Web"
    },
    { 
      id: 2, 
      nome: "Consultoria SEO", 
      tipo: "Serviço", 
      preco: 800, 
      descricao: "Consultoria para otimização de mecanismos de busca",
      categoria: "Marketing Digital"
    },
    { 
      id: 3, 
      nome: "Hospedagem Anual", 
      tipo: "Produto", 
      preco: 360, 
      descricao: "Hospedagem web com suporte 24h",
      categoria: "Infraestrutura"
    }
  ]);

  const [servicos, setServicos] = useState([
    { 
      id: 1, 
      nome: "Manutenção Mensal", 
      preco: 200, 
      descricao: "Manutenção e atualizações mensais",
      duracao: "Mensal"
    },
    { 
      id: 2, 
      nome: "Suporte Técnico", 
      preco: 150, 
      descricao: "Suporte técnico especializado",
      duracao: "Por chamado"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Produtos e Serviços</h1>
      </div>

      <Tabs defaultValue="produtos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input placeholder="Buscar produtos..." className="w-80" />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          <div className="grid gap-4">
            {produtos.map((produto) => (
              <Card key={produto.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{produto.nome}</CardTitle>
                      <CardDescription>{produto.categoria}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Tipo</Label>
                      <p className="text-sm text-muted-foreground">{produto.tipo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Preço</Label>
                      <p className="text-sm text-muted-foreground">R$ {produto.preco.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Descrição</Label>
                      <p className="text-sm text-muted-foreground">{produto.descricao}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="servicos" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input placeholder="Buscar serviços..." className="w-80" />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>

          <div className="grid gap-4">
            {servicos.map((servico) => (
              <Card key={servico.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{servico.nome}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Duração</Label>
                      <p className="text-sm text-muted-foreground">{servico.duracao}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Preço</Label>
                      <p className="text-sm text-muted-foreground">R$ {servico.preco.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Descrição</Label>
                      <p className="text-sm text-muted-foreground">{servico.descricao}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Produtos/Serviços</CardTitle>
              <CardDescription>
                Gerencie as categorias para organizar produtos e serviços
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-categoria">Nome da Categoria</Label>
                  <Input id="nome-categoria" placeholder="Ex: Desenvolvimento Web" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor-categoria">Cor</Label>
                  <Input id="cor-categoria" type="color" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc-categoria">Descrição</Label>
                <Textarea id="desc-categoria" placeholder="Descrição da categoria" />
              </div>
              <Button>Adicionar Categoria</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
