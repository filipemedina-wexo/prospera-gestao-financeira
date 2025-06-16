export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          due_date: string
          financial_client_id: string | null
          id: string
          paid_date: string | null
          saas_client_id: string
          status: Database["public"]["Enums"]["account_payable_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          due_date: string
          financial_client_id?: string | null
          id?: string
          paid_date?: string | null
          saas_client_id: string
          status?: Database["public"]["Enums"]["account_payable_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          due_date?: string
          financial_client_id?: string | null
          id?: string
          paid_date?: string | null
          saas_client_id?: string
          status?: Database["public"]["Enums"]["account_payable_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_financial_client_id_fkey"
            columns: ["financial_client_id"]
            isOneToOne: false
            referencedRelation: "financial_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          due_date: string
          financial_client_id: string | null
          id: string
          received_date: string | null
          saas_client_id: string
          status: Database["public"]["Enums"]["account_receivable_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description: string
          due_date: string
          financial_client_id?: string | null
          id?: string
          received_date?: string | null
          saas_client_id: string
          status?: Database["public"]["Enums"]["account_receivable_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          due_date?: string
          financial_client_id?: string | null
          id?: string
          received_date?: string | null
          saas_client_id?: string
          status?: Database["public"]["Enums"]["account_receivable_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_financial_client_id_fkey"
            columns: ["financial_client_id"]
            isOneToOne: false
            referencedRelation: "financial_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_databases: {
        Row: {
          client_id: string
          created_at: string
          database_name: string
          database_url: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          database_name: string
          database_url: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          database_name?: string
          database_url?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_databases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding: {
        Row: {
          admin_user_created: boolean
          client_id: string
          created_at: string
          id: string
          initial_data_created: boolean
          onboarding_completed_at: string | null
          setup_completed: boolean
          updated_at: string
          welcome_email_sent: boolean
        }
        Insert: {
          admin_user_created?: boolean
          client_id: string
          created_at?: string
          id?: string
          initial_data_created?: boolean
          onboarding_completed_at?: string | null
          setup_completed?: boolean
          updated_at?: string
          welcome_email_sent?: boolean
        }
        Update: {
          admin_user_created?: boolean
          client_id?: string
          created_at?: string
          id?: string
          initial_data_created?: boolean
          onboarding_completed_at?: string | null
          setup_completed?: boolean
          updated_at?: string
          welcome_email_sent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          saas_client_id: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          saas_client_id: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          saas_client_id?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_clients_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          welcome_email_sent: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          welcome_email_sent?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          welcome_email_sent?: boolean
        }
        Relationships: []
      }
      saas_analytics: {
        Row: {
          client_id: string
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number | null
          period_end: string | null
          period_start: string | null
          recorded_at: string
        }
        Insert: {
          client_id: string
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
          recorded_at?: string
        }
        Update: {
          client_id?: string
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number | null
          period_end?: string | null
          period_start?: string | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_analytics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_clients: {
        Row: {
          address: string | null
          blocked_at: string | null
          blocked_by: string | null
          blocked_reason: string | null
          city: string | null
          cnpj: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          state: string | null
          status: Database["public"]["Enums"]["saas_client_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          city?: string | null
          cnpj?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          state?: string | null
          status?: Database["public"]["Enums"]["saas_client_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          state?: string | null
          status?: Database["public"]["Enums"]["saas_client_status"]
          updated_at?: string
        }
        Relationships: []
      }
      saas_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_users: number
          monthly_price: number
          name: string
          type: Database["public"]["Enums"]["saas_plan_type"]
          updated_at: string
          yearly_price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_users?: number
          monthly_price: number
          name: string
          type: Database["public"]["Enums"]["saas_plan_type"]
          updated_at?: string
          yearly_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_users?: number
          monthly_price?: number
          name?: string
          type?: Database["public"]["Enums"]["saas_plan_type"]
          updated_at?: string
          yearly_price?: number | null
        }
        Relationships: []
      }
      saas_subscriptions: {
        Row: {
          auto_renew: boolean
          billing_cycle: string
          client_id: string
          created_at: string
          end_date: string | null
          id: string
          monthly_price: number
          plan_id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          trial_end_date: string | null
          updated_at: string
          yearly_price: number | null
        }
        Insert: {
          auto_renew?: boolean
          billing_cycle?: string
          client_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_price: number
          plan_id: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end_date?: string | null
          updated_at?: string
          yearly_price?: number | null
        }
        Update: {
          auto_renew?: boolean
          billing_cycle?: string
          client_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          monthly_price?: number
          plan_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end_date?: string | null
          updated_at?: string
          yearly_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_user_client_mapping: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_user_client_mapping_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_secure_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_success?: boolean
          p_error_message?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      user_belongs_to_client: {
        Args: { client_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      account_payable_status: "pending" | "paid" | "overdue" | "partial"
      account_receivable_status: "pending" | "received" | "overdue" | "partial"
      app_role:
        | "admin"
        | "financeiro"
        | "comercial"
        | "contador"
        | "super_admin"
      saas_client_status: "active" | "blocked" | "trial" | "suspended"
      saas_plan_type: "basic" | "premium" | "enterprise"
      subscription_status:
        | "active"
        | "inactive"
        | "suspended"
        | "cancelled"
        | "trial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_payable_status: ["pending", "paid", "overdue", "partial"],
      account_receivable_status: ["pending", "received", "overdue", "partial"],
      app_role: ["admin", "financeiro", "comercial", "contador", "super_admin"],
      saas_client_status: ["active", "blocked", "trial", "suspended"],
      saas_plan_type: ["basic", "premium", "enterprise"],
      subscription_status: [
        "active",
        "inactive",
        "suspended",
        "cancelled",
        "trial",
      ],
    },
  },
} as const
