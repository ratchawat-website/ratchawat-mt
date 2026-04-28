/**
 * Stripe seed script
 *
 * Creates Stripe Products + Prices for every PriceItem in pricing.ts
 * (excluding bodyweight items, which are in-person only).
 *
 * Detects the Stripe mode from STRIPE_SECRET_KEY prefix (sk_test_ vs sk_live_)
 * and writes IDs to the matching field set:
 *   - sk_test_  -> stripeProductIdTest / stripePriceIdTest
 *   - sk_live_  -> stripeProductIdLive / stripePriceIdLive
 *
 * Idempotent: skips entries that already have IDs for the current mode.
 *
 * Usage:
 *   npm run stripe:seed
 *
 * Required env (in .env.local):
 *   STRIPE_SECRET_KEY (sk_test_... for test, sk_live_... for live)
 */

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

import { PRICES } from "../src/content/pricing";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error(
    "ERROR: STRIPE_SECRET_KEY is not set. Add it to .env.local before running.",
  );
  process.exit(1);
}

const isLive = secretKey.startsWith("sk_live_");
const mode = isLive ? "LIVE" : "TEST";
const productField = isLive ? "stripeProductIdLive" : "stripeProductIdTest";
const priceField = isLive ? "stripePriceIdLive" : "stripePriceIdTest";

const stripe = new Stripe(secretKey);

const PRICING_FILE = path.resolve(process.cwd(), "src/content/pricing.ts");

async function main() {
  console.log(`Stripe mode detected: ${mode}`);
  console.log(`Writing to fields: ${productField} / ${priceField}\n`);

  const toSeed = PRICES.filter(
    (p) =>
      p.price !== null &&
      !p[productField as keyof typeof p] &&
      !p.id.startsWith("bodyweight-"),
  );

  if (toSeed.length === 0) {
    console.log(`Nothing to seed. All products already have ${mode} Stripe IDs.`);
    return;
  }

  console.log(`Seeding ${toSeed.length} Stripe products in ${mode} mode...`);

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

    // Inject the new fields right after the id: line, preserving any existing
    // sibling fields (e.g. test IDs when seeding live).
    const idPattern = new RegExp(
      `(\\s{4}id:\\s*"${item.id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}",)`,
    );

    fileContent = fileContent.replace(
      idPattern,
      `$1\n    ${productField}: "${product.id}",\n    ${priceField}: "${price.id}",`,
    );
  }

  fs.writeFileSync(PRICING_FILE, fileContent, "utf8");
  console.log(
    `\nDone. Updated src/content/pricing.ts with ${mode} Stripe IDs.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
