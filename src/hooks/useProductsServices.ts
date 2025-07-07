import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsServicesService, ProductServiceInsert, ProductServiceUpdate } from "@/services/productsServicesService";
import { useToast } from "@/hooks/use-toast";

export const useProductsServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products-services"],
    queryFn: () => productsServicesService.getAll(),
  });

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => productsServicesService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (product: Omit<ProductServiceInsert, "id" | "created_at" | "updated_at" | "saas_client_id">) =>
      productsServicesService.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-services"] });
      toast({
        title: "Sucesso!",
        description: "Produto/serviço criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar produto/serviço.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProductServiceUpdate }) =>
      productsServicesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-services"] });
      toast({
        title: "Sucesso!",
        description: "Produto/serviço atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar produto/serviço.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsServicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-services"] });
      toast({
        title: "Sucesso!",
        description: "Produto/serviço removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover produto/serviço.",
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      productsServicesService.createCategory(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast({
        title: "Sucesso!",
        description: "Categoria criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar categoria.",
        variant: "destructive",
      });
    },
  });

  return {
    products,
    categories,
    isLoading,
    isLoadingCategories,
    error,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    createCategory: createCategoryMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCreatingCategory: createCategoryMutation.isPending,
  };
};