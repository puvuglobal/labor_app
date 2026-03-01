export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'candidate' | 'client' | 'admin'
          profile_id: string
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          address: string | null
          profile_picture_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'candidate' | 'client' | 'admin'
          profile_id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          address?: string | null
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'candidate' | 'client' | 'admin'
          profile_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          address?: string | null
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          session_id: string
          user_id: string
          created_at: string
          expires_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          created_at?: string
          expires_at: string
          is_active?: boolean
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
      }
      page_registry: {
        Row: {
          id: string
          page_id: string
          page_name: string
          path: string
          allowed_roles: Json
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          page_name: string
          path: string
          allowed_roles: Json
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          page_name?: string
          path?: string
          allowed_roles?: Json
          created_at?: string
        }
      }
      file_registry: {
        Row: {
          id: string
          file_id: string
          file_name: string
          description: string
          functionality: string
          connection: string
          created_at: string
        }
        Insert: {
          id?: string
          file_id: string
          file_name: string
          description: string
          functionality: string
          connection: string
          created_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          file_name?: string
          description?: string
          functionality?: string
          connection?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          task_id: string
          title: string
          description: string
          task_type: 'upload' | 'form' | 'video' | 'text' | 'training'
          assigned_to: string
          created_by: string
          is_mandatory: boolean
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          description: string
          task_type: 'upload' | 'form' | 'video' | 'text' | 'training'
          assigned_to: string
          created_by: string
          is_mandatory?: boolean
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          description?: string
          task_type?: 'upload' | 'form' | 'video' | 'text' | 'training'
          assigned_to?: string
          created_by?: string
          is_mandatory?: boolean
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_submissions: {
        Row: {
          id: string
          submission_id: string
          task_id: string
          user_id: string
          content: Json | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          submission_id: string
          task_id: string
          user_id: string
          content?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          submission_id?: string
          task_id?: string
          user_id?: string
          content?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      trainings: {
        Row: {
          id: string
          training_id: string
          title: string
          description: string
          content_type: 'video' | 'text'
          content_url: string | null
          content_text: string | null
          duration_seconds: number | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          training_id: string
          title: string
          description: string
          content_type: 'video' | 'text'
          content_url?: string | null
          content_text?: string | null
          duration_seconds?: number | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          training_id?: string
          title?: string
          description?: string
          content_type?: 'video' | 'text'
          content_url?: string | null
          content_text?: string | null
          duration_seconds?: number | null
          created_by?: string
          created_at?: string
        }
      }
      user_trainings: {
        Row: {
          id: string
          user_id: string
          training_id: string
          is_completed: boolean
          progress_percentage: number
          completed_at: string | null
          assigned_by: string
          assigned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          training_id: string
          is_completed?: boolean
          progress_percentage?: number
          completed_at?: string | null
          assigned_by: string
          assigned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          training_id?: string
          is_completed?: boolean
          progress_percentage?: number
          completed_at?: string | null
          assigned_by?: string
          assigned_at?: string
        }
      }
      documentation_stages: {
        Row: {
          id: string
          stage_id: string
          name: string
          description: string
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          stage_id: string
          name: string
          description: string
          order_index: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          stage_id?: string
          name?: string
          description?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_documentation: {
        Row: {
          id: string
          user_id: string
          stage_id: string
          current_stage: string
          notes: string | null
          assigned_by: string
          assigned_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stage_id: string
          current_stage: string
          notes?: string | null
          assigned_by: string
          assigned_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stage_id?: string
          current_stage?: string
          notes?: string | null
          assigned_by?: string
          assigned_at?: string
          updated_at?: string
        }
      }
      policies: {
        Row: {
          id: string
          policy_id: string
          title: string
          content: string
          category: string
          state_code: string | null
          federal: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          policy_id: string
          title: string
          content: string
          category: string
          state_code?: string | null
          federal?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          policy_id?: string
          title?: string
          content?: string
          category?: string
          state_code?: string | null
          federal?: boolean
          created_by?: string
          created_at?: string
        }
      }
      user_policies: {
        Row: {
          id: string
          user_id: string
          policy_id: string
          is_acknowledged: boolean
          acknowledged_at: string | null
          assigned_by: string
          assigned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          policy_id: string
          is_acknowledged?: boolean
          acknowledged_at?: string | null
          assigned_by: string
          assigned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          policy_id?: string
          is_acknowledged?: boolean
          acknowledged_at?: string | null
          assigned_by?: string
          assigned_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          contract_id: string
          title: string
          pdf_url: string
          employer_id: string
          candidate_id: string | null
          status: 'draft' | 'pending' | 'signed' | 'expired'
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          contract_id: string
          title: string
          pdf_url: string
          employer_id: string
          candidate_id?: string | null
          status?: 'draft' | 'pending' | 'signed' | 'expired'
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          contract_id?: string
          title?: string
          pdf_url?: string
          employer_id?: string
          candidate_id?: string | null
          status?: 'draft' | 'pending' | 'signed' | 'expired'
          created_at?: string
          expires_at?: string | null
        }
      }
      employer_requests: {
        Row: {
          id: string
          request_id: string
          employer_id: string
          title: string
          description: string
          status: 'open' | 'filled' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          employer_id: string
          title: string
          description: string
          status?: 'open' | 'filled' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          employer_id?: string
          title?: string
          description?: string
          status?: 'open' | 'filled' | 'cancelled'
          created_at?: string
        }
      }
      candidate_recommendations: {
        Row: {
          id: string
          recommendation_id: string
          candidate_id: string
          recommended_by: string
          rating: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recommendation_id: string
          candidate_id: string
          recommended_by: string
          rating: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recommendation_id?: string
          candidate_id?: string
          recommended_by?: string
          rating?: number
          notes?: string | null
          created_at?: string
        }
      }
      user_uploads: {
        Row: {
          id: string
          upload_id: string
          user_id: string
          upload_type: 'profile' | 'document' | 'contract'
          file_url: string
          file_name: string
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          uploaded_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          upload_id: string
          user_id: string
          upload_type: 'profile' | 'document' | 'contract'
          file_url: string
          file_name: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          uploaded_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          upload_id?: string
          user_id?: string
          upload_type?: 'profile' | 'document' | 'contract'
          file_url?: string
          file_name?: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          uploaded_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      legal_references: {
        Row: {
          id: string
          reference_id: string
          title: string
          url: string
          state_code: string | null
          federal: boolean
          category: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          reference_id: string
          title: string
          url: string
          state_code?: string | null
          federal?: boolean
          category: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          reference_id?: string
          title?: string
          url?: string
          state_code?: string | null
          federal?: boolean
          category?: string
          description?: string
          created_at?: string
        }
      }
      user_legal_data: {
        Row: {
          id: string
          user_id: string
          legal_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          legal_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          legal_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_hex_id: {
        Args: { length: number }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      can_access_page: {
        Args: { user_id: string; page_path: string }
        Returns: boolean
      }
      validate_session: {
        Args: { session_id: string }
        Returns: boolean
      }
      register_file: {
        Args: { file_id: string; file_name: string; description: string; functionality: string; connection: string }
        Returns: void
      }
    }
    Enums: {
      user_role: 'candidate' | 'client' | 'admin'
      task_type: 'upload' | 'form' | 'video' | 'text' | 'training'
      submission_status: 'pending' | 'approved' | 'rejected'
      content_type: 'video' | 'text'
      contract_status: 'draft' | 'pending' | 'signed' | 'expired'
      request_status: 'open' | 'filled' | 'cancelled'
      upload_type: 'profile' | 'document' | 'contract'
    }
  }
}
