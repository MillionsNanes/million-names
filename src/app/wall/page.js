import Link from "next/link";

export default function Wall() {
  const claimed = 0;
  const total = 1000000;
  const remaining = total - claimed;
  const percentage = ((claimed / total) * 100).toFixed(2);

  // Preview spaces
  const spaces = Array.from({ length: 48 }, (_, index) => index + 1);

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
              href="https://buy.stripe.com/dRm5kx7t63rQaSZ2A3eME00"
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

          {/* LIVE BADGE */}
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

        {/* STATS */}
        <section className="max-w-6xl mx-auto px-6 pb-12">

          <div className="grid md:grid-cols-3 gap-4">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center">

              <p className="text-4xl font-black text-cyan-400">
                {claimed.toLocaleString()}
              </p>

              <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
                Names Claimed
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center">

              <p className="text-4xl font-black">
                {remaining.toLocaleString()}
              </p>

              <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
                Places Remaining
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center">

              <p className="text-4xl font-black text-purple-400">
                {percentage}%
              </p>

              <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
                Complete
              </p>

            </div>

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
                    type="text"
                    placeholder="Search name or number..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-400/50 transition"
                  />

                </div>

              </div>

              {/* FILTERS */}
              <div className="flex flex-wrap gap-3 mt-7">

                <button className="px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-bold">
                  All Places
                </button>

                <button className="px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-gray-400 text-sm font-semibold hover:text-white hover:border-white/20 transition">
                  Available
                </button>

                <button className="px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-gray-400 text-sm font-semibold hover:text-white hover:border-white/20 transition">
                  Claimed
                </button>

              </div>

            </div>

            {/* WALL */}
            <div className="p-5 md:p-8">

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">

                {spaces.map((number) => (

                  <div
                    key={number}
                    className="group relative min-h-[110px] rounded-2xl border border-white/10 bg-black/40 p-4 hover:border-cyan-400/40 hover:bg-cyan-400/[0.03] transition-all cursor-pointer"
                  >

                    <div className="flex justify-between items-start">

                      <span className="font-mono text-xs text-cyan-400">
                        #{String(number).padStart(6, "0")}
                      </span>

                      <span className="w-2 h-2 rounded-full bg-gray-700 group-hover:bg-cyan-400 transition" />

                    </div>

                    <div className="absolute bottom-4 left-4">

                      <p className="text-sm font-semibold text-gray-500 group-hover:text-gray-300 transition">
                        Available
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* PAGINATION */}
            <div className="border-t border-white/5 p-6">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-5">

                <p className="text-sm text-gray-500">
                  Showing places <span className="text-white">1–48</span> of{" "}
                  <span className="text-white">
                    {total.toLocaleString()}
                  </span>
                </p>

                <div className="flex items-center gap-2">

                  <button
                    disabled
                    className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-700 cursor-not-allowed"
                  >
                    ←
                  </button>

                  <div className="px-4 py-2 rounded-lg bg-cyan-400 text-black font-bold text-sm">
                    1
                  </div>

                  <button className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition">
                    2
                  </button>

                  <button className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition">
                    3
                  </button>

                  <span className="px-2 text-gray-600">
                    ...
                  </span>

                  <button className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition">
                    →
                  </button>

                </div>

              </div>

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
              Every supporter gets one place and one supporter number.
              Contributing more than £1 does not give anyone VIP status,
              better placement, a larger name or a higher ranking.
            </p>

          </div>

        </section>

        {/* CTA */}
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
                The first million names will be part of the permanent wall.
              </p>

              <a
                href="https://buy.stripe.com/dRm5kx7t63rQaSZ2A3eME00"
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
              © {new Date().getFullYear()} Million Names. An internet experiment.
            </div>

          </div>

        </footer>

      </div>

    </main>
  );
}