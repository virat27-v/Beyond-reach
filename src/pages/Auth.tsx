import React, { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { navigate, parseRoute, useHashRoute } from "../lib/router";
import { useStore } from "../lib/store";
import { Btn, Field, Input, Logo, Spinner, btnCls } from "../components/ui";

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.58v2.97h3.88c2.27-2.09 3.57-5.17 3.57-8.74Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-2.97c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.96H1.28v3.07A11.99 11.99 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.31A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.58.38-2.31V6.62H1.28a12 12 0 0 0 0 10.76l4.01-3.07Z" />
      <path fill="#EA4335" d="M12 4.73c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 11.99 11.99 0 0 0 1.28 6.62l4.01 3.07C6.23 6.84 8.88 4.73 12 4.73Z" />
    </svg>
  );
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
              ["24–48h", "To go live"],
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

function useNext(): string {
  const hash = useHashRoute();
  const { query } = parseRoute(hash);
  return query.get("next") || "/dashboard";
}

function divider() {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs text-faint">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/* --------------------------------- Login ----------------------------- */

export function LoginPage() {
  const { login, googleLogin, toast } = useStore();
  const next = useNext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!emailOk(email)) return setError("Please enter a valid email address.");
    if (!password) return setError("Please enter your password.");
    setBusy(true);
    window.setTimeout(() => {
      const res = login(email, password);
      setBusy(false);
      if (!res.ok) return setError(res.error || "Login failed. Please try again.");
      toast("Welcome back", "You're signed in to Beyond Reach.");
      navigate(next);
    }, 650);
  };

  const doGoogle = () => {
    setGoogleBusy(true);
    window.setTimeout(() => {
      googleLogin();
      setGoogleBusy(false);
      toast("Signed in with Google", "Demo sign-in — connect Google OAuth to enable in production.");
      navigate(next);
    }, 800);
  };

  const fillDemo = () => {
    setEmail("demo@beyondreach.agency");
    setPassword("demo1234");
    setError("");
  };

  return (
    <AuthShell title="Welcome back" sub="Log in to manage your campaigns and view performance.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Email address" error={undefined}>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <Input type="email" placeholder="you@business.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" autoComplete="email" style={{ paddingLeft: 40 }} />
          </div>
        </Field>
        <Field label="Password">
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
            <Input
              type={showPw ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingLeft: 40, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink cursor-pointer"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-end">
          <button type="button" onClick={() => navigate("/forgot")} className="text-[13px] font-medium text-sub transition-colors hover:text-ink cursor-pointer">
            Forgot password?
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700 anim-fade">{error}</p>
        )}

        <Btn type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Spinner size={17} /> : <>Log in <ArrowRight size={16} /></>}
        </Btn>

        {divider()}

        <button type="button" onClick={doGoogle} disabled={googleBusy} className={btnCls("secondary", "lg", "w-full")}>
          {googleBusy ? <Spinner size={17} /> : <GoogleG />}
          Continue with Google
        </button>

        <button
          type="button"
          onClick={fillDemo}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-mist px-4 py-3 text-[13px] text-sub transition-colors hover:text-ink cursor-pointer"
        >
          <Sparkles size={15} />
          Demo account — demo@beyondreach.agency · demo1234
          <span className="font-medium text-ink underline underline-offset-2">Autofill</span>
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-sub">
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
  const { register, googleLogin, toast } = useStore();
  const next = useNext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Please enter your full name.";
    if (!emailOk(email)) errs.email = "Please enter a valid email address.";
    if (phone && !/^[+]?[\d\s-]{10,14}$/.test(phone)) errs.phone = "Please enter a valid phone number.";
    if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!terms) errs.terms = "Please accept the Terms & Conditions to continue.";
    setErrors(errs);
    setFormError("");
    if (Object.keys(errs).length) return;
    setBusy(true);
    window.setTimeout(() => {
      const res = register(name, email, password, phone);
      setBusy(false);
      if (!res.ok) return setFormError(res.error || "Could not create your account.");
      toast("Account created", "Welcome to Beyond Reach. Let's launch your first campaign.");
      navigate(next === "/dashboard" ? "/book" : next);
    }, 700);
  };

  const doGoogle = () => {
    googleLogin();
    toast("Signed in with Google", "Demo sign-in — connect Google OAuth to enable in production.");
    navigate(next === "/dashboard" ? "/book" : next);
  };

  return (
    <AuthShell title="Create your account" sub="Start advertising in minutes. No credit card required to sign up.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Full name" error={errors.name}>
          <Input placeholder="e.g. Aarav Kapoor" value={name} onChange={(e) => setName(e.target.value)} error={!!errors.name} autoComplete="name" />
        </Field>
        <Field label="Email address" error={errors.email}>
          <Input type="email" placeholder="you@business.com" value={email} onChange={(e) => setEmail(e.target.value)} error={!!errors.email} autoComplete="email" />
        </Field>
        <Field label="Phone number" optional error={errors.phone}>
          <Input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} error={!!errors.phone} autoComplete="tel" />
        </Field>
        <Field label="Password" error={errors.password} hint="6+ characters">
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              autoComplete="new-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-ink cursor-pointer"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-sub">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#111111]"
          />
          <span>
            I agree to the{" "}
            <button type="button" onClick={() => navigate("/terms")} className="font-medium text-ink underline underline-offset-2">
              Terms &amp; Conditions
            </button>{" "}
            and{" "}
            <button type="button" onClick={() => navigate("/privacy")} className="font-medium text-ink underline underline-offset-2">
              Privacy Policy
            </button>
            .
          </span>
        </label>
        {errors.terms && <p className="-mt-2 text-xs text-red-600 anim-fade">{errors.terms}</p>}

        {formError && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-700 anim-fade">{formError}</p>}

        <Btn type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Spinner size={17} /> : <>Create Account <ArrowRight size={16} /></>}
        </Btn>

        {divider()}

        <button type="button" onClick={doGoogle} className={btnCls("secondary", "lg", "w-full")}>
          <GoogleG /> Sign up with Google
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-sub">
        Already have an account?{" "}
        <button onClick={() => navigate(`/login?next=${encodeURIComponent(next)}`)} className="font-medium text-ink u-link cursor-pointer">
          Log in
        </button>
      </p>
    </AuthShell>
  );
}

/* ------------------------------- Forgot ------------------------------- */

export function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk(email)) return setError("Please enter a valid email address.");
    setError("");
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setSent(true);
    }, 700);
  };

  return (
    <AuthShell title="Reset your password" sub="We'll email you a secure link to reset your password.">
      {sent ? (
        <div className="anim-rise">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={26} />
          </div>
          <h2 className="mt-6 text-xl font-semibold tracking-tight">Check your inbox</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-sub">
            If an account exists for <span className="font-medium text-ink">{email}</span>, we've sent a password reset link. The
            link expires in 30 minutes.
          </p>
          <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-xs leading-relaxed text-sub">
            Demo mode: password reset emails are sent once email delivery is configured in production.
          </p>
          <button onClick={() => navigate("/login")} className={btnCls("primary", "lg", "mt-6 w-full")}>
            Back to Log in
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Field label="Email address" error={error}>
            <Input type="email" placeholder="you@business.com" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} autoComplete="email" />
          </Field>
          <Btn type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? <Spinner size={17} /> : "Send Reset Link"}
          </Btn>
          <button type="button" onClick={() => navigate("/login")} className="mt-1 inline-flex items-center justify-center gap-1.5 text-sm text-sub transition-colors hover:text-ink cursor-pointer">
            <ArrowLeft size={15} /> Back to Log in
          </button>
        </form>
      )}
    </AuthShell>
  );
}
