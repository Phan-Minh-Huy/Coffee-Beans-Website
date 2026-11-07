import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { MenuFilter } from "@/components/menu-filter";

export const metadata: Metadata = {
  title: "Beverage",
  description: "Explore our handcrafted coffee, matcha, tea, and cold drinks.",
};

export default async function BeveragePage() {
  const { products, demo, error } = await getCatalog();

  // Only show beverages, not bakery or food products.
  const beverageCategories = new Set(["coffee", "cold", "matcha", "tea"]);

  const beverages = products.filter((product) =>
    beverageCategories.has(product.category),
  );

  return (
    <>
      <section className="page-hero menu-page-hero">
        <div className="shell">
          <span className="section-kicker">CRAFTED FOR EVERY MOMENT</span>

          <h1>
            Explore our
            <br />
            <em>Beverages.</em>
          </h1>

          <p>
            From rich espresso and creamy lattes to refreshing cold brews,
            matcha, and tea. Find your perfect sip.
          </p>
        </div>

        <span className="menu-hero-decoration">✳</span>
      </section>

      <section className="shell menu-section">
        {demo && (
          <div className="demo-mode">
            Demo catalog — sample products and prices.
          </div>
        )}

        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}

        <MenuFilter products={beverages} />
      </section>
    </>
  );
}
