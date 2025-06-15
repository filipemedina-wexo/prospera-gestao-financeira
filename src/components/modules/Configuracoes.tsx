import { useState } from "react";
// Import UI components individually from their actual locations
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Building, CreditCard, Percent, Tags } from "lucide-react";

interface RegraComissao {
  id: string;
  nome: string;
  descricao: string;
  percentual: number; // ex: 5 para 5%
  editando?: boolean;
}

export const Configuracoes = () => {
  // Estado Regras de Comissão
  const [regrasComissao, setRegrasComissao] = useState<RegraComissao[]>([
    {
      id: "padrao",
      nome: "Comissão Padrão",
      descricao: "Aplicada a todos os produtos",
      percentual: 5,
    },
    {
      id: "premium",
      nome: "Comissão Premium",
      descricao: "Para produtos de alto valor",
      percentual: 8,
    },
  ]);
  const [edicao, setEdicao] = useState<{[id: string]: number}>({});
  const [novaRegra, setNovaRegra] = useState({nome: "", percentual: "", tipo: ""});
  // Novo estado para o logotipo da empresa:
  const [logo, setLogo] = useState<string | null>(null);

  // Handler para upload do logotipo
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

  // Funções de edição inline
  const iniciarEdicao = (regra: RegraComissao) => {
    setEdicao({ ...edicao, [regra.id]: regra.percentual });
    setRegrasComissao(regrasComissao.map(r => r.id === regra.id ? { ...r, editando: true } : r));
  };
  const cancelarEdicao = (regra: RegraComissao) => {
    setEdicao({ ...edicao, [regra.id]: regra.percentual });
    setRegrasComissao(regrasComissao.map(r => r.id === regra.id ? { ...r, editando: false } : r));
  };
  const salvarEdicao = (regra: RegraComissao) => {
    setRegrasComissao(regrasComissao.map(r =>
      r.id === regra.id
        ? { ...r, percentual: edicao[regra.id], editando: false }
        : r
    ));
  };

  // Adicionar nova regra de comissão
  const adicionarRegra = () => {
    if (
      novaRegra.nome.trim() &&
      novaRegra.percentual.trim() &&
      !isNaN(Number(novaRegra.percentual)) &&
      novaRegra.tipo
    ) {
      setRegrasComissao([
        ...regrasComissao,
        {
          id: Date.now().toString(),
          nome: novaRegra.nome.trim(),
          descricao: novaRegra.tipo === "produto" ? "Por Produto" : novaRegra.tipo === "categoria" ? "Por Categoria" : "Por Vendedor",
          percentual: Number(novaRegra.percentual),
        },
      ]);
      setNovaRegra({nome: "", percentual: "", tipo: ""});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="bancos">Bancos</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
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
              {/* CAMPO DE UPLOAD DO LOGO */}
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
        </TabsContent>

        <TabsContent value="comissoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Regras de Comissão
              </CardTitle>
              <CardDescription>
                Configure as regras de comissão para vendedores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {regrasComissao.map(regra => (
                  <div key={regra.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{regra.nome}</h3>
                      <p className="text-sm text-muted-foreground">{regra.descricao}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {regra.editando ? (
                        <>
                          <Input
                            className="w-20"
                            type="number"
                            min={0}
                            value={edicao[regra.id] ?? regra.percentual}
                            onChange={e =>
                              setEdicao({...edicao, [regra.id]: Number(e.target.value)})
                            }
                          />
                          <span>%</span>
                          <Button
                            size="sm"
                            variant="default"
                            className="px-2"
                            onClick={() => salvarEdicao(regra)}
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-2"
                            onClick={() => cancelarEdicao(regra)}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary">{regra.percentual}%</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={() => iniciarEdicao(regra)}
                          >
                            Editar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adicionar Nova Regra</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regra-nome">Nome da Regra</Label>
                    <Input
                      id="regra-nome"
                      value={novaRegra.nome}
                      onChange={e => setNovaRegra(nr => ({...nr, nome: e.target.value}))}
                      placeholder="Ex: Comissão Especial"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentual">Percentual (%)</Label>
                    <Input
                      id="percentual"
                      type="number"
                      min={0}
                      value={novaRegra.percentual}
                      onChange={e => setNovaRegra(nr => ({...nr, percentual: e.target.value}))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={novaRegra.tipo}
                      onValueChange={v => setNovaRegra(nr => ({...nr, tipo: v}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="produto">Por Produto</SelectItem>
                        <SelectItem value="categoria">Por Categoria</SelectItem>
                        <SelectItem value="vendedor">Por Vendedor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={adicionarRegra}>Adicionar Regra</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
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
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Escritório</h3>
                    <p className="text-sm text-muted-foreground">Material de escritório e suprimentos</p>
                  </div>
                  <Badge>Ativa</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Marketing</h3>
                    <p className="text-sm text-muted-foreground">Campanhas e publicidade</p>
                  </div>
                  <Badge>Ativa</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Viagem</h3>
                    <p className="text-sm text-muted-foreground">Despesas de viagem e transporte</p>
                  </div>
                  <Badge>Ativa</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Nova Categoria</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria-nome">Nome da Categoria</Label>
                    <Input id="categoria-nome" placeholder="Ex: Tecnologia" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria-desc">Descrição</Label>
                    <Input id="categoria-desc" placeholder="Descrição da categoria" />
                  </div>
                </div>
                <Button>Adicionar Categoria</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bancos">
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
        </TabsContent>

        <TabsContent value="fornecedores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Fornecedores
              </CardTitle>
              <CardDescription>
                Gerencie o cadastro de fornecedores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Tech Solutions LTDA</h3>
                    <p className="text-sm text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
                  </div>
                  <Badge>Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Office Supplies Inc</h3>
                    <p className="text-sm text-muted-foreground">CNPJ: 98.765.432/0001-10</p>
                  </div>
                  <Badge>Ativo</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Novo Fornecedor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fornecedor-nome">Razão Social</Label>
                    <Input id="fornecedor-nome" placeholder="Nome da empresa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fornecedor-cnpj">CNPJ</Label>
                    <Input id="fornecedor-cnpj" placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fornecedor-email">E-mail</Label>
                    <Input id="fornecedor-email" type="email" placeholder="contato@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fornecedor-telefone">Telefone</Label>
                    <Input id="fornecedor-telefone" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <Button>Adicionar Fornecedor</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
