import { createClient, type SupabaseClient } from '@supabase/supabase-js';
export function isSupabaseConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);}
export function publicSupabase(): SupabaseClient | null {
 if (!isSupabaseConfigured()) return null;
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false}});
}
