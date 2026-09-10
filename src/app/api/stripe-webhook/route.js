import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const dbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!stripeKey || !webhookSecret || !dbUrl || !serviceKey) {
    return NextResponse.json({ error: "Webhook temporarily unavailable." }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  const stripe = new Stripe(stripeKey);
  let event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    return NextResponse.json({ received: true });
  }
  const session = event.data.object;
  if (session.metadata?.integration !== "million_names_v2") {
    // Legacy payments require individual reconciliation, never email matching.
    console.warn("Unlinked/legacy checkout needs separate review:", session.id);
    return NextResponse.json({ received: true, ignored: true });
  }
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, awaitingPayment: true });
  }
  const supporterId = session.metadata?.supporter_id;
  if (!/^[1-9]\d*$/.test(supporterId || "") || session.client_reference_id !== supporterId ||
      session.mode !== "payment" || session.currency !== "gbp" ||
      !Number.isSafeInteger(session.amount_total) || session.amount_total < 100 || session.amount_total > 100000) {
    console.error("Checkout payment/reference needs review:", session.id);
    return NextResponse.json({ error: "Payment needs review." }, { status: 500 });
  }
  try {
    const db = createClient(dbUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: number, error } = await db.rpc("confirm_supporter_checkout", {
      p_supporter_id: supporterId, p_session_id: session.id, p_amount_pence: session.amount_total,
    });
    if (error) throw error;
    if (number == null) throw new Error("No confirmed number returned");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Payment confirmation failed:", session.id, error?.code || "confirmation_error");
    return NextResponse.json({ error: "Payment confirmation could not be completed." }, { status: 500 });
  }
}
