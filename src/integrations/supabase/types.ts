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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actions_catalog: {
        Row: {
          base_savings: Json | null
          code: string
          comfort_impact: number | null
          description: string | null
          difficulty: number | null
          i18n: Json | null
          id: string
          safety_notes: string | null
          title: string
        }
        Insert: {
          base_savings?: Json | null
          code: string
          comfort_impact?: number | null
          description?: string | null
          difficulty?: number | null
          i18n?: Json | null
          id?: string
          safety_notes?: string | null
          title: string
        }
        Update: {
          base_savings?: Json | null
          code?: string
          comfort_impact?: number | null
          description?: string | null
          difficulty?: number | null
          i18n?: Json | null
          id?: string
          safety_notes?: string | null
          title?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          bill_range: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string
          preferred_contact_time: string | null
          rough_estimate_eur: number | null
          status: string | null
        }
        Insert: {
          address?: string | null
          bill_range?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          preferred_contact_time?: string | null
          rough_estimate_eur?: number | null
          status?: string | null
        }
        Update: {
          address?: string | null
          bill_range?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          preferred_contact_time?: string | null
          rough_estimate_eur?: number | null
          status?: string | null
        }
        Relationships: []
      }
      audits: {
        Row: {
          address: string | null
          advice: Json | null
          city: string | null
          coords: Json | null
          created_at: string | null
          curtains: string | null
          dwelling_type: string | null
          end_use: Json | null
          heating_type: string | null
          id: string
          insulation_level: string | null
          occupancy: Json | null
          roof_type: string | null
          score: number | null
          tariff: Json | null
          thermostat_setpoint: number | null
          user_id: string | null
          water_heater: string | null
          water_tank_liters: number | null
          weather: Json | null
        }
        Insert: {
          address?: string | null
          advice?: Json | null
          city?: string | null
          coords?: Json | null
          created_at?: string | null
          curtains?: string | null
          dwelling_type?: string | null
          end_use?: Json | null
          heating_type?: string | null
          id?: string
          insulation_level?: string | null
          occupancy?: Json | null
          roof_type?: string | null
          score?: number | null
          tariff?: Json | null
          thermostat_setpoint?: number | null
          user_id?: string | null
          water_heater?: string | null
          water_tank_liters?: number | null
          weather?: Json | null
        }
        Update: {
          address?: string | null
          advice?: Json | null
          city?: string | null
          coords?: Json | null
          created_at?: string | null
          curtains?: string | null
          dwelling_type?: string | null
          end_use?: Json | null
          heating_type?: string | null
          id?: string
          insulation_level?: string | null
          occupancy?: Json | null
          roof_type?: string | null
          score?: number | null
          tariff?: Json | null
          thermostat_setpoint?: number | null
          user_id?: string | null
          water_heater?: string | null
          water_tank_liters?: number | null
          weather?: Json | null
        }
        Relationships: []
      }
      checkins: {
        Row: {
          action_id: string | null
          comfort: number | null
          created_at: string | null
          date: string
          id: string
          note: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          action_id?: string | null
          comfort?: number | null
          created_at?: string | null
          date: string
          id?: string
          note?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action_id?: string | null
          comfort?: number | null
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_audits: {
        Row: {
          audit_id: string | null
          created_at: string | null
          file_url: string
          findings: Json | null
          id: string
          notes: string | null
          quality_score: number | null
        }
        Insert: {
          audit_id?: string | null
          created_at?: string | null
          file_url: string
          findings?: Json | null
          id?: string
          notes?: string | null
          quality_score?: number | null
        }
        Update: {
          audit_id?: string | null
          created_at?: string | null
          file_url?: string
          findings?: Json | null
          id?: string
          notes?: string | null
          quality_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_audits_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          locale: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          locale?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          locale?: string | null
          user_id?: string
        }
        Relationships: []
      }
      solar_assessments: {
        Row: {
          audit_id: string | null
          created_at: string | null
          economics: Json | null
          id: string
          impact: Json | null
          input: Json | null
          potential: Json | null
        }
        Insert: {
          audit_id?: string | null
          created_at?: string | null
          economics?: Json | null
          id?: string
          impact?: Json | null
          input?: Json | null
          potential?: Json | null
        }
        Update: {
          audit_id?: string | null
          created_at?: string | null
          economics?: Json | null
          id?: string
          impact?: Json | null
          input?: Json | null
          potential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "solar_assessments_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          avg_monthly_kwh: number | null
          created_at: string | null
          created_by: string | null
          id: string
          insulation_quality: string | null
          lead_id: string | null
          notes: string | null
          orientation: string | null
          readiness_score: number | null
          roof_angle: number | null
          roof_type: string | null
          shading: string | null
          windows_quality: string | null
        }
        Insert: {
          avg_monthly_kwh?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insulation_quality?: string | null
          lead_id?: string | null
          notes?: string | null
          orientation?: string | null
          readiness_score?: number | null
          roof_angle?: number | null
          roof_type?: string | null
          shading?: string | null
          windows_quality?: string | null
        }
        Update: {
          avg_monthly_kwh?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insulation_quality?: string | null
          lead_id?: string | null
          notes?: string | null
          orientation?: string | null
          readiness_score?: number | null
          roof_angle?: number | null
          roof_type?: string | null
          shading?: string | null
          windows_quality?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_visits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      solar_reports: {
        Row: {
          co2_saved_tons_per_year: number | null
          cost_high: number | null
          cost_low: number | null
          created_at: string | null
          id: string
          lead_id: string | null
          payback_years: number | null
          site_visit_id: string | null
          suggestions: Json | null
          system_size_kw: number | null
        }
        Insert: {
          co2_saved_tons_per_year?: number | null
          cost_high?: number | null
          cost_low?: number | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          payback_years?: number | null
          site_visit_id?: string | null
          suggestions?: Json | null
          system_size_kw?: number | null
        }
        Update: {
          co2_saved_tons_per_year?: number | null
          cost_high?: number | null
          cost_low?: number | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          payback_years?: number | null
          site_visit_id?: string | null
          suggestions?: Json | null
          system_size_kw?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "solar_reports_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solar_reports_site_visit_id_fkey"
            columns: ["site_visit_id"]
            isOneToOne: false
            referencedRelation: "site_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plan: {
        Row: {
          action_id: string
          added_at: string | null
          schedule: Json | null
          user_id: string
        }
        Insert: {
          action_id: string
          added_at?: string | null
          schedule?: Json | null
          user_id: string
        }
        Update: {
          action_id?: string
          added_at?: string | null
          schedule?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plan_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
