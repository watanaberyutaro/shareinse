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
      departments: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          department_id: string | null
          role: 'admin' | 'leader' | 'member'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          department_id?: string | null
          role: 'admin' | 'leader' | 'member'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          department_id?: string | null
          role?: 'admin' | 'leader' | 'member'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          company_type: 'client' | 'vendor' | 'both' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company_type?: 'client' | 'vendor' | 'both' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company_type?: 'client' | 'vendor' | 'both' | null
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          project_name: string
          project_location: string
          project_type: 'spot' | 'continuous'
          staff_name: string
          staff_company: string | null
          client_company_id: string | null
          vendor_company_id: string | null
          daily_rate: number
          cost_rate: number
          work_month: string
          work_days: number | null
          work_dates: string[] | null
          project_manager_id: string | null
          staff_manager_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          project_name: string
          project_location: string
          project_type: 'spot' | 'continuous'
          staff_name: string
          staff_company?: string | null
          client_company_id?: string | null
          vendor_company_id?: string | null
          daily_rate: number
          cost_rate: number
          work_month: string
          work_days?: number | null
          work_dates?: string[] | null
          project_manager_id?: string | null
          staff_manager_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          project_name?: string
          project_location?: string
          project_type?: 'spot' | 'continuous'
          staff_name?: string
          staff_company?: string | null
          client_company_id?: string | null
          vendor_company_id?: string | null
          daily_rate?: number
          cost_rate?: number
          work_month?: string
          work_days?: number | null
          work_dates?: string[] | null
          project_manager_id?: string | null
          staff_manager_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
      }
      sales_records: {
        Row: {
          id: string
          user_id: string | null
          record_month: string
          total_sales: number
          total_profit: number
          project_profit: number
          staff_profit: number
          assignment_count: number
          gross_margin_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          record_month: string
          total_sales?: number
          total_profit?: number
          project_profit?: number
          staff_profit?: number
          assignment_count?: number
          gross_margin_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          record_month?: string
          total_sales?: number
          total_profit?: number
          project_profit?: number
          staff_profit?: number
          assignment_count?: number
          gross_margin_rate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          assignment_id: string | null
          user_id: string | null
          content: string
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id?: string | null
          user_id?: string | null
          content: string
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string | null
          user_id?: string | null
          content?: string
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      targets: {
        Row: {
          id: string
          target_type: 'individual' | 'department' | 'company'
          target_id: string | null
          target_month: string
          sales_target: number | null
          profit_target: number | null
          assignment_target: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          target_type: 'individual' | 'department' | 'company'
          target_id?: string | null
          target_month: string
          sales_target?: number | null
          profit_target?: number | null
          assignment_target?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          target_type?: 'individual' | 'department' | 'company'
          target_id?: string | null
          target_month?: string
          sales_target?: number | null
          profit_target?: number | null
          assignment_target?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_monthly_sales: {
        Args: {
          target_month: string
          target_user_id: string
        }
        Returns: {
          total_sales: number
          total_profit: number
          project_profit: number
          staff_profit: number
          assignment_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}