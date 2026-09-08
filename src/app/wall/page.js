"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const TOTAL_PLACES = 1000000;
const PAGE_SIZE = 24;

export default function Wall() {
  const [supporters, setSupporters] = useState([]);
  const [claimed, setClaimed] = useState(null);
  const [matchingCount, setMatchingCount] = useState(0);

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setLoading(true);
    setLoadError("");

    const timeoutId = window.setTimeout(() => {
      controller.abort();

      if (active) {
        setLoadError(
          "The wall is taking longer than expected to load. Please try again."
        );
        setLoading(false);
      }
    }, 10000);

    async function loadSupporters() {
      try {
        const firstRow = (page - 1) * PAGE_SIZE;

        let supporterQuery = supabase
          .from("supporters")
          .select("id, supporter_number, display_name", {
            count: "exact",
          })
          .eq("paid", true);

        if (searchTerm) {
          const numberText = searchTerm.replace(/^#/, "");

          if (/^\d+$/.test(numberText)) {
            const number = Number(numberText);

            if (
              !Number.isSafeInteger(number) ||
              number < 1 ||
              number > TOTAL_PLACES
            ) {
              throw new Error(
                "Enter a supporter number between 1 and 1,000,000."
              );
            }

            supporterQuery = supporterQuery.eq(
              "supporter_number",
              number
            );
          } else {
            // Treat wildcard characters as literal name characters.
            const escapedSearch = searchTerm
              .replace(/\\/g, "\\\\")
              .replace(/%/g, "\\%")
              .replace(/_/g, "\\_");

            supporterQuery = supporterQuery.ilike(
              "display_name",
              `%${escapedSearch}%`
            );
          }
        }

        const [totalResult, supporterResult] = await Promise.all([
          supabase
            .from("supporters")
            .select("supporter_number", {
              count: "exact",
              head: true,
            })
            .eq("paid", true)
            .abortSignal(controller.signal),

          supporterQuery
            .order("supporter_number", {
              ascending: true,
            })
            .order("id", {
              ascending: true,
            })
            .range(firstRow, firstRow + PAGE_SIZE - 1)
            .abortSignal(controller.signal),
        ]);

        if (totalResult.error) {
          throw totalResult.error;
        }

        if (supporterResult.error) {
          throw supporterResult.error;
        }

        if (
          typeof totalResult.count !== "number" ||
          typeof supporterResult.count !== "number"
        ) {
          throw new Error("The supporter count was not returned.");
        }

        if (!active || controller.signal.aborted) {
          return;
        }

        const lastPage = Math.max(
          1,
          Math.ceil(supporterResult.count / PAGE_SIZE)
        );

        if (page > lastPage) {
          setPage(lastPage);
          return;
        }

        setClaimed(totalResult.count);
        setMatchingCount(supporterResult.count);
        setSupporters(supporterResult.data ?? []);
      } catch (error) {
        if (!active || controller.signal.aborted) {
          return;
        }

        console.error("Could not load the wall:", error);

        setLoadError(
          error instanceof Error &&
          error.message.startsWith("Enter a supporter number")
            ? error.message
            : "The wall could not be loaded. Please try again."
        );
      } finally {
        window.clearTimeout(timeoutId);

        if (active) {
          setLoading(false);
        }
      }
    }

    loadSupporters();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [page, searchTerm, retryCount]);

  function handleSearch(event) {
    event.preventDefault();

    const cleanedSearch = search.trim();

    setFilter("all");

    if (cleanedSearch !== searchTerm || page !== 1) {
      setLoading(true);
      setPage(1);
      setSearchTerm(cleanedSearch);
    } else {
      setLoading(true);
      setRetryCount((value) => value + 1);
    }
  }

  function clearSearch() {
    setSearch("");

    if (searchTerm || page !== 1) {
      setLoading(true);
      setPage(1);
      setSearchTerm("");
    }
  }

  function changePage(nextPage) {
    setLoading(true);
    setPage(nextPage);
  }

  const remaining =
    claimed === null
      ? null
      : Math.max(0, TOTAL_PLACES - claimed);

  const percentage =
    claimed === null
      ? null
      : ((claimed / TOTAL_PLACES) * 100).toFixed(2);

  const totalPages = Math.max(
    1,
    Math.ceil(matchingCount / PAGE_SIZE)
  );

  const firstShown =
    matchingCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const lastShown =
    matchingCount === 0
      ? 0
      : firstShown + supporters.length - 1;

  const claimButton =
    "inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300";

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
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="text-lg font-black tracking-tight sm:text-xl"
            >
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                MILLION NAMES
              </span>
            </Link>

            <div className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
              <Link href="/" className="hover:text-white">
                Home
              </Link>

              <Link
                href="/wall"
                aria-current="page"
                className="text-white"
              >
                The Wall
              </Link>

              <Link
                href="/#how-it-works"
                className="hover:text-white"
              >
                How It Works
              </Link>

              <Link href="/#faq" className="hover:text-white">
                FAQ
              </Link>
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
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 md:pb-14 md:pt-12">
          <Link
            href="/"
            className="mb-8 inline-flex py-2 text-sm text-gray-300 hover:text-white"
          >
            ← Back to home
          </Link>

          <div className="text-center">
            <p className="mb-5 text-sm font-bold uppercase tracking-widest text-cyan-400">
              One million places. One shared story.
            </p>

            <h1 className="text-5xl font-black leading-none tracking-[-0.05em] sm:text-6xl md:text-8xl">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                THE NAME
              </span>

              <br />

              WALL
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-300">
              Discover the supporters becoming part of the story.
            </p>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              value={
                claimed === null
                  ? "—"
                  : claimed.toLocaleString("en-GB")
              }
              label="Names Claimed"
              colour="text-cyan-400"
            />

            <StatCard
              value={
                remaining === null
                  ? "—"
                  : remaining.toLocaleString("en-GB")
              }
              label="Places Remaining"
            />

            <StatCard
              value={
                percentage === null ? "—" : `${percentage}%`
              }
              label="Complete"
              colour="text-purple-400"
            />
          </div>
        </section>

        {/* DIRECTORY */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-5 sm:p-8">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Supporter Directory
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    Explore the wall
                  </h2>
                </div>

                {/* SEARCH */}
                <form
                  onSubmit={handleSearch}
                  role="search"
                  className="w-full lg:max-w-md"
                >
                  <label
                    htmlFor="wallSearch"
                    className="mb-2 block text-sm text-gray-300"
                  >
                    Search a name or exact supporter number
                  </label>

                  <div className="flex gap-2">
                    <input
                      id="wallSearch"
                      name="wallSearch"
                      type="search"
                      value={search}
                      maxLength={100}
                      placeholder="Name or #000001"
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-base text-white outline-none placeholder:text-gray-500 focus:border-cyan-400"
                    />

                    <button
                      type="submit"
                      className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-300"
                    >
                      Search
                    </button>
                  </div>
                </form>
              </div>

              {/* FILTERS */}
              <div className="mt-6 flex flex-wrap gap-3">
                <FilterButton
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  All Places
                </FilterButton>

                <FilterButton
                  active={filter === "available"}
                  onClick={() => setFilter("available")}
                >
                  Available
                </FilterButton>

                <FilterButton
                  active={filter === "claimed"}
                  onClick={() => setFilter("claimed")}
                >
                  Claimed
                </FilterButton>
              </div>

              {searchTerm && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                  <span>
                    Search: <strong>{searchTerm}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={clearSearch}
                    className="rounded-lg border border-white/15 px-3 py-2 hover:bg-white/5"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* RESULTS */}
            <div
              className="min-h-[200px] p-5 sm:p-8"
              aria-busy={loading}
            >
              {loading ? (
                <p
                  role="status"
                  className="py-14 text-center text-gray-300"
                >
                  Loading the wall…
                </p>
              ) : loadError ? (
                <div role="alert" className="py-12 text-center">
                  <p className="text-red-200">{loadError}</p>

                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setRetryCount((value) => value + 1);
                    }}
                    className="mt-5 rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/5"
                  >
                    Try Again
                  </button>
                </div>
              ) : filter === "available" ? (
                <div className="py-12 text-center">
                  <h3 className="text-2xl font-bold">
                    Available places
                  </h3>

                  <p className="mt-3 text-gray-300">
                    {remaining?.toLocaleString("en-GB")} places
                    remain across the wall.
                  </p>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-400">
                    This is the overall availability total.
                    Supporter searches apply to claimed names.
                  </p>

                  <Link
                    href="/claim"
                    className={`${claimButton} mt-6`}
                  >
                    Claim Your Place →
                  </Link>
                </div>
              ) : supporters.length === 0 ? (
                <div className="py-12 text-center">
                  <h3 className="text-2xl font-bold">
                    {searchTerm
                      ? "No matching supporters"
                      : "The first place is waiting"}
                  </h3>

                  <p className="mt-3 text-gray-300">
                    {searchTerm
                      ? "Try another name or supporter number."
                      : "No confirmed supporters are listed yet."}
                  </p>
                </div>
              ) : (
                <>
                  {filter === "all" && (
                    <p className="mb-5 text-sm text-gray-400">
                      Confirmed names are shown below. Select
                      Available to see how many places remain.
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {supporters.map((supporter) => (
                      <article
                        key={supporter.id}
                        className="min-w-0 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5 transition-colors hover:border-cyan-400/50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-sm text-cyan-400">
                            #
                            {String(
                              supporter.supporter_number
                            ).padStart(6, "0")}
                          </span>

                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full bg-cyan-400"
                          />
                        </div>

                        <h3 className="mt-7 break-words text-lg font-bold [overflow-wrap:anywhere]">
                          {supporter.display_name}
                        </h3>

                        <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                          Confirmed
                        </p>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* PAGINATION */}
            {!loading &&
              !loadError &&
              filter !== "available" && (
                <div className="flex flex-col justify-between gap-5 border-t border-white/10 p-5 sm:p-6 md:flex-row md:items-center">
                  <p className="text-sm text-gray-300">
                    Showing{" "}
                    <strong>
                      {firstShown.toLocaleString("en-GB")}–
                      {lastShown.toLocaleString("en-GB")}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {matchingCount.toLocaleString("en-GB")}
                    </strong>{" "}
                    {searchTerm
                      ? "matching supporters"
                      : "confirmed supporters"}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => changePage(page - 1)}
                      className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <span className="text-sm text-gray-300">
                      {page.toLocaleString("en-GB")} /{" "}
                      {totalPages.toLocaleString("en-GB")}
                    </span>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => changePage(page + 1)}
                      className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
          </div>
        </section>

        {/* EQUALITY */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/[0.07] via-blue-500/[0.03] to-purple-500/[0.07] p-7 text-center md:p-12">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
              The Million Names Rule
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl md:text-5xl">
              Everyone is equal.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-gray-300">
              Every supporter gets one place and one supporter
              number. Contributing more than £1 does not provide
              VIP status, better placement, a larger name or a
              higher ranking.
            </p>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 md:pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-8 text-center md:p-14">
            <p className="text-sm font-bold uppercase tracking-widest text-purple-400">
              Want to be part of it?
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl md:text-5xl">
              Claim your place.
            </h2>

            <p className="mt-4 text-gray-300">
              One name. One number. One shared wall.
            </p>

            <Link
              href="/claim"
              className={`${claimButton} mt-8`}
            >
              Claim Your Place →
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
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
                <Link href="/" className="hover:text-white">
                  Home
                </Link>

                <Link
                  href="/wall"
                  aria-current="page"
                  className="text-white"
                >
                  The Wall
                </Link>

                <Link href="/#faq" className="hover:text-white">
                  FAQ
                </Link>
              </nav>
            </div>

            <p className="mt-8 border-t border-white/10 pt-6 text-sm text-gray-400">
              Million Names. An internet experiment.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ value, label, colour = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center">
      <p className={`text-3xl font-black sm:text-4xl ${colour}`}>
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-400">{label}</p>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? "rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-black"
          : "rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
      }
    >
      {children}
    </button>
  );
}