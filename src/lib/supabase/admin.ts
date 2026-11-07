import 'server-only';
import { createClient } from '@supabase/supabase-js';
export function serviceSupabase() {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!secret) throw new Error('Supabase server credentials are not configured');
 return createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
}
