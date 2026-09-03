import Link from "next/link";

export default function Home() {
  const claimed = 0;
  const total = 1000000;
  const remaining = total - claimed;
  const percentage = ((claimed / total) * 100).toFixed(2);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-300px] left-[-200px] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[-250px] right-[-200px] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px]" />
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
              <a
                href="#how-it-works"
                className="hover:text-white transition"
              >
                How It Works
              </a>

              <Link
                href="/wall"
                className="hover:text-white transition"
              >
                The Wall
              </Link>

              <a
                href="#faq"
                className="hover:text-white transition"
              >
                FAQ
              </a>
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
        <section className="max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-24">

          {/* LIVE BADGE */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
              </span>

              THE EXPERIMENT IS LIVE
            </div>
          </div>

          {/* TITLE */}
          <div className="text-center">

            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.06em] leading-none">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                MILLION
              </span>

              <br />

              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                NAMES
              </span>
            </h1>

            <p className="mt-8 text-xl sm:text-2xl md:text-3xl font-medium text-white">
              Can 1,000,000 strangers build something together?
            </p>

            <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              One million names. One permanent wall.
              <br />
              Every supporter becomes part of the experiment.
            </p>

            {/* HERO BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

              <a
                href="claim"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 bg-cyan-400 text-black font-black px-8 py-4 rounded-2xl hover:bg-cyan-300 hover:scale-[1.03] transition-all shadow-[0_0_40px_rgba(34,211,238,0.15)]"
              >
                Claim Your Place
                <span className="group-hover:translate-x-1 transition">
                  →
                </span>
              </a>

              <Link
                href="/wall"
                className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/[0.04] backdrop-blur-xl font-bold px-8 py-4 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition"
              >
                Explore The Wall
                <span>↗</span>
              </Link>

            </div>

            <p className="mt-5 text-xs text-gray-500">
              Minimum contribution £1 • Everyone gets the same status
            </p>

          </div>

          {/* PROGRESS CARD */}
          <div className="max-w-3xl mx-auto mt-20">

            <div className="relative">

              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-7 sm:p-10 shadow-2xl">

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                      The Wall Is Growing
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                      Live project progress
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold">
                    {percentage}% COMPLETE
                  </div>
                </div>

                <div className="text-center">

                  <div className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
                    {claimed.toLocaleString()}
                  </div>

                  <div className="text-gray-400 mt-2">
                    NAMES CLAIMED
                  </div>

                </div>

                {/* PROGRESS BAR */}
                <div className="mt-8">

                  <div className="h-4 bg-black/70 rounded-full overflow-hidden border border-white/5">

                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="flex justify-between mt-4 text-sm">

                  <span className="text-gray-500">
                    0
                  </span>

                  <span className="text-gray-400">
                    1,000,000
                  </span>

                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-center sm:text-left">

                  <div>
                    <p className="text-2xl font-bold">
                      {remaining.toLocaleString()}
                    </p>

                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Places Remaining
                    </p>
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      £1+
                    </p>

                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Minimum Contribution
                    </p>
                  </div>

                  <div>
                    <p className="text-2xl font-bold">
                      1 : 1
                    </p>

                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      One Name Per Place
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* DIVIDER */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="max-w-6xl mx-auto px-6 py-24"
        >

          <div className="text-center mb-14">

            <p className="text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">
              How It Works
            </p>

            <h2 className="text-4xl md:text-5xl font-black">
              Your name becomes part of history.
            </h2>

            <p className="text-gray-400 mt-5 max-w-2xl mx-auto">
              No complicated memberships. No VIP tiers. No special treatment.
              Just one giant wall built by thousands of people.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* CARD 1 */}
            <div className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.05] hover:border-cyan-400/20 transition-all">

              <div className="text-5xl font-black text-white/10 group-hover:text-cyan-400/20 transition">
                01
              </div>

              <h3 className="text-2xl font-bold mt-6">
                Claim Your Name
              </h3>

              <p className="text-gray-400 mt-4 leading-relaxed">
                Contribute £1 or more and choose the name you want to place
                on the Million Names wall.
              </p>

            </div>

            {/* CARD 2 */}
            <div className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.05] hover:border-blue-400/20 transition-all">

              <div className="text-5xl font-black text-white/10 group-hover:text-blue-400/20 transition">
                02
              </div>

              <h3 className="text-2xl font-bold mt-6">
                Receive Your Number
              </h3>

              <p className="text-gray-400 mt-4 leading-relaxed">
                Every supporter receives a unique number based on the order
                they joined the experiment.
              </p>

            </div>

            {/* CARD 3 */}
            <div className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.05] hover:border-purple-400/20 transition-all">

              <div className="text-5xl font-black text-white/10 group-hover:text-purple-400/20 transition">
                03
              </div>

              <h3 className="text-2xl font-bold mt-6">
                Become Part of It
              </h3>

              <p className="text-gray-400 mt-4 leading-relaxed">
                Your name becomes part of a permanent public record of
                something built by strangers from around the world.
              </p>

            </div>

          </div>

        </section>

        {/* EQUALITY SECTION */}
        <section className="max-w-6xl mx-auto px-6 pb-24">

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/[0.08] via-blue-500/[0.04] to-purple-500/[0.08] p-8 md:p-14">

            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full" />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">

              <div>

                <p className="text-cyan-400 font-bold text-sm uppercase tracking-widest">
                  The Rule
                </p>

                <h2 className="text-4xl md:text-5xl font-black mt-4">
                  Everyone is equal.
                </h2>

                <p className="text-gray-400 mt-6 leading-relaxed text-lg">
                  You can contribute more than £1 if you want to support the
                  experiment, but money doesn't buy status.
                </p>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                  <p className="text-2xl font-bold">£1</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Same status
                  </p>
                </div>

                <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                  <p className="text-2xl font-bold">£10+</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Same status
                  </p>
                </div>

                <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                  <p className="text-2xl font-bold">VIP?</p>
                  <p className="text-sm text-gray-500 mt-1">
                    No special tier
                  </p>
                </div>

                <div className="rounded-2xl bg-black/40 border border-white/10 p-5">
                  <p className="text-2xl font-bold">Equal</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Every supporter
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* WALL PREVIEW */}
        <section className="max-w-6xl mx-auto px-6 pb-24">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">

            <div>

              <p className="text-purple-400 text-sm font-bold uppercase tracking-widest">
                The Wall
              </p>

              <h2 className="text-4xl md:text-5xl font-black mt-3">
                A million places.
              </h2>

            </div>

            <Link
              href="/wall"
              className="text-cyan-400 font-bold hover:text-cyan-300 transition"
            >
              View full wall →
            </Link>

          </div>

          <div className="rounded-[2rem] border border-white/10 bg-zinc-900/70 overflow-hidden">

            <div className="px-6 py-5 border-b border-white/5 flex justify-between text-xs uppercase tracking-widest text-gray-500">
              <span>Supporter</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-white/5">

              <div className="flex justify-between items-center p-5 hover:bg-white/[0.03] transition">
                <div className="flex items-center gap-4">
                  <span className="text-cyan-400 font-mono">
                    #000001
                  </span>
                  <span className="text-gray-500">
                    Available
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  WAITING
                </span>
              </div>

              <div className="flex justify-between items-center p-5 hover:bg-white/[0.03] transition">
                <div className="flex items-center gap-4">
                  <span className="text-cyan-400 font-mono">
                    #000002
                  </span>
                  <span className="text-gray-500">
                    Available
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  WAITING
                </span>
              </div>

              <div className="flex justify-between items-center p-5 hover:bg-white/[0.03] transition">
                <div className="flex items-center gap-4">
                  <span className="text-cyan-400 font-mono">
                    #000003
                  </span>
                  <span className="text-gray-500">
                    Available
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  WAITING
                </span>
              </div>

            </div>

            <div className="p-5 border-t border-white/5 text-center">
              <Link
                href="/wall"
                className="text-sm font-bold text-gray-400 hover:text-white transition"
              >
                Explore all available places →
              </Link>
            </div>

          </div>

        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-4xl mx-auto px-6 pb-24"
        >

          <div className="text-center mb-12">

            <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">
              Questions
            </p>

            <h2 className="text-4xl md:text-5xl font-black mt-3">
              Frequently Asked Questions
            </h2>

          </div>

          <div className="space-y-4">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-bold text-lg">
                What do I receive?
              </h3>

              <p className="text-gray-400 mt-3 leading-relaxed">
                You receive a supporter number and a permanent place on the
                Million Names wall.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-bold text-lg">
                How much does it cost?
              </h3>

              <p className="text-gray-400 mt-3 leading-relaxed">
                The minimum contribution is £1. You can contribute more if
                you wish, but every supporter receives the same status.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-bold text-lg">
                Does paying more give me a better position?
              </h3>

              <p className="text-gray-400 mt-3 leading-relaxed">
                No. There are no VIP places, rankings, larger names or
                special positions based on how much someone contributes.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-bold text-lg">
                Is this a charity?
              </h3>

              <p className="text-gray-400 mt-3 leading-relaxed">
                No. Million Names is an internet experiment and public
                community project.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-bold text-lg">
                Is this an investment?
              </h3>

              <p className="text-gray-400 mt-3 leading-relaxed">
                No. Contributions do not represent an investment or ownership
                in the project.
              </p>
            </div>

          </div>

        </section>

        {/* FINAL CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-24">

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 text-center p-10 md:p-16">

            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5" />

            <div className="relative">

              <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest">
                Be There From The Beginning
              </p>

              <h2 className="text-4xl md:text-6xl font-black mt-4">
                Your name could be one of the first.
              </h2>

              <p className="text-gray-400 mt-5 max-w-xl mx-auto">
                One million places. One permanent wall.
                <br />
                The experiment starts with you.
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

                <div className="font-black text-lg">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    MILLION NAMES
                  </span>
                </div>

                <p className="text-gray-600 text-sm mt-2">
                  One million strangers. One permanent wall.
                </p>

              </div>

              <div className="flex gap-6 text-sm text-gray-500">

                <Link
                  href="/wall"
                  className="hover:text-white transition"
                >
                  The Wall
                </Link>

                <a
                  href="#how-it-works"
                  className="hover:text-white transition"
                >
                  How It Works
                </a>

                <a
                  href="#faq"
                  className="hover:text-white transition"
                >
                  FAQ
                </a>

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