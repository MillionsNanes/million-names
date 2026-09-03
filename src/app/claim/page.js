"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Claim() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNumberLoading, setIsNumberLoading] =
    useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [nextNumber, setNextNumber] = useState(null);

  useEffect(() => {
    async function loadNextNumber() {
      setIsNumberLoading(true);

      const { data, error } = await supabase
        .from("supporters")
        .select("supporter_number")
        .order("supporter_number", {
          ascending: false,
        })
        .limit(1);

      if (error) {
        console.error(
          "Could not load next number:",
          error
        );

        setErrorMessage(
          "The next supporter number could not be loaded."
        );

        setNextNumber(null);
      } else {
        const next =
          data && data.length > 0
            ? Number(data[0].supporter_number) + 1
            : 1;

        setNextNumber(next);
      }

      setIsNumberLoading(false);
    }

    loadNextNumber();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedName = displayName.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (cleanedName.length < 2) {
      setErrorMessage(
        "Please enter a display name."
      );
      return;
    }

    if (cleanedName.length > 30) {
      setErrorMessage(
        "Your display name must be 30 characters or fewer."
      );
      return;
    }

    if (!cleanedEmail) {
      setErrorMessage(
        "Please enter your email address."
      );
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanedEmail)) {
      setErrorMessage(
        "Please enter a valid email address."
      );
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName: cleanedName,
            email: cleanedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "The payment page could not be opened."
        );
      }

      if (!data.url) {
        throw new Error(
          "No checkout address was returned."
        );
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.message ||
          "Something went wrong. Please try again."
      );

      setIsLoading(false);
    }
  }

  const formattedNextNumber = nextNumber
    ? `#${String(nextNumber).padStart(6, "0")}`
    : "#------";

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-250px] left-[-200px] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />

        <div className="absolute top-[-250px] right-[-200px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />

        <div className="absolute bottom-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* PAGE CONTENT */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-xl">
          {/* BACK BUTTON */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-white transition mb-8"
          >
            ← Back to home
          </Link>

          {/* HEADING */}
          <div className="text-center mb-10">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em]">
              Step 1 of 2
            </p>

            <h1 className="text-5xl md:text-6xl font-black mt-3">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                CLAIM YOUR
              </span>

              <br />

              <span>PLACE</span>
            </h1>

            <p className="text-gray-400 mt-6">
              What should the wall call you?
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-zinc-900/70 backdrop-blur-xl p-6 sm:p-8"
          >
            {/* DISPLAY NAME */}
            <label
              htmlFor="displayName"
              className="block text-sm font-semibold text-gray-300 mb-3"
            >
              Display name
            </label>

            <input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Enter your display name"
              value={displayName}
              maxLength={30}
              required
              autoComplete="name"
              onChange={(event) => {
                setDisplayName(event.target.value);
                setErrorMessage("");
              }}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 outline-none focus:border-cyan-400/50 transition"
            />

            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>This name will be public</span>

              <span>
                {displayName.length}/30
              </span>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="mt-6">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-300 mb-3"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                required
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrorMessage("");
                }}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 outline-none focus:border-cyan-400/50 transition"
              />

              <p className="mt-2 text-xs text-gray-600">
                Your email will not appear publicly
                on the wall.
              </p>
            </div>

            {/* NAME PREVIEW */}
            <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
                  Preview
                </p>

                <span className="text-xs text-gray-500">
                  Your place
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <p className="font-mono text-cyan-400">
                    {isNumberLoading
                      ? "#------"
                      : formattedNextNumber}
                  </p>

                  {isNumberLoading && (
                    <span className="w-4 h-4 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                  )}
                </div>

                <p className="text-2xl font-black mt-2 break-words">
                  {displayName.trim() ||
                    "Your Name"}
                </p>

                <p className="text-xs text-gray-500 uppercase tracking-wider mt-2">
                  Awaiting payment
                </p>
              </div>
            </div>

            {/* CONTRIBUTION INFORMATION */}
            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-gray-400">
                  Minimum contribution
                </span>

                <span className="font-bold">
                  £1
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                Contributing more does not provide
                a different position, ranking or
                status.
              </p>
            </div>

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
              >
                {errorMessage}
              </div>
            )}

            {/* PAYMENT BUTTON */}
            <button
              type="submit"
              disabled={
                isLoading ||
                isNumberLoading ||
                !nextNumber ||
                displayName.trim().length < 2 ||
                email.trim().length === 0
              }
              className="w-full mt-8 bg-cyan-400 text-black font-black py-4 rounded-2xl hover:bg-cyan-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Opening secure payment..."
                : "Continue To Payment →"}
            </button>

            <p className="text-xs text-center text-gray-600 mt-4">
              Your final number will be securely
              assigned after payment is confirmed.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}