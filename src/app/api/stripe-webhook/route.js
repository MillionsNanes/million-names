import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();

  const signature = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error);

    return NextResponse.json(
      {
        error: "Invalid signature",
      },
      {
        status: 400,
      }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customerEmail =
      session.customer_details?.email?.trim().toLowerCase();

    console.log("Payment received from:", customerEmail);

    if (customerEmail) {
      const { data, error } = await supabase
        .from("supporters")
        .update({
          paid: true,
        })
        .eq("email", customerEmail)
        .select();

      console.log("Updated rows:", data);

      if (error) {
        console.error("Supabase update error:", error);
      } else {
        console.log(
          "Supporter marked as paid:",
          customerEmail
        );
      }
    }
  }

  return NextResponse.json({
    received: true,
  });
}