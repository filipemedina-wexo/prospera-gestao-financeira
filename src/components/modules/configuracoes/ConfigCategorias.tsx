
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tags, Edit, Trash2 } from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { CategoriaDespesa } from "./types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export const ConfigCategorias = () => {
  const [categoriasDespesa, setCategoriasDespesa] = useState<CategoriaDespesa[]>([
    { id: 'escritorio', nome: 'Escritório', descricao: 'Material de escritório e suprimentos' },
    { id: 'marketing', nome: 'Marketing', descricao: 'Campanhas e publicidade' },
    { id: 'viagem', nome: 'Viagem', descricao: 'Despesas de viagem e transporte' },
  ]);
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '' });
  const [edicaoCategoria, setEdicaoCategoria] = useState<Omit<CategoriaDespesa, 'id' | 'editando'>>({ nome: '', descricao: '' });
  const [categoriaParaRemover, setCategoriaParaRemover] = useState<CategoriaDespesa | null>(null);

  const adicionarCategoria = () => {
    if (novaCategoria.nome.trim() && novaCategoria.descricao.trim()) {
      setCategoriasDespesa([
        ...categoriasDespesa,
        {
          id: Date.now().toString(),
          nome: novaCategoria.nome.trim(),
          descricao: novaCategoria.descricao.trim(),
        },
      ]);
      setNovaCategoria({ nome: '', descricao: '' });
    }
  };

  const removerCategoria = () => {
    if (categoriaParaRemover) {
      setCategoriasDespesa(categoriasDespesa.filter(c => c.id !== categoriaParaRemover.id));
      setCategoriaParaRemover(null);
    }
  };

  const iniciarEdicaoCategoria = (categoria: CategoriaDespesa) => {
    setEdicaoCategoria({ nome: categoria.nome, descricao: categoria.descricao });
    setCategoriasDespesa(categoriasDespesa.map(c =>
      c.id === categoria.id ? { ...c, editando: true } : { ...c, editando: false }
    ));
  };

  const cancelarEdicaoCategoria = (categoria: CategoriaDespesa) => {
    setCategoriasDespesa(categoriasDespesa.map(c =>
      c.id === categoria.id ? { ...c, editando: false } : c
    ));
  };

  const salvarEdicaoCategoria = (categoria: CategoriaDespesa) => {
    setCategoriasDespesa(categoriasDespesa.map(c =>
      c.id === categoria.id
        ? { ...c, nome: edicaoCategoria.nome, descricao: edicaoCategoria.descricao, editando: false }
        : c
    ));
  };

  const getActionsForCategoria = (categoria: CategoriaDespesa): ActionItem[] => [
    { type: 'edit', label: 'Editar', onClick: () => iniciarEdicaoCategoria(categoria) },
    { type: 'delete', label: 'Excluir', onClick: () => setCategoriaParaRemover(categoria), variant: 'destructive' }
  ];

  return (
    <>
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
            {categoriasDespesa.map(categoria => (
              <div key={categoria.id} className="flex items-center justify-between p-4 border rounded-lg min-h-[72px]">
                {categoria.editando ? (
                  <div className="flex-grow flex items-center gap-2 w-full">
                    <Input
                      value={edicaoCategoria.nome}
                      onChange={(e) => setEdicaoCategoria(c => ({ ...c, nome: e.target.value }))}
                      placeholder="Nome da Categoria"
                      className="flex-1"
                    />
                    <Input
                      value={edicaoCategoria.descricao}
                      onChange={(e) => setEdicaoCategoria(c => ({ ...c, descricao: e.target.value }))}
                      placeholder="Descrição"
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => salvarEdicaoCategoria(categoria)}>Salvar</Button>
                    <Button size="sm" variant="outline" onClick={() => cancelarEdicaoCategoria(categoria)}>Cancelar</Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium">{categoria.nome}</h3>
                      <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ActionsDropdown actions={getActionsForCategoria(categoria)} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Nova Categoria</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria-nome">Nome da Categoria</Label>
                <Input
                  id="categoria-nome"
                  placeholder="Ex: Tecnologia"
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria(c => ({...c, nome: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria-desc">Descrição</Label>
                <Input
                  id="categoria-desc"
                  placeholder="Descrição da categoria"
                  value={novaCategoria.descricao}
                  onChange={(e) => setNovaCategoria(c => ({...c, descricao: e.target.value}))}
                />
              </div>
            </div>
            <Button onClick={adicionarCategoria}>Adicionar Categoria</Button>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={!!categoriaParaRemover} onOpenChange={(open) => !open && setCategoriaParaRemover(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá remover permanentemente a categoria
              de despesa "{categoriaParaRemover?.nome}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={removerCategoria}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
