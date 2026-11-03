import React from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Info, Lock } from "lucide-react";
import { navigate, parseRoute, useHashRoute } from "../lib/router";
import { Logo, btnCls } from "../components/ui";
import GoogleSignIn, { GoogleAuthHeader } from "../components/googleSignIn";

/* ------------------------------------------------------------------ */
/*  Frontend-only authentication with Firebase Authentication.         */
/*  The ONLY sign-in mechanism is Google via GoogleAuthProvider.       */
/*  No email/password is accepted here, and no fake account exists.    */
/* ------------------------------------------------------------------ */

function useNext(fallback = "/dashboard"): string {
  const hash = useHashRoute();
  const { query } = parseRoute(hash);
  const next = query.get("next") || fallback;
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

function AuthShell({ children, title, sub }: { children: React.ReactNode; title: string; sub: string }) {
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
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm text-sub transition-colors hover:text-ink cursor-pointer"
          >
            <ArrowLeft size={15} /> Back to website
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
  const next = useNext();
  const hash = useHashRoute();
  const { query } = parseRoute(hash);
  const oauthError = query.get("error");

  return (
    <AuthShell title="Welcome back" sub="Sign in securely with Google to access your Beyond Reach dashboard.">
      <GoogleAuthHeader />

      {oauthError && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900 anim-fade">
          {oauthError === "session_expired"
            ? "Your Google session expired. Please sign in again."
            : "Google sign-in did not complete. Please try again."}
        </p>
      )}

      <GoogleSignIn next={next} mode="login" />

      <div className="mt-7 rounded-2xl bg-mist px-4 py-3.5 text-[12px] leading-relaxed text-sub">
        <p className="flex items-start gap-2">
          <Lock size={14} className="mt-px shrink-0" />
          Only Google-authenticated sign-in is available. Email addresses typed anywhere on this site are never treated as a
          verified login.
        </p>
      </div>

      <p className="mt-7 text-center text-sm text-sub">
        New to Beyond Reach?{" "}
        <button onClick={() => navigate(`/register?next=${encodeURIComponent(next)}`)} className="font-medium text-ink u-link cursor-pointer">
          Create an account
        </button>
      </p>
    </AuthShell>
  );
}

/* -------------------------------- Register ---------------------------- */

export function RegisterPage() {
  const next = useNext("/book");
  return (
    <AuthShell title="Create your account" sub="One tap with Google. No forms, no passwords to remember.">
      <GoogleAuthHeader />
      <GoogleSignIn next={next} mode="register" />
      <p className="mt-6 text-center text-[11px] leading-relaxed text-faint">
        By continuing with Google you agree to our{" "}
        <button onClick={() => navigate("/terms")} className="font-medium text-ink underline underline-offset-2 cursor-pointer">
          Terms
        </button>{" "}
        and{" "}
        <button onClick={() => navigate("/privacy")} className="font-medium text-ink underline underline-offset-2 cursor-pointer">
          Privacy Policy
        </button>
        .
      </p>
      <p className="mt-7 text-center text-sm text-sub">
        Already have an account?{" "}
        <button onClick={() => navigate(`/login?next=${encodeURIComponent(next)}`)} className="font-medium text-ink u-link cursor-pointer">
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}

/* ------------------------- Password guidance ------------------------- */

function GooglePasswordHelp({ title }: { title: string }) {
  return (
    <AuthShell
      title={title}
      sub="Beyond Reach accounts created with Google use Google's own secure account recovery."
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mist text-sub">
        <Lock size={24} />
      </div>
      <p className="mt-5 text-[15px] leading-relaxed text-sub">
        There is no separate Beyond Reach password to reset. Your credentials are managed entirely by Google. To recover or change
        your password, use your Google Account.
      </p>
      <div className="mt-5 rounded-xl bg-mist px-4 py-3.5 text-[13px] leading-relaxed text-sub">
        This website is a frontend-only deployment: it holds no accounts, no passwords and no database.
      </div>
      <a
        href="https://accounts.google.com/signin/recovery"
        target="_blank"
        rel="noreferrer"
        className={btnCls("primary", "lg", "mt-6 w-full")}
      >
        Open Google Account recovery <ExternalLink size={15} />
      </a>
      <button
        onClick={() => navigate("/login")}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-sm text-sub transition-colors hover:text-ink cursor-pointer"
      >
        <ArrowLeft size={15} /> Back to sign in
      </button>
    </AuthShell>
  );
}

export function ForgotPage() {
  return <GooglePasswordHelp title="Account recovery" />;
}

export function ResetPage() {
  return <GooglePasswordHelp title="Reset your password" />;
}

/* Kept for deep links from older mails. */
export function AuthInfoNote() {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-3 text-xs leading-relaxed text-sub">
      <Info size={14} className="mt-px shrink-0" />
      Beyond Reach uses Google Sign-In. Your email address alone is never treated as authentication.
      <ArrowRight size={12} className="ml-auto mt-0.5 shrink-0 text-faint" />
    </p>
  );
}
