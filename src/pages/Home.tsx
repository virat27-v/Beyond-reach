import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Eye, Headphones, ShieldCheck } from "lucide-react";
import { navigate } from "../lib/router";
import { PLATFORM_ORDER, PLATFORMS, PlatformId, fmtCompact, fmtDateShort } from "../lib/data";
import { Accordion, AreaChart, CompareBars, PlatformChip, Reveal, SectionHead, StatePill, btnCls } from "../components/ui";
import { FAQS, PricingSection } from "./Pricing";

/* --------------------------- in-view on scroll -------------------------- */

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ------------------------------ CountUp ----------------------------- */

export function CountUp({ end, duration = 1600, className = "" }: { end: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            setVal(Math.round(end * (1 - Math.pow(1 - p, 4))));
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, duration]);
  return (
    <span ref={ref} className={`tnum ${className}`}>
      {val.toLocaleString("en-IN")}
    </span>
  );
}

/* --------------------------- Hero console --------------------------- */

/* Illustrative dashboard preview (clearly labelled). Numbers animate when scrolled into view. */
const PREVIEW_DAILY = [1420, 1610, 1490, 1740, 1890, 1660, 2080, 2350, 2210, 2480, 2810, 2620, 2710, 2190]; // = 29,260
const PREVIEW_TOTALS = { views: 29260, reach: 22300, impressions: 42200, clicks: 1000 };
const PREVIEW_PLATFORMS: { id: PlatformId; value: number }[] = [
  { id: "instagram", value: 12600 },
  { id: "facebook", value: 7700 },
  { id: "youtube", value: 5400 },
  { id: "google", value: 3500 },
];

function HeroConsole() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  const chartData = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let i = 0; i < PREVIEW_DAILY.length; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (PREVIEW_DAILY.length - 1 - i));
      out.push({ label: fmtDateShort(d.toISOString().slice(0, 10)), value: PREVIEW_DAILY[i] });
    }
    return out;
  }, []);

  const bars = useMemo(
    () =>
      PREVIEW_PLATFORMS.map((p) => ({
        id: p.id,
        name: PLATFORMS[p.id].name,
        value: p.value,
        sub: `${Math.round((p.value / PREVIEW_TOTALS.views) * 100)}% of views`,
      })),
    []
  );

  return (
    <div ref={ref} className="relative rounded-[28px] border border-line bg-white shadow-soft text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 md:px-8">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full rounded-full bg-emerald-500" style={{ animation: "ringPulse 2s ease-out infinite" }} />
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[13px] font-medium text-ink">Campaign Performance</span>
          <span className="hidden text-[13px] text-faint sm:inline">· Last 14 days</span>
        </div>
        <StatePill label="Preview" />
      </div>

      <div className="grid lg:grid-cols-5">
        <div className="px-6 pt-6 md:px-8 lg:col-span-3 lg:pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Total views</p>
          <div className="mt-2 flex items-baseline gap-3">
            <CountUp end={PREVIEW_TOTALS.views} className="text-[44px] font-semibold leading-none tracking-[-0.03em]" />
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">+18.4%</span>
          </div>
          <div className="mt-6">
            {inView ? (
              <AreaChart data={chartData} height={190} />
            ) : (
              <div className="h-[190px] w-full" aria-hidden="true" />
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 divide-x divide-line border-t border-line pt-5">
            {[
              { label: "Reach", value: PREVIEW_TOTALS.reach },
              { label: "Impressions", value: PREVIEW_TOTALS.impressions },
              { label: "Clicks", value: PREVIEW_TOTALS.clicks },
            ].map((s) => (
              <div key={s.label} className="px-4 first:pl-0">
                <p className="text-lg font-semibold tracking-tight tnum md:text-xl">{fmtCompact(s.value)}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-faint">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-line px-6 py-6 md:px-8 lg:col-span-2 lg:border-l lg:border-t-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Views by platform</p>
          <div className="mt-5">
            {inView ? (
              <CompareBars items={bars} />
            ) : (
              <div className="h-[170px] w-full" aria-hidden="true" />
            )}
          </div>
          <div className="mt-7 rounded-2xl bg-mist p-4">
            <p className="text-[13px] leading-relaxed text-sub">
              Every campaign includes <span className="font-medium text-ink">platform-wise reporting</span> — so you always know
              exactly where your views came from.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Hero ------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 md:pt-44">
      {/* faint reach rings */}
      <svg className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 opacity-[0.05]" width="1100" height="1100" viewBox="0 0 1100 1100" fill="none" aria-hidden="true">
        {[180, 300, 420, 540].map((r) => (
          <circle key={r} cx="550" cy="550" r={r} stroke="#111111" strokeWidth="1" />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(640px_320px_at_50%_0%,rgba(17,17,17,0.045),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2 pr-3.5 text-xs font-medium text-sub shadow-soft">
              <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">NEW</span>
              Starter Reach — now live at ₹399
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-8 text-[52px] font-semibold leading-[0.98] tracking-[-0.045em] text-balance sm:text-7xl md:text-[92px]">
              Your Brand.
              <br />
              <span className="font-light italic tracking-[-0.03em] text-ink/80">Beyond Reach.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-sub md:text-xl">
              Professional digital advertising for businesses that want more visibility, more opportunities and measurable growth.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <button onClick={() => navigate("/book")} className={btnCls("primary", "lg")}>
                Start Advertising — ₹399
                <ArrowRight size={17} />
              </button>
              <button onClick={() => navigate("/", "how-it-works")} className={btnCls("secondary", "lg")}>
                Explore How It Works
              </button>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <p className="mt-7 text-[13px] text-faint">No long-term contracts · Launch in 24–48 hours · Cancel anytime before launch</p>
          </Reveal>
        </div>

        <Reveal delay={250} className="relative mx-auto mt-16 max-w-5xl md:mt-20">
          <HeroConsole />
          <p className="mt-4 text-center text-xs text-faint">Illustrative preview of your client dashboard. Your dashboard shows your real campaign data.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- Platform strip ---------------------------- */

function PlatformStrip() {
  return (
    <section className="border-b border-line py-14 mt-20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-faint">Campaigns run on official advertising platforms</p>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {PLATFORM_ORDER.map((p) => (
              <span key={p} className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-ink/40 transition-colors duration-300 hover:text-ink/80">
                <PlatformChip id={p} size={30} />
                {PLATFORMS[p].name} <span className="text-xs font-normal text-faint">via {PLATFORMS[p].via}</span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Services ----------------------------- */

const SERVICES: { id: PlatformId; num: string }[] = [
  { id: "instagram", num: "01" },
  { id: "facebook", num: "02" },
  { id: "youtube", num: "03" },
  { id: "google", num: "04" },
];

function Services() {
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          align="left"
          eyebrow="Services"
          title="Everything your brand needs to get noticed."
          sub="Four platforms. One team. Zero complexity. We run your campaigns end-to-end — you watch the results roll in."
        />

        <div className="mt-16 border-t border-line">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={i * 60}>
              <button
                onClick={() => navigate(`/book?platform=${s.id}`)}
                className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-7 text-left transition-colors duration-300 hover:bg-mist sm:gap-8 sm:px-4 md:grid-cols-[64px_auto_1fr_auto_auto] md:py-9 cursor-pointer"
              >
                <span className="text-sm font-medium text-faint tnum">{s.num}</span>
                <span className="hidden md:block">
                  <PlatformChip id={s.id} size={46} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xl font-semibold tracking-tight text-ink md:text-2xl">
                    {PLATFORMS[s.id].name} Advertising
                  </span>
                  <span className="mt-1 block max-w-xl text-sm leading-relaxed text-sub md:text-[15px]">{PLATFORMS[s.id].serviceLine}</span>
                  <span className="mt-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-faint md:hidden">
                    {PLATFORMS[s.id].metricNote}
                  </span>
                </span>
                <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-faint lg:block">{PLATFORMS[s.id].metricNote}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-sub transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                  <ArrowUpRight size={16} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-sm text-faint">
            Not sure which platform fits your business?{" "}
            <button onClick={() => navigate("/support")} className="font-medium text-ink u-link cursor-pointer">
              Ask our team
            </button>{" "}
            — we'll recommend the right mix for your goals.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------- How it works --------------------------- */

const STEPS = [
  {
    num: "01",
    title: "Choose Your Package",
    body: "Select an advertising package that fits your goals. One transparent price — no hidden charges, ever.",
  },
  {
    num: "02",
    title: "Submit Your Advertisement",
    body: "Tell us about your business and upload your creative — an image, a video, or ask us to help you make one.",
  },
  {
    num: "03",
    title: "We Launch Your Campaign",
    body: "Our team reviews, approves and schedules your campaign across your selected platforms within 24–48 hours.",
  },
  {
    num: "04",
    title: "Track Your Performance",
    body: "Follow views, reach and platform-wise results in real time from your personal dashboard. Download reports anytime.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-mist py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          eyebrow="How It Works"
          title="Advertising, without the complexity."
          sub="From sign-up to live campaign in four simple steps. Most advertisers are live within 48 hours."
        />

        <div className="relative mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden border-t border-dashed border-ink/15 lg:block" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 120}>
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold shadow-soft tnum">
                  {s.num}
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-sub">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-16 flex justify-center">
            <button onClick={() => navigate("/book")} className={btnCls("primary", "lg")}>
              Start Your Campaign
              <ArrowRight size={17} />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------- Principles ----------------------------- */

function Principles() {
  const facts = [
    { value: "₹399", label: "One transparent price" },
    { value: "4", label: "Advertising platforms" },
    { value: "24–48h", label: "Typical review time" },
    { value: "0", label: "Hidden charges" },
  ];
  const principles = [
    {
      icon: <ShieldCheck size={20} strokeWidth={1.7} />,
      title: "Honest by design",
      body: "Estimated views are labelled as estimates. Your dashboard only ever shows verified platform data — never inflated numbers.",
    },
    {
      icon: <Eye size={20} strokeWidth={1.7} />,
      title: "Radically transparent",
      body: "Know exactly where every rupee goes — media spend, management fee and taxes, itemised before you pay and printed on your receipt.",
    },
    {
      icon: <Headphones size={20} strokeWidth={1.7} />,
      title: "Humans, on call",
      body: "Real people on WhatsApp and email who know your campaign by name. No ticket black holes, no copy-paste replies.",
    },
  ];
  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHead
          light
          align="left"
          eyebrow="Why Beyond Reach"
          title={
            <>
              Built on clarity,
              <br />
              <span className="font-light italic text-white/60">not complexity.</span>
            </>
          }
          sub="Most advertising tools are built for agencies. Beyond Reach is built for business owners — simple to start, impossible to misunderstand."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-3">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 100} className="h-full">
              <div className="h-full bg-ink p-8 transition-colors duration-300 hover:bg-[#161616] md:p-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white">{p.icon}</div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/55">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-10 border-t border-white/10 pt-12 lg:grid-cols-4">
          {facts.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <p className="text-4xl font-semibold tracking-tight tnum md:text-5xl">{s.value}</p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FAQ teaser ---------------------------- */

function FaqTeaser() {
  return (
    <section className="py-24 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHead eyebrow="FAQ" title="Everything else you're wondering." />
        <Reveal delay={120} className="mt-12">
          <Accordion items={FAQS.slice(0, 4)} />
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-10 text-center">
            <button onClick={() => navigate("/pricing")} className={btnCls("secondary", "md")}>
              View all questions
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------- Final CTA ---------------------------- */

function FinalCta() {
  return (
    <section className="pb-24 md:pb-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-20 text-center text-white md:py-28">
            <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" width="900" height="900" viewBox="0 0 900 900" fill="none" aria-hidden="true">
              {[150, 260, 370].map((r) => (
                <circle key={r} cx="450" cy="450" r={r} stroke="#fff" strokeWidth="1" />
              ))}
            </svg>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-4xl font-semibold tracking-[-0.03em] text-balance md:text-6xl">
                Ready to take your brand <span className="font-light italic text-white/70">beyond reach?</span>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/60 md:text-lg">
                One transparent package, verified reporting and a team that answers. Your first campaign is ₹399 — and about ten minutes away.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button onClick={() => navigate("/book")} className={btnCls("white", "lg")}>
                  Start Advertising — ₹399
                  <ArrowRight size={17} />
                </button>
                <button
                  onClick={() => navigate("/", "how-it-works")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-[15px] font-medium text-white transition-all hover:bg-white/10 cursor-pointer"
                >
                  See How It Works
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------- Page ------------------------------ */

export default function Home() {
  return (
    <div className="anim-fade">
      <Hero />
      <PlatformStrip />
      <Services />
      <HowItWorks />
      <Principles />
      <PricingSection />
      <FaqTeaser />
      <FinalCta />
    </div>
  );
}
