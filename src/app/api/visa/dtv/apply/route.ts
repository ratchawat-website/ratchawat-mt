import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { DtvApplicationSchema } from "@/lib/validation/dtv-application";
import { getPriceById, getStripePriceId } from "@/content/pricing";
import { getCheckoutOrigin } from "@/lib/utils/origin";
import { verifyTurnstile } from "@/lib/security/turnstile";

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

    const parsed = DtvApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid application", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const pkg = getPriceById(data.price_id);
    const stripePriceId = pkg ? getStripePriceId(pkg) : undefined;
    if (!pkg || pkg.category !== "dtv" || !stripePriceId || pkg.price === null) {
      return NextResponse.json(
        { error: "Invalid DTV package" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: application, error } = await supabase
      .from("dtv_applications")
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        nationality: data.nationality,
        phone: data.phone,
        email: data.email,
        passport_number: data.passport_number,
        passport_expiry: data.passport_expiry,
        currently_in_thailand: data.currently_in_thailand,
        training_start_date: data.training_start_date,
        arrival_date: data.arrival_date,
        price_id: data.price_id,
        price_amount: pkg.price,
      })
      .select("id")
      .single();

    if (error || !application) {
      console.error("DTV application insert error:", error);
      return NextResponse.json(
        { error: "Failed to save application" },
        { status: 500 },
      );
    }

    const origin = getCheckoutOrigin(request);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      metadata: {
        dtv_application_id: application.id,
        type: "dtv",
      },
      customer_email: data.email,
      success_url: `${origin}/visa/dtv/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/visa/dtv/apply?cancelled=1&package=${data.price_id}`,
    });

    await supabase
      .from("dtv_applications")
      .update({ stripe_session_id: session.id })
      .eq("id", application.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("DTV checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
