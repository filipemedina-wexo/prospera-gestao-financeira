
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clientCategoriesService, ClientAccountCategory } from '@/services/clientCategoriesService';
import { useMultiTenant } from '@/contexts/MultiTenantContext';
import { useToast } from '@/hooks/use-toast';

export const useClientCategories = () => {
  const { currentClientId, loading: clientLoading } = useMultiTenant();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['client-categories', currentClientId],
    queryFn: () => currentClientId ? clientCategoriesService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId && !clientLoading,
  });

  const createCategory = async (categoryData: Omit<ClientAccountCategory, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>) => {
    try {
      await clientCategoriesService.create(categoryData);
      queryClient.invalidateQueries({ queryKey: ['client-categories', currentClientId] });
      toast({
        title: 'Categoria criada',
        description: 'A categoria foi criada com sucesso.',
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar categoria.',
        variant: 'destructive',
      });
    }
  };

  const updateCategory = async (id: string, updates: Partial<Omit<ClientAccountCategory, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>>) => {
    try {
      await clientCategoriesService.update(id, updates);
      queryClient.invalidateQueries({ queryKey: ['client-categories', currentClientId] });
      toast({
        title: 'Categoria atualizada',
        description: 'A categoria foi atualizada com sucesso.',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar categoria.',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await clientCategoriesService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['client-categories', currentClientId] });
      toast({
        title: 'Categoria removida',
        description: 'A categoria foi removida com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover categoria.',
        variant: 'destructive',
      });
    }
  };

  return {
    categories: categories || [],
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
