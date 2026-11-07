"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "./cart-provider";
import { formatMoney, sumCart } from "@/lib/money";
import Image from "next/image";
export function CartView() {
  const { items, remove, setQuantity } = useCart();
  const total = sumCart(items);
  if (!items.length)
    return (
      <section className="shell empty-cart">
        <div className="empty-cart-icon">
          <ShoppingBag size={36} />
        </div>
        <h2>Your bag is feeling a little empty.</h2>
        <p>Good coffee is just a few clicks away.</p>
        <Link className="pill-btn" href="/menu">
          Explore the menu <ArrowRight size={17} />
        </Link>
      </section>
    );
  return (
    <section className="shell cart-layout">
      <div className="cart-main">
        <div className="section-kicker">
          YOUR SELECTION · {items.length} ITEMS
        </div>
        <h1>Good choices.</h1>
        <div className="cart-list">
          {items.map((item) => (
            <div className="cart-item" key={item.key}>
              <img src={item.image} alt="" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>
                  {item.size} · {formatMoney(item.unitPriceCents)} each
                </p>
                <button
                  className="remove-link"
                  onClick={() => remove(item.key)}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
              <div className="cart-item-end">
                <b>{formatMoney(item.unitPriceCents * item.quantity)}</b>
                <div className="quantity-picker">
                  <button
                    aria-label={`Decrease ${item.name}`}
                    onClick={() => setQuantity(item.key, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label={`Increase ${item.name}`}
                    onClick={() => setQuantity(item.key, item.quantity + 1)}
                    disabled={item.quantity >= 20}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/menu" className="text-link">
          <ArrowLeft size={16} /> Continue exploring
        </Link>
      </div>
      <aside className="order-summary">
        <h2>Order summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatMoney(total)}</span>
        </div>
        <div className="summary-row">
          <span>Pickup</span>
          <span>Free</span>
        </div>
        <p className="summary-notice">
          Taxes and final amounts, where applicable, are confirmed at checkout.
        </p>
        <div className="summary-total">
          <span>Subtotal</span>
          <b>{formatMoney(total)}</b>
        </div>
        <Link href="/checkout" className="pill-btn full-btn">
          Continue to checkout <ArrowRight size={17} />
        </Link>
        <p className="summary-footnote">
          Made fresh. Ready for your pickup time.
        </p>
      </aside>
    </section>
  );
}
