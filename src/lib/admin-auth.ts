import 'server-only';
import {redirect} from 'next/navigation';
import {sessionSupabase} from '@/lib/supabase/session';
export async function requireAdmin(){
 const supabase=await sessionSupabase();
 if(!supabase)redirect('/admin/login?reason=setup');
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user)redirect('/admin/login');
 const {data:admin,error:adminError}=await supabase.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
 if(adminError||!admin)redirect('/admin/login?reason=forbidden');
 return user;
}
