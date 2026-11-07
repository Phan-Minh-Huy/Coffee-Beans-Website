import Link from 'next/link';
import type {Metadata} from 'next';
import {CheckCircle2,Clock3,AlertCircle} from 'lucide-react';
import {stripeClient} from '@/lib/stripe';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Checkout status',robots:{index:false,follow:false}};
export default async function SuccessPage({searchParams}:{searchParams:Promise<{session_id?:string}>}){
 const {session_id}=await searchParams;let paid=false;let amount:number|undefined;let reference:string|undefined;
 if(session_id&&session_id.startsWith('cs_')&&process.env.STRIPE_SECRET_KEY){try{const session=await stripeClient().checkout.sessions.retrieve(session_id);paid=session.payment_status==='paid';if(paid){amount=session.amount_total??undefined;reference=session.client_reference_id??undefined;}}catch{/* Do not assume payment succeeded */}}
 return <section className="shell checkout-result"><div className="result-symbol">{paid?<CheckCircle2 size={45}/>:<AlertCircle size={45}/>}</div><span className="section-kicker">{paid?'PAYMENT CONFIRMED':'PAYMENT STATUS'}</span><h1>{paid?'Your coffee is on its way.':'We can’t confirm payment yet.'}</h1><p>{paid?'Your payment was confirmed by Stripe. The shop will prepare your order for the selected pickup time.': 'Your payment may still be processing, or the checkout link is invalid. Check your payment confirmation before trying again.'}</p>{paid&&<div className="result-data"><span>Order reference: {reference?.slice(0,8)??'—'}</span>{amount!==undefined&&<span>Amount paid: ${(amount/100).toFixed(2)}</span>}</div>}<Link className="pill-btn" href="/menu">Explore the menu →</Link></section>;
}
