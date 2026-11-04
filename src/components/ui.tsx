import React, { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CampaignStatus, PlatformId, fmtCompact } from "../lib/data";

/* ------------------------------- Logo ------------------------------ */

export function LogoMark({ size = 34, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0">
      <rect width="36" height="36" rx="9" fill={inverted ? "#FFFFFF" : "#111111"} />
      <path d="M8.5 25.5a13 13 0 0 1 19 0" stroke={inverted ? "#111111" : "#FFFFFF"} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12.8 21a7.4 7.4 0 0 1 10.4 0" stroke={inverted ? "#111111" : "#FFFFFF"} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="18" cy="16.4" r="2" fill={inverted ? "#111111" : "#FFFFFF"} />
    </svg>
  );
}

export function Logo({ inverted = false, markSize = 34 }: { inverted?: boolean; markSize?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <LogoMark size={markSize} inverted={inverted} />
      <span className={`leading-none ${inverted ? "text-white" : "text-ink"}`}>
        <span className="block text-[13px] font-bold tracking-[0.24em]">BEYOND</span>
        <span className="block text-[13px] font-light tracking-[0.24em] mt-[3px]">REACH</span>
      </span>
    </span>
  );
}

/* ------------------------------ Buttons ---------------------------- */

type BtnVariant = "primary" | "secondary" | "ghost" | "white" | "danger-ghost";

export function btnCls(variant: BtnVariant = "primary", size: "sm" | "md" | "lg" = "md", extra = ""): string {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const sizes = {
    sm: "text-[13px] px-4 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-[15px] px-7 py-3.5",
  };
  const variants: Record<BtnVariant, string> = {
    primary: "bg-ink text-white hover:bg-black hover:shadow-lift",
    secondary: "bg-white text-ink border border-line hover:border-ink/40 hover:shadow-soft",
    ghost: "text-ink hover:bg-mist",
    white: "bg-white text-ink hover:bg-mist",
    "danger-ghost": "text-red-600 hover:bg-red-50",
  };
  return `${base} ${sizes[size]} ${variants[variant]} ${extra}`;
}

export function Btn({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg" }) {
  return <button className={btnCls(variant, size, className)} {...props} />;
}

/* ------------------------------ Reveal ----------------------------- */

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`rv ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* --------------------------- Section head -------------------------- */

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
        light ? "text-white/50" : "text-faint"
      }`}
    >
      <span className={`h-px w-6 ${light ? "bg-white/40" : "bg-ink/30"}`} />
      {children}
      <span className={`h-px w-6 ${light ? "bg-white/40" : "bg-ink/30"}`} />
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  align = "center",
  light = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  const alignCls = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  return (
    <div className={`flex flex-col gap-5 max-w-2xl ${alignCls}`}>
      <Reveal>
        <Eyebrow light={light}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={80}>
        <h2
          className={`text-4xl md:text-[44px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance ${
            light ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={160}>
          <p className={`text-base md:text-lg leading-relaxed ${light ? "text-white/60" : "text-sub"}`}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ------------------------------- Forms ----------------------------- */

export function Field({
  label,
  error,
  hint,
  children,
  optional,
}: {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between mb-2">
        <span className="text-[13px] font-medium text-ink">
          {label}
          {optional && <span className="text-faint font-normal ml-1.5">Optional</span>}
        </span>
        {hint && <span className="text-[11px] text-faint">{hint}</span>}
      </span>
      {children}
      {error && <span className="block mt-1.5 text-xs text-red-600 anim-fade">{error}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-faint outline-none transition-all duration-200 focus:border-ink/60 focus:ring-4 focus:ring-ink/5";

export function Input({ error, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`${inputBase} ${error ? "border-red-300 focus:border-red-400 focus:ring-red-50" : "border-line"} ${className}`}
      {...props}
    />
  );
}

export function Textarea({ error, className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={`${inputBase} resize-none ${error ? "border-red-300 focus:border-red-400 focus:ring-red-50" : "border-line"} ${className}`}
      {...props}
    />
  );
}

export function Select({
  error,
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <span className="relative block">
      <select
        className={`${inputBase} appearance-none pr-10 cursor-pointer ${error ? "border-red-300" : "border-line"} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-faint" />
    </span>
  );
}

/* --------------------------- Status pill --------------------------- */

const STATUS_DOT: Record<CampaignStatus, string> = {
  Active: "#1f9d55",
  Completed: "#111111",
  Approved: "#111111",
  Scheduled: "#111111",
  "Under Review": "#d97706",
  "Payment Confirmed": "#d97706",
  "Payment Pending": "#d97706",
  Paused: "#a3a3a3",
  Rejected: "#dc2626",
};

export function StatusPill({ status, className = "" }: { status: CampaignStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-mist px-2.5 py-1 text-[11px] font-medium text-ink/80 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: STATUS_DOT[status] }} />
      {status}
    </span>
  );
}

/** Neutral pill for honest "unavailable" states (Not Allocated, Awaiting Report, Not Connected…). */
export function StatePill({ label, tone = "neutral", className = "" }: { label: string; tone?: "neutral" | "ok" | "warn"; className?: string }) {
  const dot = tone === "ok" ? "#1f9d55" : tone === "warn" ? "#d97706" : "#a6a6a6";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-sub ${className}`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
      {label}
    </span>
  );
}

/** Setup / configuration notice — shown instead of any simulated behaviour. */
export function SetupNotice({ title, body, steps, className = "" }: { title: string; body: string; steps?: string[]; className?: string }) {
  return (
    <div className={`rounded-2xl border border-dashed border-ink/25 bg-mist/60 p-5 text-left ${className}`}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-sub">{body}</p>
      {steps && steps.length > 0 && (
        <ol className="mt-3 flex list-decimal flex-col gap-1 pl-4 text-[12.5px] leading-relaxed text-sub">
          {steps.map((s) => (
            <li key={s}>
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[11.5px] text-ink">{s}</code>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Inline error banner, consistent with the design system. */
export function ErrorBanner({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-700 anim-fade ${className}`}>{children}</p>;
}

/* --------------------------- Platform icon -------------------------- */

export function PlatformGlyph({ id, size = 18 }: { id: PlatformId; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (id) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M14.2 21v-6.6h2.2l.35-2.6h-2.55V10.1c0-.75.22-1.26 1.32-1.26h1.4V6.55c-.25-.03-1.08-.11-2.05-.11-2.03 0-3.42 1.24-3.42 3.5v1.86H9.2v2.6h2.25V21h2.75Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.8" y="5.5" width="18.4" height="13" rx="4" />
          <path d="M10.2 9.3v5.4c0 .35.38.57.68.4l4.6-2.7a.46.46 0 0 0 0-.8l-4.6-2.7a.46.46 0 0 0-.68.4Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "google":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12.24 10.2v2.76h4.36c-.18 1.06-.95 3.1-4.36 3.1a4.83 4.83 0 1 1 0-9.66c1.34 0 2.24.57 2.76 1.06l1.88-1.81A7.96 7.96 0 1 0 12.24 20c3.84 0 7.36-2.7 7.36-7.36 0-.25-.02-.49-.06-.72H12.24Z" />
        </svg>
      );
  }
}

export function PlatformChip({ id, size = 34 }: { id: PlatformId; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[10px] border border-line bg-white text-ink shrink-0"
      style={{ width: size, height: size }}
    >
      <PlatformGlyph id={id} size={Math.round(size * 0.5)} />
    </span>
  );
}

/* ------------------------------ Spinner ----------------------------- */

export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------- Empty state --------------------------- */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 anim-fade">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-mist text-sub mb-5">{icon}</div>
      <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-sub">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ----------------------------- Accordion ---------------------------- */

export function Accordion({ items, light = false }: { items: { q: string; a: string }[]; light?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={`divide-y ${light ? "divide-white/10" : "divide-line"}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left cursor-pointer group"
            >
              <span className={`text-[15px] font-medium tracking-tight ${light ? "text-white" : "text-ink"}`}>{item.q}</span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 ${
                  light ? "border-white/20 text-white" : "border-line text-sub"
                } ${isOpen ? "rotate-45" : "group-hover:border-ink/40"}`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className="grid transition-all duration-400 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
            >
              <div className="overflow-hidden">
                <p className={`pb-6 pr-10 text-sm leading-relaxed ${light ? "text-white/60" : "text-sub"}`}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- Area chart --------------------------- */

export interface ChartPoint {
  label: string;
  value: number;
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function AreaChart({
  data,
  height = 220,
  valueLabel = "views",
}: {
  data: ChartPoint[];
  height?: number;
  valueLabel?: string;
}) {
  const gid = useId().replace(/[:]/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 240;
  const PAD = { l: 6, r: 6, t: 14, b: 26 };
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const pts = data.map((d, i) => ({
    x: PAD.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw),
    y: PAD.t + ih - (d.value / max) * ih,
  }));
  const line = smoothPath(pts);
  const area = pts.length ? `${line} L ${pts[pts.length - 1].x} ${PAD.t + ih} L ${pts[0].x} ${PAD.t + ih} Z` : "";
  const gridYs = [0.25, 0.5, 0.75, 1];

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bestDist = Infinity;
    pts.forEach((p, i) => {
      const dist = Math.abs(p.x - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setHover(best);
  };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-sm text-faint" style={{ height }}>
        No performance data yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111111" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#111111" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridYs.map((f) => (
          <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ih * f} y2={PAD.t + ih * f} stroke="#EFEFEF" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#g${gid})`} className="anim-fade" />
        <path d={line} fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" pathLength={100} className="chart-line" />
        {hover !== null && pts[hover] && (
          <g className="anim-fade">
            <line x1={pts[hover].x} x2={pts[hover].x} y1={PAD.t} y2={PAD.t + ih} stroke="#111" strokeOpacity="0.15" strokeDasharray="3 3" />
            <circle cx={pts[hover].x} cy={pts[hover].y} r="4.5" fill="#111" stroke="#fff" strokeWidth="2" />
          </g>
        )}
        {data.map((d, i) =>
          i % Math.ceil(data.length / 6) === 0 || i === data.length - 1 ? (
            <text key={i} x={pts[i].x} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#A6A6A6">
              {d.label}
            </text>
          ) : null
        )}
      </svg>
      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-center shadow-lift anim-fade"
          style={{ left: `${(pts[hover].x / W) * 100}%` }}
        >
          <div className="text-[13px] font-semibold text-white tnum">{fmtCompact(data[hover].value)}</div>
          <div className="text-[10px] text-white/60">
            {data[hover].label} · {valueLabel}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- Comparison bars ------------------------ */

export function CompareBars({
  items,
}: {
  items: { id: string; name: string; value: number; sub?: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const sorted = [...items].sort((a, b) => b.value - a.value);
  return (
    <div className="flex flex-col gap-5">
      {sorted.map((item, i) => (
        <div key={item.id}>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <span className="text-[13px] font-medium text-ink">{item.name}</span>
            <span className="text-[13px] text-sub tnum">
              <span className="font-semibold text-ink">{fmtCompact(item.value)}</span>
              {item.sub ? <span className="text-faint"> · {item.sub}</span> : null}
            </span>
          </div>
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-mist">
            <div
              className="bar-grow h-full rounded-full"
              style={{
                width: `${Math.max(3, (item.value / max) * 100)}%`,
                background: i === 0 ? "#111111" : "#D8D8D8",
                animationDelay: `${i * 120}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Avatars ----------------------------- */

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, size = 36, src }: { name: string; size?: number; src?: string | null }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="inline-flex shrink-0 rounded-full bg-mist object-cover"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}
