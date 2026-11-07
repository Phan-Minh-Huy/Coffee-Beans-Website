import {NextResponse} from 'next/server';
import Stripe from 'stripe';
import {stripeClient} from '@/lib/stripe';
import {serviceSupabase} from '@/lib/supabase/admin';
export const runtime='nodejs';
export async function POST(request:Request){
 const signature=request.headers.get('stripe-signature');
 if(!signature||!process.env.STRIPE_WEBHOOK_SECRET)return NextResponse.json({error:'Webhook configuration missing'},{status:400});
 let event:Stripe.Event;
 try{event=stripeClient().webhooks.constructEvent(await request.text(),signature,process.env.STRIPE_WEBHOOK_SECRET);}catch{return NextResponse.json({error:'Invalid webhook signature'},{status:400});}
 try{
  if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded'){
   const session=event.data.object as Stripe.Checkout.Session;
   if(session.payment_status==='paid'&&session.metadata?.order_id){
    const db=serviceSupabase();
    // Restrict by both order ID and Stripe session ID; repeat events leave paid orders unchanged.
    const {error}=await db.from('orders').update({status:'paid',paid_at:new Date().toISOString()}).eq('id',session.metadata.order_id).eq('stripe_session_id',session.id).eq('status','pending_payment');
    if(error)throw error;
   }
  }
  if(event.type==='checkout.session.expired'){
   const session=event.data.object as Stripe.Checkout.Session;
   if(session.metadata?.order_id){const {error}=await serviceSupabase().from('orders').update({status:'cancelled'}).eq('id',session.metadata.order_id).eq('stripe_session_id',session.id).eq('status','pending_payment');if(error)throw error;}
  }
  return NextResponse.json({received:true});
 }catch(error){console.error('Webhook processing failed',error instanceof Error?error.message:'Unknown error');return NextResponse.json({error:'Webhook processing failed'},{status:500});}
}
