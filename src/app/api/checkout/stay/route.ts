import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { StayCheckoutSchema } from "@/lib/validation/stay-booking";
import { computeStayPrice, StayPricingError } from "@/lib/booking/stay";
import { stayPriceId, getStayStripeProduct } from "@/content/stay-pricing";
import { getStayUnitInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability } from "@/lib/admin/availability";
import { getCheckoutOrigin } from "@/lib/utils/origin";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { formatDateShort } from "@/lib/utils/date-format";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const captcha = await verifyTurnstile(
      typeof body?.cf_turnstile_token === "string"
        ? body.cf_turnstile_token
        : null,
      request,
    );
    if (captcha) return captcha;

    const parsed = StayCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid stay request", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Server-side price: the client NEVER sends an amount.
    let quote;
    try {
      quote = computeStayPrice(
        data.check_in,
        data.check_out,
        data.unit,
        data.plan,
      );
    } catch (err) {
      if (err instanceof StayPricingError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    const inventoryKey = getStayUnitInventoryKey(data.unit);
    const check = await checkRangeAvailability(
      inventoryKey,
      data.check_in,
      data.check_out,
    );
    if (!check.ok) {
      return NextResponse.json(
        {
          error: `Sold out on ${check.conflictDate}. Please choose different dates.`,
        },
        { status: 409 },
      );
    }

    const stayProduct = getStayStripeProduct();
    if (!stayProduct) {
      return NextResponse.json(
        { error: "Stay product not configured. Run npm run stripe:seed." },
        { status: 500 },
      );
    }

    const supabase = createAdminClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        type: data.plan === "fighter" ? "fighter" : "camp-stay",
        status: "pending",
        price_id: stayPriceId(data.unit, data.plan),
        price_amount: quote.total,
        num_participants: 1,
        start_date: data.check_in,
        end_date: data.check_out,
        time_slot: null,
        camp: data.plan === "fighter" ? "plai-laem" : "both",
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_nationality: data.client_nationality ?? null,
        notes: data.notes ?? null,
      })
      .select("id")
      .single();

    if (error || !booking) {
      console.error("Stay booking insert error:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }

    const origin = getCheckoutOrigin(request);
    const stripe = getStripe();
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "thb",
              unit_amount: quote.total * 100, // satang
              product: stayProduct,
            },
            quantity: 1,
          },
        ],
        metadata: { booking_id: booking.id },
        customer_email: data.client_email,
        success_url: `${origin}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/booking?cancelled=1`,
        payment_intent_data: {
          description: `${quote.label} · ${quote.nights} nights · ${formatDateShort(new Date(`${data.check_in}T00:00:00`))} to ${formatDateShort(new Date(`${data.check_out}T00:00:00`))}`,
        },
      });
    } catch (stripeErr) {
      console.error("Stripe stay session failed:", stripeErr);
      await supabase.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "Payment provider error. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stay checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
