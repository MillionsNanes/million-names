"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const TOTAL_PLACES = 1000000;

const steps = [
  {
    number: "01",
    title: "Claim Your Name",
    description:
      "Contribute £1 or more and choose the name you want to place on the Million Names wall.",
  },
  {
    number: "02",
    title: "Receive Your Number",
    description:
      "Your supporter number is assigned after your payment is confirmed.",
  },
  {
    number: "03",
    title: "Become Part of It",
    description:
      "Your name becomes part of a shared public wall built by strangers from around the world.",
  },
];

const questions = [
  {
    question: "What do I receive?",
    answer:
      "One display name, one supporter number and one place on the Million Names wall.",
  },
  {
    question: "How much does it cost?",
    answer:
      "The minimum contribution is £1. You can contribute more if you wish, but everyone receives the same status.",
  },
  {
    question: "Does paying more give me a better position?",
    answer:
      "No. There are no VIP places, rankings, larger names or special positions based on how much you contribute.",
  },
  {
    question: "Is this a charity?",
    answer:
      "No. Million Names is an independently run internet experiment. Contributions go to the creator, not a charity.",
  },
  {
    question: "Is this an investment?",
    answer:
      "No. Contributions do not provide ownership, a financial return or a share of the project.",
  },
];

export default function Home() {
  const [claimed, setClaimed] = useState(null);
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    // Stop waiting indefinitely if the database is slow.
    const timeoutId = window.setTimeout(() => {
      controller.abort();

      if (active) {
        setLoading(false);
        setLoadError(
          "The wall statistics are taking longer than expected. Please try again."
        );
      }
    }, 8000);

    async function loadWallData() {
      setLoading(true);
      setLoadError("");

      try {
        const supabaseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL;

        const supabaseKey =
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error(
            "Supabase environment variables are missing."
          );
        }

        const supabase = createClient(
          supabaseUrl,
          supabaseKey,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          }
        );

        const [countResult, previewResult] = await Promise.all([
          supabase
            .from("supporters")
            .select("supporter_number", {
              count: "exact",
              head: true,
            })
            .eq("paid", true)
            .abortSignal(controller.signal),

          supabase
            .from("supporters")
            .select("id, supporter_number, display_name")
            .eq("paid", true)
            .order("supporter_number", {
              ascending: true,
            })
            .limit(3)
            .abortSignal(controller.signal),
        ]);

        if (countResult.error) {
          throw countResult.error;
        }

        if (previewResult.error) {
          throw previewResult.error;
        }

        if (!active || controller.signal.aborted) {
          return;
        }

        if (typeof countResult.count !== "number") {
          throw new Error("No supporter count was returned.");
        }

        setClaimed(countResult.count);
        setSupporters(previewResult.data ?? []);
      } catch (error) {
        if (!active || controller.signal.aborted) {
          return;
        }

        console.error("Could not load wall statistics:", error);

        setLoadError(
          "The wall statistics are temporarily unavailable. Please try again."
        );
      } finally {
        window.clearTimeout(timeoutId);

        if (active) {
          setLoading(false);
        }
      }
    }

    loadWallData();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [retryCount]);

  const hasCount = claimed !== null;

  const remaining = hasCount
    ? Math.max(0, TOTAL_PLACES - claimed)
    : null;

  const progress = hasCount
    ? Math.min(100, Math.max(0, (claimed / TOTAL_PLACES) * 100))
    : 0;

  const percentage = hasCount
    ? progress.toFixed(2)
    : null;

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-7 py-4 font-bold text-black transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      {/* LIGHTWEIGHT BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 650px at 0% 0%, rgba(6,182,212,0.12), transparent 75%), radial-gradient(ellipse 70% 650px at 100% 0%, rgba(147,51,234,0.12), transparent 75%)",
        }}
      />

      <div className="relative z-10">
        {/* NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="mx-auto max-w-7xl px-5 py-6 sm:px-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-5">
            <Link
              href="/"
              className="text-lg font-black tracking-tight sm:text-xl"
            >
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                MILLION NAMES
              </span>
            </Link>

            <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
              <a
                href="#how-it-works"
                className="transition-colors hover:text-white"
              >
                How It Works
              </a>

              <Link
                href="/wall"
                className="transition-colors hover:text-white"
              >
                The Wall
              </Link>

              <a
                href="#faq"
                className="transition-colors hover:text-white"
              >
                FAQ
              </a>
            </div>

            <Link
              href="/claim"
              className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-300"
            >
              Claim Your Place
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-24">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold text-cyan-300 sm:text-sm">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-cyan-400"
              />

              ONE MILLION NAMES. ONE SHARED WALL.
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-6xl font-black leading-none tracking-[-0.06em] sm:text-7xl md:text-8xl lg:text-9xl">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                MILLION
              </span>

              <br />

              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                NAMES
              </span>
            </h1>

            <p className="mt-8 text-xl font-medium sm:text-2xl md:text-3xl">
              Can 1,000,000 strangers build something together?
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
              One million names. One permanent wall.
              <br />
              Every supporter becomes part of the experiment.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/claim" className={primaryButton}>
                Claim Your Place
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/wall"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-zinc-900 px-7 py-4 font-bold transition-colors hover:bg-zinc-800"
              >
                Explore The Wall
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <p className="mt-5 text-sm text-gray-400">
              Minimum contribution £1 · Everyone gets the same status
            </p>
          </div>

          {/* PROGRESS CARD */}
          <div className="mx-auto mt-14 max-w-3xl sm:mt-20">
            <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-6 sm:p-10">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-300">
                    The Wall Is Growing
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Confirmed supporters
                  </p>
                </div>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-400">
                  {percentage !== null
                    ? `${percentage}% COMPLETE`
                    : loading
                      ? "LOADING STATS"
                      : "STATS UNAVAILABLE"}
                </span>
              </div>

              <div className="text-center" aria-live="polite">
                <div className="min-h-[72px] bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl md:text-8xl">
                  {hasCount ? claimed.toLocaleString("en-GB") : "—"}
                </div>

                <p className="mt-2 text-sm tracking-wide text-gray-300">
                  NAMES CLAIMED
                </p>
              </div>

              <div className="mt-8">
                <div
                  role="progressbar"
                  aria-label="Names claimed toward one million"
                  aria-valuemin={0}
                  aria-valuemax={TOTAL_PLACES}
                  aria-valuenow={
                    hasCount
                      ? Math.min(claimed, TOTAL_PLACES)
                      : undefined
                  }
                  aria-valuetext={
                    hasCount
                      ? `${claimed.toLocaleString("en-GB")} names claimed`
                      : "Supporter count unavailable"
                  }
                  className="h-3 overflow-hidden rounded-full border border-white/5 bg-black"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-3 flex justify-between text-sm text-gray-400">
                  <span>0</span>
                  <span>1,000,000</span>
                </div>
              </div>

              {loadError && (
                <div
                  role="status"
                  className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200"
                >
                  <p>{loadError}</p>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setRetryCount((value) => value + 1)}
                    className="mt-3 rounded-lg border border-amber-200/30 px-4 py-2 font-semibold transition-colors hover:bg-amber-200/10 disabled:opacity-50"
                  >
                    Try Again
                  </button>
                </div>
              )}

              <div className="mt-8 grid gap-6 border-t border-white/10 pt-6 text-center sm:grid-cols-3 sm:text-left">
                <div>
                  <p className="text-2xl font-bold">
                    {remaining !== null
                      ? remaining.toLocaleString("en-GB")
                      : "—"}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Places Remaining
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">£1+</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Minimum Contribution
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold">1 : 1</p>
                  <p className="mt-1 text-sm text-gray-400">
                    One Name Per Place
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl scroll-mt-8 px-5 py-16 sm:px-6 md:py-24"
        >
          <div className="mb-10 text-center md:mb-14">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              How It Works
            </p>

            <h2 className="text-3xl font-black sm:text-4xl md:text-5xl">
              Your name becomes part of the story.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-gray-300">
              No complicated memberships. No VIP tiers.
              No special treatment. Just one giant wall,
              built one name at a time.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-white/10 bg-zinc-950 p-7 transition-colors hover:border-cyan-400/30 sm:p-8"
              >
                <span className="text-5xl font-black text-cyan-400/30">
                  {step.number}
                </span>

                <h3 className="mt-6 text-2xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 leading-relaxed text-gray-300">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* EQUALITY */}
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 md:pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/[0.08] via-blue-500/[0.04] to-purple-500/[0.08] p-7 md:p-14">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
                  The Rule
                </p>

                <h2 className="mt-4 text-3xl font-black sm:text-4xl md:text-5xl">
                  Everyone is equal.
                </h2>

                <p className="mt-6 text-lg leading-relaxed text-gray-300">
                  You can contribute more than £1 if you want
                  to support the experiment, but money
                  doesn&apos;t buy status.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  ["£1", "Same status"],
                  ["£10+", "Same status"],
                  ["No VIP", "No special tier"],
                  ["Equal", "Every supporter"],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5"
                  >
                    <p className="text-2xl font-bold">{title}</p>
                    <p className="mt-2 text-sm text-gray-400">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WALL PREVIEW */}
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 md:pb-24">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-purple-400">
                The Wall
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl md:text-5xl">
                A million places.
              </h2>
            </div>

            <Link
              href="/wall"
              className="font-bold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              View full wall →
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900">
            <div className="flex justify-between border-b border-white/10 px-6 py-5 text-sm text-gray-400">
              <span>Supporter</span>
              <span>Status</span>
            </div>

            {loading ? (
              <p
                role="status"
                className="px-6 py-10 text-center text-gray-400"
              >
                Loading supporters…
              </p>
            ) : loadError ? (
              <p className="px-6 py-10 text-center text-gray-400">
                The supporter preview is temporarily unavailable.
              </p>
            ) : supporters.length > 0 ? (
              <div className="divide-y divide-white/10">
                {supporters.map((supporter) => (
                  <div
                    key={supporter.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-5"
                  >
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 sm:gap-4">
                      <span className="font-mono text-sm text-cyan-400">
                        #
                        {String(
                          supporter.supporter_number
                        ).padStart(6, "0")}
                      </span>

                      <span className="min-w-0 break-words font-semibold [overflow-wrap:anywhere]">
                        {supporter.display_name}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-cyan-300">
                      CONFIRMED
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-xl font-bold">
                  The first name starts the story.
                </p>

                <p className="mt-3 text-gray-400">
                  No confirmed supporters are listed yet.
                </p>

                <Link
                  href="/claim"
                  className="mt-5 inline-flex font-bold text-cyan-400 hover:text-cyan-300"
                >
                  Claim Your Place →
                </Link>
              </div>
            )}

            <div className="border-t border-white/10 p-5 text-center">
              <Link
                href="/wall"
                className="text-sm font-bold text-gray-300 transition-colors hover:text-white"
              >
                Explore the full wall →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="mx-auto max-w-4xl scroll-mt-8 px-5 pb-16 sm:px-6 md:pb-24"
        >
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Questions
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl md:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {questions.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-6"
              >
                <h3 className="text-lg font-bold">
                  {item.question}
                </h3>

                <p className="mt-3 leading-relaxed text-gray-300">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-6 md:pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/30 p-8 text-center md:p-16">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
              Be Part of the Experiment
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl md:text-6xl">
              A place for your name.
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-gray-300">
              One million places. One permanent wall.
              <br />
              Become part of something built together.
            </p>

            <Link
              href="/claim"
              className={`${primaryButton} mt-8`}
            >
              Claim Your Place
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
            <div className="flex flex-col justify-between gap-6 md:flex-row">
              <div>
                <Link href="/" className="text-lg font-black">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    MILLION NAMES
                  </span>
                </Link>

                <p className="mt-2 text-sm text-gray-400">
                  One million strangers. One permanent wall.
                </p>
              </div>

              <nav
                aria-label="Footer navigation"
                className="flex flex-wrap gap-6 text-sm text-gray-300"
              >
                <Link href="/wall" className="hover:text-white">
                  The Wall
                </Link>

                <a href="#how-it-works" className="hover:text-white">
                  How It Works
                </a>

                <a href="#faq" className="hover:text-white">
                  FAQ
                </a>
              </nav>
            </div>

            <p className="mt-8 border-t border-white/10 pt-6 text-sm text-gray-400">
              Million Names. An independent internet experiment.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}