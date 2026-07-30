export type Json =
  | boolean
  | null
  | number
  | string
  | Json[]
  | { [key: string]: Json | undefined };

type UserRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  department: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  subject: string;
  body: string;
  read: boolean;
  starred: boolean;
  created_at: string;
  sender_id: string;
  recipient_id: string;
};

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  user_id: string;
};

type SettingsRow = {
  id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  language: string;
  timezone: string;
  updated_at: string;
  user_id: string;
};

type ServiceRow = {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type IllustrationJobRow = {
  id: string;
  owner_id: string;
  session_id: string;
  idempotency_key: string;
  prompt: string;
  status: 'completed' | 'failed' | 'pending' | 'processing';
  image_url: string | null;
  error_code: string | null;
  attempts: number;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role?: string;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserRow, 'id' | 'created_at'>> & {
          id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: MessageRow;
        Insert: {
          id?: string;
          subject: string;
          body: string;
          read?: boolean;
          starred?: boolean;
          created_at?: string;
          sender_id: string;
          recipient_id: string;
        };
        Update: Partial<MessageRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: {
          id?: string;
          title: string;
          message: string;
          type: string;
          read?: boolean;
          created_at?: string;
          user_id: string;
        };
        Update: Partial<NotificationRow>;
        Relationships: [];
      };
      settings: {
        Row: SettingsRow;
        Insert: {
          id?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          push_notifications?: boolean;
          language?: string;
          timezone?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<SettingsRow>;
        Relationships: [];
      };
      services: {
        Row: ServiceRow;
        Insert: {
          id?: string;
          name: string;
          description: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ServiceRow>;
        Relationships: [];
      };
      illustration_jobs: {
        Row: IllustrationJobRow;
        Insert: {
          id?: string;
          owner_id: string;
          session_id: string;
          idempotency_key: string;
          prompt: string;
          status?: IllustrationJobRow['status'];
          image_url?: string | null;
          error_code?: string | null;
          attempts?: number;
          locked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<IllustrationJobRow>;
        Relationships: [];
      };
      health_checks: {
        Row: { id: number; updated_at: string };
        Insert: { id?: number; updated_at?: string };
        Update: { id?: number; updated_at?: string };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      enqueue_illustration_job: {
        Args: {
          p_owner_id: string;
          p_session_id: string;
          p_idempotency_key: string;
          p_prompt: string;
        };
        Returns: IllustrationJobRow[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
