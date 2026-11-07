"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cartVariantKey,
  defaultDrinkOptions,
  optionsAllowed,
  optionsPriceCents,
} from "@/lib/customizations";
import type { CartItem, Product, SelectedCup } from "@/types";

const STORAGE_KEY = "brewbean-cart-v1";
type CartContextType = {
  items: CartItem[];
  add: (product: Product, size: string) => void;
  addConfigured: (product: Product, cups: SelectedCup[]) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  count: number;
};
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const data: unknown = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]",
      );
      if (Array.isArray(data)) {
        setItems(
          data
            .filter((item: unknown): item is CartItem => {
              if (!item || typeof item !== "object") return false;
              const candidate = item as Partial<CartItem>;
              return (
                typeof candidate.productId === "string" &&
                typeof candidate.key === "string" &&
                typeof candidate.size === "string" &&
                Number.isInteger(candidate.quantity) &&
                (candidate.quantity ?? 0) >= 1 &&
                (candidate.quantity ?? 0) <= 20
              );
            })
            .slice(0, 30),
        );
      }
    } catch {
      /* Ignore malformed or unavailable local storage. */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* Storage may be disabled. */
      }
    }
  }, [ready, items]);

  const addConfigured = useCallback((product: Product, cups: SelectedCup[]) => {
    if (!product.is_available || cups.length === 0) return;
    const valid = cups.filter(
      (cup) =>
        Object.hasOwn(product.size_prices, cup.size) &&
        Number.isInteger(cup.quantity) &&
        cup.quantity >= 1 &&
        cup.quantity <= 20 &&
        optionsAllowed(product.category, cup.customizations),
    );

    setItems((previous) => {
      const next = [...previous];
      for (const cup of valid) {
        const key = cartVariantKey(product.id, cup.size, cup.customizations);
        const unitPriceCents =
          product.size_prices[cup.size] + optionsPriceCents(cup.customizations);
        const existing = next.findIndex((item) => item.key === key);
        if (existing !== -1) {
          next[existing] = {
            ...next[existing],
            unitPriceCents,
            quantity: Math.min(20, next[existing].quantity + cup.quantity),
          };
        } else if (next.length < 30) {
          next.push({
            key,
            productId: product.id,
            name: product.name,
            image: product.image_url,
            size: cup.size,
            quantity: cup.quantity,
            unitPriceCents,
            customizations: { ...cup.customizations },
          });
        }
      }
      return next;
    });
  }, []);

  const add = useCallback(
    (product: Product, size: string) => {
      addConfigured(product, [
        {
          size,
          quantity: 1,
          customizations: defaultDrinkOptions(product.category),
        },
      ]);
    },
    [addConfigured],
  );

  const remove = useCallback(
    (key: string) => setItems((old) => old.filter((item) => item.key !== key)),
    [],
  );
  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((old) =>
      old.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) }
          : item,
      ),
    );
  }, []);
  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const context = useMemo(
    () => ({ items, add, addConfigured, remove, setQuantity, clear, count }),
    [items, add, addConfigured, remove, setQuantity, clear, count],
  );

  return (
    <CartContext.Provider value={context}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartProvider is missing");
  return context;
}
