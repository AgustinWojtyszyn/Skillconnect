import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          location?: string | null;
        };
        Update: {
          username?: string;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          location?: string | null;
        };
      };
      skills: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          level: 'beginner' | 'intermediate' | 'expert';
          is_offering: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description: string;
          category: string;
          level: 'beginner' | 'intermediate' | 'expert';
          is_offering?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          category?: string;
          level?: 'beginner' | 'intermediate' | 'expert';
          is_offering?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          created_at: string;
          updated_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read?: boolean;
        };
      };
    };
  };
}
