
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Percent } from "lucide-react";
import { RegraComissao } from "./types";

export const ConfigComissoes = () => {
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

  const iniciarEdicao = (regra: RegraComissao) => {
    setEdicao({ ...edicao, [regra.id]: regra.percentual });
    setRegrasComissao(regrasComissao.map(r => r.id === regra.id ? { ...r, editando: true } : r));
  };
  const cancelarEdicao = (regra: RegraComissao) => {
    setRegrasComissao(regrasComissao.map(r => r.id === regra.id ? { ...r, editando: false } : r));
  };
  const salvarEdicao = (regra: RegraComissao) => {
    setRegrasComissao(regrasComissao.map(r =>
      r.id === regra.id
        ? { ...r, percentual: edicao[regra.id], editando: false }
        : r
    ));
  };

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
  );
}
