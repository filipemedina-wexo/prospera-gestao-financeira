import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Search } from "lucide-react";
import { ActionsDropdown } from "@/components/ui/actions-dropdown";
import { useState } from "react";
import { useProductsServices } from "@/hooks/useProductsServices";
import { ProductServiceForm } from "./produtos-servicos/ProductServiceForm";
import { ProductService } from "@/services/productsServicesService";
import { Skeleton } from "@/components/ui/skeleton";

export const ProdutosServicos = () => {
  const { products, deleteProduct, isLoading, isDeleting } = useProductsServices();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductService | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category_id && product.category_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (product: ProductService) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDelete = (product: ProductService) => {
    if (window.confirm(`Tem certeza que deseja remover "${product.name}"?`)) {
      deleteProduct(product.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Produtos e Serviços</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Novo Produto/Serviço"}
        </Button>
      </div>

      {showForm && (
        <ProductServiceForm product={editingProduct} onClose={handleCloseForm} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos e Serviços</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os produtos e serviços cadastrados
          </CardDescription>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos e serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <Badge variant={product.type === "product" ? "default" : "secondary"}>
                          {product.type === "product" ? "Produto" : "Serviço"}
                        </Badge>
                        <Badge variant={product.status === "active" ? "outline" : "destructive"}>
                          {product.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-1">{product.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        {product.sale_price && (
                          <span className="font-medium text-green-600">
                            R$ {product.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActionsDropdown 
                        actions={[
                          { type: 'edit', label: 'Editar', onClick: () => handleEdit(product) },
                          { 
                            type: 'delete', 
                            label: 'Excluir', 
                            onClick: () => handleDelete(product), 
                            variant: 'destructive',
                            disabled: isDeleting 
                          }
                        ]} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhum produto encontrado com esse termo" : "Nenhum produto cadastrado"}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
