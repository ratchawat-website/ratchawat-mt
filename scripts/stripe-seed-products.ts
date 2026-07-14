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
      !p.archived &&
      !p[productField as keyof typeof p] &&
      !p.id.startsWith("bodyweight-"),
  );

  if (toSeed.length === 0) {
    console.log(`Nothing to seed. All products already have ${mode} Stripe IDs.`);
  } else {
    console.log(`Seeding ${toSeed.length} Stripe products in ${mode} mode...`);
  }

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

  // Sync pass: items already seeded whose catalog price no longer matches
  // the active Stripe price. Creates a new Price on the same Product,
  // makes it the default, refreshes name/description, and rewrites the
  // price ID in pricing.ts.
  const seeded = PRICES.filter(
    (p) =>
      p.price !== null &&
      !p.archived &&
      p[priceField as keyof typeof p] &&
      !p.id.startsWith("bodyweight-"),
  );

  for (const item of seeded) {
    const currentPriceId = item[priceField as keyof typeof item] as string;
    const current = await stripe.prices.retrieve(currentPriceId);
    const expected = item.price! * 100;
    if (current.unit_amount === expected) continue;

    console.log(
      `  ~ ${item.id}: ${current.unit_amount} -> ${expected} satang (new price)`,
    );

    const productId =
      typeof current.product === "string" ? current.product : current.product.id;

    const description = [item.description, item.notes]
      .filter(Boolean)
      .join(" - ");

    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: expected,
      currency: "thb",
    });
    await stripe.products.update(productId, {
      name: item.name,
      description,
      default_price: newPrice.id,
    });
    // Deliberately NOT deactivating the old price here: in LIVE mode the
    // currently deployed code still references it until the new deploy is
    // out. Deactivating it during that window would break live checkouts.
    // Old prices are archived AFTER the deploy (see handoff checklist).
    console.log(`    old price kept active for zero-downtime cutover: ${currentPriceId}`);

    fileContent = fileContent.replace(currentPriceId, newPrice.id);
  }

  fs.writeFileSync(PRICING_FILE, fileContent, "utf8");
  console.log(
    `\nDone. Updated src/content/pricing.ts with ${mode} Stripe IDs.`,
  );

  // Permanent "Accommodation Stay" product: stay checkouts attach a computed
  // price_data amount to it (tiered pricing, no pre-created Price).
  const STAY_FILE = path.resolve(process.cwd(), "src/content/stay-pricing.ts");
  const stayField = isLive ? "STAY_STRIPE_PRODUCT_LIVE" : "STAY_STRIPE_PRODUCT_TEST";
  let stayContent = fs.readFileSync(STAY_FILE, "utf8");
  const stayFieldRegex = new RegExp(`export const ${stayField} = "([^"]*)";`);
  const currentStayId = stayContent.match(stayFieldRegex)?.[1] ?? "";

  if (!currentStayId) {
    const stayProduct = await stripe.products.create({
      name: "Accommodation Stay",
      description:
        "Room or bungalow stay at Plai Laem camp, training included. Amount computed from the tiered rate card at checkout.",
      metadata: { price_id: "stay-dynamic", category: "camp-stay", booking_type: "camp-stay" },
    });
    stayContent = stayContent.replace(
      stayFieldRegex,
      `export const ${stayField} = "${stayProduct.id}";`,
    );
    fs.writeFileSync(STAY_FILE, stayContent);
    console.log(`  + Accommodation Stay product: ${stayProduct.id} (${mode})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
