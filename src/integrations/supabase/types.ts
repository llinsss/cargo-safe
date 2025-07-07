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
      carriers: {
        Row: {
          contact_email: string
          contact_phone: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          license_number: string | null
          name: string
          rating: number | null
        }
        Insert: {
          contact_email: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          name: string
          rating?: number | null
        }
        Update: {
          contact_email?: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          name?: string
          rating?: number | null
        }
        Relationships: []
      }
      custody_chain: {
        Row: {
          action: Database["public"]["Enums"]["custody_action"]
          blockchain_hash: string | null
          created_at: string | null
          holder_id: string | null
          holder_name: string
          id: string
          is_verified: boolean | null
          location: string | null
          metadata: Json | null
          shipment_id: string
          signature: string | null
          timestamp_occurred: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["custody_action"]
          blockchain_hash?: string | null
          created_at?: string | null
          holder_id?: string | null
          holder_name: string
          id?: string
          is_verified?: boolean | null
          location?: string | null
          metadata?: Json | null
          shipment_id: string
          signature?: string | null
          timestamp_occurred?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["custody_action"]
          blockchain_hash?: string | null
          created_at?: string | null
          holder_id?: string | null
          holder_name?: string
          id?: string
          is_verified?: boolean | null
          location?: string | null
          metadata?: Json | null
          shipment_id?: string
          signature?: string | null
          timestamp_occurred?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custody_chain_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custody_chain_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier_id: string | null
          created_at: string | null
          customer_id: string
          description: string
          destination_address: string
          expected_delivery: string | null
          id: string
          origin_address: string
          penalty_per_day: number | null
          progress: number | null
          shipment_number: string
          status: Database["public"]["Enums"]["shipment_status"] | null
          updated_at: string | null
          value_usd: number
        }
        Insert: {
          carrier_id?: string | null
          created_at?: string | null
          customer_id: string
          description: string
          destination_address: string
          expected_delivery?: string | null
          id?: string
          origin_address: string
          penalty_per_day?: number | null
          progress?: number | null
          shipment_number: string
          status?: Database["public"]["Enums"]["shipment_status"] | null
          updated_at?: string | null
          value_usd: number
        }
        Update: {
          carrier_id?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string
          destination_address?: string
          expected_delivery?: string | null
          id?: string
          origin_address?: string
          penalty_per_day?: number | null
          progress?: number | null
          shipment_number?: string
          status?: Database["public"]["Enums"]["shipment_status"] | null
          updated_at?: string | null
          value_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          created_at: string | null
          description: string
          event_type: string
          id: string
          location: string | null
          metadata: Json | null
          recorded_by: string | null
          shipment_id: string
          timestamp_occurred: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          event_type: string
          id?: string
          location?: string | null
          metadata?: Json | null
          recorded_by?: string | null
          shipment_id: string
          timestamp_occurred?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          event_type?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          recorded_by?: string | null
          shipment_id?: string
          timestamp_occurred?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_shipment_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "carrier" | "customer" | "warehouse"
      custody_action:
        | "created"
        | "picked_up"
        | "checkpoint_passed"
        | "delivered"
        | "transferred"
      shipment_status:
        | "draft"
        | "active"
        | "in_transit"
        | "delivered"
        | "delayed"
        | "cancelled"
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
      app_role: ["admin", "carrier", "customer", "warehouse"],
      custody_action: [
        "created",
        "picked_up",
        "checkpoint_passed",
        "delivered",
        "transferred",
      ],
      shipment_status: [
        "draft",
        "active",
        "in_transit",
        "delivered",
        "delayed",
        "cancelled",
      ],
    },
  },
} as const
