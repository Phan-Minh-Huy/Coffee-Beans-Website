"use client";

import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowDownUp,
} from "lucide-react";
import { ProductCard } from "./product-card";
import { categoryNames } from "@/lib/demo-data";
import type { Product } from "@/types";

type Category = "all" | "coffee" | "cold" | "matcha" | "tea";
type SortOrder = "featured" | "price-asc" | "price-desc" | "name";

const categories: Category[] = ["all", "coffee", "cold", "matcha", "tea"];

const sizeRank: Record<string, number> = {
  Single: 1,
  Small: 2,
  Regular: 3,
  Medium: 4,
  Double: 5,
  Large: 6,
};

export function MenuFilter({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<Category>("all");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState<SortOrder>("featured");
  const [search, setSearch] = useState("");

  const drinks = useMemo(
    () => products.filter((p) => p.category !== "bakery"),
    [products],
  );

  const sizes = useMemo(() => {
    const allSizes = new Set(drinks.flatMap((p) => Object.keys(p.size_prices)));

    return [...allSizes].sort(
      (a, b) => (sizeRank[a] ?? 99) - (sizeRank[b] ?? 99) || a.localeCompare(b),
    );
  }, [drinks]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = drinks.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (size === "all" ||
          Object.prototype.hasOwnProperty.call(p.size_prices, size)) &&
        `${p.name} ${p.description}`.toLowerCase().includes(query),
    );

    const price = (p: Product) =>
      size === "all" ? p.base_price_cents : p.size_prices[size];

    if (sort === "featured") {
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
    } else if (sort === "price-asc") {
      result.sort((a, b) => price(a) - price(b));
    } else if (sort === "price-desc") {
      result.sort((a, b) => price(b) - price(a));
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [drinks, category, size, sort, search]);

  function resetFilters() {
    setCategory("all");
    setSize("all");
    setSort("featured");
    setSearch("");
  }

  return (
    <>
      <div className="beverage-filter-panel">
        <div className="beverage-filter-heading">
          <div className="beverage-filter-title">
            <SlidersHorizontal size={19} />
            <span>Find your perfect drink</span>
          </div>
          <button
            type="button"
            className="beverage-reset"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>

        <div className="filter-list beverage-categories">
          {categories.map((key) => (
            <button
              key={key}
              type="button"
              className={category === key ? "selected" : ""}
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
            >
              {categoryNames[key]}
            </button>
          ))}
        </div>

        <div className="beverage-filter-fields">
          <label className="beverage-search">
            <span className="beverage-field-label">Search</span>
            <span className="beverage-input-shell">
              <Search size={17} />
              <input
                type="search"
                placeholder="Find your drink..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </span>
          </label>

          <label className="beverage-select-field">
            <span className="beverage-field-label">Cup Size</span>
            <span className="beverage-select-shell">
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="all">All Sizes</option>
                {sizes.map((s) => (
                  <option value={s} key={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown size={17} />
            </span>
          </label>

          <label className="beverage-select-field">
            <span className="beverage-field-label">Sort By</span>
            <span className="beverage-select-shell">
              <ArrowDownUp size={16} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
              >
                <option value="featured">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
              </select>
              <ChevronDown size={17} />
            </span>
          </label>
        </div>
      </div>

      <p className="beverage-results-count" role="status">
        Showing <strong>{visible.length}</strong> drinks
      </p>

      {visible.length > 0 ? (
        <div className="products-grid beverage-results-grid">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              preferredSize={size === "all" ? undefined : size}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No drinks found</h3>
          <p>Try another size or category.</p>
          <button
            type="button"
            className="beverage-reset"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
