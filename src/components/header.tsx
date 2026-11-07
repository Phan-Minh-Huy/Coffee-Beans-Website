"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, ArrowUpRight } from "lucide-react";
import { useCart } from "./cart-provider";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Beverage" },
  { href: "/food", label: "Food & pastries" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Visit us" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header className="site-header">
      <div className="shell nav-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Brew and Bean home"
          onClick={() => setOpen(false)}
        >
          <span className="brand-icon">
            b<span>·</span>
          </span>
          <span className="brand-word">
            BREW <i>&</i> BEAN
            <small>COFFEE HOUSE</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link
            href="/cart"
            className="cart-nav"
            aria-label={`Shopping bag with ${count} items`}
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span key={count} className="cart-count">
                {count}
              </span>
            )}
          </Link>

          <Link href="/menu" className="pill-btn order-nav">
            Order online <ArrowUpRight size={16} />
          </Link>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={`mobile-nav ${open ? "is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!open}
        inert={!open}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/cart" onClick={() => setOpen(false)}>
          Your bag ({count})
        </Link>
      </nav>
    </header>
  );
}
