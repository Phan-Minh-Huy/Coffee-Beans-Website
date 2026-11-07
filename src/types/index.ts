import type { DrinkOptions } from "@/lib/customizations";
export type ProductCategory = "coffee" | "cold" | "matcha" | "tea" | "bakery";
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  image_url: string;
  base_price_cents: number;
  size_prices: Record<string, number>;
  featured: boolean;
  is_available: boolean;
};

export type SelectedCup = {
  size: string;
  quantity: number;
  customizations: DrinkOptions;
};

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
  customizations?: DrinkOptions;
};

export type OrderState =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
