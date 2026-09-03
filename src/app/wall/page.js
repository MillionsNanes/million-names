"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const TOTAL_PLACES = 1000000;

export default function Wall() {
  const [supporters, setSupporters] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadSupporters() {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
  .from("supporters")
  .select("id, supporter_number, display_name")
  .eq("paid", true)
  .order("supporter_number", { ascending: true });

      if (error) {
        console.error(error);
        setLoadError("The wall could not be loaded. Please try again.");
      } else {
        setSupporters(data || []);
      }

      setLoading(false);
    }

    loadSupporters();
  }, []);

  const claimed = supporters.length;
  const remaining = TOTAL_PLACES - claimed;
  const percentage = ((claimed / TOTAL_PLACES) * 100).toFixed(2);

  const filteredSupporters = useMemo(() => {
    const cleanSearch = search
      .trim()
      .toLowerCase()
      .replace(/^#/, "");

    if (filter === "available") {
      return [];
    }

    return supporters.filter((supporter) => {
      if (!cleanSearch) {
        return true;
      }

      const displayName = String(
        supporter.display_name || ""
      ).toLowerCase();

      const supporterNumber = String(
        supporter.supporter_number || ""
      );

      return (
        displayName.includes(cleanSearch) ||
        supporterNumber.includes(cleanSearch)
      );
    });
  }, [supporters, search, filter]);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-250px] left-[-200px] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />

        <div className="absolute top-[-250px] right-[-200px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />

        <div className="absolute bottom-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        {/* NAVIGATION */}
        <nav className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-black text-xl tracking-tight"
            >
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                MILLION NAMES
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
              <Link
                href="/"
                className="hover:text-white transition"
              >
                Home
              </Link>

              <span className="text-white">
                The Wall
              </span>

              <Link
                href="/#how-it-works"
                className="hover:text-white transition"
              >
                How It Works
              </Link>

              <Link
                href="/#faq"
                className="hover:text-white transition"
              >
                FAQ
              </Link>
            </div>

            <a
              href="claim"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex bg-white text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-cyan-400 transition"
            >
              Claim Your Place
            </a>
          </div>
        </nav>

        {/* HERO */}
        <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-16">
          <div className="flex justify-center mb-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />

                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
              </span>

              THE EXPERIMENT IS LIVE
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black tracking-[-0.05em] leading-none">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                THE NAME
              </span>

              <br />

              <span className="text-white">
                WALL
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mt-7 max-w-2xl mx-auto">
              One million places waiting to become part of the story.
            </p>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              value={claimed.toLocaleString()}
              label="Names Claimed"
              colour="text-cyan-400"
            />

            <StatCard
              value={remaining.toLocaleString()}
              label="Places Remaining"
            />

            <StatCard
              value={`${percentage}%`}
              label="Complete"
              colour="text-purple-400"
            />
          </div>
        </section>

        {/* WALL CONTAINER */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-zinc-900/70 backdrop-blur-xl overflow-hidden">
            {/* WALL HEADER */}
            <div className="p-6 md:p-8 border-b border-white/5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em]">
                    Supporter Directory
                  </p>

                  <h2 className="text-3xl md:text-4xl font-black mt-2">
                    Explore the wall
                  </h2>
                </div>

                {/* SEARCH */}
                <div className="relative w-full lg:w-80">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search name or number..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-400/50 transition"
                  />
                </div>
              </div>

              {/* FILTERS */}
              <div className="flex flex-wrap gap-3 mt-7">
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
            </div>

            {/* WALL */}
            <div className="p-5 md:p-8">
              {loading && (
                <div className="text-center py-16">
                  <div className="inline-block w-8 h-8 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />

                  <p className="text-gray-400 mt-4">
                    Loading the wall...
                  </p>
                </div>
              )}

              {!loading && loadError && (
                <div className="text-center py-16">
                  <p className="text-red-300">
                    {loadError}
                  </p>
                </div>
              )}

              {!loading &&
                !loadError &&
                filter === "available" && (
                  <div className="text-center py-16">
                    <p className="text-2xl font-bold">
                      Available places
                    </p>

                    <p className="text-gray-500 mt-3">
                      {remaining.toLocaleString()} places are
                      still waiting to be claimed.
                    </p>

                    <a
                      href="claim"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex mt-7 bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl hover:bg-cyan-300 transition"
                    >
                      Claim Your Place
                    </a>
                  </div>
                )}

              {!loading &&
                !loadError &&
                filter !== "available" && (
                  <>
                    {filteredSupporters.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredSupporters.map(
                          (supporter) => (
                            <div
                              key={supporter.id}
                              className="group min-h-[130px] rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4 hover:border-cyan-400/50 hover:bg-cyan-400/[0.07] transition-all"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-mono text-xs text-cyan-400">
                                  #
                                  {String(
                                    supporter.supporter_number
                                  ).padStart(6, "0")}
                                </span>

                                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                              </div>

                              <div className="mt-8">
                                <p className="text-lg font-bold text-white break-words">
                                  {supporter.display_name}
                                </p>

                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                                  Claimed
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-2xl font-bold">
                          {search
                            ? "No matching supporters"
                            : "The first place is waiting"}
                        </p>

                        <p className="text-gray-500 mt-3">
                          {search
                            ? "Try a different name or supporter number."
                            : "Be the first name on the Million Names wall."}
                        </p>
                      </div>
                    )}
                  </>
                )}
            </div>

            {/* WALL INFORMATION */}
            <div className="border-t border-white/5 p-6">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="text-white">
                  {filteredSupporters.length.toLocaleString()}
                </span>{" "}
                confirmed names out of{" "}
                <span className="text-white">
                  {TOTAL_PLACES.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* EQUALITY MESSAGE */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/[0.07] via-blue-500/[0.03] to-purple-500/[0.07] p-8 md:p-12 text-center">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em]">
              The Million Names Rule
            </p>

            <h2 className="text-4xl md:text-5xl font-black mt-4">
              Everyone is equal.
            </h2>

            <p className="text-gray-400 mt-5 max-w-2xl mx-auto leading-relaxed">
              Every supporter gets one place and one supporter
              number. Contributing more than £1 does not give
              anyone VIP status, better placement, a larger name
              or a higher ranking.
            </p>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 p-10 md:p-14 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5" />

            <div className="relative">
              <p className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em]">
                Want to be part of it?
              </p>

              <h2 className="text-4xl md:text-5xl font-black mt-4">
                Claim your place.
              </h2>

              <p className="text-gray-400 mt-4">
                The first million names will be part of the
                permanent wall.
              </p>

              <a
                href="claim"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 bg-cyan-400 text-black font-black px-8 py-4 rounded-2xl hover:bg-cyan-300 hover:scale-[1.03] transition-all"
              >
                Claim Your Place →
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <Link
                  href="/"
                  className="font-black text-lg"
                >
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    MILLION NAMES
                  </span>
                </Link>

                <p className="text-gray-600 text-sm mt-2">
                  One million strangers. One permanent wall.
                </p>
              </div>

              <div className="flex gap-6 text-sm text-gray-500">
                <Link
                  href="/"
                  className="hover:text-white transition"
                >
                  Home
                </Link>

                <Link
                  href="/wall"
                  className="text-white"
                >
                  The Wall
                </Link>

                <Link
                  href="/#faq"
                  className="hover:text-white transition"
                >
                  FAQ
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-xs text-gray-700">
              © {new Date().getFullYear()} Million Names. An
              internet experiment.
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ value, label, colour = "" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center">
      <p className={`text-4xl font-black ${colour}`}>
        {value}
      </p>

      <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
        {label}
      </p>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-bold"
          : "px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-gray-400 text-sm font-semibold hover:text-white hover:border-white/20 transition"
      }
    >
      {children}
    </button>
  );
}