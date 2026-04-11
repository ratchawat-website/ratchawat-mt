/**
 * Stripe seed script
 *
 * Creates Stripe Products + Prices for every PriceItem in pricing.ts
 * (excluding bodyweight items, which are in-person only).
 *
 * Writes generated stripeProductId and stripePriceId back into
 * src/content/pricing.ts via in-place regex replacement.
 *
 * Idempotent: re-running skips entries that already have stripeProductId.
 *
 * Usage:
 *   npm run stripe:seed
 *
 * Required env (in .env.local):
 *   STRIPE_SECRET_KEY (test mode key: sk_test_...)
 */

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

import { PRICES } from "../src/content/pricing";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error(
    "ERROR: STRIPE_SECRET_KEY is not set. Add it to .env.local before running.",
  );
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICING_FILE = path.resolve(process.cwd(), "src/content/pricing.ts");

async function main() {
  const toSeed = PRICES.filter(
    (p) =>
      p.price !== null &&
      !p.stripeProductId &&
      !p.id.startsWith("bodyweight-"),
  );

  if (toSeed.length === 0) {
    console.log("Nothing to seed. All products already have Stripe IDs.");
    return;
  }

  console.log(`Seeding ${toSeed.length} Stripe products...`);

  let fileContent = fs.readFileSync(PRICING_FILE, "utf8");

  for (const item of toSeed) {
    console.log(`  -> ${item.id} (${item.price} THB)`);

    const description = [
      item.description,
      item.notes,
      item.priceTodo ? `NOTE: ${item.priceTodo}` : null,
    ]
      .filter(Boolean)
      .join(" - ");

    const product = await stripe.products.create({
      name: item.name,
      description,
      metadata: {
        price_id: item.id,
        category: item.category,
        booking_type: item.bookingType,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: item.price! * 100, // THB in smallest unit (satang)
      currency: "thb",
    });

    // Inject stripeProductId + stripePriceId right after the id: line
    // The PriceItem object starts at indent 2 inside the PRICES array.
    const idPattern = new RegExp(
      `(\\s{4}id:\\s*"${item.id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}",)`,
    );

    fileContent = fileContent.replace(
      idPattern,
      `$1\n    stripeProductId: "${product.id}",\n    stripePriceId: "${price.id}",`,
    );
  }

  fs.writeFileSync(PRICING_FILE, fileContent, "utf8");
  console.log("Done. Updated src/content/pricing.ts with Stripe IDs.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
