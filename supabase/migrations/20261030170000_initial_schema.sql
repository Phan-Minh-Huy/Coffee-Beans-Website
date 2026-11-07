-- Brew & Bean Coffee / initial database schema
-- Apply to a NEW Supabase project through Supabase CLI migration or SQL editor.
-- Public tables are RLS-protected. Sensitive writes happen only via server-side service key.
create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 2 and 100),
  description text not null default '',
  category text not null check (category in ('coffee','cold','matcha','tea','bakery')),
  image_url text not null default '/images/latte.svg',
  base_price_cents integer not null check (base_price_cents between 50 and 100000),
  size_prices jsonb not null check (jsonb_typeof(size_prices)='object'),
  featured boolean not null default false,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_available_category on public.products(is_available,category);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  pickup_date date not null,
  pickup_time time not null,
  notes text not null default '',
  total_cents integer not null check (total_cents between 0 and 10000000),
  status text not null default 'pending_payment' check (status in ('pending_payment','paid','preparing','ready','completed','cancelled')),
  stripe_session_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_status_created on public.orders(status,created_at desc);
create index if not exists idx_orders_pickup on public.orders(pickup_date,pickup_time);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  size text not null,
  quantity integer not null check (quantity between 1 and 20),
  unit_price_cents integer not null check (unit_price_cents > 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create or replace function public.update_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end; $$;
create trigger update_products_timestamp before update on public.products for each row execute function public.update_updated_at();
create trigger update_orders_timestamp before update on public.orders for each row execute function public.update_updated_at();

alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;

-- Explicit grants are required when the Data API does not auto-expose SQL-created tables.
revoke all on public.admins,public.products,public.orders,public.order_items,public.contact_messages from anon,authenticated;
grant select on public.products to anon,authenticated;
grant select on public.admins to authenticated;
-- Server-side clients require explicit table privileges on projects with restricted defaults.
grant select,insert,update,delete on public.admins,public.products,public.orders,public.order_items,public.contact_messages to service_role;

create policy "Anyone may read available products" on public.products
  for select to anon,authenticated using (is_available = true);
create policy "Admin user may see their own membership" on public.admins
  for select to authenticated using ((select auth.uid())=user_id);
-- No public INSERT/UPDATE/DELETE policies on any table.
-- An authenticated admin uses a SERVER action that checks membership, then server service-role.
-- Orders, order items and contact messages are invisible to normal clients.

-- Demo catalog seed. Verify product names, menu, prices and availability before commercial launch.
insert into public.products (slug,name,description,category,image_url,base_price_cents,size_prices,featured)
values
('signature-espresso','Signature Espresso','Bold, velvety espresso with notes of dark chocolate and toasted hazelnut.','coffee','/images/espresso.svg',350,'{"Single":350,"Double":450}',true),
('honey-oat-latte','Honey Oat Latte','Silky oat milk, rich espresso and a soft swirl of wildflower honey.','coffee','/images/latte.svg',550,'{"Regular":550,"Large":650}',true),
('cloud-cappuccino','Cloud Cappuccino','A beautifully balanced classic with pillowy microfoam.','coffee','/images/cappuccino.svg',490,'{"Regular":490,"Large":590}',true),
('slow-cold-brew','Slow Cold Brew','Steeped for 18 hours. Smooth, refreshing and naturally sweet.','cold','/images/coldbrew.svg',520,'{"Regular":520,"Large":620}',true),
('ceremonial-matcha','Ceremonial Matcha','Vibrant stone-ground matcha whisked smooth and finished with milk.','matcha','/images/matcha.svg',590,'{"Regular":590,"Large":690}',false),
('garden-chai','Garden Chai','Slow-simmered spices with black tea, gently sweetened.','tea','/images/chai.svg',480,'{"Regular":480,"Large":580}',false),
('butter-croissant','Butter Croissant','Golden, flaky layers baked fresh each morning.','bakery','/images/croissant.svg',420,'{"One":420}',false),
('chocolate-cookie','Brown Butter Cookie','Crisp edges, chewy center and generous chocolate chunks.','bakery','/images/cookie.svg',380,'{"One":380}',false)
on conflict (slug) do nothing;
