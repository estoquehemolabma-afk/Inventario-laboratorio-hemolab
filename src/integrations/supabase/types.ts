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
      equipment: {
        Row: {
          brand: string | null
          conservation_state: Database["public"]["Enums"]["conservation_state"]
          created_at: string
          id: string
          installation_date: string | null
          location: string
          model: string | null
          observations: string | null
          patrimony_number: string | null
          serial_number: string | null
          type: Database["public"]["Enums"]["equipment_type"]
          ubs_id: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          conservation_state?: Database["public"]["Enums"]["conservation_state"]
          created_at?: string
          id?: string
          installation_date?: string | null
          location: string
          model?: string | null
          observations?: string | null
          patrimony_number?: string | null
          serial_number?: string | null
          type: Database["public"]["Enums"]["equipment_type"]
          ubs_id: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          conservation_state?: Database["public"]["Enums"]["conservation_state"]
          created_at?: string
          id?: string
          installation_date?: string | null
          location?: string
          model?: string | null
          observations?: string | null
          patrimony_number?: string | null
          serial_number?: string | null
          type?: Database["public"]["Enums"]["equipment_type"]
          ubs_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_ubs_id_fkey"
            columns: ["ubs_id"]
            isOneToOne: false
            referencedRelation: "ubs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          ubs_name: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          ubs_name?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          ubs_name?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          created_at: string
          description: string
          equipment_info: string | null
          id: string
          location: string
          priority: Database["public"]["Enums"]["support_priority"]
          request_type: Database["public"]["Enums"]["support_type"]
          requester_email: string | null
          requester_name: string
          requester_phone: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["support_status"]
          tracking_code: string
          ubs_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          equipment_info?: string | null
          id?: string
          location: string
          priority?: Database["public"]["Enums"]["support_priority"]
          request_type?: Database["public"]["Enums"]["support_type"]
          requester_email?: string | null
          requester_name: string
          requester_phone?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_status"]
          tracking_code: string
          ubs_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          equipment_info?: string | null
          id?: string
          location?: string
          priority?: Database["public"]["Enums"]["support_priority"]
          request_type?: Database["public"]["Enums"]["support_type"]
          requester_email?: string | null
          requester_name?: string
          requester_phone?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_status"]
          tracking_code?: string
          ubs_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ubs: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          responsible: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          responsible?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          responsible?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      conservation_state: "Funcionando" | "Manutenção" | "Sucata"
      equipment_type:
        | "PC"
        | "Impressora"
        | "Monitor"
        | "Estabilizador"
        | "Scanner"
        | "Notebook"
        | "Roteador"
        | "Switch"
        | "Nobreak"
      support_priority: "baixa" | "media" | "alta" | "urgente"
      support_status: "recebido" | "em_andamento" | "resolvido" | "cancelado"
      support_type: "hardware" | "software" | "rede" | "impressora" | "outros"
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
      conservation_state: ["Funcionando", "Manutenção", "Sucata"],
      equipment_type: [
        "PC",
        "Impressora",
        "Monitor",
        "Estabilizador",
        "Scanner",
        "Notebook",
        "Roteador",
        "Switch",
        "Nobreak",
      ],
      support_priority: ["baixa", "media", "alta", "urgente"],
      support_status: ["recebido", "em_andamento", "resolvido", "cancelado"],
      support_type: ["hardware", "software", "rede", "impressora", "outros"],
    },
  },
} as const
