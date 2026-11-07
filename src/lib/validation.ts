import { z } from "zod";

const drinkOptionsSchema = z
  .object({
    vanillaPumps: z.number().int().min(0).max(6),
    extraShots: z.number().int().min(0).max(4),
    espresso: z.enum(["signature", "decaf", "none"]),
    ice: z.enum(["regular", "light", "none", "not_applicable"]),
  })
  .strict();

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        size: z.string().min(1).max(35),
        quantity: z.number().int().min(1).max(20),
        customizations: drinkOptionsSchema.optional(),
      }),
    )
    .min(1)
    .max(30),

  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.email().max(200),
  customerPhone: z.string().trim().min(7).max(35),
  pickupDate: z.iso.date(),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  notes: z.string().max(400).optional().default(""),
  website: z.string().max(100).optional().default(""), // honeypot
});
export function validatePickup(date: string, time: string, timezone: string) {
  const now = new Date(Date.now() + 30 * 60_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (part: string) => parts.find((x) => x.type === part)?.value || "";
  const start = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
  const requested = `${date}T${time}`;
  const day = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(day.valueOf()) || day.toISOString().slice(0, 10) !== date)
    return false;
  const daysAhead =
    (Date.parse(`${date}T00:00:00Z`) -
      Date.parse(`${get("year")}-${get("month")}-${get("day")}T00:00:00Z`)) /
    86_400_000;
  if (daysAhead < 0 || daysAhead > 14 || requested < start) return false;
  const dayOfWeek = day.getUTCDay();
  const opening = dayOfWeek === 0 || dayOfWeek === 6 ? "08:00" : "07:00";
  return time >= opening && time <= "17:30";
}
