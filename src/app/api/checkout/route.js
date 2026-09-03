import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error:
            "The Supabase environment variables are missing.",
        },
        {
          status: 500,
        }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    const body = await request.json();

    const displayName =
      typeof body.displayName === "string"
        ? body.displayName.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (
      displayName.length < 2 ||
      displayName.length > 30
    ) {
      return NextResponse.json(
        {
          error:
            "The display name must contain between 2 and 30 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    const { data: supporters, error: numberError } =
      await supabase
        .from("supporters")
        .select("supporter_number")
        .order("supporter_number", {
          ascending: false,
        })
        .limit(1);

    if (numberError) {
      console.error(
        "Number lookup failed:",
        numberError
      );

      return NextResponse.json(
        {
          error:
            "The next supporter number could not be calculated.",
        },
        {
          status: 500,
        }
      );
    }

    const nextNumber =
      supporters && supporters.length > 0
        ? Number(supporters[0].supporter_number) + 1
        : 1;

    const { error: insertError } = await supabase
      .from("supporters")
      .insert({
        display_name: displayName,
        email,
        supporter_number: nextNumber,
        amount: 1,
        paid: false,
      });

    if (insertError) {
      console.error(
        "Supporter insert failed:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "The supporter details could not be saved.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      supporterNumber: nextNumber,
      url: "https://buy.stripe.com/dRm5kx7t63rQaSZ2A3eME00",
    });
  } catch (error) {
    console.error("Checkout route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      {
        status: 500,
      }
    );
  }
}