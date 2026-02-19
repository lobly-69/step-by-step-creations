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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      allowed_prefixes_pt: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: number
          prefix: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          prefix: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          prefix?: string
        }
        Relationships: []
      }
      background_colors: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_order: number
          hex: string
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_order: number
          hex: string
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_order?: number
          hex?: string
          name?: string
        }
        Relationships: []
      }
      blocked_numbers: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: number
          reason: string | null
          whatsapp_full: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          reason?: string | null
          whatsapp_full: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          reason?: string | null
          whatsapp_full?: string
        }
        Relationships: []
      }
      builder_files: {
        Row: {
          bucket: string
          created_at: string
          entry_number: number | null
          id: string
          idx: number
          kind: string
          mime_type: string | null
          path: string
          session_id: string
          size_bytes: number | null
        }
        Insert: {
          bucket?: string
          created_at?: string
          entry_number?: number | null
          id?: string
          idx: number
          kind: string
          mime_type?: string | null
          path: string
          session_id: string
          size_bytes?: number | null
        }
        Update: {
          bucket?: string
          created_at?: string
          entry_number?: number | null
          id?: string
          idx?: number
          kind?: string
          mime_type?: string | null
          path?: string
          session_id?: string
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "builder_leads"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "builder_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "builder_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "builder_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "builder_tracking"
            referencedColumns: ["session_id"]
          },
        ]
      }
      builder_sessions: {
        Row: {
          abandoned_at: string | null
          background_name: string | null
          country_code: string | null
          created_at: string
          current_step: string
          dial_code: string | null
          email: string | null
          entry_number: number | null
          first_name: string | null
          frame_prefix: string | null
          image_count: number
          last_name: string | null
          lifecycle_status: string
          name: string | null
          origin_url: string | null
          result_code: string | null
          session_id: string
          size: string | null
          updated_at: string
          whatsapp_full: string | null
          whatsapp_number: string | null
        }
        Insert: {
          abandoned_at?: string | null
          background_name?: string | null
          country_code?: string | null
          created_at?: string
          current_step?: string
          dial_code?: string | null
          email?: string | null
          entry_number?: number | null
          first_name?: string | null
          frame_prefix?: string | null
          image_count?: number
          last_name?: string | null
          lifecycle_status?: string
          name?: string | null
          origin_url?: string | null
          result_code?: string | null
          session_id?: string
          size?: string | null
          updated_at?: string
          whatsapp_full?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          abandoned_at?: string | null
          background_name?: string | null
          country_code?: string | null
          created_at?: string
          current_step?: string
          dial_code?: string | null
          email?: string | null
          entry_number?: number | null
          first_name?: string | null
          frame_prefix?: string | null
          image_count?: number
          last_name?: string | null
          lifecycle_status?: string
          name?: string | null
          origin_url?: string | null
          result_code?: string | null
          session_id?: string
          size?: string | null
          updated_at?: string
          whatsapp_full?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_sessions_background_name_fkey"
            columns: ["background_name"]
            isOneToOne: false
            referencedRelation: "background_colors"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "builder_sessions_frame_prefix_fkey"
            columns: ["frame_prefix"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["prefix"]
          },
          {
            foreignKeyName: "builder_sessions_size_fkey"
            columns: ["size"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["size"]
          },
        ]
      }
      builder_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      frame_colors: {
        Row: {
          active: boolean | null
          created_at: string | null
          display_name_pt: string | null
          display_order: number
          hex: string
          id: number
          name: string
          prefix: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          display_name_pt?: string | null
          display_order: number
          hex: string
          id?: number
          name: string
          prefix: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          display_name_pt?: string | null
          display_order?: number
          hex?: string
          id?: number
          name?: string
          prefix?: string
        }
        Relationships: []
      }
      mockup_variants: {
        Row: {
          active: boolean | null
          background_name: string
          created_at: string | null
          frame_prefix: string
          id: number
          image_url: string
          size: string
        }
        Insert: {
          active?: boolean | null
          background_name: string
          created_at?: string | null
          frame_prefix: string
          id?: number
          image_url: string
          size: string
        }
        Update: {
          active?: boolean | null
          background_name?: string
          created_at?: string | null
          frame_prefix?: string
          id?: number
          image_url?: string
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "mockup_variants_background_name_fkey"
            columns: ["background_name"]
            isOneToOne: false
            referencedRelation: "background_colors"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "mockup_variants_frame_prefix_fkey"
            columns: ["frame_prefix"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["prefix"]
          },
          {
            foreignKeyName: "mockup_variants_size_fkey"
            columns: ["size"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["size"]
          },
        ]
      }
      sizes: {
        Row: {
          active: boolean | null
          bg_img: string | null
          created_at: string | null
          discount: number | null
          display_order: number
          label: string
          name: string
          price: number
          promo_price: number | null
          size: string
        }
        Insert: {
          active?: boolean | null
          bg_img?: string | null
          created_at?: string | null
          discount?: number | null
          display_order: number
          label: string
          name: string
          price: number
          promo_price?: number | null
          size: string
        }
        Update: {
          active?: boolean | null
          bg_img?: string | null
          created_at?: string | null
          discount?: number | null
          display_order?: number
          label?: string
          name?: string
          price?: number
          promo_price?: number | null
          size?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      builder_leads: {
        Row: {
          abandoned_at: string | null
          background_name: string | null
          country_code: string | null
          created_at: string | null
          current_step: string | null
          dial_code: string | null
          email: string | null
          entry_number: number | null
          frame_prefix: string | null
          image_count: number | null
          lifecycle_status: string | null
          name: string | null
          origin_url: string | null
          result_code: string | null
          session_id: string | null
          size: string | null
          updated_at: string | null
          whatsapp_full: string | null
          whatsapp_number: string | null
        }
        Insert: {
          abandoned_at?: string | null
          background_name?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: string | null
          dial_code?: string | null
          email?: string | null
          entry_number?: number | null
          frame_prefix?: string | null
          image_count?: number | null
          lifecycle_status?: string | null
          name?: string | null
          origin_url?: string | null
          result_code?: string | null
          session_id?: string | null
          size?: string | null
          updated_at?: string | null
          whatsapp_full?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          abandoned_at?: string | null
          background_name?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: string | null
          dial_code?: string | null
          email?: string | null
          entry_number?: number | null
          frame_prefix?: string | null
          image_count?: number | null
          lifecycle_status?: string | null
          name?: string | null
          origin_url?: string | null
          result_code?: string | null
          session_id?: string | null
          size?: string | null
          updated_at?: string | null
          whatsapp_full?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_sessions_background_name_fkey"
            columns: ["background_name"]
            isOneToOne: false
            referencedRelation: "background_colors"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "builder_sessions_frame_prefix_fkey"
            columns: ["frame_prefix"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["prefix"]
          },
          {
            foreignKeyName: "builder_sessions_size_fkey"
            columns: ["size"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["size"]
          },
        ]
      }
      builder_tracking: {
        Row: {
          abandoned_at: string | null
          background_name: string | null
          country_code: string | null
          created_at: string | null
          current_step: string | null
          dial_code: string | null
          email: string | null
          entry_number: number | null
          frame_prefix: string | null
          image_count: number | null
          lifecycle_status: string | null
          name: string | null
          origin_url: string | null
          result_code: string | null
          session_id: string | null
          size: string | null
          updated_at: string | null
          whatsapp_full: string | null
          whatsapp_number: string | null
        }
        Insert: {
          abandoned_at?: string | null
          background_name?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: string | null
          dial_code?: string | null
          email?: string | null
          entry_number?: number | null
          frame_prefix?: string | null
          image_count?: number | null
          lifecycle_status?: string | null
          name?: string | null
          origin_url?: string | null
          result_code?: string | null
          session_id?: string | null
          size?: string | null
          updated_at?: string | null
          whatsapp_full?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          abandoned_at?: string | null
          background_name?: string | null
          country_code?: string | null
          created_at?: string | null
          current_step?: string | null
          dial_code?: string | null
          email?: string | null
          entry_number?: number | null
          frame_prefix?: string | null
          image_count?: number | null
          lifecycle_status?: string | null
          name?: string | null
          origin_url?: string | null
          result_code?: string | null
          session_id?: string | null
          size?: string | null
          updated_at?: string | null
          whatsapp_full?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_sessions_background_name_fkey"
            columns: ["background_name"]
            isOneToOne: false
            referencedRelation: "background_colors"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "builder_sessions_frame_prefix_fkey"
            columns: ["frame_prefix"]
            isOneToOne: false
            referencedRelation: "frame_colors"
            referencedColumns: ["prefix"]
          },
          {
            foreignKeyName: "builder_sessions_size_fkey"
            columns: ["size"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["size"]
          },
        ]
      }
    }
    Functions: {
      cleanup_builder_sessions_sql:
        | { Args: never; Returns: undefined }
        | { Args: { p_older_than_hours?: number }; Returns: Json }
      finalize_session_db: {
        Args: { p_session_id: string }
        Returns: {
          out_entry_number: number
          out_lifecycle_status: string
          out_session_id: string
        }[]
      }
      finalize_success: {
        Args: { p_session_id: string }
        Returns: {
          entry_number: number
          lifecycle_status: string
          result_code: string
          session_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
