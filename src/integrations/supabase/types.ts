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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_access_state: {
        Row: {
          blocked_reason: string | null
          id: string
          updated_at: string
        }
        Insert: {
          blocked_reason?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          blocked_reason?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_preferences: {
        Row: {
          consent: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          consent?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          consent?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          discount_description: string
          expires_at: string | null
          id: string
          rule_type: string
        }
        Insert: {
          active?: boolean
          code: string
          discount_description: string
          expires_at?: string | null
          id: string
          rule_type: string
        }
        Update: {
          active?: boolean
          code?: string
          discount_description?: string
          expires_at?: string | null
          id?: string
          rule_type?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_memberships: {
        Row: {
          id: string
          role: string
          store_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role?: string
          store_id: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_memberships_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_completions: {
        Row: {
          completed_at: string
          coupon_id: string
          id: string
          product_id: string
          store_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          coupon_id: string
          id?: string
          product_id: string
          store_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          coupon_id?: string
          id?: string
          product_id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_completions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_completions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_completions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          deduplication_key: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deduplication_key?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          deduplication_key?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          availability: Database["public"]["Enums"]["offer_availability"]
          id: string
          original_price_cents: number | null
          price_cents: number
          product_id: string
          stock_mode: string
          store_id: string
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["offer_availability"]
          id: string
          original_price_cents?: number | null
          price_cents: number
          product_id: string
          stock_mode?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["offer_availability"]
          id?: string
          original_price_cents?: number | null
          price_cents?: number
          product_id?: string
          stock_mode?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          brand: string
          category: string
          color: string
          description: string
          id: string
          image_key: string
          name: string
          options: string[]
          tags: string[]
        }
        Insert: {
          active?: boolean
          brand: string
          category: string
          color: string
          description: string
          id: string
          image_key: string
          name: string
          options?: string[]
          tags?: string[]
        }
        Update: {
          active?: boolean
          brand?: string
          category?: string
          color?: string
          description?: string
          id?: string
          image_key?: string
          name?: string
          options?: string[]
          tags?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          marketing_opt_in: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          marketing_opt_in?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          marketing_opt_in?: boolean
        }
        Relationships: []
      }
      reservation_groups: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          idempotency_key: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          idempotency_key: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          idempotency_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_groups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_items: {
        Row: {
          id: string
          offer_id: string
          quantity: number
          reservation_id: string
          selected_option: string | null
          unit_price_cents_snapshot: number
        }
        Insert: {
          id?: string
          offer_id: string
          quantity: number
          reservation_id: string
          selected_option?: string | null
          unit_price_cents_snapshot: number
        }
        Update: {
          id?: string
          offer_id?: string
          quantity?: number
          reservation_id?: string
          selected_option?: string | null
          unit_price_cents_snapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservation_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_items_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          code: string
          created_at: string
          customer_id: string
          decided_at: string | null
          expires_at: string
          group_id: string
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          store_id: string
        }
        Insert: {
          code: string
          created_at?: string
          customer_id: string
          decided_at?: string | null
          expires_at: string
          group_id: string
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          store_id: string
        }
        Update: {
          code?: string
          created_at?: string
          customer_id?: string
          decided_at?: string | null
          expires_at?: string
          group_id?: string
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "reservation_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      search_events: {
        Row: {
          category: string
          created_at: string
          id: string
          product_ids: string[]
          request_id: string
          result_count: number
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          product_ids?: string[]
          request_id: string
          result_count: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          product_ids?: string[]
          request_id?: string
          result_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          active: boolean
          id: string
          location_label: string
          name: string
        }
        Insert: {
          active?: boolean
          id: string
          location_label: string
          name: string
        }
        Update: {
          active?: boolean
          id?: string
          location_label?: string
          name?: string
        }
        Relationships: []
      }
      user_coupons: {
        Row: {
          claimed_at: string
          coupon_id: string
          id: string
          redeemed_at: string | null
          reservation_id: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string
          coupon_id: string
          id?: string
          redeemed_at?: string | null
          reservation_id?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string
          coupon_id?: string
          id?: string
          redeemed_at?: string | null
          reservation_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      cancel_reservation: {
        Args: { p_reservation_id: string }
        Returns: undefined
      }
      complete_demo_mission: {
        Args: { p_product_id: string; p_store_id: string }
        Returns: string
      }
      create_reservation: {
        Args: { p_idempotency_key: string; p_items: Json }
        Returns: string
      }
      decide_reservation: {
        Args: { p_decision: string; p_reservation_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_store_member: { Args: { _store_id: string }; Returns: boolean }
      merchant_insights: { Args: { p_store_id: string }; Returns: Json }
      search_demand_insights: { Args: never; Returns: Json }
      set_offer_availability: {
        Args: {
          p_availability: Database["public"]["Enums"]["offer_availability"]
          p_offer_id: string
        }
        Returns: undefined
      }
      simulate_demo_availability: {
        Args: { p_group_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "CUSTOMER" | "MERCHANT"
      offer_availability: "AVAILABLE" | "UNAVAILABLE" | "CHECK_WITH_STORE"
      reservation_status:
        | "PENDING"
        | "CONFIRMED"
        | "REJECTED"
        | "CANCELLED"
        | "EXPIRED"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["CUSTOMER", "MERCHANT"],
      offer_availability: ["AVAILABLE", "UNAVAILABLE", "CHECK_WITH_STORE"],
      reservation_status: [
        "PENDING",
        "CONFIRMED",
        "REJECTED",
        "CANCELLED",
        "EXPIRED",
      ],
    },
  },
} as const
