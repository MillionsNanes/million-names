"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import GraffitiName from "../../components/GraffitiName";
import PaintPicker from "../../components/PaintPicker";

export default function Claim() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("1");
  const [paintStyle, setPaintStyle] = useState("brush");
  const [paintColour, setPaintColour] = useState("cyan");
  const [nextNumber, setNextNumber] = useState(null);

  const [isNumberLoading, setIsNumberLoading] = useState(true);
  const [numberError, setNumberError] = useState("");
  const [numberRetry, setNumberRetry] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setIsNumberLoading(true);
    setNumberError("");

    // Prevent the number preview from waiting indefinitely.
    const timeoutId = window.setTimeout(() => {
      controller.abort();

      if (active) {
        setNumberError(
          "The supporter number is taking too long to load. Please retry."
        );
        setIsNumberLoading(false);
      }
    }, 8000);

    async function loadNextNumber() {
      try {
        const { data, error } = await supabase
          .from("supporters")
          .select("supporter_number")
          .eq("paid", true)
          .not("supporter_number", "is", null)
          .order("supporter_number", {
            ascending: false,
          })
          .limit(1)
          .abortSignal(controller.signal);

        if (error) {
          throw error;
        }

        const highestNumber =
          data && data.length > 0
            ? Number(data[0].supporter_number)
            : 0;

        if (
          !Number.isSafeInteger(highestNumber) ||
          highestNumber < 0
        ) {
          throw new Error("Invalid supporter number returned.");
        }

        if (active && !controller.signal.aborted) {
          setNextNumber(highestNumber + 1);
        }
      } catch (error) {
        if (!active || controller.signal.aborted) {
          return;
        }

        console.error(
          "Could not load next supporter number:",
          error
        );

        setNextNumber(null);
        setNumberError(
          "The next supporter number could not be loaded. Please retry."
        );
      } finally {
        window.clearTimeout(timeoutId);

        if (active) {
          setIsNumberLoading(false);
        }
      }
    }

    loadNextNumber();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [numberRetry]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const cleanedName = displayName.trim();
    const cleanedEmail = email.trim();

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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!/^\d{1,4}(?:\.\d{1,2})?$/.test(amount.trim()) || Number(amount) < 1 || Number(amount) > 1000) {
      setErrorMessage(
        "Enter a contribution between £1 and £1,000, with up to two decimal places."
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
          amount: amount.trim(),
          paintStyle,
          paintColour,
        }),
      });

      // Handle missing API routes and non-JSON error pages.
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Checkout could not be opened. Please try again."
        );
      }

      if (typeof data?.url !== "string" || !data.url.trim()) {
        throw new Error(
          "The checkout API did not return a payment address."
        );
      }

      const checkoutUrl = new URL(
        data.url,
        window.location.origin
      );

      if (
        checkoutUrl.protocol !== "https:" &&
        checkoutUrl.origin !== window.location.origin
      ) {
        throw new Error(
          "The checkout API returned an invalid payment address."
        );
      }

      window.location.assign(checkoutUrl.href);
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

  const formattedNextNumber =
    nextNumber !== null
      ? `#${String(nextNumber).padStart(6, "0")}`
      : "#------";

  const formIsValid =
    displayName.trim().length >= 2 &&
    displayName.trim().length <= 30 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const inputClasses =
    "w-full rounded-xl border border-white/15 bg-black/60 px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-60";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      {/* LIGHTWEIGHT BACKGROUND: NO LARGE BLUR FILTERS */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(6,182,212,0.12), transparent 55%), radial-gradient(ellipse at top right, rgba(147,51,234,0.12), transparent 55%)",
        }}
      />

      {/* PAGE CONTENT */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center py-2 text-sm text-gray-300 transition-colors hover:text-white"
          >
            ← Back to home
          </Link>

          {/* HEADING */}
          <div className="mb-8 text-center sm:mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Step 1 of 2
            </p>

            <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight md:text-6xl">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                CLAIM YOUR
              </span>

              <br />

              <span>PLACE</span>
            </h1>

            <p className="mt-5 text-base text-gray-300">
              Your name. Your lettering. Your mark on the wall.
            </p>
          </div>

          {/* SOLID PANEL: NO BACKDROP BLUR */}
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-8"
          >
            {/* DISPLAY NAME */}
            <div>
              <label
                htmlFor="displayName"
                className="mb-3 block text-sm font-semibold text-gray-200"
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
                disabled={isLoading}
                autoComplete="nickname"
                aria-describedby="displayNameHelp"
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setErrorMessage("");
                }}
                className={inputClasses}
              />

              <div
                id="displayNameHelp"
                className="mt-2 flex justify-between gap-3 text-sm text-gray-400"
              >
                <span>This name will be public</span>
                <span>{displayName.length}/30</span>
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="mt-6">
              <label
                htmlFor="email"
                className="mb-3 block text-sm font-semibold text-gray-200"
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
                disabled={isLoading}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrorMessage("");
                }}
                className={inputClasses}
              />
            </div>

            <PaintPicker
              paintStyle={paintStyle}
              paintColour={paintColour}
              onStyleChange={setPaintStyle}
              onColourChange={setPaintColour}
              disabled={isLoading}
            />

            <div className="paint-preview brick-surface mt-8" aria-label="Your name preview">
              <div className="paint-preview-header">
                <span>YOUR WALL PREVIEW</span>
                <span>Estimated next number</span>
              </div>
              <GraffitiName
                name={displayName}
                number={nextNumber}
                paintStyle={paintStyle}
                paintColour={paintColour}
                numberLabel={isNumberLoading ? "Loading number…" : formattedNextNumber}
                status="Awaiting payment"
              />
            </div>
            <p className="paint-preview-note">
              Your final number is assigned after payment. This preview does not reserve a number.
            </p>
            {numberError && (
              <div role="status" className="mt-4 rounded-xl border border-white/10 p-4">
                <p className="text-sm text-amber-200">{numberError}</p>
                <button type="button" disabled={isNumberLoading || isLoading}
                  onClick={() => setNumberRetry((value) => value + 1)}
                  className="mt-3 rounded-lg border border-cyan-400/30 px-4 py-2 text-sm font-semibold text-cyan-300 disabled:opacity-50">
                  Retry number preview
                </button>
              </div>
            )}

            {/* CONTRIBUTION INFORMATION */}
            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <label htmlFor="contribution" className="mb-3 block text-sm font-semibold text-gray-300">
                Your contribution (£)
              </label>
              <input
                id="contribution"
                name="amount"
                type="number"
                inputMode="decimal"
                min="1"
                max="1000"
                step="0.01"
                required
                value={amount}
                disabled={isLoading}
                onChange={(event) => { setAmount(event.target.value); setErrorMessage(""); }}
                className={`${inputClasses} mb-4`}
                aria-describedby="contribution-help"
              />
              <div className="flex justify-between gap-4">
                <span className="text-sm text-gray-300">
                  Minimum contribution
                </span>

                <span className="font-bold">£1</span>
              </div>

              <p id="contribution-help" className="mt-3 text-sm leading-relaxed text-gray-400">
                Contributing more does not provide a different
                position, ranking or status.
              </p>
            </div>

            {/* FORM ERROR */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
              >
                {errorMessage}
              </div>
            )}

            {/* PAYMENT BUTTON */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !formIsValid
              }
              className="mt-8 w-full rounded-2xl bg-cyan-400 px-4 py-4 font-black text-black transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading
                ? "Opening secure payment…"
                : "Continue To Payment →"}
            </button>

            <p className="mt-4 text-center text-sm leading-relaxed text-gray-400">
              Check your name, lettering, colour and email before continuing.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
