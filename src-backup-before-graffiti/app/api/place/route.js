import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const sessionId = params.get("session_id");
  const number = params.get("number");

  if (
    (!!sessionId === !!number) ||
    (sessionId && !/^cs_(test|live)_[A-Za-z0-9]{1,240}$/.test(sessionId)) ||
    (number && (!/^\d{1,7}$/.test(number) || Number(number) < 1 || Number(number) > 1000000))
  ) {
    return reply({ error: "This place link is invalid." }, 400);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || (sessionId && !process.env.STRIPE_SECRET_KEY)) {
    return reply({ error: "We cannot load this place right now. Please try again." }, 503);
  }

  try {
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let query = db.from("supporters").select("display_name, supporter_number, paid");

    if (sessionId) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        timeout: 8000,
        maxNetworkRetries: 0,
      });
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const supporterId = session.metadata?.supporter_id;

      if (
        session.metadata?.integration !== "million_names_v2" ||
        !/^[1-9]\d*$/.test(supporterId || "") ||
        session.client_reference_id !== supporterId ||
        session.mode !== "payment"
      ) {
        return reply({ error: "This checkout is not linked to a place. Please check your confirmation link." }, 404);
      }

      if (session.payment_status !== "paid") {
        return reply({
          status: session.status === "complete" ? "pending_payment" : "unpaid",
        });
      }

      query = query.eq("id", supporterId).eq("stripe_checkout_session_id", sessionId);
    } else {
      query = query.eq("supporter_number", Number(number)).eq("paid", true);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;

    const finalNumber = Number(data?.supporter_number);
    if (
      !data || data.paid !== true ||
      !Number.isSafeInteger(finalNumber) || finalNumber < 1 || finalNumber > 1000000
    ) {
      return sessionId
        ? reply({ status: "processing" })
        : reply({ error: "This place is not on the wall yet." }, 404);
    }

    // Return public information only. Never return email or the full Stripe session.
    return reply({
      status: "ready",
      supporter: { displayName: data.display_name, number: finalNumber },
    });
  } catch (error) {
    if (error?.code === "resource_missing") {
      return reply({ error: "This checkout could not be found." }, 404);
    }
    console.error("Place lookup failed:", error?.code || error?.type || "lookup_error");
    return reply({ error: "We could not check your place. Please try again." }, 503);
  }
}
