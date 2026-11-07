# Architecture

## Components

- Next.js App Router: server-rendered pages, route handlers for guest checkout/contact/webhook, server actions for admin modifications.
- `CartProvider`: browser localStorage (key `brewbean-cart-v1`) holds only product selection and display estimates. Its data is untrusted.
- Supabase `publicSupabase()`: publishable key, SELECT-only access to available products with RLS.
- Supabase `sessionSupabase()`: cookie-bound authentication client for staff login and admin membership verification.
- Supabase `serviceSupabase()`: secret server client, used **only** in route handlers or server actions after appropriate checks.
- Stripe: hosted Checkout session server-side; signed webhook updates authoritative payment status. Success URL independently checks Stripe session and is not used for fulfillment.

## Checkout data flow

1. Shopper selects `{productId, size, quantity}` in browser.
2. POST `/api/checkout` validates customer details, pickup hours, product UUIDs, and quantity limits.
3. Server fetches current product prices from Supabase; selected sizes must exist and products must be active.
4. Server inserts `orders` and `order_items` with immutable snapshot prices and `pending_payment` status.
5. Server creates a Stripe Checkout Session with server-computed amounts and stores `stripe_session_id`.
6. Shopper completes hosted payment. The signed webhook sets `paid`; admin starts preparation. Browser success-page visits cannot mark orders paid.
7. Staff updates order status after authentication and the admin-membership check.

## Access boundaries

- `admins`: accessible to a logged-in user only for *their own membership record*.
- `products`: public SELECT for available products; mutations use admin-verified server actions.
- `orders`, `order_items`, `contact_messages`: no `anon` or `authenticated` table privileges; server writes only through secret key.
- Service role must never be sent to the client and must never be declared `NEXT_PUBLIC_*`.
- Checkout URL derives from configured deployment site URL, never user input.

## Operational caveats

- Webhook updates are idempotent for simple state transitions (only `pending_payment` becomes `paid`, and expiry changes only pending orders). For fulfillment emails, introduce an event log/outbox with exactly-once processing semantics.
- New customer order rate limiting and spam protections are not configured by default; set up Vercel Firewall, a managed limiter, or an equivalent solution before accepting real traffic.
- Admin uses role checks in application code; server-side keys bypass RLS by design. Keep code ownership and deployment permissions carefully managed.
- Image URLs accept HTTPS or app-local images. Use approved domains and content moderation policy if allowing staff uploads in the future.
- Inventory tracking, allergen information, discount codes, taxes, email notifications, refunds and customer account portals are deliberately outside this starter's MVP.
