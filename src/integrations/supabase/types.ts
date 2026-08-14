export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      commodities: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          hs_code: string | null
          id: string
          name: string
          slug: string
          sub_category: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          hs_code?: string | null
          id?: string
          name: string
          slug: string
          sub_category?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          hs_code?: string | null
          id?: string
          name?: string
          slug?: string
          sub_category?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      commodity_specifications: {
        Row: {
          commodity_id: string
          created_at: string
          id: string
          is_template: boolean
          name: string
          notes: string | null
          spec: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commodity_id: string
          created_at?: string
          id?: string
          is_template?: boolean
          name: string
          notes?: string | null
          spec?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commodity_id?: string
          created_at?: string
          id?: string
          is_template?: boolean
          name?: string
          notes?: string | null
          spec?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commodity_specifications_commodity_id_fkey"
            columns: ["commodity_id"]
            isOneToOne: false
            referencedRelation: "commodities"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          company_type: string
          country: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          legacy_counterparty_id: string | null
          legal_name: string
          registration_number: string | null
          risk_level: string
          status: string
          tax_number: string | null
          trading_name: string | null
          updated_at: string
          user_id: string
          verification_status: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_type?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          legacy_counterparty_id?: string | null
          legal_name: string
          registration_number?: string | null
          risk_level?: string
          status?: string
          tax_number?: string | null
          trading_name?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_type?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          legacy_counterparty_id?: string | null
          legal_name?: string
          registration_number?: string | null
          risk_level?: string
          status?: string
          tax_number?: string | null
          trading_name?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
          website?: string | null
        }
        Relationships: []
      }
      company_commodities: {
        Row: {
          commodity_id: string
          company_id: string
          created_at: string
          id: string
          side: string
          user_id: string
        }
        Insert: {
          commodity_id: string
          company_id: string
          created_at?: string
          id?: string
          side?: string
          user_id: string
        }
        Update: {
          commodity_id?: string
          company_id?: string
          created_at?: string
          id?: string
          side?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_commodities_commodity_id_fkey"
            columns: ["commodity_id"]
            isOneToOne: false
            referencedRelation: "commodities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_commodities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          country: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          job_title: string | null
          notes: string | null
          phone: string | null
          preferred_language: string | null
          status: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          company_id?: string | null
          country?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          job_title?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?: string | null
          status?: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          company_id?: string | null
          country?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      counterparties: {
        Row: {
          commodities: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string
          trust_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commodities?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role?: string
          trust_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commodities?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          trust_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      counterparty_submissions: {
        Row: {
          broker_user_id: string
          commodities: string | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          phone: string | null
          reviewed_at: string | null
          role: string
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          broker_user_id: string
          commodities?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          reviewed_at?: string | null
          role?: string
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          broker_user_id?: string
          commodities?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          reviewed_at?: string | null
          role?: string
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      deal_steps: {
        Row: {
          created_at: string
          deal_id: string
          detail: string | null
          done: boolean
          id: string
          label: string
          owner_role: string | null
          step_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          detail?: string | null
          done?: boolean
          id?: string
          label: string
          owner_role?: string | null
          step_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          detail?: string | null
          done?: boolean
          id?: string
          label?: string
          owner_role?: string | null
          step_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_steps_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          buyer_company_id: string | null
          buyer_name: string | null
          commodity: string
          commodity_id: string | null
          created_at: string
          currency: string | null
          delivery_window: string | null
          destination: string | null
          id: string
          incoterm: string | null
          match_score: number | null
          notes: string | null
          origin: string | null
          owner_id: string | null
          payment_terms: string | null
          price: number | null
          price_formula: string | null
          quantity: number | null
          risk_level: string
          seller_company_id: string | null
          seller_name: string | null
          side: string
          stage: string
          status: string
          target_date: string | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          buyer_company_id?: string | null
          buyer_name?: string | null
          commodity?: string
          commodity_id?: string | null
          created_at?: string
          currency?: string | null
          delivery_window?: string | null
          destination?: string | null
          id?: string
          incoterm?: string | null
          match_score?: number | null
          notes?: string | null
          origin?: string | null
          owner_id?: string | null
          payment_terms?: string | null
          price?: number | null
          price_formula?: string | null
          quantity?: number | null
          risk_level?: string
          seller_company_id?: string | null
          seller_name?: string | null
          side?: string
          stage?: string
          status?: string
          target_date?: string | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          buyer_company_id?: string | null
          buyer_name?: string | null
          commodity?: string
          commodity_id?: string | null
          created_at?: string
          currency?: string | null
          delivery_window?: string | null
          destination?: string | null
          id?: string
          incoterm?: string | null
          match_score?: number | null
          notes?: string | null
          origin?: string | null
          owner_id?: string | null
          payment_terms?: string | null
          price?: number | null
          price_formula?: string | null
          quantity?: number | null
          risk_level?: string
          seller_company_id?: string | null
          seller_name?: string | null
          side?: string
          stage?: string
          status?: string
          target_date?: string | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_buyer_company_id_fkey"
            columns: ["buyer_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_commodity_id_fkey"
            columns: ["commodity_id"]
            isOneToOne: false
            referencedRelation: "commodities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_seller_company_id_fkey"
            columns: ["seller_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "broker"
        | "sales"
        | "compliance"
        | "operations"
        | "finance"
        | "viewer"
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
      app_role: [
        "admin",
        "broker",
        "sales",
        "compliance",
        "operations",
        "finance",
        "viewer",
      ],
    },
  },
} as const
