import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const required=['src/app/page.tsx','src/app/menu/page.tsx','src/app/cart/page.tsx','src/app/checkout/page.tsx','src/app/admin/page.tsx','src/app/api/checkout/route.ts','src/app/api/stripe/webhook/route.ts','src/app/api/contact/route.ts','supabase/migrations/20261030170000_initial_schema.sql','DEPLOYMENT.md','MAINTENANCE.md','public/images/hero-coffee.svg'];
const missing=required.filter(f=>!existsSync(join(process.cwd(),f)));
if(missing.length){console.error('Missing files:',missing.join(', '));process.exit(1)}
const sql=readFileSync(join(process.cwd(),'supabase/migrations/20261030170000_initial_schema.sql'),'utf8');
for(const name of ['admins','products','orders','order_items','contact_messages']){if(!sql.includes(`alter table public.${name} enable row level security;`)){console.error(`Missing RLS for ${name}`);process.exit(1)}}
console.log(`Structure OK (${required.length} critical files, 5 RLS-protected tables).`);
