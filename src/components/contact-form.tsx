"use client";
import { FormEvent, useState } from "react";
import { ArrowUpRight } from "lucide-react";
export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult("");
    const form = event.currentTarget;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Could not send message");
      setResult("Thanks for reaching out! Your message was received.");
      form.reset();
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="checkout-form contact-form" onSubmit={send}>
      <label>
        Your name
        <input
          name="name"
          minLength={2}
          maxLength={100}
          required
          placeholder="Full name"
        />
      </label>
      <label>
        Email address
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
      </label>
      <label>
        Message
        <textarea
          name="message"
          required
          rows={5}
          minLength={10}
          maxLength={2000}
          placeholder="Tell us what's on your mind..."
        ></textarea>
      </label>
      <input
        className="honeypot"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button type="submit" disabled={loading} className="pill-btn full-btn">
        {loading ? "Sending..." : "Send a message"} <ArrowUpRight size={16} />
      </button>
      {result && (
        <p className="form-status" role="status">
          {result}
        </p>
      )}
    </form>
  );
}
