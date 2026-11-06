import React from "react";
import { navigate } from "../lib/router";
import { Logo, btnCls } from "../components/ui";
import { GoogleSignInButton } from "../components/GoogleSignin";

export function AuthShell({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex min-h-screen bg-white anim-fade">
      {/* brand panel */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <svg className="pointer-events-none absolute -right-40 -top-40 opacity-[0.08]" width="700" height="700" viewBox="0 0 700 700" fill="none" aria-hidden="true">
          {[120, 210, 300].map((r) => (
            <circle key={r} cx="350" cy="350" r={r} stroke="#fff" strokeWidth="1" />
          ))}
        </svg>
        <button onClick={() => navigate("/")} className="relative cursor-pointer w-fit" aria-label="Back to home">
          <Logo inverted />
        </button>
        <div className="relative">
          <p className="text-4xl font-semibold leading-[1.1] tracking-[-0.03em]">
            Your Business.
            <br />
            <span className="font-light italic text-white/60">Beyond Reach.</span>
          </p>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/55">
            Professional digital advertising across Instagram, Facebook, YouTube and Google — with reporting you can actually understand.
          </p>
          <div className="mt-10 flex gap-10 border-t border-white/10 pt-8">
            {[
              ["₹399", "To get started"],
              ["24–48h", "Typical review"],
              ["4", "Ad platforms"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-semibold tracking-tight">{v}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/40">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* form side */}
      <div className="relative flex flex-1 flex-col">
        <div className="flex h-[68px] items-center justify-between px-5 md:px-10">
          <button onClick={() => navigate("/")} className="lg:hidden cursor-pointer" aria-label="Back to home">
            <Logo />
          </button>
          <span className="hidden lg:block" />
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-sub transition-colors hover:text-ink cursor-pointer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>{" "}
            Back to website
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-16 pt-4">
          <div className="w-full max-w-[400px] anim-rise">
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
            <p className="mt-2 text-[15px] text-sub">{sub}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Login ----------------------------- */

export function LoginPage() {
  return (
    <AuthShell
      title="Welcome to Beyond Reach"
      sub="Sign in with Google to open your dashboard. New here? The same button creates your account."
    >
      <GoogleSignInButton />
      <button onClick={() => navigate("/book")} className={`${btnCls("secondary", "lg", "mt-4 w-full")}`}>
        Not ready to sign in? Book a campaign
      </button>
      <p className="mt-6 text-center text-xs leading-relaxed text-faint">
        Your Google account is verified directly with Google on every visit. We never ask for or store your password.
      </p>
    </AuthShell>
  );
}
