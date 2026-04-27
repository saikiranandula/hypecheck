import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? "/check" : "/login";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Sticky Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
            HypeCheck{" "}
            <span className="font-normal text-slate-400">by NullHype AI</span>
          </span>
          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <>
                <Link
                  href="/reports"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  My reports
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                Sign in
              </Link>
            )}
            <Link
              href={ctaHref}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
            >
              Check My Idea
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="bg-slate-950 px-6 py-28 text-center sm:py-36">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
              AI-powered startup reality check
            </div>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stop building things{" "}
              <span className="text-orange-400">nobody wants.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              HypeCheck runs an AI-powered reality check on your startup idea —
              market size, competitors, demand signals, and a brutal honest
              verdict. In 60 seconds.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                href={ctaHref}
                className="inline-flex flex-col items-center rounded-xl bg-orange-500 px-10 py-4 shadow-lg shadow-orange-900/40 transition-colors hover:bg-orange-400"
              >
                <span className="text-base font-bold text-white">Check My Idea</span>
                <span className="text-xs font-normal text-orange-100/80">$5 per report</span>
              </Link>
              <p className="text-sm text-slate-500">
                No subscription required. Pay once, get your verdict.
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────────── */}
        <section className="border-y border-slate-800 bg-slate-900 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
              How it works
            </h2>
            <ol className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  text: "Describe your idea in plain language",
                },
                {
                  step: "2",
                  text: "HypeCheck analyses market reality, competitors, and demand signals",
                },
                {
                  step: "3",
                  text: "Get a structured report with a Hype Score and a clear verdict",
                },
              ].map(({ step, text }) => (
                <li key={step} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <span className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                    {step}
                  </span>
                  <p className="text-slate-300 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Features Grid ──────────────────────────────────────────── */}
        <section className="bg-slate-950 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
              What you get
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "📊",
                  title: "Hype Score",
                  desc: "0–100 viability verdict so you know exactly where your idea stands.",
                },
                {
                  icon: "🔍",
                  title: "Competitor Teardown",
                  desc: "Who exists, what they miss, and where your opening is.",
                },
                {
                  icon: "📈",
                  title: "Market Size",
                  desc: "TAM estimate grounded in real data, not wishful thinking.",
                },
                {
                  icon: "💬",
                  title: "Demand Signals",
                  desc: "Real Reddit and X mentions of the problem you're solving.",
                },
                {
                  icon: "⚠️",
                  title: "Execution Risk",
                  desc: "Landmines flagged before you build, not after you ship.",
                },
                {
                  icon: "🔗",
                  title: "Shareable Report",
                  desc: "Send it to co-founders or investors with one link.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-700"
                >
                  <div className="mb-3 text-2xl">{icon}</div>
                  <h3 className="mb-2 font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ────────────────────────────────────────────────── */}
        <section className="border-t border-slate-800 bg-slate-900 px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Simple pricing
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Pay as you go */}
              <div className="flex flex-col rounded-xl border border-slate-700 bg-slate-800 p-8">
                <p className="mb-1 text-sm font-medium uppercase tracking-widest text-slate-400">
                  Pay as you go
                </p>
                <div className="mb-6 mt-3 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">$5</span>
                  <span className="mb-1 text-slate-400">/ report</span>
                </div>
                <ul className="mb-8 flex flex-col gap-3 text-sm text-slate-300">
                  {[
                    "Full HypeCheck report",
                    "Hype Score + verdict",
                    "Shareable link",
                    "No commitment",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-orange-400">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={ctaHref}
                  className="mt-auto rounded-lg border border-orange-500 px-5 py-3 text-center text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500/10"
                >
                  Get started
                </Link>
              </div>

              {/* Unlimited — highlighted */}
              <div className="relative flex flex-col rounded-xl border border-orange-500 bg-slate-800 p-8 shadow-xl shadow-orange-900/30">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </div>
                <p className="mb-1 text-sm font-medium uppercase tracking-widest text-orange-400">
                  Unlimited
                </p>
                <div className="mb-6 mt-3 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">$15</span>
                  <span className="mb-1 text-slate-400">/ month</span>
                </div>
                <ul className="mb-8 flex flex-col gap-3 text-sm text-slate-300">
                  {[
                    "Unlimited reports",
                    "Everything in Pay as you go",
                    "Priority processing",
                    "Early access to new features",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-orange-400">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={ctaHref}
                  className="mt-auto rounded-lg bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                >
                  Start unlimited
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-8 text-center text-sm text-slate-500">
        Built by NullHype AI · Powered by Claude ·{" "}
        <a
          href="https://github.com/nullhypeai/hypecheck"
          className="underline underline-offset-2 transition-colors hover:text-slate-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open source on GitHub
        </a>
      </footer>
    </div>
  );
}
