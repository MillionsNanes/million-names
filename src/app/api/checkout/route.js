import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { isPaintStyle, isPaintColour } from "../../../lib/graffiti";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid form." }, { status: 400 });
  }

  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const paintStyle = body?.paintStyle === undefined ? "brush" : body.paintStyle;
  const paintColour = body?.paintColour === undefined ? "cyan" : body.paintColour;
  if (!isPaintStyle(paintStyle) || !isPaintColour(paintColour)) {
    return NextResponse.json({ error: "Please choose one of the available lettering styles and paint colours." }, { status: 400 });
  }

  const amountText = body?.amount === undefined ? "1" : typeof body.amount === "string" ? body.amount.trim() : "";
  const amountParts = amountText.split(".");
  const amountPence = Number(amountParts[0]) * 100 + Number((amountParts[1] || "").padEnd(2, "0"));

  if (displayName.length < 2 || displayName.length > 30) {
    return NextResponse.json({ error: "Your display name must contain 2–30 characters." }, { status: 400 });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!/^\d{1,4}(?:\.\d{1,2})?$/.test(amountText) || !Number.isSafeInteger(amountPence) || amountPence < 100 || amountPence > 100000) {
    return NextResponse.json({ error: "Enter a contribution between £1 and £1,000, with up to two decimal places." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey || !stripeKey) {
    return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  let stripe;
  let session;
  try {
    const siteUrl = new URL(process.env.SITE_URL || "https://www.millionnames.uk");
    const local = ["localhost", "127.0.0.1"].includes(siteUrl.hostname);
    if (siteUrl.protocol !== "https:" && !(local && siteUrl.protocol === "http:")) throw new Error("Invalid SITE_URL");
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    stripe = new Stripe(stripeKey, { timeout: 10000, maxNetworkRetries: 1 });

    const { data: highest, error: countError } = await db.from("supporters")
      .select("supporter_number").not("supporter_number", "is", null)
      .order("supporter_number", { ascending: false }).limit(1).maybeSingle();
    if (countError) throw countError;
    if (Number(highest?.supporter_number || 0) >= 1000000) {
      return NextResponse.json({ error: "The wall is full. All places have been claimed." }, { status: 409 });
    }
    const { data: supporter, error: insertError } = await db.from("supporters")
      .insert({ display_name: displayName, email, amount: amountPence / 100, paid: false, supporter_number: null, paint_style: paintStyle, paint_colour: paintColour })
      .select("id").single();
    if (insertError) throw insertError;
    const supporterId = String(supporter.id);

    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: supporterId,
      metadata: { integration: "million_names_v2", supporter_id: supporterId },
      line_items: [{
        price_data: { currency: "gbp", unit_amount: amountPence,
          product_data: { name: "Million Names — One Place", description: "One name. One supporter number. Everyone equal." } },
        quantity: 1,
      }],
      success_url: `${siteUrl.origin}/place?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl.origin}/claim?checkout=cancelled`,
    }, { idempotencyKey: `million-names-checkout-${supporterId}` });

    if (!session.url) throw new Error("Missing checkout URL");
    const { error: linkError } = await db.from("supporters")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", supporter.id).is("stripe_checkout_session_id", null).select("id").single();
    if (linkError) throw linkError;
    return NextResponse.json({ url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Checkout failed:", error?.code || error?.type || "checkout_error");
    if (stripe && session?.id) {
      try { await stripe.checkout.sessions.expire(session.id); }
      catch { console.error("Unlinked checkout could not be expired."); }
    }
    return NextResponse.json({ error: "The payment page could not be opened. Please try again." }, { status: 500 });
  }
}
