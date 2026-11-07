import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Coffee, ShoppingBag } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Food & Pastries",
  description: "Fresh pastries, croissants, muffins and delicious small bites.",
};

export default async function FoodPage() {
  const { products, demo, error } = await getCatalog();

  const food = products.filter((product) => product.category === "bakery");

  return (
    <>
      <section className="food-hero">
        <div className="shell food-hero-layout">
          <div>
            <span className="section-kicker">FRESHLY BAKED WITH LOVE</span>

            <h1>
              A little bite
              <br />
              of <em>happiness.</em>
            </h1>

            <p>
              Flaky croissants, warm pastries and sweet treats. The perfect
              pairing for your favorite coffee.
            </p>

            <div className="food-hero-actions">
              <a href="#food-menu" className="pill-btn">
                Explore food <ArrowRight size={17} />
              </a>
              <Link href="/menu" className="underlined-link">
                Browse coffee <Coffee size={17} />
              </Link>
            </div>
          </div>

          <div className="food-hero-image">
            <img
              src="/images/croissant.svg"
              alt="Freshly baked butter croissant"
            />
          </div>
        </div>
      </section>

      <section id="food-menu" className="shell food-section">
        <div className="food-heading">
          <div>
            <span className="section-kicker">FRESH FROM OUR BAKERY</span>
            <h2>
              Something <em>delicious.</em>
            </h2>
            <p>Add your favorite treats to the same bag as your coffee.</p>
          </div>

          <Link href="/cart" className="text-link">
            <ShoppingBag size={17} />
            View your bag
          </Link>
        </div>

        {demo && <p className="demo-mode">Demo menu — sample prices only.</p>}

        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}

        {food.length > 0 ? (
          <div className="products-grid">
            {food.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Fresh bites are on their way.</h3>
            <p>Check back soon for new bakery treats.</p>
            <Link href="/menu" className="pill-btn">
              Browse coffee <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
