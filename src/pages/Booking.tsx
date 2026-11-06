import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Film,
  Image as ImageIcon,
  Info,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { navigate, parseRoute, useHashRoute } from "../lib/router";
import { useStore } from "../lib/store";
import {
  BookingDraft,
  CATEGORIES,
  DISCLAIMER,
  LANGUAGES,
  PACKAGE,
  PLATFORMS,
  PLATFORM_ORDER,
  PlatformId,
  SUPPORT_EMAIL,
  WHATSAPP_NUMBER,
  fmtINR,
} from "../lib/data";
import { Field, Input, PlatformChip, Select, Textarea, btnCls } from "../components/ui";
import { PublicShell } from "../components/chrome";
import { GoogleSignInButton } from "../components/GoogleSignin";

const STEP_LABELS = ["Your Business", "Your Advertisement", "Audience & Platforms", "Review & Send"];

const EMPTY_DRAFT: BookingDraft = {
  businessName: "",
  category: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  campaignName: "",
  product: "",
  description: "",
  creativeFile: null,
  creativeName: "",
  creativeHelp: false,
  landingUrl: "",
  location: "",
  audience: "",
  language: "English",
  platforms: [],
};

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const urlOk = (u: string) => !u || /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i.test(u.trim());

/* ------------------------------ Booking page ------------------------------ */

export default function BookingPage() {
  const { user, ready, toast } = useStore();
  const hash = useHashRoute();
  const { query } = parseRoute(hash);
  const presetPlatform = query.get("platform") as PlatformId | null;

  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState("");
  const [creativePreview, setCreativePreview] = useState("");
  const [creativeKind, setCreativeKind] = useState<"image" | "video" | "">("");
  const fileRef = useRef<HTMLInputElement>(null);
  const prefilled = useRef(false);

  useEffect(() => {
    if (user && !prefilled.current) {
      prefilled.current = true;
      setDraft((d) => ({
        ...d,
        contactName: d.contactName || user.name,
        email: d.email || user.email,
        phone: d.phone || user.phone || "",
        businessName: d.businessName || user.business || "",
        platforms: presetPlatform && PLATFORM_ORDER.includes(presetPlatform) ? [presetPlatform] : d.platforms,
      }));
    }
  }, [user, presetPlatform]);

  const set = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const isVideoCreative = creativeKind === "video";
  const youtubeBlocked = useMemo(
    () => draft.platforms.includes("youtube") && !isVideoCreative && !draft.creativeHelp,
    [draft.platforms, draft.creativeHelp, isVideoCreative]
  );

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (draft.businessName.trim().length < 2) e.businessName = "Please enter your business name.";
      if (!draft.category) e.category = "Please select a category.";
      if (draft.contactName.trim().length < 2) e.contactName = "Please enter a contact name.";
      if (!emailOk(draft.email)) e.email = "Please enter a valid email address.";
      if (!/^[+]?[\d\s-]{10,14}$/.test(draft.phone)) e.phone = "Please enter a valid phone number.";
      if (!urlOk(draft.website)) e.website = "Please enter a valid website or social link.";
    }
    if (s === 1) {
      if (draft.campaignName.trim().length < 3) e.campaignName = "Give your campaign a name (min. 3 characters).";
      if (draft.product.trim().length < 2) e.product = "What product or service are you promoting?";
      if (draft.description.trim().length < 10) e.description = "Please add a short description (min. 10 characters).";
      if (!draft.creativeFile && !draft.creativeHelp) e.creative = "Please upload your ad creative, or ask us to create one.";
      if (!urlOk(draft.landingUrl)) e.landingUrl = "Please enter a valid landing page URL.";
    }
    if (s === 2) {
      if (draft.location.trim().length < 2) e.location = "Where should your ads run?";
      if (draft.audience.trim().length < 3) e.audience = "Describe who should see your ads.";
      if (draft.platforms.length === 0) e.platforms = "Please select at least one platform.";
      if (youtubeBlocked) e.platforms = "YouTube requires a video creative. Upload a video, remove YouTube, or ask us to create your ad.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) {
      toast("A few details are missing", "Please review the highlighted fields.", "error");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"].includes(file.type)) {
      setErrors((e) => ({ ...e, creative: "Please upload a JPG, PNG, WEBP image or an MP4/MOV video." }));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrors((e) => ({ ...e, creative: "File is larger than 50 MB. Please compress it and try again." }));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const kind = file.type.startsWith("video") ? "video" : "image";
    setCreativeKind(kind);
    set("creativeFile", file);
    set("creativeName", file.name);
    set("creativeHelp", false);
    setErrors((e) => ({ ...e, creative: "" }));
    if (kind === "image" && file.size < 4_000_000) {
      const reader = new FileReader();
      reader.onload = () => setCreativePreview(String(reader.result));
      reader.readAsDataURL(file);
    } else {
      setCreativePreview("");
    }
  };

  const togglePlatform = (p: PlatformId) => {
    setDraft((d) => ({ ...d, platforms: d.platforms.includes(p) ? d.platforms.filter((x) => x !== p) : [...d.platforms, p] }));
    setErrors((e) => ({ ...e, platforms: "" }));
  };

  /* ----------------------- booking request (no payment) ----------------------- */

  const requestMessage = useMemo(() => {
    const lines = [
      "Hi Beyond Reach, I'd like to book a Starter Reach campaign (₹399).",
      "",
      `Business: ${draft.businessName} (${draft.category})`,
      `Contact: ${draft.contactName} · ${draft.phone} · ${draft.email}`,
      draft.website ? `Website/Social: ${draft.website}` : "",
      "",
      `Campaign: ${draft.campaignName}`,
      `Product/Service: ${draft.product}`,
      `Description: ${draft.description}`,
      `Creative: ${draft.creativeHelp ? "Please design one for me" : draft.creativeName}`,
      draft.landingUrl ? `Landing page: ${draft.landingUrl}` : "",
      "",
      `Target location: ${draft.location}`,
      `Audience: ${draft.audience}`,
      `Language: ${draft.language}`,
      `Platforms: ${draft.platforms.map((p) => PLATFORMS[p].name).join(", ")}`,
    ];
    return lines.filter((l) => l !== "").join("\n");
  }, [draft]);

  const sendWhatsApp = () => {
    if (!validateStep(2) || !agree) {
      setAgreeError("Please review the details and confirm the checkbox first.");
      return;
    }
    setAgreeError("");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(requestMessage)}`, "_blank", "noopener");
    toast("Request prepared", "WhatsApp is opening with your booking details. Send the message to us.");
  };

  const sendEmail = () => {
    if (!validateStep(2) || !agree) {
      setAgreeError("Please review the details and confirm the checkbox first.");
      return;
    }
    setAgreeError("");
    const subject = encodeURIComponent(`Campaign booking request — ${draft.campaignName}`);
    const body = encodeURIComponent(requestMessage);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    toast("Request prepared", "Your email app is opening with the booking details. Hit send to reach us.");
  };

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(requestMessage);
      toast("Copied", "Your booking details are on the clipboard — paste them anywhere.");
    } catch {
      toast("Could not copy", "Please select and copy the details manually.", "error");
    }
  };

  const restart = () => {
    setDraft({ ...EMPTY_DRAFT });
    setCreativePreview("");
    setCreativeKind("");
    setAgree(false);
    setAgreeError("");
    setStep(0);
    prefilled.current = false;
  };

  /* ---------- auth gate ---------- */
  if (!ready) {
    return (
      <PublicShell>
        <div className="flex min-h-[60vh] items-center justify-center pt-28">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-ink" aria-label="Loading" />
        </div>
      </PublicShell>
    );
  }

  if (!user) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-xl px-5 pb-28 pt-40 text-center anim-fade">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-line bg-mist">
            <Lock size={24} className="text-sub" />
          </div>
          <h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em]">One quick step first</h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-sub">
            Sign in with Google so your booking details are pre-filled from your profile. New here? The same button creates
            your account.
          </p>
          <div className="mx-auto mt-9 flex max-w-[340px] justify-center">
            <GoogleSignInButton />
          </div>
          <button onClick={() => navigate("/login")} className="mt-4 text-sm text-sub underline underline-offset-2 transition-colors hover:text-ink cursor-pointer">
            Continue to the login page
          </button>
          <p className="mt-6 text-xs text-faint">Free · verified directly with Google · no password shared with us</p>
        </div>
      </PublicShell>
    );
  }

  /* ---------- form ---------- */

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">Book a Campaign</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">Let's launch your ad.</h1>
          <p className="mt-4 text-base leading-relaxed text-sub">
            Four short steps. Our team reviews every request within 24–48 hours — the Starter Reach package is {fmtINR(PACKAGE.price)}.
          </p>
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={label}>
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2.5 rounded-full border py-2 pl-2 pr-3.5 text-[13px] font-medium transition-all sm:pr-4 ${
                    i === step ? "border-ink bg-ink text-white" : i < step ? "border-line bg-white text-ink cursor-pointer hover:border-ink/40" : "border-line bg-white text-faint"
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${i === step ? "bg-white text-ink" : i < step ? "bg-ink text-white" : "bg-mist text-faint"}`}>
                    {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="hidden md:inline">{label}</span>
                </button>
                {i < STEP_LABELS.length - 1 && <span className={`h-px flex-1 ${i < step ? "bg-ink" : "bg-line"}`} />}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-sub md:hidden">
            Step {step + 1} of 4 — {STEP_LABELS[step]}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[24px] border border-line bg-white p-6 shadow-soft sm:p-9">
            {step === 0 && (
              <div className="anim-rise" key="s0">
                <h2 className="text-xl font-semibold tracking-tight">Your Business</h2>
                <p className="mt-1.5 text-sm text-sub">Tell us who's advertising. This appears on your reports and receipts.</p>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Field label="Business Name" error={errors.businessName}>
                    <Input placeholder="Your business name" value={draft.businessName} onChange={(e) => set("businessName", e.target.value)} error={!!errors.businessName} />
                  </Field>
                  <Field label="Business Category" error={errors.category}>
                    <Select value={draft.category} onChange={(e) => set("category", e.target.value)} error={!!errors.category}>
                      <option value="" disabled>Select a category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Contact Name" error={errors.contactName}>
                    <Input placeholder="Your full name" value={draft.contactName} onChange={(e) => set("contactName", e.target.value)} error={!!errors.contactName} />
                  </Field>
                  <Field label="Phone Number" error={errors.phone}>
                    <Input placeholder="+91 98765 43210" value={draft.phone} onChange={(e) => set("phone", e.target.value)} error={!!errors.phone} />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <Input type="email" placeholder="you@business.com" value={draft.email} onChange={(e) => set("email", e.target.value)} error={!!errors.email} />
                  </Field>
                  <Field label="Website or Social Media Link" optional error={errors.website}>
                    <Input placeholder="instagram.com/yourbusiness" value={draft.website} onChange={(e) => set("website", e.target.value)} error={!!errors.website} />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="anim-rise" key="s1">
                <h2 className="text-xl font-semibold tracking-tight">Your Advertisement</h2>
                <p className="mt-1.5 text-sm text-sub">What are we promoting? Upload your creative — or let our team design one.</p>
                <div className="mt-8 grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Campaign Name" error={errors.campaignName}>
                      <Input placeholder="e.g. Festive Sale 2026" value={draft.campaignName} onChange={(e) => set("campaignName", e.target.value)} error={!!errors.campaignName} maxLength={120} />
                    </Field>
                    <Field label="Product or Service" error={errors.product}>
                      <Input placeholder="e.g. Handcrafted gold jewellery" value={draft.product} onChange={(e) => set("product", e.target.value)} error={!!errors.product} />
                    </Field>
                  </div>
                  <Field label="Short Description" error={errors.description} hint={`${draft.description.length}/160`}>
                    <Textarea rows={3} maxLength={160} placeholder="A one-line pitch customers will see with your ad…" value={draft.description} onChange={(e) => set("description", e.target.value)} error={!!errors.description} />
                  </Field>

                  <Field label="Upload Image or Video" error={errors.creative}>
                    <div>
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                      {draft.creativeFile ? (
                        <div className="overflow-hidden rounded-2xl border border-line">
                          {creativePreview ? (
                            <img src={creativePreview} alt="Your creative preview" className="h-44 w-full object-cover" />
                          ) : (
                            <div className="flex h-32 w-full flex-col items-center justify-center gap-2 bg-mist text-sub">
                              {creativeKind === "video" ? <Film size={26} /> : <ImageIcon size={26} />}
                              <span className="text-xs">{creativeKind === "video" ? "Video creative" : "Image creative"}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <span className="flex min-w-0 items-center gap-2 text-sm">
                              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                              <span className="truncate font-medium text-ink">{draft.creativeName}</span>
                              <span className="shrink-0 text-xs text-faint">{(draft.creativeFile.size / 1024 / 1024).toFixed(1)} MB</span>
                            </span>
                            <button type="button" onClick={() => fileRef.current?.click()} className="shrink-0 text-[13px] font-medium text-sub underline underline-offset-2 hover:text-ink cursor-pointer">
                              Replace
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-ink/25 bg-mist/60 px-6 py-10 text-center transition-all hover:border-ink/50 hover:bg-mist cursor-pointer"
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-soft">
                            <Upload size={18} className="text-ink" />
                          </span>
                          <span className="text-sm font-medium text-ink">Click to upload your ad creative</span>
                          <span className="text-xs text-faint">Image (JPG, PNG, WEBP) or Video (MP4, MOV) · up to 50 MB</span>
                        </button>
                      )}
                      <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-sub">
                        <input
                          type="checkbox"
                          checked={draft.creativeHelp}
                          onChange={(e) => {
                            set("creativeHelp", e.target.checked);
                            if (e.target.checked) {
                              set("creativeFile", null);
                              set("creativeName", "");
                              setCreativePreview("");
                              setCreativeKind("");
                              if (fileRef.current) fileRef.current.value = "";
                            }
                          }}
                          className="h-4 w-4 cursor-pointer accent-[#111111]"
                        />
                        I don't have a creative — please design one for me
                        <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-sub">Included</span>
                      </label>
                      <p className="mt-2 text-[11px] leading-relaxed text-faint">
                        Uploaded files stay on your device in this step. Share the final creative with us on WhatsApp or email after sending your request.
                      </p>
                    </div>
                  </Field>

                  <Field label="Landing Page URL" optional error={errors.landingUrl}>
                    <Input placeholder="Where should people go when they tap your ad?" value={draft.landingUrl} onChange={(e) => set("landingUrl", e.target.value)} error={!!errors.landingUrl} />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="anim-rise" key="s2">
                <h2 className="text-xl font-semibold tracking-tight">Audience & Platforms</h2>
                <p className="mt-1.5 text-sm text-sub">Who should see your ad, and where? Choose one or more platforms.</p>
                <div className="mt-8 grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Target Location" error={errors.location}>
                      <Input placeholder="e.g. Delhi NCR, or All India" value={draft.location} onChange={(e) => set("location", e.target.value)} error={!!errors.location} />
                    </Field>
                    <Field label="Preferred Language">
                      <Select value={draft.language} onChange={(e) => set("language", e.target.value)}>
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field label="Target Audience" error={errors.audience}>
                    <Textarea rows={2} placeholder="e.g. Women aged 25–44 interested in fashion and jewellery" value={draft.audience} onChange={(e) => set("audience", e.target.value)} error={!!errors.audience} />
                  </Field>

                  <Field label="Select Platforms" error={errors.platforms}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PLATFORM_ORDER.map((p) => {
                        const selected = draft.platforms.includes(p);
                        const blocked = p === "youtube" && !isVideoCreative && !draft.creativeHelp;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => togglePlatform(p)}
                            className={`relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                              selected ? "border-ink bg-mist/70 ring-1 ring-ink" : "border-line bg-white hover:border-ink/40"
                            }`}
                          >
                            <PlatformChip id={p} size={42} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-ink">{PLATFORMS[p].name}</span>
                              <span className="block truncate text-xs text-faint">via {PLATFORMS[p].via} · {PLATFORMS[p].metricNote}</span>
                              {blocked && <span className="mt-0.5 block text-[11px] font-medium text-amber-600">Requires a video creative</span>}
                            </span>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${selected ? "border-ink bg-ink text-white" : "border-line text-transparent"}`}>
                              <Check size={11} strokeWidth={3.5} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-faint">
                    <Info size={14} className="mt-px shrink-0" />
                    Final platform allocation is confirmed by our team during review. If a selected platform isn't eligible for your
                    creative or category, its budget is reallocated to your other platforms and you are informed first.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="anim-rise" key="s3">
                <h2 className="text-xl font-semibold tracking-tight">Review & Send</h2>
                <p className="mt-1.5 text-sm text-sub">Confirm everything looks right, then send your booking request to our team.</p>

                <div className="mt-8 flex flex-col gap-4">
                  {[
                    {
                      title: "Business",
                      step: 0,
                      rows: [
                        ["Business", draft.businessName],
                        ["Category", draft.category],
                        ["Contact", `${draft.contactName} · ${draft.phone}`],
                        ["Email", draft.email],
                      ] as [string, string][],
                    },
                    {
                      title: "Advertisement",
                      step: 1,
                      rows: [
                        ["Campaign", draft.campaignName],
                        ["Product", draft.product],
                        ["Creative", draft.creativeHelp ? "Designed by Beyond Reach" : draft.creativeName || "—"],
                      ] as [string, string][],
                    },
                    {
                      title: "Audience & Platforms",
                      step: 2,
                      rows: [
                        ["Location", draft.location],
                        ["Audience", draft.audience],
                        ["Language", draft.language],
                        ["Platforms", draft.platforms.map((p) => PLATFORMS[p].name).join(", ") || "—"],
                      ] as [string, string][],
                    },
                  ].map((block) => (
                    <div key={block.title} className="rounded-2xl border border-line p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">{block.title}</h3>
                        <button onClick={() => setStep(block.step)} className="text-[13px] font-medium text-sub underline underline-offset-2 transition-colors hover:text-ink cursor-pointer">
                          Edit
                        </button>
                      </div>
                      <div className="mt-2 divide-y divide-line/70">
                        {block.rows.map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-6 py-2 text-sm">
                            <span className="shrink-0 text-sub">{k}</span>
                            <span className="text-right font-medium text-ink break-words">{v || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-ink/25 bg-mist/60 p-5">
                  <p className="text-sm font-semibold text-ink">How booking works in this version</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
                    Online payment is not enabled yet. Send your request — our team confirms availability within 24–48 hours and
                    shares payment details with you. Nothing is charged until you confirm with us directly.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <button onClick={sendWhatsApp} className={btnCls("primary", "md")}>
                      <MessageCircle size={15} /> WhatsApp
                    </button>
                    <button onClick={sendEmail} className={btnCls("secondary", "md")}>
                      <Mail size={15} /> Email
                    </button>
                    <button onClick={() => void copyDetails()} className={btnCls("secondary", "md")}>
                      <Copy size={15} /> Copy details
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-faint">
                    The buttons open WhatsApp or your email app with all details pre-filled — nothing is sent until you press send there.
                  </p>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-sub">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#111111]" />
                  <span>
                    I confirm my advertisement complies with platform policies and Beyond Reach's{" "}
                    <button type="button" onClick={() => navigate("/terms")} className="font-medium text-ink underline underline-offset-2">Terms</button>, and I understand views are an estimated target, not a guarantee.
                  </span>
                </label>
                {agreeError && <p className="mt-2 text-xs text-red-600 anim-fade">{agreeError}</p>}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
              {step > 0 ? (
                <button onClick={back} className={btnCls("secondary", "md")}>
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-sub transition-colors hover:text-ink cursor-pointer">
                  <ArrowLeft size={15} /> Cancel
                </button>
              )}
              {step < 3 ? (
                <button onClick={next} className={btnCls("primary", "md")}>
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={restart} className="text-sm text-sub underline underline-offset-2 transition-colors hover:text-ink cursor-pointer">
                  Start a new campaign
                </button>
              )}
            </div>
          </div>

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
                <span className="text-sm font-medium text-ink">Total</span>
                <span className="text-xl font-semibold tnum">{fmtINR(PACKAGE.price)}</span>
              </div>
              <ul className="mt-6 flex flex-col gap-2.5">
                {["Reviewed within 24–48 hours", "Personal dashboard & reports", "Platform-wise verified statistics"].map((t) => (
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
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-mist px-5 py-4">
              <ShieldCheck size={18} className="shrink-0 text-sub" />
              <p className="text-xs leading-relaxed text-sub">
                You only pay after our team confirms your campaign — payment details are shared directly. No card is charged on this website.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
