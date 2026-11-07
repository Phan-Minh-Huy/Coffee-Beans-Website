import {createServerClient} from '@supabase/ssr';
import {NextRequest,NextResponse} from 'next/server';
export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return response;
 const db=createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll();},setAll(cookies){cookies.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 await db.auth.getUser();return response;
}
export const config={matcher:['/admin/:path*']};
