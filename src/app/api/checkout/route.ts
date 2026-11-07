import { NextResponse } from "next/server";
import { checkoutSchema, validatePickup } from "@/lib/validation";
import { serviceSupabase } from "@/lib/supabase/admin";
import { stripeClient } from "@/lib/stripe";
import {
  defaultDrinkOptions,
  optionsAllowed,
  optionsPriceCents,
  optionsLabel,
  type DrinkOptions,
} from "@/lib/customizations";
import type { ProductCategory } from "@/types";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.NEXT_PUBLIC_SITE_URL)
      return NextResponse.json(
        { error: "Checkout is not configured." },
        { status: 503 },
      );
    const input = checkoutSchema.safeParse(await request.json());
    if (!input.success)
      return NextResponse.json(
        { error: "Please review the checkout fields and try again." },
        { status: 400 },
      );
    const data = input.data;
    if (data.website)
      return NextResponse.json(
        { error: "Invalid submission." },
        { status: 400 },
      );
    const timezone = process.env.STORE_TIMEZONE || "America/Chicago";
    if (!validatePickup(data.pickupDate, data.pickupTime, timezone))
      return NextResponse.json(
        {
          error:
            "Please choose a pickup time during store hours, at least 30 minutes from now and within 14 days.",
        },
        { status: 400 },
      );
    const db = serviceSupabase();
    const uniqueIds = [...new Set(data.items.map((item) => item.productId))];
    const { data: products, error: productError } = await db
      .from("products")
      .select("id,name,category,base_price_cents,size_prices,is_available")
      .in("id", uniqueIds);
    if (productError || !products || products.length !== uniqueIds.length)
      return NextResponse.json(
        { error: "Some products are no longer available." },
        { status: 400 },
      );
    const byId = new Map(products.map((p) => [p.id, p]));
    const lineItems: Array<{
      productId: string;
      name: string;
      size: string;
      quantity: number;
      unitPriceCents: number;
      customizations: DrinkOptions;
    }> = [];
    for (const item of data.items) {
      const product = byId.get(item.productId);
      if (!product || !product.is_available)
        return NextResponse.json(
          { error: "A selected product is unavailable." },
          { status: 400 },
        );
      const sizes = product.size_prices as Record<string, number>;
      if (!Object.hasOwn(sizes, item.size))
        return NextResponse.json(
          { error: "A product size is no longer available." },
          { status: 400 },
        );
      const options =
        item.customizations ??
        defaultDrinkOptions(product.category as ProductCategory);
      if (!optionsAllowed(product.category as ProductCategory, options))
        return NextResponse.json(
          { error: "A drink customization is not available for this item." },
          { status: 400 },
        );
      const amount = sizes[item.size] + optionsPriceCents(options);
      if (!Number.isSafeInteger(amount) || amount < 50 || amount > 100_000)
        return NextResponse.json(
          { error: "A product price is invalid." },
          { status: 500 },
        );
      lineItems.push({
        productId: product.id,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        unitPriceCents: amount,
        customizations: options,
      });
    }
    const total = lineItems.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0,
    );
    if (total > 100_000_00)
      return NextResponse.json(
        { error: "Order value exceeds the limit." },
        { status: 400 },
      );
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        pickup_date: data.pickupDate,
        pickup_time: data.pickupTime,
        notes: data.notes,
        total_cents: total,
        status: "pending_payment",
      })
      .select("id")
      .single();
    if (orderError || !order)
      return NextResponse.json(
        { error: "Unable to create your order right now." },
        { status: 503 },
      );
    const { error: itemsError } = await db
      .from("order_items")
      .insert(
        lineItems.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.name,
          size: item.size,
          quantity: item.quantity,
          unit_price_cents: item.unitPriceCents,
          customizations: item.customizations,
        })),
      );
    if (itemsError) {
      await db
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id);
      return NextResponse.json(
        { error: "Could not save order items." },
        { status: 503 },
      );
    }
    try {
      const stripe = stripeClient();
      const base = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: data.customerEmail,
        client_reference_id: order.id,
        metadata: { order_id: order.id },
        line_items: lineItems.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: item.unitPriceCents,
            product_data: {
              name: `${item.name} · ${item.size}`,
              description: optionsLabel(item.customizations),
            },
          },
        })),
        success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/cart`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      });
      if (!session.url) throw new Error("Stripe returned no payment URL");
      const { error: updateError } = await db
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", order.id);
      if (updateError) throw new Error("Could not connect payment to order");
      return NextResponse.json({ url: session.url });
    } catch (error) {
      console.error(
        "Checkout session creation failed",
        error instanceof Error ? error.message : "Unknown error",
      );
      await db
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id);
      return NextResponse.json(
        { error: "Payment could not be started. No payment has been taken." },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error(
      "Checkout failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable." },
      { status: 503 },
    );
  }
}
