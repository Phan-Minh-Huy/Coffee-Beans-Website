import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { DrinkConfigurator } from "@/components/drink-configurator";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getCatalog();
  const product = products.find(
    (item) => item.slug === slug && item.category !== "bakery",
  );
  return {
    title: product ? `Customize ${product.name}` : "Drink not found",
    robots: { index: false, follow: false },
  };
}

export default async function BeverageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ size?: string; qty?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const parsedQuantity = Number(query.qty ?? "1");

  const quantity =
    Number.isInteger(parsedQuantity) &&
    parsedQuantity >= 1 &&
    parsedQuantity <= 20
      ? parsedQuantity
      : 1;
  const { products, demo, error } = await getCatalog();
  if (error)
    return (
      <section className="shell centered-page">
        <h1>Menu unavailable</h1>
        <p>{error}</p>
        <Link href="/menu" className="pill-btn">
          Back to beverages
        </Link>
      </section>
    );
  const product = products.find(
    (item) =>
      item.slug === slug && item.category !== "bakery" && item.is_available,
  );
  if (!product || Object.keys(product.size_prices).length === 0) notFound();

  return (
    <main className="drink-detail shell">
      <Link href="/menu" className="drink-breadcrumb">
        <ArrowLeft size={17} /> Back to beverages
      </Link>
      {demo && (
        <div className="demo-mode">
          Demo drink — checkout requires configured Supabase and Stripe.
        </div>
      )}
      <DrinkConfigurator product={product} preferredSize={query.size} />
    </main>
  );
}
