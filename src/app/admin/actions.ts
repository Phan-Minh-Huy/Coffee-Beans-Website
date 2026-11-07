"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { sessionSupabase } from "@/lib/supabase/session";
import { serviceSupabase } from "@/lib/supabase/admin";
const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(5).max(500),
  category: z.enum(["coffee", "cold", "matcha", "tea", "bakery"]),
  price: z.coerce.number().positive().max(999),
  image: z
    .string()
    .trim()
    .max(500)
    .refine(
      (x) =>
        x.startsWith("/images/") ||
        (() => {
          try {
            return new URL(x).protocol === "https:";
          } catch {
            return false;
          }
        })(),
      "Image must be /images/... or https URL",
    ),
  featured: z.boolean(),
  sizePrices: z.record(
    z.string().min(1).max(35),
    z.number().int().min(50).max(100000),
  ),
});
function readSizePrices(raw: string) {
  const entries = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((x) => {
      const [name, amount] = x.split(":").map((y) => y.trim());
      return [name, Math.round(Number(amount) * 100)] as const;
    });
  if (
    !entries.length ||
    entries.length > 8 ||
    entries.some(([name, amount]) => !name || !Number.isSafeInteger(amount))
  )
    throw new Error("Invalid sizes. Use Regular:5.50,Large:6.50");
  return Object.fromEntries(entries);
}
export async function loginAction(formData: FormData) {
  const supabase = await sessionSupabase();
  if (!supabase) redirect("/admin/login?reason=setup");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?reason=invalid");
  redirect("/admin");
}
export async function logoutAction() {
  const supabase = await sessionSupabase();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  let sizes: Record<string, number>;
  try {
    sizes = readSizePrices(String(formData.get("sizes") || ""));
  } catch {
    redirect("/admin?error=sizes");
  }
  const raw = {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    category: String(formData.get("category") || ""),
    price: formData.get("price"),
    image: String(formData.get("image") || ""),
    featured: formData.get("featured") === "on",
    sizePrices: sizes,
  };
  const input = productSchema.safeParse(raw);
  if (!input.success) redirect("/admin?error=product");
  const data = input.data;
  const id = String(formData.get("id") || "");
  const payload = {
    name: data.name,
    description: data.description,
    category: data.category,
    base_price_cents: Math.round(data.price * 100),
    size_prices: data.sizePrices,
    image_url: data.image,
    featured: data.featured,
  };
  const db = serviceSupabase();
  if (id) {
    const { error } = await db.from("products").update(payload).eq("id", id);
    if (error) redirect("/admin?error=save");
  } else {
    const slug = `${data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
    const { error } = await db
      .from("products")
      .insert({ ...payload, slug, is_available: true });
    if (error) redirect("/admin?error=save");
  }
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  revalidatePath("/food");
  redirect("/admin?success=product");
}
export async function toggleProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const available = String(formData.get("available")) === "true";
  if (!z.uuid().safeParse(id).success) redirect("/admin?error=product");
  const { error } = await serviceSupabase()
    .from("products")
    .update({ is_available: !available })
    .eq("id", id);
  if (error) redirect("/admin?error=save");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin");
  redirect("/admin?success=availability");
}
export async function updateOrderAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (
    !z.uuid().safeParse(id).success ||
    !["preparing", "ready", "completed", "cancelled"].includes(status)
  )
    redirect("/admin?error=order");
  const db = serviceSupabase();
  const { data: order } = await db
    .from("orders")
    .select("status")
    .eq("id", id)
    .single();
  if (!order || !["paid", "preparing", "ready"].includes(order.status))
    redirect("/admin?error=order");
  if (status === "cancelled") redirect("/admin?error=refund"); // Never cancel paid order without refund workflow
  const { error } = await db.from("orders").update({ status }).eq("id", id);
  if (error) redirect("/admin?error=order");
  revalidatePath("/admin");
  redirect("/admin?success=order");
}
