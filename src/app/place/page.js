"use client";

import Link from "next/link";
import GraffitiName from "../../components/GraffitiName";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const primary = "inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300";
const secondary = "inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300";

function Frame({ children }) {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:py-14" style={{ backgroundImage: "radial-gradient(ellipse at top left, rgba(6,182,212,0.12), transparent 55%), radial-gradient(ellipse at bottom right, rgba(147,51,234,0.10), transparent 55%)" }}>
      <div className="mx-auto w-full max-w-xl">
        <Link href="/" className="mb-10 inline-block py-2 text-sm text-gray-400 hover:text-white">← Back to home</Link>
        {children}
        <div className="mt-8 text-center">
          <Link href="/wall" className={secondary}>Explore the wall →</Link>
          <p className="mt-7 text-xs text-gray-500">One million names. One wall. Everyone equal.</p>
        </div>
      </div>
    </main>
  );
}

function PlaceContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const number = params.get("number");
  const isConfirmation = Boolean(sessionId);
  const [result, setResult] = useState({ status: "loading" });
  const [retry, setRetry] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    let stopped = false;
    let timer;
    let controller;
    let attempts = 0;
    setResult({ status: "loading" });
    setShareUrl("");
    setShareMessage("");

    if ((!sessionId && !number) || (sessionId && number)) {
      setResult({ status: "error", message: "Open your checkout confirmation link or a shared supporter link to view a place." });
      return;
    }

    async function check() {
      attempts += 1;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const query = new URLSearchParams(sessionId ? { session_id: sessionId } : { number });
        const response = await fetch(`/api/place?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "We could not load this place.");
        if (stopped) return;
        setResult(data);

        if (data.status === "ready") {
          // Share only the public number, never the private checkout URL.
          const publicUrl = new URL("/place", window.location.origin);
          publicUrl.searchParams.set("number", String(data.supporter.number));
          setShareUrl(publicUrl.toString());
        } else if (["processing", "pending_payment"].includes(data.status)) {
          if (attempts < 15) timer = setTimeout(check, 2000);
          else setResult({ ...data, paused: true });
        }
      } catch (error) {
        if (!stopped) setResult({
          status: "error",
          message: error.name === "AbortError"
            ? "The connection took too long. Please check again."
            : error.message || "We could not load this place.",
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    check();
    return () => { stopped = true; clearTimeout(timer); controller?.abort(); };
  }, [sessionId, number, retry]);

  const ready = result.status === "ready";
  const formatted = ready ? `#${String(result.supporter.number).padStart(6, "0")}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Link copied. Paste it into a message to your friend.");
    } catch {
      setShareMessage("Select and copy the link below to send it to a friend.");
    }
  }

  async function sharePlace() {
    setShareMessage("");
    if (!navigator.share) { await copyLink(); return; }
    try {
      await navigator.share({
        title: `Million Names · ${formatted}`,
        text: isConfirmation
          ? `I'm ${formatted} on Million Names! Here's my place on the wall.`
          : `Take a look at ${formatted} on Million Names.`,
        url: shareUrl,
      });
    } catch (error) {
      if (error.name !== "AbortError") setShareMessage("Sharing is unavailable here. Use Copy link below.");
    }
  }

  let heading = "Finding your place…";
  let message = "This should only take a moment.";
  if (result.status === "processing") {
    heading = "Payment received. Thank you!";
    message = result.paused
      ? "Your number is still being confirmed. You do not need to pay again. Keep this page and check again shortly."
      : "We're waiting for your final supporter number. This page will update automatically.";
  } else if (result.status === "pending_payment") {
    heading = "Your payment is processing";
    message = "Your payment provider hasn't confirmed it yet. Some payment methods take longer. You do not need to submit another payment.";
  } else if (result.status === "unpaid") {
    heading = "Payment isn't confirmed";
    message = "This checkout has not completed a payment. If you believe you paid, check again before starting another checkout.";
  } else if (result.status === "error") {
    heading = "We couldn't load this place";
    message = result.message;
  }

  return (
    <Frame>
      {ready ? (
        <>
          <header className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{isConfirmation ? "You're part of the experiment" : "A place on Million Names"}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{isConfirmation ? "THANK YOU." : "ONE OF A MILLION."}</h1>
            <p className="mt-4 text-gray-400">{isConfirmation ? "Your name is on the wall. This is your place in the story." : "One name. One number. Part of something built together."}</p>
          </header>
          <section aria-label="Supporter place" className="paint-preview brick-surface text-center">
            <p className="px-6 pt-6 text-xs uppercase tracking-widest text-gray-200">{isConfirmation ? "Your mark on the wall" : "One of a million"}</p>
            <GraffitiName
              name={result.supporter.displayName}
              number={result.supporter.number}
              paintStyle={result.supporter.paintStyle}
              paintColour={result.supporter.paintColour}
              status="Confirmed · On the wall"
              heading
            />
          </section>
          <Link href={`/wall?number=${result.supporter.number}#wall-directory`} className={`${primary} mt-5 w-full`}>
            {isConfirmation ? "View my place on the wall →" : "View this place on the wall →"}
          </Link>
          <section aria-label="Share this place" className="mt-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={sharePlace} disabled={!shareUrl} className={`${primary} disabled:opacity-50`}>Share {isConfirmation ? "my" : "this"} number ↗</button>
              <button type="button" onClick={copyLink} disabled={!shareUrl} className={`${secondary} disabled:opacity-50`}>Copy link</button>
            </div>
            <label htmlFor="place-link" className="mt-6 block text-sm text-gray-400">{isConfirmation ? "Save your link or send it to a friend" : "Public link to this place"}</label>
            <input id="place-link" type="text" readOnly value={shareUrl} onFocus={(event) => event.target.select()} className="mt-2 w-full rounded-xl border border-white/15 bg-black p-3 text-sm text-gray-300 focus:outline-cyan-300" />
            <p role="status" className="mt-3 text-sm text-cyan-200">{shareMessage}</p>
          </section>
          {!isConfirmation && <Link href="/claim" className={`${primary} mt-6 w-full`}>Claim your own place →</Link>}
        </>
      ) : (
        <section aria-live="polite" className="rounded-3xl border border-white/10 bg-zinc-900 p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Million Names</p>
          <h1 className="mt-5 text-3xl font-black">{heading}</h1>
          <p className="mt-5 leading-relaxed text-gray-400">{message}</p>
          {(result.status === "error" || result.status === "unpaid" || result.paused) && (
            <button type="button" onClick={() => setRetry((value) => value + 1)} className={`${primary} mt-6`}>Check again</button>
          )}
        </section>
      )}
    </Frame>
  );
}

export default function PlacePage() {
  return (
    <Suspense fallback={<Frame><p role="status" className="text-center text-gray-300">Loading your place…</p></Frame>}>
      <PlaceContent />
    </Suspense>
  );
}
