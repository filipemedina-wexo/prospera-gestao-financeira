import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TipoFornecedor } from "./types";
import { TipoFornecedorDialog } from "./TipoFornecedorDialog";
import { useToast } from "@/hooks/use-toast";

interface GerenciarTiposProps {
  tipos: TipoFornecedor[];
  setTipos: React.Dispatch<React.SetStateAction<TipoFornecedor[]>>;
}

export const GerenciarTipos = ({ tipos, setTipos }: GerenciarTiposProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tipoDialogOpen, setTipoDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoFornecedor | null>(null);

  const handleSaveTipo = (tipo: TipoFornecedor) => {
    const isEditing = !!selectedTipo;
    if (isEditing) {
      setTipos(tipos.map(t => t.id === tipo.id ? tipo : t));
    } else {
      setTipos([...tipos, tipo]);
    }
    toast({
      title: "Sucesso!",
      description: `Tipo ${isEditing ? 'atualizado' : 'criado'} com sucesso.`,
    });
    setSelectedTipo(null);
  };

  const handleEditTipo = (tipo: TipoFornecedor) => {
    setSelectedTipo(tipo);
    setTipoDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTipo(null);
    setTipoDialogOpen(true);
  };

  const handleDeleteTipo = (id: string) => {
    setTipos(tipos.filter(t => t.id !== id));
    toast({
      title: "Tipo removido",
      description: "O tipo foi removido com sucesso.",
      variant: "destructive"
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Gerenciar Tipos
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Tipos de Fornecedores</DialogTitle>
            <DialogDescription>
              Gerencie os tipos de fornecedores disponíveis no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Tipo
            </Button>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipos.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell>
                      <Badge variant="outline">{tipo.nome}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditTipo(tipo)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTipo(tipo.id)}
                            className="text-red-600"
                          >
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <TipoFornecedorDialog
        open={tipoDialogOpen}
        onOpenChange={setTipoDialogOpen}
        onSave={handleSaveTipo}
        tipo={selectedTipo}
      />
    </>
  );
};
