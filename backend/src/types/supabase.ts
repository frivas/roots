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
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          department?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          subject: string
          body: string
          read: boolean
          starred: boolean
          created_at: string
          sender_id: string | null
          recipient_id: string | null
        }
        Insert: {
          id?: string
          subject: string
          body: string
          read?: boolean
          starred?: boolean
          created_at?: string
          sender_id?: string | null
          recipient_id?: string | null
        }
        Update: {
          id?: string
          subject?: string
          body?: string
          read?: boolean
          starred?: boolean
          created_at?: string
          sender_id?: string | null
          recipient_id?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          title: string
          message: string
          type: string
          read?: boolean
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          created_at?: string
          user_id?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          email_notifications: boolean
          sms_notifications: boolean
          push_notifications: boolean
          language: string
          timezone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          email_notifications?: boolean
          sms_notifications?: boolean
          push_notifications?: boolean
          language?: string
          timezone?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          email_notifications?: boolean
          sms_notifications?: boolean
          push_notifications?: boolean
          language?: string
          timezone?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      services: {
        Row: {
          id: string
          name: string
          description: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}