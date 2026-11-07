import type {Metadata} from 'next';
import {CheckoutForm} from '@/components/checkout-form';
export const metadata:Metadata={title:'Checkout',robots:{index:false,follow:false}};
export default function CheckoutPage(){const isConfigured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET);return <CheckoutForm isConfigured={isConfigured}/>}
