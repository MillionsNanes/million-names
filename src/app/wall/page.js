"use client";

import Link from "next/link";
import GraffitiName from "../../components/GraffitiName";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

const TOTAL_PLACES = 1000000;
const PAGE_SIZE = 24;

function WallContent() {
  const params = useSearchParams();
  const requestedNumber = params.get("number") || "";
  const focusNumber = /^\d{1,7}$/.test(requestedNumber) && Number(requestedNumber) >= 1 && Number(requestedNumber) <= TOTAL_PLACES
    ? String(Number(requestedNumber)) : "";
  const [supporters, setSupporters] = useState([]);
  const [claimed, setClaimed] = useState(null);
  const [matchingCount, setMatchingCount] = useState(0);

  const [search, setSearch] = useState(focusNumber);
  const [searchTerm, setSearchTerm] = useState(focusNumber);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setSearch(focusNumber);
    setSearchTerm(focusNumber);
    setPage(1);
    setFilter("all");
  }, [focusNumber]);

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
          .select("id, supporter_number, display_name, paint_style, paint_colour", {
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
    <main className="min-h-screen bg-[#090b0d] text-white">
      <nav aria-label="Main navigation" className="border-b border-white/10 bg-[#090b0d]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/" className="text-base font-black tracking-[0.18em] sm:text-xl">MILLION NAMES</Link>
          <div className="hidden items-center gap-7 text-sm text-gray-300 md:flex">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/wall" aria-current="page" className="text-white">The Wall</Link>
            <Link href="/#how-it-works" className="hover:text-white">How it works</Link>
            <Link href="/#faq" className="hover:text-white">FAQ</Link>
          </div>
          <Link href="/claim" className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-black hover:bg-cyan-200">Claim your place →</Link>
        </div>
      </nav>

      <div className="brick-surface">
        <header className="mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-8 sm:pt-8">
          <Link href="/" className="inline-block py-2 text-sm text-gray-300 hover:text-white">← Back to home</Link>
          <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-300">THE MILLION NAMES WALL</p>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">LEAVE YOUR MARK.</h1>
              <p className="mt-4 text-base text-gray-200 sm:text-lg">One million names. One wall. Everyone equal.</p>
            </div>
            <form onSubmit={handleSearch} role="search" className="w-full lg:max-w-sm">
              <label htmlFor="wallSearch" className="mb-2 block text-sm text-gray-200">Find a name or supporter number</label>
              <div className="flex gap-2">
                <input id="wallSearch" name="wallSearch" type="search" value={search} maxLength={100}
                  placeholder="Name or #000001" onChange={(event) => setSearch(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-white/25 bg-[#0b0d10] px-4 py-3 text-base outline-none placeholder:text-gray-400 focus:border-cyan-300" />
                <button type="submit" className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-black hover:bg-cyan-200">Search</button>
              </div>
            </form>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-white/20 pt-5">
            <div className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-gray-300">
              <p><strong className="font-mono text-white">{claimed === null ? "—" : claimed.toLocaleString("en-GB")}</strong> names claimed</p>
              <p><strong className="font-mono text-white">{remaining === null ? "—" : remaining.toLocaleString("en-GB")}</strong> places remaining</p>
              <p>{percentage === null ? "—" : `${percentage}%`} complete</p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Wall filters">
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>All places</FilterButton>
              <FilterButton active={filter === "claimed"} onClick={() => setFilter("claimed")}>Claimed</FilterButton>
              <FilterButton active={filter === "available"} onClick={() => setFilter("available")}>Available</FilterButton>
            </div>
          </div>
          {searchTerm && <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span>Results for <strong>{searchTerm}</strong></span>
            <button type="button" onClick={clearSearch} className="rounded-lg border border-white/30 bg-black/40 px-3 py-2 hover:bg-black/70">Show all names</button>
          </div>}
        </header>

        <section id="wall-directory" aria-label="Names on the wall" aria-busy={loading} className="mx-auto min-h-64 max-w-7xl scroll-mt-6 px-3 pb-6 sm:px-6">
          {loading ? (
            <p role="status" className="py-24 text-center text-gray-200">Loading the wall…</p>
          ) : loadError ? (
            <div role="alert" className="py-20 text-center">
              <p className="text-red-200">{loadError}</p>
              <button type="button" onClick={() => { setLoading(true); setRetryCount((value) => value + 1); }} className="mt-5 rounded-lg border border-white/30 bg-black/50 px-5 py-3">Try again</button>
            </div>
          ) : filter === "available" ? (
            <div className="px-4 py-20 text-center">
              <h2 className="text-3xl font-black">There’s room for your name.</h2>
              <p className="mt-4 text-gray-200">{remaining?.toLocaleString("en-GB")} places remain across the wall.</p>
              <p className="mt-3 text-sm text-gray-300">Choose your lettering and paint colour. Every place is equal.</p>
              <Link href="/claim" className={`${claimButton} mt-6`}>Claim your place →</Link>
            </div>
          ) : supporters.length === 0 ? (
            <div className="px-4 py-20 text-center">
              <h2 className="text-2xl font-bold">{searchTerm ? "No matching names" : "Make the first mark."}</h2>
              <p className="mt-4 text-gray-200">{searchTerm ? "Try another name or supporter number." : "The wall is waiting for its first confirmed supporter."}</p>
              {!searchTerm && <Link href="/claim" className={`${claimButton} mt-6`}>Claim your place →</Link>}
            </div>
          ) : (
            <div className="paint-grid">
              {supporters.map((supporter) => (
                <article key={supporter.id} className={`paint-slot ${String(supporter.supporter_number) === focusNumber ? "is-focused" : ""}`}>
                  <GraffitiName name={supporter.display_name} number={supporter.supporter_number}
                    paintStyle={supporter.paint_style} paintColour={supporter.paint_colour} heading />
                  <Link href={`/place?number=${supporter.supporter_number}`} className="paint-slot-link"
                    aria-label={`View and share ${supporter.display_name}, supporter number ${supporter.supporter_number}`}>View & share →</Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="border-y border-white/10 bg-[#101214]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <p role="status" className="text-sm text-gray-400">
            {loading ? "Loading names…" : loadError ? "Wall unavailable" : filter === "available" ? "One place per supporter" : `Showing ${firstShown}–${lastShown} of ${matchingCount.toLocaleString("en-GB")} confirmed names`}
          </p>
          {filter !== "available" && <nav aria-label="Wall pages" className="flex items-center gap-3">
            <button type="button" disabled={loading || !!loadError || page <= 1} onClick={() => changePage(page - 1)} className="rounded-lg border border-white/20 px-4 py-3 text-sm disabled:opacity-30">← Previous</button>
            <span className="text-sm text-gray-300">{page} / {totalPages}</span>
            <button type="button" disabled={loading || !!loadError || page >= totalPages} onClick={() => changePage(page + 1)} className="rounded-lg border border-white/20 px-4 py-3 text-sm disabled:opacity-30">Next →</button>
          </nav>}
        </div>
      </div>
      <section className="mx-auto max-w-4xl px-5 py-14 text-center sm:py-20">
        <p className="text-sm uppercase tracking-widest text-cyan-300">Your name belongs here.</p>
        <h2 className="mt-4 text-3xl font-black sm:text-4xl">Different names. Equal places.</h2>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-gray-300">Every supporter gets the same space and the same choice of lettering and colours. Contributing more doesn’t buy a bigger name or a better position.</p>
        <Link href="/claim" className={`${claimButton} mt-7`}>Claim your place →</Link>
      </section>
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-8 text-sm text-gray-400 sm:px-8">
          <Link href="/" className="font-bold tracking-widest text-gray-200">MILLION NAMES</Link>
          <p>One million names. One shared wall.</p>
          <nav aria-label="Footer navigation" className="flex gap-6"><Link href="/">Home</Link><Link href="/#how-it-works">How it works</Link><Link href="/#faq">FAQ</Link></nav>
        </div>
      </footer>
    </main>
  );
}

export default function Wall() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black p-8 text-white">
        <Link href="/" className="text-cyan-300">← Back to home</Link>
        <p role="status" className="mt-8">Loading the wall…</p>
      </main>
    }>
      <WallContent />
    </Suspense>
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
