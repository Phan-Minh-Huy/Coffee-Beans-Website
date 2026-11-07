"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, Minus, Plus, ShoppingBag } from "lucide-react";

import { formatMoney } from "@/lib/money";
import { cartVariantKey, defaultDrinkOptions } from "@/lib/customizations";
import { useCart } from "./cart-provider";
import type { Product } from "@/types";

export function ProductCard({
  product,
  preferredSize,
}: {
  product: Product;
  preferredSize?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addConfigured, items } = useCart();

  const isFood = product.category === "bakery";
  const sizes = Object.keys(product.size_prices);

  // Keep the database size key "One" internally.
  const servingSize = sizes.includes("One") ? "One" : (sizes[0] ?? "");

  const available = product.is_available && sizes.length > 0;

  const options = defaultDrinkOptions(product.category);

  const variantKey = cartVariantKey(product.id, servingSize, options);

  const existingQuantity =
    items.find((item) => item.key === variantKey)?.quantity ?? 0;

  const canAdd = available && existingQuantity + quantity <= 20;

  const unitPrice =
    product.size_prices[servingSize] ?? product.base_price_cents;

  const totalPrice = unitPrice * quantity;

  const href =
    `/menu/${encodeURIComponent(product.slug)}` +
    (preferredSize ? `?size=${encodeURIComponent(preferredSize)}` : "");

  const productImage = (
    <div className={`product-art product-art-${product.category}`}>
      <img src={product.image_url} alt={product.name} loading="lazy" />
      <span className="product-badge">
        {isFood ? "Freshly baked" : "Made your way"}
      </span>
    </div>
  );

  // BEVERAGE: Open customization page.
  if (!isFood) {
    return (
      <Link
        href={href}
        className="product-card beverage-product-card beverage-clickable"
        aria-label={`Customize ${product.name}`}
      >
        {productImage}

        <div className="product-details">
          <div className="product-title-row">
            <h3>{product.name}</h3>
            <span>From {formatMoney(product.base_price_cents)}</span>
          </div>

          <p>{product.description}</p>

          <span className="add-btn beverage-add-button">
            Customize & Order
            <ArrowUpRight size={17} />
          </span>
        </div>
      </Link>
    );
  }

  // PASTRY: Choose quantity and add to the bag.
  function addPastryToBag() {
    if (!canAdd) return;

    addConfigured(product, [
      {
        size: servingSize,
        quantity,
        customizations: options,
      },
    ]);

    setAdded(true);
  }

  return (
    <article className="product-card beverage-product-card pastry-card">
      {productImage}

      <div className="product-details">
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <span>{formatMoney(unitPrice)} / piece</span>
        </div>

        <p>{product.description}</p>

        <div className="pastry-quantity-section">
          <div className="pastry-quantity-header">
            <span>Quantity</span>
            <strong>{formatMoney(totalPrice)}</strong>
          </div>

          <div
            className="pastry-stepper"
            role="group"
            aria-label={`${product.name} quantity`}
          >
            <button
              type="button"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              onClick={() => {
                setQuantity((q) => Math.max(1, q - 1));
                setAdded(false);
              }}
            >
              <Minus size={17} />
            </button>

            <span aria-live="polite">{quantity}</span>

            <button
              type="button"
              disabled={quantity >= 20}
              aria-label="Increase quantity"
              onClick={() => {
                setQuantity((q) => Math.min(20, q + 1));
                setAdded(false);
              }}
            >
              <Plus size={17} />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="add-btn beverage-add-button"
          disabled={!canAdd}
          onClick={addPastryToBag}
        >
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}

          {added ? "Added to bag" : `Add ${quantity} to bag`}
        </button>

        {!canAdd && available && (
          <p className="pastry-limit-note" role="status">
            Maximum 20 of this item per order.
          </p>
        )}
      </div>
    </article>
  );
}
