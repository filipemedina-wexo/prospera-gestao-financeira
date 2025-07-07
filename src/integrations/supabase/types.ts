export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount: number
          category: string | null
          category_id: string | null
          client_id: string | null
          competencia: string | null
          created_at: string
          description: string
          document_number: string | null
          due_date: string
          financial_client_id: string | null
          id: string
          is_recurring: boolean | null
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          payment_reference: string | null
          recurrence_count: number | null
          recurrence_frequency: string | null
          recurrence_group_id: string | null
          saas_client_id: string
          status: Database["public"]["Enums"]["account_payable_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string | null
          category_id?: string | null
          client_id?: string | null
          competencia?: string | null
          created_at?: string
          description: string
          document_number?: string | null
          due_date: string
          financial_client_id?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          recurrence_count?: number | null
          recurrence_frequency?: string | null
          recurrence_group_id?: string | null
          saas_client_id: string
          status?: Database["public"]["Enums"]["account_payable_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string | null
          category_id?: string | null
          client_id?: string | null
          competencia?: string | null
          created_at?: string
          description?: string
          document_number?: string | null
          due_date?: string
          financial_client_id?: string | null
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          recurrence_count?: number | null
          recurrence_frequency?: string | null
          recurrence_group_id?: string | null
          saas_client_id?: string
          status?: Database["public"]["Enums"]["account_payable_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
          bank_account_id: string | null
          category: string | null
          category_id: string | null
          client_id: string | null
          competencia: string | null
          created_at: string
          description: string
          due_date: string
          financial_client_id: string | null
          id: string
          invoice_number: string | null
          is_recurring: boolean | null
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          received_date: string | null
          recurrence_count: number | null
          recurrence_frequency: string | null
          recurrence_group_id: string | null
          saas_client_id: string
          status: Database["public"]["Enums"]["account_receivable_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category?: string | null
          category_id?: string | null
          client_id?: string | null
          competencia?: string | null
          created_at?: string
          description: string
          due_date: string
          financial_client_id?: string | null
          id?: string
          invoice_number?: string | null
          is_recurring?: boolean | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          received_date?: string | null
          recurrence_count?: number | null
          recurrence_frequency?: string | null
          recurrence_group_id?: string | null
          saas_client_id: string
          status?: Database["public"]["Enums"]["account_receivable_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category?: string | null
          category_id?: string | null
          client_id?: string | null
          competencia?: string | null
          created_at?: string
          description?: string
          due_date?: string
          financial_client_id?: string | null
          id?: string
          invoice_number?: string | null
          is_recurring?: boolean | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          received_date?: string | null
          recurrence_count?: number | null
          recurrence_frequency?: string | null
          recurrence_group_id?: string | null
          saas_client_id?: string
          status?: Database["public"]["Enums"]["account_receivable_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
      bank_accounts: {
        Row: {
          account_number: string | null
          agency: string | null
          balance: number
          bank_name: string | null
          created_at: string
          id: string
          initial_balance: number | null
          is_active: boolean
          name: string
          saas_client_id: string
          type: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          agency?: string | null
          balance?: number
          bank_name?: string | null
          created_at?: string
          id?: string
          initial_balance?: number | null
          is_active?: boolean
          name: string
          saas_client_id: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          agency?: string | null
          balance?: number
          bank_name?: string | null
          created_at?: string
          id?: string
          initial_balance?: number | null
          is_active?: boolean
          name?: string
          saas_client_id?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          saas_client_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          saas_client_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          saas_client_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_account_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          saas_client_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          saas_client_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          saas_client_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_account_categories_saas_client_id_fkey"
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
      clients: {
        Row: {
          address: string | null
          anniversary_date: string | null
          birth_date: string | null
          city: string | null
          client_code: string | null
          client_type: string
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          credit_limit: number | null
          document_number: string | null
          id: string
          is_active: boolean
          municipal_registration: string | null
          notes: string | null
          payment_terms: number | null
          saas_client_id: string
          state: string | null
          state_registration: string | null
          status: string
          trade_name: string | null
          updated_at: string
          website: string | null
          whatsapp: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          anniversary_date?: string | null
          birth_date?: string | null
          city?: string | null
          client_code?: string | null
          client_type?: string
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          document_number?: string | null
          id?: string
          is_active?: boolean
          municipal_registration?: string | null
          notes?: string | null
          payment_terms?: number | null
          saas_client_id: string
          state?: string | null
          state_registration?: string | null
          status?: string
          trade_name?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          anniversary_date?: string | null
          birth_date?: string | null
          city?: string | null
          client_code?: string | null
          client_type?: string
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          credit_limit?: number | null
          document_number?: string | null
          id?: string
          is_active?: boolean
          municipal_registration?: string | null
          notes?: string | null
          payment_terms?: number | null
          saas_client_id?: string
          state?: string | null
          state_registration?: string | null
          status?: string
          trade_name?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          saas_client_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          saas_client_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          saas_client_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_fk"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          department_id: string | null
          document_number: string | null
          email: string | null
          employee_number: string | null
          full_name: string
          hire_date: string
          id: string
          is_active: boolean
          phone: string | null
          position_id: string | null
          saas_client_id: string
          salary: number | null
          state: string | null
          status: string
          termination_date: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          department_id?: string | null
          document_number?: string | null
          email?: string | null
          employee_number?: string | null
          full_name: string
          hire_date: string
          id?: string
          is_active?: boolean
          phone?: string | null
          position_id?: string | null
          saas_client_id: string
          salary?: number | null
          state?: string | null
          status?: string
          termination_date?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          department_id?: string | null
          document_number?: string | null
          email?: string | null
          employee_number?: string | null
          full_name?: string
          hire_date?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          position_id?: string | null
          saas_client_id?: string
          salary?: number | null
          state?: string | null
          status?: string
          termination_date?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_clients: {
        Row: {
          address: string | null
          cep: string | null
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
          cep?: string | null
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
          cep?: string | null
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
      financial_transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          reference_id: string | null
          reference_type: string | null
          saas_client_id: string
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          saas_client_id: string
          transaction_date?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          saas_client_id?: string
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          base_salary: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          saas_client_id: string
          updated_at: string
        }
        Insert: {
          base_salary?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          saas_client_id: string
          updated_at?: string
        }
        Update: {
          base_salary?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          saas_client_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      products_services: {
        Row: {
          barcode: string | null
          category_id: string | null
          code: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          maximum_stock: number | null
          minimum_stock: number | null
          name: string
          ncm_code: string | null
          saas_client_id: string
          sale_price: number | null
          status: string
          stock_quantity: number | null
          tax_rate: number | null
          type: string
          unit_of_measure: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          code?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          maximum_stock?: number | null
          minimum_stock?: number | null
          name: string
          ncm_code?: string | null
          saas_client_id: string
          sale_price?: number | null
          status?: string
          stock_quantity?: number | null
          tax_rate?: number | null
          type: string
          unit_of_measure?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          code?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          maximum_stock?: number | null
          minimum_stock?: number | null
          name?: string
          ncm_code?: string | null
          saas_client_id?: string
          sale_price?: number | null
          status?: string
          stock_quantity?: number | null
          tax_rate?: number | null
          type?: string
          unit_of_measure?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_services_saas_client_id_fkey"
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
      reports: {
        Row: {
          created_at: string
          data: Json | null
          description: string | null
          error_message: string | null
          file_path: string | null
          generated_by: string | null
          id: string
          is_scheduled: boolean | null
          name: string
          next_run_date: string | null
          parameters: Json | null
          period_end: string | null
          period_start: string | null
          saas_client_id: string
          schedule_frequency: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          description?: string | null
          error_message?: string | null
          file_path?: string | null
          generated_by?: string | null
          id?: string
          is_scheduled?: boolean | null
          name: string
          next_run_date?: string | null
          parameters?: Json | null
          period_end?: string | null
          period_start?: string | null
          saas_client_id: string
          schedule_frequency?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          description?: string | null
          error_message?: string | null
          file_path?: string | null
          generated_by?: string | null
          id?: string
          is_scheduled?: boolean | null
          name?: string
          next_run_date?: string | null
          parameters?: Json | null
          period_end?: string | null
          period_start?: string | null
          saas_client_id?: string
          schedule_frequency?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_saas_client_id_fkey"
            columns: ["saas_client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
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
      saas_client_configurations: {
        Row: {
          client_id: string
          configuration_key: string
          configuration_value: Json
          created_at: string
          id: string
          is_default: boolean | null
          updated_at: string
        }
        Insert: {
          client_id: string
          configuration_key: string
          configuration_value: Json
          created_at?: string
          id?: string
          is_default?: boolean | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          configuration_key?: string
          configuration_value?: Json
          created_at?: string
          id?: string
          is_default?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_client_configurations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "saas_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_client_user_assignments: {
        Row: {
          assigned_by: string | null
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_client_user_assignments_client_id_fkey"
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
      saas_payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          status: string
          subscription_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          status?: string
          subscription_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          status?: string
          subscription_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "saas_subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
      create_client_admin_user: {
        Args: {
          client_id_param: string
          admin_email: string
          admin_name: string
        }
        Returns: Json
      }
      generate_secure_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      initialize_client_data: {
        Args: { client_id_param: string }
        Returns: undefined
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
      migrate_financial_clients_to_clients: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      registrar_recebimento: {
        Args: {
          p_receivable_id: string
          p_received_date: string
          p_bank_account_id: string
        }
        Returns: undefined
      }
      user_belongs_to_client: {
        Args: { client_uuid: string }
        Returns: boolean
      }
      validate_account_status_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      account_payable_status: "pending" | "paid" | "overdue" | "partial"
      account_receivable_status:
        | "pending"
        | "received"
        | "overdue"
        | "partial"
        | "paid"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_payable_status: ["pending", "paid", "overdue", "partial"],
      account_receivable_status: [
        "pending",
        "received",
        "overdue",
        "partial",
        "paid",
      ],
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
