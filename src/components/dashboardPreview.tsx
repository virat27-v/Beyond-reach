import { useEffect, useRef, useState } from "react";
import { AreaChart } from "./ui";
import { PLATFORMS, PlatformId, fmtCompact } from "../lib/data";

/* ------------------------------------------------------------------ */
/*  Homepage dashboard preview.                                        */
/*  This is a static marketing illustration (clearly labelled as such)   */
/*  — NOT live customer data. The total views count up as the visitor    */
/*  scrolls the card into view, so the numbers grow with the scroll.    */
/* ------------------------------------------------------------------ */

const TOTAL_VIEWS = 29260;
const REACH = 22300;
const IMPRESSIONS = 42200;
const CLICKS = 1030;

type PreviewPlatform = {
  id: PlatformId;
  views: number;
  percent: number;
  bar: number; // illustrative bar width relative to the largest platform
};

const VIEWS_BY_PLATFORM: PreviewPlatform[] = [
  { id: "instagram", views: 12600, percent: 43, bar: 1 },
  { id: "facebook", views: 7700, percent: 26, bar: 0.8 },
  { id: "youtube", views: 5400, percent: 19, bar: 0.55 },
  { id: "google", views: 3500, percent: 12, bar: 0.35 },
];

/* Fixed illustrative 14-day series (Oct 17 – Oct 30, 2026). */
const CHART_DATA = [
  1150, 1450, 1380, 900, 1250, 2050, 2580, 2500, 2200, 2100, 2350, 2980, 3550, 3000,
].map((value, i) => {
  const d = new Date(2026, 9, 17);
  d.setDate(d.getDate() + i);
  return {
    label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    value,
  };
});

/** Returns 0→1 as the referenced element scrolls into view (never decreases). */
function useScrollRevealProgress(ref: React.RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);
  const maxSeen = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setProgress(1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh * 0.95; // begins when the card enters the lower viewport
      const end = vh * 0.35; // complete once the card reaches the upper third
      const p = Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, start - end)));
      if (p > maxSeen.current) {
        maxSeen.current = p;
        setProgress(p);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);

  return progress;
}

export default function DashboardPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const progress = useScrollRevealProgress(cardRef);
  // ease-out so the number accelerates the more you scroll
  const eased = 1 - Math.pow(1 - progress, 3);

  const views = Math.round(TOTAL_VIEWS * eased);

  return (
    <div ref={cardRef} className="relative">
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-white text-left shadow-soft">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute h-full w-full rounded-full bg-emerald-500"
                style={{ animation: "ringPulse 2s ease-out infinite" }}
              />
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[13px] font-medium text-ink">Campaign Performance</span>
            <span className="hidden text-[13px] text-faint sm:inline">· Last 14 days</span>
          </div>
          <span className="rounded-full border border-line bg-mist px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sub">
            Illustrative preview
          </span>
        </div>

        <div className="grid lg:grid-cols-5">
          {/* left: total views + chart + summary */}
          <div className="px-6 pt-6 md:px-8 lg:col-span-3 lg:pb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Total views</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span
                className="text-[46px] font-semibold leading-none tracking-[-0.035em] tnum md:text-[54px]"
                aria-label={`${views.toLocaleString("en-IN")} total views (illustrative preview)`}
              >
                {views.toLocaleString("en-IN")}
              </span>
              <span className="translate-y-[-4px] rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                +18.4%
              </span>
            </div>

            <div className="mt-6">
              <AreaChart data={CHART_DATA} height={210} />
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-line border-t border-line pt-5">
              {[
                { label: "Reach", value: fmtCompact(REACH * eased) },
                { label: "Impressions", value: fmtCompact(IMPRESSIONS * eased) },
                { label: "Clicks", value: fmtCompact(CLICKS * eased) },
              ].map((s) => (
                <div key={s.label} className="px-4 first:pl-0">
                  <p className="text-lg font-semibold tracking-tight tnum md:text-xl">{s.value}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-faint">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* right: views by platform */}
          <div className="border-t border-line px-6 py-6 md:px-8 lg:col-span-2 lg:border-l lg:border-t-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Views by platform</p>

            <div className="mt-5 flex flex-col gap-5">
              {VIEWS_BY_PLATFORM.map((p, i) => (
                <div key={p.id}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-ink">{PLATFORMS[p.id].name}</span>
                    <span className="text-[13px] text-sub tnum">
                      <span className="font-semibold text-ink">{fmtCompact(p.views * eased)}</span>
                      <span className="text-faint"> · {p.percent}% of views</span>
                    </span>
                  </div>
                  <div className="h-[6px] w-full overflow-hidden rounded-full bg-mist">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, p.bar * eased * 100))}%`,
                        background: i === 0 ? "#111111" : "#D8D8D8",
                        transition: "width 120ms linear",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl bg-mist p-4 md:p-5">
              <p className="text-[13px] leading-relaxed text-sub">
                Every campaign includes <span className="font-medium text-ink">platform-wise reporting</span> — so you always
                know exactly where your views came from.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
