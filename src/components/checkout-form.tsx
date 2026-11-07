"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Info } from "lucide-react";
import { useCart } from "./cart-provider";
import { formatMoney, sumCart } from "@/lib/money";
export function CheckoutForm({ isConfigured }: { isConfigured: boolean }) {
  const { items } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    pickupDate: "",
    pickupTime: "",
    notes: "",
    website: "",
  });
  function set(field: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...fields,

          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            customizations: item.customizations,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout.");
      if (!data.url) throw new Error("Checkout URL missing.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }
  if (!items.length)
    return (
      <div className="shell centered-page">
        <h1>Your bag is empty.</h1>
        <p>Choose something delicious before checking out.</p>
        <Link className="pill-btn" href="/menu">
          Browse our menu →
        </Link>
      </div>
    );
  return (
    <div className="shell checkout-layout">
      <div>
        <div className="section-kicker">ALMOST THERE</div>
        <h1 className="page-heading">
          The good part
          <br />
          <em>is coming.</em>
        </h1>
        <p className="checkout-intro">
          Order ahead and we’ll have your favorites ready when you arrive.
        </p>
        {!isConfigured && (
          <div className="config-note">
            <Info size={21} />
            <div>
              <strong>Demo mode — real checkout is not connected.</strong>
              <p>
                Configure Supabase and Stripe environment variables to accept
                paid orders. You can still explore the menu and bag.
              </p>
            </div>
          </div>
        )}
        <form onSubmit={submit} className="checkout-form">
          <h2>01 / Your details</h2>
          <div className="form-grid">
            <label>
              Full name
              <input
                required
                minLength={2}
                maxLength={100}
                value={fields.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                placeholder="Your full name"
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                value={fields.customerEmail}
                onChange={(e) => set("customerEmail", e.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </div>
          <label>
            Phone number
            <input
              required
              type="tel"
              minLength={7}
              maxLength={35}
              value={fields.customerPhone}
              onChange={(e) => set("customerPhone", e.target.value)}
              placeholder="Phone number"
            />
          </label>
          <h2>02 / When to pick up</h2>
          <div className="form-grid">
            <label>
              Pickup date
              <input
                type="date"
                required
                value={fields.pickupDate}
                onChange={(e) => set("pickupDate", e.target.value)}
              />
            </label>
            <label>
              Pickup time
              <select
                required
                value={fields.pickupTime}
                onChange={(e) => set("pickupTime", e.target.value)}
              >
                <option value="">Choose a time</option>
                {Array.from({ length: 22 }, (_, i) => {
                  const m = 7 * 60 + i * 30;
                  const time = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
                  return (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
          <p className="field-help">
            Orders require at least 30 minutes lead time, within 14 days and
            during store hours.
          </p>
          <h2>03 / Anything else?</h2>
          <label>
            Order notes <span className="optional">(optional)</span>
            <textarea
              rows={3}
              maxLength={400}
              value={fields.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any special requests?"
            ></textarea>
          </label>
          <input
            aria-hidden="true"
            className="honeypot"
            tabIndex={-1}
            autoComplete="off"
            value={fields.website}
            onChange={(e) => set("website", e.target.value)}
            name="website"
          />
          {error && (
            <div role="alert" className="form-error">
              {error}
            </div>
          )}
          <button
            className="pill-btn full-btn"
            disabled={busy || !isConfigured}
            type="submit"
          >
            {busy ? "Opening secure checkout..." : "Continue to secure payment"}{" "}
            <LockKeyhole size={17} />
          </button>
          <p className="secure-note">
            <LockKeyhole size={13} /> Payments are processed securely by Stripe.
          </p>
        </form>
      </div>
      <aside className="order-summary checkout-aside">
        <h2>Your order</h2>
        {items.map((item) => (
          <div key={item.key} className="checkout-line">
            <img src={item.image} alt="" />
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.size} × {item.quantity}
              </span>
            </div>
            <b>{formatMoney(item.unitPriceCents * item.quantity)}</b>
          </div>
        ))}
        <div className="summary-total">
          <span>Estimated subtotal</span>
          <b>{formatMoney(sumCart(items))}</b>
        </div>
        <p className="summary-notice">
          Final prices are verified on the server and displayed again on Stripe
          Checkout. Demo storefront displays USD.
        </p>
      </aside>
    </div>
  );
}
