import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ProductService = Database["public"]["Tables"]["products_services"]["Row"];
type ProductServiceInsert = Database["public"]["Tables"]["products_services"]["Insert"];
type ProductServiceUpdate = Database["public"]["Tables"]["products_services"]["Update"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export const productsServicesService = {
  async getAll() {
    const { data, error } = await supabase
      .from("products_services")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async create(product: Omit<ProductServiceInsert, "id" | "created_at" | "updated_at" | "saas_client_id">) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Usuário não autenticado");

    const { data: clientIdData, error: clientIdError } = await supabase.rpc("get_current_user_client_id");
    if (clientIdError || !clientIdData) throw new Error("Cliente não encontrado");

    const { data, error } = await supabase
      .from("products_services")
      .insert({
        ...product,
        saas_client_id: clientIdData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ProductServiceUpdate) {
    const { data, error } = await supabase
      .from("products_services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("products_services")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .eq("type", "product")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  async createCategory(name: string, description?: string) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Usuário não autenticado");

    const { data: clientIdData, error: clientIdError } = await supabase.rpc("get_current_user_client_id");
    if (clientIdError || !clientIdData) throw new Error("Cliente não encontrado");

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        description,
        type: "product",
        saas_client_id: clientIdData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export type { ProductService, ProductServiceInsert, ProductServiceUpdate, Category };