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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alert_rules: {
        Row: {
          condition: string
          created_at: string
          enabled: boolean
          id: string
          name: string
          severity: string
          updated_at: string
          window_size: string
        }
        Insert: {
          condition: string
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          severity?: string
          updated_at?: string
          window_size: string
        }
        Update: {
          condition?: string
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          severity?: string
          updated_at?: string
          window_size?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by_id: string | null
          alert_type: string
          created_at: string
          episode_id: string | null
          id: string
          is_acknowledged: boolean | null
          message: string
          patient_id: string
          severity: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by_id?: string | null
          alert_type: string
          created_at?: string
          episode_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          patient_id: string
          severity?: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by_id?: string | null
          alert_type?: string
          created_at?: string
          episode_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          patient_id?: string
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_id_fkey"
            columns: ["acknowledged_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          ambulation_score: number | null
          assessment_date: string
          assessment_type: string
          assessor_id: string | null
          bathing_score: number | null
          created_at: string
          discipline: string | null
          dressing_lower_score: number | null
          dressing_upper_score: number | null
          eating_score: number | null
          episode_id: string | null
          grooming_score: number | null
          id: string
          medication_mgmt_score: number | null
          notes: string | null
          patient_id: string
          risk_level: string | null
          toileting_score: number | null
          total_adl_score: number | null
          transferring_score: number | null
        }
        Insert: {
          ambulation_score?: number | null
          assessment_date: string
          assessment_type: string
          assessor_id?: string | null
          bathing_score?: number | null
          created_at?: string
          discipline?: string | null
          dressing_lower_score?: number | null
          dressing_upper_score?: number | null
          eating_score?: number | null
          episode_id?: string | null
          grooming_score?: number | null
          id?: string
          medication_mgmt_score?: number | null
          notes?: string | null
          patient_id: string
          risk_level?: string | null
          toileting_score?: number | null
          total_adl_score?: number | null
          transferring_score?: number | null
        }
        Update: {
          ambulation_score?: number | null
          assessment_date?: string
          assessment_type?: string
          assessor_id?: string | null
          bathing_score?: number | null
          created_at?: string
          discipline?: string | null
          dressing_lower_score?: number | null
          dressing_upper_score?: number | null
          eating_score?: number | null
          episode_id?: string | null
          grooming_score?: number | null
          id?: string
          medication_mgmt_score?: number | null
          notes?: string | null
          patient_id?: string
          risk_level?: string | null
          toileting_score?: number | null
          total_adl_score?: number | null
          transferring_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_assessor_id_fkey"
            columns: ["assessor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          session_metadata: Json | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_metadata?: Json | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clinician_notes: {
        Row: {
          attachments: Json | null
          author_id: string | null
          content: string
          created_at: string
          discipline: string
          episode_id: string | null
          id: string
          linked_data_sources: string[] | null
          patient_id: string
          priority: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          content: string
          created_at?: string
          discipline: string
          episode_id?: string | null
          id?: string
          linked_data_sources?: string[] | null
          patient_id: string
          priority?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          content?: string
          created_at?: string
          discipline?: string
          episode_id?: string | null
          id?: string
          linked_data_sources?: string[] | null
          patient_id?: string
          priority?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinician_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinician_notes_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinician_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      data_source_links: {
        Row: {
          confidence_score: number | null
          created_at: string
          data_id: string
          data_table: string
          extracted_snippet: string | null
          id: string
          source_document_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          data_id: string
          data_table: string
          extracted_snippet?: string | null
          id?: string
          source_document_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          data_id?: string
          data_table?: string
          extracted_snippet?: string | null
          id?: string
          source_document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_source_links_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "source_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          coordinator_id: string | null
          created_at: string
          discharge_reason: string | null
          end_date: string
          episode_number: string
          id: string
          patient_id: string
          primary_nurse_id: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          coordinator_id?: string | null
          created_at?: string
          discharge_reason?: string | null
          end_date: string
          episode_number: string
          id?: string
          patient_id: string
          primary_nurse_id?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          coordinator_id?: string | null
          created_at?: string
          discharge_reason?: string | null
          end_date?: string
          episode_number?: string
          id?: string
          patient_id?: string
          primary_nurse_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_primary_nurse_id_fkey"
            columns: ["primary_nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          assigned_to_id: string | null
          completed_date: string | null
          created_at: string
          description: string
          episode_id: string | null
          id: string
          intervention_type: string
          notes: string | null
          patient_id: string
          priority: string
          scheduled_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to_id?: string | null
          completed_date?: string | null
          created_at?: string
          description: string
          episode_id?: string | null
          id?: string
          intervention_type: string
          notes?: string | null
          patient_id: string
          priority?: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string
          episode_id?: string | null
          id?: string
          intervention_type?: string
          notes?: string | null
          patient_id?: string
          priority?: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_audit: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string
          id: string
          keyword_id: string | null
          new_data: Json | null
          oasis_item_id: string
          old_data: Json | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string
          id?: string
          keyword_id?: string | null
          new_data?: Json | null
          oasis_item_id: string
          old_data?: Json | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          keyword_id?: string | null
          new_data?: Json | null
          oasis_item_id?: string
          old_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_audit_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_audit_oasis_item_id_fkey"
            columns: ["oasis_item_id"]
            isOneToOne: false
            referencedRelation: "oasis_items"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_synonyms: {
        Row: {
          created_at: string
          id: string
          keyword_id: string
          synonym: string
        }
        Insert: {
          created_at?: string
          id?: string
          keyword_id: string
          synonym: string
        }
        Update: {
          created_at?: string
          id?: string
          keyword_id?: string
          synonym?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_synonyms_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_usage: {
        Row: {
          id: string
          keyword_id: string
          matched_at: string
          matched_text: string
          source_id: string
          source_table: string
        }
        Insert: {
          id?: string
          keyword_id: string
          matched_at?: string
          matched_text: string
          source_id: string
          source_table: string
        }
        Update: {
          id?: string
          keyword_id?: string
          matched_at?: string
          matched_text?: string
          source_id?: string
          source_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_usage_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          created_at: string
          id: string
          last_matched_at: string | null
          oasis_item_id: string
          tag_type: string | null
          term: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_matched_at?: string | null
          oasis_item_id: string
          tag_type?: string | null
          term: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_matched_at?: string | null
          oasis_item_id?: string
          tag_type?: string | null
          term?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keywords_oasis_item_id_fkey"
            columns: ["oasis_item_id"]
            isOneToOne: false
            referencedRelation: "oasis_items"
            referencedColumns: ["id"]
          },
        ]
      }
      oasis_items: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          label: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: Json | null
          created_at: string
          date_of_birth: string
          emergency_contact: Json | null
          first_name: string
          id: string
          insurance_info: Json | null
          last_name: string
          mrn: string
          phone: string | null
          primary_diagnosis: string | null
          secondary_diagnoses: string[] | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          date_of_birth: string
          emergency_contact?: Json | null
          first_name: string
          id?: string
          insurance_info?: Json | null
          last_name: string
          mrn: string
          phone?: string | null
          primary_diagnosis?: string | null
          secondary_diagnoses?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          date_of_birth?: string
          emergency_contact?: Json | null
          first_name?: string
          id?: string
          insurance_info?: Json | null
          last_name?: string
          mrn?: string
          phone?: string | null
          primary_diagnosis?: string | null
          secondary_diagnoses?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          discipline: string | null
          email: string
          full_name: string
          id: string
          license_number: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discipline?: string | null
          email: string
          full_name: string
          id: string
          license_number?: string | null
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discipline?: string | null
          email?: string
          full_name?: string
          id?: string
          license_number?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      source_documents: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          document_type: string
          episode_id: string | null
          id: string
          metadata: Json | null
          patient_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          document_type: string
          episode_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          document_type?: string
          episode_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_documents_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_documents_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_user_assigned_to_patient: {
        Args: { patient_uuid: string }
        Returns: boolean
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
