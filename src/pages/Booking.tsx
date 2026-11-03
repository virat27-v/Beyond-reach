import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { navigate, parseRoute, useHashRoute } from "../lib/router";
import { useStore } from "../lib/store";
import {
  CATEGORIES,
  DISCLAIMER,
  LANGUAGES,
  PACKAGE,
  PLATFORMS,
  PLATFORM_ORDER,
  PlatformId,
  SUPPORT_EMAIL,
  fmtINR,
} from "../lib/data";
import { Field, Input, PlatformChip, Select, Textarea, btnCls } from "../components/ui";
import { PublicShell } from "../components/chrome";

/* ------------------------------------------------------------------ */
/*  Campaign brief page — frontend only.                               */
/*  No payment is taken, no order is created and no campaign is        */
/*  claimed to be running. The brief is handed to the user's own email */
/*  app so they can send it to our team.                               */
/* ------------------------------------------------------------------ */

interface Brief {
  businessName: string;
  category: string;
  contactName: string;
  phone: string;
  campaignName: string;
  product: string;
  description: string;
  location: string;
  audience: string;
  language: string;
  platforms: PlatformId[];
}

const EMPTY: Brief = {
  businessName: "",
  category: "",
  contactName: "",
  phone: "",
  campaignName: "",
  product: "",
  description: "",
  location: "",
  audience: "",
  language: "English",
  platforms: [],
};

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function BookingPage() {
  const { user, toast } = useStore();
  const hash = useHashRoute();
  const { query } = parseRoute(hash);
  const preset = query.get("platform") as PlatformId | null;

  const initial = useMemo<Brief>(
    () => ({
      ...EMPTY,
      contactName: user?.name || "",
      businessName: "",
      platforms: preset && PLATFORM_ORDER.includes(preset) ? [preset] : [],
    }),
    [user, preset]
  );

  const [brief, setBrief] = useState<Brief>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [opened, setOpened] = useState(false);
  const [mailto, setMailto] = useState("");
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState("");

  const set = <K extends keyof Brief>(key: K, value: Brief[K]) => {
    setBrief((b) => ({ ...b, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const togglePlatform = (p: PlatformId) => {
    setBrief((b) => ({
      ...b,
      platforms: b.platforms.includes(p) ? b.platforms.filter((x) => x !== p) : [...b.platforms, p],
    }));
    setErrors((e) => ({ ...e, platforms: "" }));
  };

  const buildMailto = () => {
    const subject = `Campaign brief — ${brief.businessName || "Beyond Reach"}${brief.campaignName ? ` — ${brief.campaignName}` : ""}`;
    const lines = [
      "Hello Beyond Reach,",
      "",
      "I'd like to discuss the Starter Reach package (₹399). Here is my campaign brief:",
      "",
      `Business: ${brief.businessName}`,
      `Category: ${brief.category}`,
      `Contact: ${brief.contactName}`,
      `Phone: ${brief.phone}`,
      `Account email (Google verified): ${user?.email || ""}`,
      "",
      `Campaign: ${brief.campaignName}`,
      `Product / service: ${brief.product}`,
      `Description: ${brief.description}`,
      "",
      `Location: ${brief.location}`,
      `Audience: ${brief.audience}`,
      `Language: ${brief.language}`,
      `Platforms: ${brief.platforms.map((p) => PLATFORMS[p].name).join(", ")}`,
      "",
      "Please let me know the next steps. I understand no payment has been taken and no campaign is running yet.",
      "",
      "Thank you.",
    ];
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (brief.businessName.trim().length < 2) errs.businessName = "Please enter your business name.";
    if (!brief.category) errs.category = "Please select a category.";
    if (brief.contactName.trim().length < 2) errs.contactName = "Please enter a contact name.";
    if (!/^[+]?[\d\s-]{10,15}$/.test(brief.phone)) errs.phone = "Please enter a valid phone number.";
    if (brief.campaignName.trim().length < 3) errs.campaignName = "Give your campaign a name (min. 3 characters).";
    if (brief.product.trim().length < 2) errs.product = "What product or service are you promoting?";
    if (brief.description.trim().length < 10) errs.description = "Please add a short description (min. 10 characters).";
    if (brief.location.trim().length < 2) errs.location = "Where should your ads run?";
    if (brief.audience.trim().length < 3) errs.audience = "Describe who should see your ads.";
    if (brief.platforms.length === 0) errs.platforms = "Please select at least one platform.";
    setErrors(errs);
    setAgreeError("");
    if (!agree) {
      setAgreeError("Please confirm you understand no payment is taken on this site.");
      if (!Object.keys(errs).length) return;
    }
    if (Object.keys(errs).length) {
      toast("A few details are missing", "Please review the highlighted fields.");
      return;
    }
    if (!agree) return;
    const link = buildMailto();
    setMailto(link);
    setOpened(true);
    window.location.href = link;
    toast("Email draft created", "Send it from your email app — nothing is transmitted from this page.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- sign-in gate (Google identity) ---------- */
  if (!user || !emailOk(user.email)) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-xl px-5 pb-28 pt-40 text-center anim-fade">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-line bg-mist">
            <Lock size={24} className="text-sub" />
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em]">Sign in to continue</h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-sub">
            Sign in with Google so your campaign brief includes a verified email address. No password is created or stored on this
            site.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => navigate("/login?next=/book")} className={btnCls("primary", "lg")}>
              Sign in with Google <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate("/pricing")} className={btnCls("secondary", "lg")}>
              View Pricing
            </button>
          </div>
          <p className="mt-6 text-xs text-faint">Google authentication happens in Google's own secure popup.</p>
        </div>
      </PublicShell>
    );
  }

  if (opened && mailto) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-2xl px-5 pb-28 pt-36 text-center md:pt-44 anim-fade">
          <div className="anim-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mist">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
              <Mail size={24} />
            </span>
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em]">Your brief is ready to send</h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-sub">
            Your email app should have opened with the brief pre-filled. <span className="font-medium text-ink">Nothing has been
            sent yet</span> — press send in your email app to reach our team. No payment has been taken and no campaign is running.
          </p>

          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-line bg-white p-7 text-left shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Brief summary</p>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-sub">Business</dt><dd className="font-medium text-ink text-right">{brief.businessName}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-sub">Campaign</dt><dd className="font-medium text-ink text-right">{brief.campaignName}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-sub">Platforms</dt><dd className="font-medium text-ink text-right">{brief.platforms.map((p) => PLATFORMS[p].name).join(", ")}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-sub">Package</dt><dd className="font-medium text-ink text-right">{PACKAGE.name} · {fmtINR(PACKAGE.price)}</dd></div>
            </dl>
            <div className="my-5 h-px bg-line" />
            <p className="text-xs leading-relaxed text-faint">
              Payment is not processed on this site. If and when payments are enabled, they will require secure server-side
              verification — never a frontend-only confirmation.
            </p>
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={mailto} className={btnCls("primary", "lg")}>
              <Mail size={16} /> Open email draft again
            </a>
            <button onClick={() => navigate("/dashboard")} className={btnCls("secondary", "lg")}>
              Go to Dashboard
            </button>
          </div>
          <button
            onClick={() => {
              setOpened(false);
              setBrief(initial);
            }}
            className="mt-5 text-xs text-faint underline underline-offset-2 hover:text-sub cursor-pointer"
          >
            Write another brief
          </button>
        </div>
      </PublicShell>
    );
  }

  const summaryRow = (label: string, value: string) => (
    <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
      <span className="shrink-0 text-sub">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl px-5 pb-28 pt-28 md:px-8 md:pt-36 anim-fade">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">Start a Campaign</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">Tell us what you're advertising.</h1>
          <p className="mt-4 text-base leading-relaxed text-sub">
            Share your brief and our team will continue by email. You're signed in as{" "}
            <span className="font-medium text-ink">{user.email}</span>.
          </p>
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[13px] leading-relaxed text-amber-900">
            <span className="font-semibold">Frontend-only preview.</span> This site does not process payments. Nothing is charged
            here and no campaign is created or running. Submitting this form opens an email draft in your own email app.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={submit} className="rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-9" noValidate>
            <h2 className="text-xl font-semibold tracking-tight">Campaign brief</h2>
            <p className="mt-1.5 text-sm text-sub">A few details so our team can respond with the right next steps.</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field label="Business Name" error={errors.businessName}>
                <Input placeholder="e.g. Sharma Jewellers" value={brief.businessName} onChange={(e) => set("businessName", e.target.value)} error={!!errors.businessName} />
              </Field>
              <Field label="Business Category" error={errors.category}>
                <Select value={brief.category} onChange={(e) => set("category", e.target.value)} error={!!errors.category}>
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Contact Name" error={errors.contactName}>
                <Input placeholder="Your full name" value={brief.contactName} onChange={(e) => set("contactName", e.target.value)} error={!!errors.contactName} />
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                <Input placeholder="+91 98765 43210" value={brief.phone} onChange={(e) => set("phone", e.target.value)} error={!!errors.phone} />
              </Field>
            </div>

            <div className="my-8 h-px bg-line" />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Campaign Name" error={errors.campaignName}>
                <Input placeholder="e.g. Festive Sale 2026" value={brief.campaignName} onChange={(e) => set("campaignName", e.target.value)} error={!!errors.campaignName} />
              </Field>
              <Field label="Product or Service" error={errors.product}>
                <Input placeholder="e.g. Handcrafted gold jewellery" value={brief.product} onChange={(e) => set("product", e.target.value)} error={!!errors.product} />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Short Description" error={errors.description} hint={`${brief.description.length}/160`}>
                <Textarea
                  rows={3}
                  maxLength={160}
                  placeholder="A one-line pitch customers will see with your ad…"
                  value={brief.description}
                  onChange={(e) => set("description", e.target.value)}
                  error={!!errors.description}
                />
              </Field>
            </div>

            <div className="my-8 h-px bg-line" />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Target Location" error={errors.location}>
                <Input placeholder="e.g. Delhi NCR, or All India" value={brief.location} onChange={(e) => set("location", e.target.value)} error={!!errors.location} />
              </Field>
              <Field label="Preferred Language">
                <Select value={brief.language} onChange={(e) => set("language", e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Target Audience" error={errors.audience}>
                <Textarea
                  rows={2}
                  placeholder="e.g. Women aged 25–44 interested in fashion and jewellery"
                  value={brief.audience}
                  onChange={(e) => set("audience", e.target.value)}
                  error={!!errors.audience}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Preferred Platforms" error={errors.platforms}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PLATFORM_ORDER.map((p) => {
                    const selected = brief.platforms.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePlatform(p)}
                        className={`relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                          selected ? "border-ink bg-mist/70 ring-1 ring-ink" : "border-line bg-white hover:border-ink/40"
                        }`}
                      >
                        <PlatformChip id={p} size={38} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">{PLATFORMS[p].name}</span>
                          <span className="block truncate text-xs text-faint">{PLATFORMS[p].metricNote}</span>
                        </span>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            selected ? "border-ink bg-ink text-white" : "border-line text-transparent"
                          }`}
                        >
                          <Check size={11} strokeWidth={3.5} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            <label className="mt-7 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-sub">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#111111]" />
              <span>
                I understand this site is a frontend-only preview: no payment is taken, no campaign is created, and my brief is
                only sent if I send the email myself. I agree to the{" "}
                <button type="button" onClick={() => navigate("/terms")} className="font-medium text-ink underline underline-offset-2">Terms</button>.
              </span>
            </label>
            {agreeError && <p className="mt-2 text-xs text-red-600 anim-fade">{agreeError}</p>}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              <button type="button" onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-sub transition-colors hover:text-ink cursor-pointer">
                <ArrowLeft size={15} /> Cancel
              </button>
              <button type="submit" className={btnCls("primary", "lg")}>
                <Mail size={16} /> Create email brief
              </button>
            </div>
          </form>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-[24px] border border-line bg-white p-7 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sub">{PACKAGE.name}</span>
                <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-medium text-white">FEATURED</span>
              </div>
              <p className="mt-5 text-4xl font-semibold tracking-tight tnum">{fmtINR(PACKAGE.price)}</p>
              <p className="mt-1.5 text-[13px] text-sub">Estimated {PACKAGE.estViews} views · one campaign</p>
              <div className="my-6 h-px bg-line" />
              <div className="divide-y divide-line/70">
                {summaryRow("Media spend", fmtINR(PACKAGE.mediaSpend))}
                {summaryRow("Campaign management", fmtINR(PACKAGE.fee))}
                {summaryRow("Taxes (GST)", fmtINR(PACKAGE.tax))}
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-4">
                <span className="text-sm font-medium text-ink">Package total</span>
                <span className="text-xl font-semibold tnum">{fmtINR(PACKAGE.price)}</span>
              </div>
              <ul className="mt-6 flex flex-col gap-2.5">
                {["Reviewed within 24–48 hours", "Personal dashboard", "Platform-wise reporting when live"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[13px] text-sub">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 flex items-start gap-2 px-1 text-[11px] leading-relaxed text-faint">
              <Info size={13} className="mt-px shrink-0" />
              {DISCLAIMER}
            </p>
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-mist px-5 py-4">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-sub" />
              <p className="text-xs leading-relaxed text-sub">
                No payment is collected on this site. Secure payments are only possible with server-side verification and are not
                part of this frontend-only deployment.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
