import { createClient } from '@supabase/supabase-js';

// Leemos variables de entorno de Vite (se reemplazan en build). Pueden no estar definidas.
const supabaseUrl: string | undefined = (import.meta as any).env?.VITE_SUPABASE_URL as
  | string
  | undefined;
const supabaseAnonKey: string | undefined = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

// Creamos el cliente solo si hay configuración válida para evitar errores en runtime.
let client: ReturnType<typeof createClient> | undefined;
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // No romper la app en producción: evitamos crear el cliente y dejamos que la UI muestre un aviso.
  // Nota: Exportamos un valor "any" para no romper imports tipados; no debe usarse si faltan envs.
  console.warn(
  '[SkillsConnect] Variables de entorno de Supabase ausentes. Configure VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  );
}

// Export por compatibilidad con el resto del código. Cuando no hay envs, será undefined.
// Los componentes deben evitar usarlo si la configuración es inválida.
export const supabase: any = client as any;

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
