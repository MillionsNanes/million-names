import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { displayName } = body;

    const { data: supporters } = await supabase
      .from("supporters")
      .select("supporter_number")
      .order("supporter_number", { ascending: false })
      .limit(1);

    const nextNumber =
      supporters && supporters.length > 0
        ? supporters[0].supporter_number + 1
        : 1;

    const { error } = await supabase
      .from("supporters")
      .insert([
       {
  display_name: displayName,
  supporter_number: nextNumber,
  amount: 1,
  paid: false,
}
      ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      url: "https://buy.stripe.com/dRm5kx7t63rQaSZ2A3eME00",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}