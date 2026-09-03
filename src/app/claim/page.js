"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Claim() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [nextNumber, setNextNumber] = useState(null);
  const [isNumberLoading, setIsNumberLoading] =
    useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadNextNumber() {
      setIsNumberLoading(true);

      try {
        const { data, error } = await supabase
          .from("supporters")
          .select("supporter_number")
          .order("supporter_number", {
            ascending: false,
          })
          .limit(1);

        if (error) {
          throw error;
        }

        const next =
          data && data.length > 0
            ? Number(data[0].supporter_number) + 1
            : 1;

        setNextNumber(next);
      } catch (error) {
        console.error(
          "Could not load next supporter number:",
          error
        );

        setErrorMessage(
          "The next supporter number could not be loaded."
        );

        setNextNumber(null);
      } finally {
        setIsNumberLoading(false);
      }
    }

    loadNextNumber();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedName = displayName.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (cleanedName.length < 2) {
      setErrorMessage(
        "Your display name must contain at least 2 characters."
      );
      return;
    }

    if (cleanedName.length > 30) {
      setErrorMessage(
        "Your display name must be 30 characters or fewer."
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
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: cleanedName,
          email: cleanedEmail,
        }),
      });

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
      console.error("Checkout error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setIsLoading(false);
    }
  }

  const formattedNextNumber = nextNumber
    ? `#${String(nextNumber).padStart(6, "0")}`
    : "#------";

  const formIsValid =
    displayName.trim().length >= 2 &&
    displayName.trim().length <= 30 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* BACKGROUND EFFECTS */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-250px] left-[-200px] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute top-[-250px] right-[-200px] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="absolute bottom-[-300px] left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[150px]" />

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
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 py-12">
        <div className="w-full max-w-xl">
          {/* BACK LINK */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center text-sm text-gray-500 transition hover:text-white"
          >
            ← Back to home
          </Link>

          {/* HEADING */}
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Step 1 of 2
            </p>

            <h1 className="mt-3 text-5xl font-black md:text-6xl">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                CLAIM YOUR
              </span>

              <br />

              <span>PLACE</span>
            </h1>

            <p className="mt-6 text-gray-400">
              Choose the name that will appear on the wall.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-6 backdrop-blur-xl sm:p-8"
          >
            {/* DISPLAY NAME */}
            <div>
              <label
                htmlFor="displayName"
                className="mb-3 block text-sm font-semibold text-gray-300"
              >
                Display name
              </label>

              <input
                id="displayName"
                name="displayName"
                type="text"
                value={displayName}
                placeholder="Enter your display name"
                minLength={2}
                maxLength={30}
                required
                autoComplete="name"
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setErrorMessage("");
                }}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-600">
                <span>This name will be public</span>

                <span>{displayName.length}/30</span>
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="mt-6">
              <label
                htmlFor="email"
                className="mb-3 block text-sm font-semibold text-gray-300"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                placeholder="Enter your email address"
                required
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrorMessage("");
                }}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
              />

              <p className="mt-2 text-xs text-gray-600">
                Your email address will not appear publicly.
              </p>
            </div>

            {/* PREVIEW */}
            <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
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
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400"
                      aria-label="Loading supporter number"
                    />
                  )}
                </div>

                <p className="mt-2 break-words text-2xl font-black">
                  {displayName.trim() || "Your Name"}
                </p>

                <p className="mt-2 text-xs uppercase tracking-wider text-gray-500">
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

                <span className="font-bold">£1</span>
              </div>

              <p className="mt-2 text-xs text-gray-600">
                Contributing more does not provide a
                different position, ranking or status.
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

            {/* CONTINUE BUTTON */}
            <button
              type="submit"
              disabled={
                isLoading ||
                isNumberLoading ||
                !nextNumber ||
                !formIsValid
              }
              className="mt-8 w-full rounded-2xl bg-cyan-400 py-4 font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading
                ? "Opening secure payment..."
                : "Continue To Payment →"}
            </button>

            <p className="mt-4 text-center text-xs text-gray-600">
              Your final supporter number will be assigned
              after payment is confirmed.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}