import type { ProductCategory } from "@/types";

// Prices are stored in USD cents.
export const ADDON_PRICES_CENTS = {
  vanillaPump: 25,
  extraEspressoShot: 100,
} as const;

export type DrinkOptions = {
  vanillaPumps: number;
  extraShots: number;
  espresso: "signature" | "decaf" | "none";
  ice: "regular" | "light" | "none" | "not_applicable";
};

export function defaultDrinkOptions(category: ProductCategory): DrinkOptions {
  return {
    vanillaPumps: 0,
    extraShots: 0,
    espresso:
      category === "coffee" || category === "cold" ? "signature" : "none",
    ice: category === "cold" ? "regular" : "not_applicable",
  };
}

export function optionsAllowed(
  category: ProductCategory,
  options: DrinkOptions,
): boolean {
  const espressoDrink = category === "coffee" || category === "cold";

  const coldDrink = category === "cold";

  return (
    Number.isInteger(options.vanillaPumps) &&
    options.vanillaPumps >= 0 &&
    options.vanillaPumps <= 6 &&
    Number.isInteger(options.extraShots) &&
    options.extraShots >= 0 &&
    options.extraShots <= 4 &&
    (espressoDrink
      ? ["signature", "decaf"].includes(options.espresso)
      : options.espresso === "none") &&
    (coldDrink
      ? ["regular", "light", "none"].includes(options.ice)
      : options.ice === "not_applicable") &&
    (espressoDrink || options.extraShots === 0)
  );
}

export function optionsPriceCents(options: DrinkOptions): number {
  return (
    options.vanillaPumps * ADDON_PRICES_CENTS.vanillaPump +
    options.extraShots * ADDON_PRICES_CENTS.extraEspressoShot
  );
}

export function optionsLabel(options: DrinkOptions): string {
  const details: string[] = [];

  if (options.vanillaPumps) {
    details.push(`Vanilla ×${options.vanillaPumps}`);
  }

  if (options.extraShots) {
    details.push(`Extra shot ×${options.extraShots}`);
  }

  if (options.espresso === "decaf") {
    details.push("Decaf");
  }

  if (options.ice === "light") {
    details.push("Light ice");
  }

  if (options.ice === "none") {
    details.push("No ice");
  }

  return details.length ? details.join(" · ") : "Classic recipe";
}

export function cartVariantKey(
  productId: string,
  size: string,
  options: DrinkOptions,
): string {
  return `${productId}::${encodeURIComponent(size)}::${
    options.vanillaPumps
  }:${options.extraShots}:${options.espresso}:${options.ice}`;
}
