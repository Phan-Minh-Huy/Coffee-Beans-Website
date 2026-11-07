import { demoProducts } from './demo-data';
import { publicSupabase } from './supabase/public';
import type { Product } from '@/types';
export async function getCatalog(): Promise<{ products: Product[]; demo: boolean; error?: string }> {
 const db=publicSupabase();
 if(!db) return {products:demoProducts,demo:true};
 const {data,error}=await db.from('products').select('id,slug,name,description,category,image_url,base_price_cents,size_prices,featured,is_available').eq('is_available',true).order('name');
 if(error) return {products:[],demo:false,error:'Menu is temporarily unavailable. Please try again soon.'};
 return {products:(data??[]) as Product[],demo:false};
}
