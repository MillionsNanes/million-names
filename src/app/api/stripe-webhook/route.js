import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("Stripe webhook received");

  return NextResponse.json({
    received: true,
  });
}