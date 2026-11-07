"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Coffee,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { formatMoney } from "@/lib/money";
import {
  ADDON_PRICES_CENTS,
  cartVariantKey,
  defaultDrinkOptions,
  optionsPriceCents,
  type DrinkOptions,
} from "@/lib/customizations";
import { useCart } from "@/components/cart-provider";
import type { Product, SelectedCup } from "@/types";

type CupDraft = SelectedCup & { id: number };

function cupName(size: string) {
  return size === "One" ? "One serving" : size;
}

function Counter({
  label,
  value,
  max,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="drink-counter" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={16} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export function DrinkConfigurator({
  product,
  preferredSize,
}: {
  product: Product;
  preferredSize?: string;
}) {
  const router = useRouter();
  const { addConfigured, items } = useCart();
  const [error, setError] = useState("");
  const sizes = Object.keys(product.size_prices);
  const firstSize =
    preferredSize && sizes.includes(preferredSize) ? preferredSize : sizes[0];
  const [cups, setCups] = useState<CupDraft[]>(() => [
    {
      id: 1,
      size: firstSize ?? "",
      quantity: 1,
      customizations: defaultDrinkOptions(product.category),
    },
  ]);
  const [nextId, setNextId] = useState(2);
  const canCustomizeEspresso = ["coffee", "cold"].includes(product.category);
  const canCustomizeIce = product.category === "cold";
  const lineTotal = (cup: CupDraft) =>
    (product.size_prices[cup.size] + optionsPriceCents(cup.customizations)) *
    cup.quantity;
  const total = useMemo(
    () => cups.reduce((sum, cup) => sum + lineTotal(cup), 0),
    [cups, product],
  );
  const totalCount = cups.reduce((sum, cup) => sum + cup.quantity, 0);

  function modify(id: number, changes: Partial<CupDraft>) {
    setCups((current) =>
      current.map((cup) => (cup.id === id ? { ...cup, ...changes } : cup)),
    );
  }
  function modifyOptions(id: number, changes: Partial<DrinkOptions>) {
    setCups((current) =>
      current.map((cup) =>
        cup.id === id
          ? {
              ...cup,
              customizations: { ...cup.customizations, ...changes },
            }
          : cup,
      ),
    );
  }
  function addCup() {
    if (cups.length >= 30) return;
    const newSize =
      sizes.find((size) => !cups.some((cup) => cup.size === size)) ?? sizes[0];
    setCups((current) => [
      ...current,
      {
        id: nextId,
        size: newSize,
        quantity: 1,
        customizations: defaultDrinkOptions(product.category),
      },
    ]);
    setNextId((id) => id + 1);
  }
  function addToBag() {
    setError("");
    if (!cups.length || !product.is_available) return;
    const totals = new Map<string, number>(
      items.map((item) => [item.key, item.quantity]),
    );
    for (const cup of cups) {
      const key = cartVariantKey(product.id, cup.size, cup.customizations);
      totals.set(key, (totals.get(key) ?? 0) + cup.quantity);
      if ((totals.get(key) ?? 0) > 20) {
        setError(
          "Maximum 20 of the same customized cup per order. Please reduce the quantity.",
        );
        return;
      }
    }
    if (totals.size > 30) {
      setError("Your bag can contain up to 30 different selections.");
      return;
    }
    addConfigured(
      product,
      cups.map(({ size, quantity, customizations }) => ({
        size,
        quantity,
        customizations,
      })),
    );
    router.push("/cart");
  }

  return (
    <div className="drink-detail-grid">
      <section className="drink-story" aria-label="Selected beverage">
        <div className={`drink-hero-art product-art-${product.category}`}>
          <img src={product.image_url} alt={product.name} />
          <span className="drink-art-caption">
            CRAFTED WITH CARE · BREW & BEAN
          </span>
        </div>
        <div className="drink-story-copy">
          <span className="section-kicker">MAKE IT YOURS</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="drink-story-meta">
            <Coffee size={17} /> Made fresh for your pickup
          </div>
        </div>
      </section>

      <section
        className="drink-configuration"
        aria-label="Customize your order"
      >
        <div className="drink-config-heading">
          <div>
            <span className="section-kicker">YOUR COFFEE, YOUR WAY</span>
            <h2>
              Make every cup <em>yours.</em>
            </h2>
          </div>
          <p>
            Mix sizes and personalize each cup. Add multiple cups to a single
            order.
          </p>
        </div>

        <div className="drink-cup-list">
          {cups.map((cup, index) => (
            <article className="drink-cup" key={cup.id}>
              <div className="drink-cup-head">
                <div>
                  <span className="drink-cup-number">
                    CUP {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{cupName(cup.size)}</h3>
                </div>

                {cups.length > 1 && (
                  <button
                    type="button"
                    className="drink-remove"
                    onClick={() =>
                      setCups((current) =>
                        current.filter((item) => item.id !== cup.id),
                      )
                    }
                    aria-label={`Remove cup ${index + 1}`}
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                )}
              </div>

              <div className="drink-cup-controls">
                <fieldset className="drink-size-fieldset">
                  <legend>Choose size</legend>

                  <div className="drink-size-options">
                    {sizes.map((size) => (
                      <label
                        key={size}
                        className={`drink-size-choice ${
                          cup.size === size ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`cup-size-${cup.id}`}
                          value={size}
                          checked={cup.size === size}
                          onChange={() => modify(cup.id, { size })}
                        />

                        <span className="drink-size-symbol" aria-hidden="true">
                          ◡
                        </span>

                        <span>{size}</span>
                        <strong>
                          {formatMoney(product.size_prices[size])}
                        </strong>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="drink-cup-quantity">
                  <span>Quantity</span>
                  <Counter
                    label={`cup ${index + 1} quantity`}
                    value={cup.quantity}
                    min={1}
                    max={20}
                    onChange={(quantity) => modify(cup.id, { quantity })}
                  />
                </div>
              </div>

              <details className="drink-personalize" open={index === 0}>
                <summary>
                  Customize flavor & extras
                  <span>Optional</span>
                </summary>

                <div className="drink-extras-grid">
                  <div className="drink-extra-option">
                    <div>
                      <strong>Vanilla syrup</strong>
                      <small>
                        +{formatMoney(ADDON_PRICES_CENTS.vanillaPump)} / pump ·
                        up to 6
                      </small>
                    </div>

                    <Counter
                      label={`cup ${index + 1} vanilla pumps`}
                      value={cup.customizations.vanillaPumps}
                      max={6}
                      onChange={(vanillaPumps) =>
                        modifyOptions(cup.id, { vanillaPumps })
                      }
                    />
                  </div>

                  {canCustomizeEspresso && (
                    <div className="drink-extra-option">
                      <div>
                        <strong>Extra espresso shots</strong>
                        <small>
                          +{formatMoney(ADDON_PRICES_CENTS.extraEspressoShot)} /
                          shot · up to 4
                        </small>
                      </div>

                      <Counter
                        label={`cup ${index + 1} extra shots`}
                        value={cup.customizations.extraShots}
                        max={4}
                        onChange={(extraShots) =>
                          modifyOptions(cup.id, { extraShots })
                        }
                      />
                    </div>
                  )}

                  {canCustomizeEspresso && (
                    <label className="drink-select-option">
                      <span>Espresso style</span>
                      <select
                        value={cup.customizations.espresso}
                        onChange={(e) =>
                          modifyOptions(cup.id, {
                            espresso: e.target
                              .value as DrinkOptions["espresso"],
                          })
                        }
                      >
                        <option value="signature">Signature Espresso</option>
                        <option value="decaf">Decaf</option>
                      </select>
                    </label>
                  )}

                  {canCustomizeIce && (
                    <label className="drink-select-option">
                      <span>Ice preference</span>
                      <select
                        value={cup.customizations.ice}
                        onChange={(e) =>
                          modifyOptions(cup.id, {
                            ice: e.target.value as DrinkOptions["ice"],
                          })
                        }
                      >
                        <option value="regular">Regular ice</option>
                        <option value="light">Light ice</option>
                        <option value="none">No ice</option>
                      </select>
                    </label>
                  )}
                </div>
              </details>

              <div className="drink-cup-total">
                <span>Subtotal for this cup selection</span>
                <strong>{formatMoney(lineTotal(cup))}</strong>
              </div>
            </article>
          ))}
        </div>

        <button
          className="drink-add-cup"
          type="button"
          onClick={addCup}
          disabled={!sizes.length || cups.length >= 30}
        >
          <Plus size={19} />
          Add another cup or size
        </button>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="drink-bottom-summary">
          <div>
            <span>
              {totalCount} {totalCount === 1 ? "drink" : "drinks"}
              {" · "}
              {cups.length} {cups.length === 1 ? "selection" : "selections"}
            </span>
            <strong>{formatMoney(total)}</strong>
          </div>

          <button
            type="button"
            className="pill-btn"
            onClick={addToBag}
            disabled={
              !product.is_available || !sizes.length || cups.length === 0
            }
          >
            <ShoppingBag size={18} />
            Add {totalCount} to bag
            <ArrowRight size={17} />
          </button>
        </div>

        <p className="drink-price-footnote">
          Addon fees shown are sample prices; confirm them for your shop before
          accepting real orders.
        </p>
      </section>
    </div>
  );
}
