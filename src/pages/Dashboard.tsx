import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Flag,
  Headphones,
  Inbox,
  LayoutGrid,
  LogOut,
  Mail,
  Megaphone,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Receipt,
  Search,

  User as UserIcon,
  XCircle,
} from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import {
  AppNotification,
  Campaign,
  NotificationType,
  PACKAGE,
  PLATFORMS,
  PLATFORM_ORDER,
  PlatformId,
  SUPPORT_EMAIL,
  WHATSAPP_LINK,
  WHATSAPP_NUMBER,
  campaignTotals,
  fmtDate,
  fmtDateTime,
  fmtINR,
  fmtMetric,
  fmtPaise,
  hasAnyMetric,
  sumMetrics,
  timeAgo,
} from "../lib/data";
import { Avatar, CompareBars, EmptyState, Field, Input, Logo, PlatformChip, Select, StatePill, StatusPill, Textarea, btnCls } from "../components/ui";

/* ------------------------------- Shell ------------------------------- */

export type DashView = "overview" | "campaigns" | "campaign" | "reports" | "notifications" | "orders" | "payments" | "account" | "support";

const SIDE_ITEMS: { id: DashView; label: string; to: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", to: "/dashboard", icon: <LayoutGrid size={18} /> },
  { id: "campaigns", label: "My Campaigns", to: "/dashboard/campaigns", icon: <Megaphone size={18} /> },
  { id: "reports", label: "Reports", to: "/dashboard/reports", icon: <BarChart3 size={18} /> },
  { id: "orders", label: "Orders", to: "/dashboard/orders", icon: <Receipt size={18} /> },
  { id: "payments", label: "Payments", to: "/dashboard/payments", icon: <CreditCard size={18} /> },
  { id: "notifications", label: "Notifications", to: "/dashboard/notifications", icon: <Bell size={18} /> },
  { id: "support", label: "Support", to: "/dashboard/support", icon: <Headphones size={18} /> },
  { id: "account", label: "Account", to: "/dashboard/account", icon: <UserIcon size={18} /> },
];

const MOBILE_ITEMS: { id: DashView; label: string; to: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", to: "/dashboard", icon: <LayoutGrid size={20} /> },
  { id: "campaigns", label: "Campaigns", to: "/dashboard/campaigns", icon: <Megaphone size={20} /> },
  { id: "reports", label: "Reports", to: "/dashboard/reports", icon: <BarChart3 size={20} /> },
  { id: "notifications", label: "Alerts", to: "/dashboard/notifications", icon: <Bell size={20} /> },
  { id: "account", label: "Account", to: "/dashboard/account", icon: <UserIcon size={20} /> },
];

export function DashboardShell({ active, children }: { active: DashView; children: React.ReactNode }) {
  const { user, unread, logout } = useStore();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-[68px] items-center border-b border-line px-6">
          <button onClick={() => navigate("/")} className="cursor-pointer" aria-label="Beyond Reach home">
            <Logo />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {SIDE_ITEMS.map((item) => {
            const isActive = active === item.id || (item.id === "campaigns" && active === "campaign");
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.to)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all cursor-pointer ${isActive ? "bg-ink font-medium text-white shadow-soft" : "text-sub hover:bg-mist hover:text-ink"}`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "notifications" && unread > 0 && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${isActive ? "bg-white text-ink" : "bg-ink text-white"}`}>{unread}</span>
                )}
              </button>
            );
          })}
          <button onClick={() => navigate("/book")} className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-ink/25 px-3.5 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink hover:bg-mist cursor-pointer">
            <Plus size={18} /> New Campaign
          </button>
        </nav>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user.name} size={38} src={user.avatar} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-faint">{user.email}</p>
            </div>
            <button
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              className="rounded-lg p-2 text-faint transition-colors hover:bg-mist hover:text-ink cursor-pointer"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-[60px] items-center justify-between border-b border-line bg-white/90 px-5 backdrop-blur-lg lg:hidden">
        <button onClick={() => navigate("/")} aria-label="Beyond Reach home" className="cursor-pointer">
          <Logo markSize={30} />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/book")} className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white cursor-pointer" aria-label="New campaign">
            <Plus size={18} />
          </button>
          <button onClick={() => navigate("/dashboard/account")} aria-label="Account" className="cursor-pointer">
            <Avatar name={user.name} size={34} src={user.avatar} />
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_ITEMS.map((item) => {
            const isActive = active === item.id || (item.id === "campaigns" && active === "campaign");
            return (
              <button key={item.id} onClick={() => navigate(item.to)} className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium cursor-pointer ${isActive ? "text-ink" : "text-faint"}`}>
                {item.icon}
                {item.label}
                {item.id === "notifications" && unread > 0 && (
                  <span className="absolute right-[22%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">{unread}</span>
                )}
                {isActive && <span className="absolute -top-px h-0.5 w-8 rounded-full bg-ink" />}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="px-5 pb-28 pt-[84px] sm:px-8 lg:ml-[264px] lg:px-10 lg:pb-16 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 anim-rise">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink md:text-[32px]">{title}</h1>
        {sub && <p className="mt-1.5 text-sm text-sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------- shared list pieces ------------------------ */

export function CampaignRow({ campaign, compact = false }: { campaign: Campaign; compact?: boolean }) {
  const { data } = useStore();
  const t = campaignTotals(campaign, data.totals);
  return (
    <button onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)} className="group flex w-full items-center gap-4 py-4 text-left cursor-pointer">
      <div className="hidden -space-x-1.5 sm:flex">
        {campaign.platforms.slice(0, 3).map((p) => (
          <span key={p} className="ring-2 ring-white rounded-[10px]">
            <PlatformChip id={p} size={34} />
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{campaign.name}</p>
        <p className="mt-0.5 truncate text-xs text-faint">
          {campaign.ref} · {fmtDate(campaign.createdAt)}
        </p>
      </div>
      {!compact && <span className="hidden text-sm text-sub tnum md:block">{t.views !== null ? `${fmtMetric(t.views)} views` : "Awaiting report"}</span>}
      <StatusPill status={campaign.status} />
      <ArrowRight size={16} className="shrink-0 text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ink" />
    </button>
  );
}

const NOTIF_ICON: Record<NotificationType, React.ReactNode> = {
  payment: <CreditCard size={16} />,
  received: <Inbox size={16} />,
  approved: <CheckCircle2 size={16} />,
  scheduled: <CalendarClock size={16} />,
  started: <Play size={16} />,
  paused: <Pause size={16} />,
  report: <FileText size={16} />,
  completed: <Flag size={16} />,
  rejected: <XCircle size={16} />,
  general: <Bell size={16} />,
};

export function NotificationItem({ n, compact = false }: { n: AppNotification; compact?: boolean }) {
  return (
    <button
      onClick={() => {
        if (n.campaignId) navigate(`/dashboard/campaigns/${n.campaignId}`);
      }}
      className={`flex w-full items-start gap-3.5 rounded-2xl px-3 py-3.5 text-left transition-colors cursor-pointer ${n.read ? "hover:bg-mist" : "bg-mist/80 hover:bg-mist"} ${compact ? "-mx-3" : ""}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-sub">{NOTIF_ICON[n.type] ?? NOTIF_ICON.general}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`truncate text-sm ${n.read ? "font-medium text-ink/80" : "font-semibold text-ink"}`}>{n.title}</span>
          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />}
        </span>
        <span className={`mt-0.5 block text-[13px] leading-snug text-sub ${compact ? "line-clamp-2" : ""}`}>{n.body}</span>
        <span className="mt-1 block text-[11px] text-faint">{timeAgo(n.time)}</span>
      </span>
    </button>
  );
}

function MetricCard({ label, value, sub, delay = 0 }: { label: string; value: string; sub: string; delay?: number }) {
  const unavailable = value === "Awaiting Report" || value === "Not available";
  return (
    <div className="anim-rise rounded-3xl border border-line bg-white p-6" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</p>
      <p className={`mt-3 font-semibold leading-none tracking-tight tnum ${unavailable ? "text-[20px] text-faint" : "text-[34px]"}`}>{value}</p>
      <p className="mt-2.5 text-xs text-sub">{sub}</p>
    </div>
  );
}

/* ------------------------------ Overview ----------------------------- */

function Overview() {
  const { user, data } = useStore();
  if (!user) return null;
  const { campaigns, notifications, totals } = data;

  const agg = useMemo(() => sumMetrics(totals), [totals]);
  const hasReporting = hasAnyMetric(agg);
  const activeCount = campaigns.filter((c) => c.status === "Active").length;
  const completedCount = campaigns.filter((c) => c.status === "Completed").length;
  const firstName = user.name.split(" ")[0];
  const lastSync = totals.map((t) => t.lastSyncedAt).sort().reverse()[0];

  return (
    <div>
      <PageHead
        title={`Welcome back, ${firstName}`}
        sub={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        action={
          <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
            <Plus size={16} /> New Campaign
          </button>
        }
      />

      {campaigns.length === 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink px-6 py-5 text-white anim-rise">
          <div>
            <p className="text-sm font-semibold">
              {user.isFirstLogin ? "Welcome — your account was just created with Google." : "No campaigns yet."}
            </p>
            <p className="mt-1 text-[13px] text-white/60">
              {user.isFirstLogin
                ? "Registration happened automatically — no separate sign-up needed. Launch your first campaign from here."
                : "Start your first campaign in about ten minutes — the Starter Reach package is ₹399."}
            </p>
          </div>
          <button onClick={() => navigate("/book")} className={btnCls("white", "sm")}>
            Start Your First Campaign
          </button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard label="Total Views" value={agg.views === null ? "Awaiting Report" : fmtMetric(agg.views)} sub={hasReporting ? "Verified platform data" : "Appears once reporting data is verified"} />
        <MetricCard label="Total Reach" value={agg.reach === null ? "Awaiting Report" : fmtMetric(agg.reach)} sub="Unique people reached" delay={70} />
        <MetricCard label="Active Campaigns" value={String(activeCount)} sub={activeCount === 1 ? "Campaign live now" : "Campaigns live now"} delay={140} />
        <MetricCard label="Completed" value={String(completedCount)} sub="Finished campaigns" delay={210} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink">Platform performance</h2>
                <p className="mt-0.5 text-xs text-sub">{lastSync ? `Last updated ${fmtDateTime(lastSync)}` : "Verified data from Meta Ads and Google Ads reporting"}</p>
              </div>
              <button onClick={() => navigate("/dashboard/reports")} className="text-[13px] font-medium text-sub transition-colors hover:text-ink cursor-pointer">
                View reports →
              </button>
            </div>
            <div className="mt-5">
              {hasReporting ? (
                <PlatformTable />
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center text-center">
                  <BarChart3 size={22} className="text-faint" />
                  <p className="mt-3 text-sm font-medium text-ink">Analytics Not Available Yet</p>
                  <p className="mt-1 max-w-xs text-[13px] text-sub">
                    {campaigns.length ? "Platform statistics appear here once your campaign is live and reporting data has been verified." : "Book a campaign to start collecting verified platform statistics."}
                  </p>
                  {!campaigns.length && (
                    <button onClick={() => navigate("/book")} className={btnCls("secondary", "sm", "mt-4")}>
                      Start Your First Campaign
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Recent campaigns</h2>
              <button onClick={() => navigate("/dashboard/campaigns")} className="text-[13px] font-medium text-sub transition-colors hover:text-ink cursor-pointer">
                View all →
              </button>
            </div>
            {campaigns.length === 0 ? (
              <EmptyState
                icon={<Megaphone size={22} />}
                title="No campaigns yet."
                body="Launch your first campaign in about ten minutes — the Starter Reach package is ₹399."
                action={
                  <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
                    Start Your First Campaign
                  </button>
                }
              />
            ) : (
              <div className="mt-4 divide-y divide-line">
                {campaigns.slice(0, 3).map((c) => (
                  <CampaignRow key={c.id} campaign={c} compact />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Latest updates</h2>
              <button onClick={() => navigate("/dashboard/notifications")} className="text-[13px] font-medium text-sub transition-colors hover:text-ink cursor-pointer">
                View all →
              </button>
            </div>
            <div className="mt-4 flex flex-col">
              {notifications.slice(0, 4).map((n) => (
                <NotificationItem key={n.id} n={n} compact />
              ))}
              {notifications.length === 0 && <p className="py-4 text-sm text-faint">You're all caught up.</p>}
            </div>
          </div>

          <AboutVersionCard />

          <div className="rounded-3xl bg-ink p-6 text-white">
            <h2 className="text-[15px] font-semibold tracking-tight">Grow further</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">Book your campaign and our team takes care of the rest — review, launch and reporting.</p>
            <div className="mt-5 flex flex-col gap-2">
              <button onClick={() => navigate("/book")} className={btnCls("white", "md", "w-full")}>
                <Plus size={15} /> Book a Campaign
              </button>
              <button onClick={() => navigate("/dashboard/support")} className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white/70 transition-all hover:text-white cursor-pointer">
                <Headphones size={15} /> Talk to Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Per-platform totals across all campaigns — Views, Reach and Impressions never mixed. */
function PlatformTable({ campaignId }: { campaignId?: string }) {
  const { data } = useStore();
  const rows = PLATFORM_ORDER.map((p) => {
    const sets = data.totals.filter((t) => t.platform === p && (!campaignId || t.campaignId === campaignId));
    return { p, m: sumMetrics(sets), days: sets.reduce((s, t) => s + t.daysReported, 0) };
  }).filter((r) => r.days > 0);
  if (!rows.length) return <p className="py-6 text-center text-sm text-faint">Analytics Not Available Yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            <th className="pb-3 font-semibold">Platform</th>
            <th className="pb-3 text-right font-semibold">Views</th>
            <th className="pb-3 text-right font-semibold">Reach</th>
            <th className="pb-3 text-right font-semibold">Impressions</th>
            <th className="pb-3 text-right font-semibold">Clicks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.p}>
              <td className="py-3">
                <span className="flex items-center gap-2.5">
                  <PlatformChip id={r.p} size={28} />
                  <span className="font-medium text-ink">{PLATFORMS[r.p].name}</span>
                  <span className="text-xs text-faint">{r.days}d</span>
                </span>
              </td>
              {(["views", "reach", "impressions", "clicks"] as const).map((k) => (
                <td key={k} className={`py-3 text-right tnum ${r.m[k] === null ? "text-faint" : "font-medium text-ink"}`}>
                  {fmtMetric(r.m[k], "n/a")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-faint">“n/a” — metric not provided by that platform for this placement.</p>
    </div>
  );
}

/* ------------------------- About this version ------------------------- */

function AboutVersionCard() {
  return (
    <div className="rounded-3xl border border-line bg-white p-6">
      <h2 className="text-[15px] font-semibold tracking-tight text-ink">About this version</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-sub">
        This is the frontend version of Beyond Reach. It shows your profile and your campaign workspace. Booking requests
        reach our team on WhatsApp or email, and reports will be shared with you as your campaigns run.
      </p>
    </div>
  );
}

/* ------------------------------ Campaigns ---------------------------- */

const STATUS_FILTERS = ["All", "Active", "Under Review", "Payment Confirmed", "Scheduled", "Approved", "Paused", "Completed", "Payment Pending", "Rejected"] as const;

function CampaignsPage() {
  const { data } = useStore();
  const [filter, setFilter] = useState<string>("All");
  const [q, setQ] = useState("");
  const campaigns = data.campaigns;

  const filtered = campaigns.filter((c) => {
    if (filter !== "All" && c.status !== filter) return false;
    if (q && !`${c.name} ${c.ref} ${c.businessName}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of campaigns) m.set(c.status, (m.get(c.status) || 0) + 1);
    return m;
  }, [campaigns]);

  return (
    <div>
      <PageHead
        title="My Campaigns"
        sub={`${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"} in your account`}
        action={
          <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
            <Plus size={16} /> New Campaign
          </button>
        }
      />

      <div className="mt-8 flex flex-col gap-4 anim-rise">
        <div className="relative max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
          <Input placeholder="Search campaigns…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUS_FILTERS.filter((s) => s === "All" || counts.has(s)).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all cursor-pointer ${filter === s ? "border-ink bg-ink text-white" : "border-line bg-white text-sub hover:border-ink/40 hover:text-ink"}`}>
              {s}
              {s !== "All" && <span className="ml-1.5 opacity-60 tnum">{counts.get(s)}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-white anim-rise">
        {campaigns.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={22} />}
            title="No campaigns yet."
            body="Your campaigns will appear here. Book your first one — it takes about ten minutes and costs ₹399."
            action={
              <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
                Start Your First Campaign
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={22} />}
            title="Nothing matches"
            body="No campaigns match your current search or filter. Try a different combination."
            action={
              <button onClick={() => { setFilter("All"); setQ(""); }} className={btnCls("secondary", "md")}>
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            <div className="hidden grid-cols-[1fr_130px_130px_160px_28px] items-center gap-4 border-b border-line bg-mist/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint md:grid">
              <span>Campaign</span>
              <span>Platforms</span>
              <span className="text-right">Views</span>
              <span>Status</span>
              <span />
            </div>
            <div className="divide-y divide-line px-3 sm:px-3 md:px-6">
              {filtered.map((c) => {
                const t = campaignTotals(c, data.totals);
                return (
                  <button key={c.id} onClick={() => navigate(`/dashboard/campaigns/${c.id}`)} className="group flex w-full items-center gap-4 py-4 text-left cursor-pointer md:grid md:grid-cols-[1fr_130px_130px_160px_28px]">
                    <span className="min-w-0 flex-1 md:flex-none">
                      <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-faint">
                        {c.ref} · {c.businessName} · {fmtDate(c.createdAt)}
                      </span>
                    </span>
                    <span className="hidden -space-x-1.5 md:flex">
                      {c.platforms.slice(0, 4).map((p) => (
                        <span key={p} className="rounded-[10px] ring-2 ring-white">
                          <PlatformChip id={p} size={30} />
                        </span>
                      ))}
                    </span>
                    <span className={`hidden text-right text-sm tnum md:block ${t.views === null ? "text-xs text-faint" : "font-medium text-ink"}`}>{t.views === null ? "Awaiting Report" : fmtMetric(t.views)}</span>
                    <span>
                      <StatusPill status={c.status} />
                    </span>
                    <ArrowRight size={16} className="justify-self-end text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ink" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-faint">
        Need another campaign? Packages start at {fmtINR(PACKAGE.price)} —{" "}
        <button onClick={() => navigate("/book")} className="font-medium text-ink underline underline-offset-2 cursor-pointer">
          book in minutes
        </button>
        .
      </p>
    </div>
  );
}

/* ------------------------------- Reports ----------------------------- */

const SOURCE_LABEL = { meta_marketing_api: "Meta Marketing API", google_ads_api: "Google Ads API", manual_verified: "Verified by operations" } as const;

function ReportsPage() {
  const { user, data } = useStore();
  if (!user) return null;
  const { campaigns, reports, totals } = data;
  const agg = useMemo(() => sumMetrics(totals), [totals]);
  const byCampaign = new Map(campaigns.map((c) => [c.id, c]));

  const bars = PLATFORM_ORDER.map((p) => ({ id: p, name: PLATFORMS[p].name, value: sumMetrics(totals.filter((t) => t.platform === p)).views }))
    .filter((b): b is { id: PlatformId; name: string; value: number } => b.value !== null && b.value > 0)
    .map((b) => ({ ...b, sub: agg.views ? `${Math.round((b.value / agg.views) * 100)}% of views` : undefined }));

  return (
    <div>
      <PageHead title="Reports" sub="Verified campaign reports, platform-wise statistics and downloadable PDFs." />

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {(["views", "reach", "impressions", "clicks"] as const).map((k, i) => (
          <MetricCard key={k} label={k === "views" ? "Total Views" : k === "reach" ? "Total Reach" : k[0].toUpperCase() + k.slice(1)} value={agg[k] === null ? "Awaiting Report" : fmtMetric(agg[k])} sub={agg[k] === null ? "No verified data yet" : "Across all campaigns"} delay={i * 60} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-line bg-white p-6 md:p-7 xl:col-span-1">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Platform comparison</h2>
          <p className="mt-0.5 text-xs text-sub">Views by platform · all campaigns</p>
          <div className="mt-6">{bars.length ? <CompareBars items={bars} /> : <p className="py-8 text-center text-sm text-faint">No platform data yet.</p>}</div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-line bg-white xl:col-span-2">
          <div className="border-b border-line px-6 py-5 md:px-7">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Campaign reports</h2>
            <p className="mt-0.5 text-xs text-sub">Each report states its reporting period, source and generation time.</p>
          </div>
          {reports.length === 0 ? (
            <EmptyState
              icon={<FileText size={22} />}
              title="No reports yet."
              body={campaigns.length ? "Your campaign reports will appear here once reporting data is available from the advertising platforms." : "Reports are generated for campaigns once they are live and reporting data has been verified."}
              action={
                <button onClick={() => navigate(campaigns.length ? "/dashboard/campaigns" : "/book")} className={btnCls("primary", "md")}>
                  {campaigns.length ? "View My Campaigns" : "Book a Campaign"}
                </button>
              }
            />
          ) : (
            <div className="divide-y divide-line">
              {reports.map((r) => {
                const c = byCampaign.get(r.campaignId);
                if (!c) return null;
                return (
                  <div key={r.id} className="flex flex-wrap items-center gap-4 px-6 py-5 md:px-7">
                    <div className="min-w-0 flex-1 basis-52">
                      <p className="truncate text-sm font-semibold text-ink">
                        {c.name} {r.isFinal && <span className="ml-1.5 rounded-full bg-mist px-2 py-0.5 text-[10px] font-medium text-sub">FINAL</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-faint">
                        {c.ref} · {fmtDate(r.periodStart)} — {fmtDate(r.periodEnd)} · {SOURCE_LABEL[r.source]} · generated {fmtDateTime(r.generatedAt)}
                      </p>
                    </div>
                    <div className="hidden gap-8 text-right sm:flex">
                      <div>
                        <p className="text-sm font-semibold tnum">{fmtMetric(r.totals.views, "n/a")}</p>
                        <p className="text-[10px] uppercase tracking-wider text-faint">Views</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold tnum">{fmtMetric(r.totals.reach, "n/a")}</p>
                        <p className="text-[10px] uppercase tracking-wider text-faint">Reach</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/dashboard/campaigns/${c.id}`)} className={btnCls("secondary", "sm")}>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Notifications -------------------------- */

function NotificationsPage() {
  const { data, unread } = useStore();
  return (
    <div>
      <PageHead
        title="Notifications"
        sub={unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You're all caught up"}
      />
      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white p-2 sm:p-3 anim-rise">
        {data.notifications.length === 0 ? (
          <EmptyState icon={<Bell size={22} />} title="No notifications" body="Payment confirmations, campaign approvals and report updates will appear here." />
        ) : (
          <div className="flex flex-col">
            {data.notifications.map((n) => (
              <NotificationItem key={n.id} n={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Orders ------------------------------ */

function payPill(status: string) {
  const colors: Record<string, string> = { Paid: "#1f9d55", captured: "#1f9d55", Failed: "#dc2626", failed: "#dc2626", Pending: "#d97706", created: "#d97706", authorized: "#d97706", Refunded: "#a3a3a3", refunded: "#a3a3a3", Cancelled: "#a3a3a3" };
  const label = status === "captured" ? "Paid" : status[0].toUpperCase() + status.slice(1);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-mist px-2.5 py-1 text-[11px] font-medium text-ink/80">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors[status] || "#a3a3a3" }} />
      {label}
    </span>
  );
}

function OrdersPage() {
  const { user, data } = useStore();
  if (!user) return null;
  const campaignById = new Map(data.campaigns.map((c) => [c.id, c]));

  return (
    <div>
      <PageHead title="Orders" sub="Every campaign booking and its payment status." />
      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white anim-rise">
        {data.orders.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="No orders yet."
            body="When you book a campaign and proceed to payment, your order will appear here."
            action={
              <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
                Book a Campaign — {fmtINR(PACKAGE.price)}
              </button>
            }
          />
        ) : (
          <>
            <div className="hidden grid-cols-[1fr_1.2fr_120px_100px_120px_150px] items-center gap-4 border-b border-line bg-mist/60 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint lg:grid">
              <span>Order</span>
              <span>Campaign</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-line">
              {data.orders.map((o) => {
                const c = campaignById.get(o.campaignId);
                return (
                  <div key={o.id} className="grid grid-cols-1 gap-3 px-5 py-5 sm:px-7 lg:grid-cols-[1fr_1.2fr_120px_100px_120px_150px] lg:items-center lg:gap-4">
                    <div>
                      <p className="font-mono text-[13px] font-semibold text-ink">{o.ref}</p>
                      <p className="text-xs text-faint">{c?.packageName ?? PACKAGE.name}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{c?.name ?? "—"}</p>
                      {c && <p className="text-xs text-faint">{c.ref}</p>}
                    </div>
                    <p className="text-sm text-sub">{fmtDate(o.paidAt ?? o.createdAt)}</p>
                    <p className="text-sm font-semibold tnum">{fmtPaise(o.amountPaise)}</p>
                    <div>{payPill(o.status)}</div>
                    <div className="flex gap-2 lg:justify-end">
                      {c && (
                        <button onClick={() => navigate(`/dashboard/campaigns/${c.id}`)} className={btnCls("secondary", "sm")}>
                          {o.status === "Pending" ? "Complete Payment" : "View"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Payments ----------------------------- */

function PaymentsPage() {
  const { user, data } = useStore();
  if (!user) return null;
  const orderById = new Map(data.orders.map((o) => [o.id, o]));
  const campaignById = new Map(data.campaigns.map((c) => [c.id, c]));

  return (
    <div>
      <PageHead title="Payments" sub="Online payments are not enabled in this version yet. Payment records will appear here once they are." />
      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white anim-rise">
        {data.payments.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={22} />}
            title="No payments yet."
            body="Your payment history will appear here after your first successful transaction."
            action={
              <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
                Book a Campaign
              </button>
            }
          />
        ) : (
          <>
            <div className="hidden grid-cols-[1.4fr_1fr_120px_100px_110px_130px] items-center gap-4 border-b border-line bg-mist/60 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint lg:grid">
              <span>Payment</span>
              <span>Campaign</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span className="text-right">Receipt</span>
            </div>
            <div className="divide-y divide-line">
              {data.payments.map((p) => {
                const o = orderById.get(p.orderId);
                const c = o ? campaignById.get(o.campaignId) : undefined;
                return (
                  <div key={p.id} className="grid grid-cols-1 gap-3 px-5 py-5 sm:px-7 lg:grid-cols-[1.4fr_1fr_120px_100px_110px_130px] lg:items-center lg:gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[12.5px] font-semibold text-ink">{p.paymentId}</p>
                      <p className="text-xs text-faint">
                        {(p.method || "—").toUpperCase()} · verified via {p.verifiedBy}
                        {p.errorDescription ? ` · ${p.errorDescription}` : ""}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{c?.name ?? "—"}</p>
                      {o && <p className="text-xs text-faint">{o.ref}</p>}
                    </div>
                    <p className="text-sm text-sub">{fmtDateTime(p.createdAt)}</p>
                    <p className="text-sm font-semibold tnum">{fmtPaise(p.amountPaise)}</p>
                    <div>{payPill(p.status)}</div>
                    <div className="flex lg:justify-end">
                      <StatePill label="Receipt on request" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Support ----------------------------- */

const SUBJECTS = ["Campaign question", "Payment & billing", "Report issue", "Creative help", "Account help", "Something else"];

function SupportPage() {
  const { user, toast } = useStore();
  if (!user) return null;
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const compose = () => `${subject}: ${message.trim()}\n\n— ${user.name} (${user.email})`;

  const valid = () => {
    setError("");
    if (message.trim().length < 10) {
      setError("Please describe how we can help (min. 10 characters).");
      return false;
    }
    return true;
  };

  const sendWhatsApp = () => {
    if (!valid()) return;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(compose())}`, "_blank", "noopener");
    toast("Request prepared", "WhatsApp is opening with your message — send it to reach us.");
  };

  const sendEmail = () => {
    if (!valid()) return;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(compose())}`;
    toast("Request prepared", "Your email app is opening — hit send to reach us.");
  };

  return (
    <div>
      <PageHead title="Support" sub="Questions about a campaign, payment or report — we're here." />
      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-line bg-white p-6 md:p-8 anim-rise xl:col-span-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Send a message</h2>
          <div className="mt-6 grid gap-5">
            <Field label="Subject">
              <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </Select>
            </Field>
            <Field label="Message">
              <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" maxLength={4000} />
            </Field>
            {error && <p className="text-xs text-red-600 anim-fade">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button onClick={sendWhatsApp} className={btnCls("primary", "md")}>
                <MessageCircle size={15} /> Send on WhatsApp
              </button>
              <button onClick={sendEmail} className={btnCls("secondary", "md")}>
                <Mail size={15} /> Send by Email
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-faint">
              The buttons open WhatsApp or your email app with the message pre-filled — nothing is sent until you press send there.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-white p-6 anim-rise">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Direct lines</h2>
            <div className="mt-4 flex flex-col gap-2">
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className={btnCls("primary", "md", "w-full")}>
                Chat on WhatsApp
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className={btnCls("secondary", "md", "w-full")}>
                {SUPPORT_EMAIL}
              </a>
            </div>
            <p className="mt-4 text-xs text-faint">Mon–Sat · 10:00 AM – 7:00 PM IST</p>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 anim-rise">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">How we reply</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-sub">
              Messages you send reach our team directly on WhatsApp or email, and replies come back on the same channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Account ----------------------------- */

function AccountPage() {
  const { user, logout } = useStore();
  if (!user) return null;

  return (
    <div>
      <PageHead title="Account" sub="Your profile, session and quick links." />

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <div className="rounded-3xl border border-line bg-white p-6 md:p-8 anim-rise">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} size={56} src={user.avatar} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold tracking-tight text-ink">{user.name}</p>
                  <StatePill label="Active" tone="ok" />
                </div>
                <p className="text-sm text-sub">{user.email}</p>
                <p className="mt-0.5 text-xs text-faint">Google account</p>
              </div>
            </div>
            <div className="mt-7 divide-y divide-line/70">
              {(
                [
                  ["User ID", <span className="font-mono text-[12.5px]" key="uid">{user.id}</span>],
                  ["Registered on", fmtDate(user.createdAt)],
                  ["Last login", fmtDateTime(user.lastLoginAt)],
                  ["Account status", "Active"],
                ] as [string, React.ReactNode][]
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-2.5 text-sm">
                  <span className="shrink-0 text-sub">{label}</span>
                  <span className="text-right font-medium text-ink break-words">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-mist px-5 py-4">
              <p className="text-[13px] leading-relaxed text-sub">
                This account was created automatically by Google and is stored in Firebase Authentication — one account per
                Google email, with the same User ID on every login. Name, email and photo are provided by Google and can't be
                edited here.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 md:p-8 anim-rise">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Session & privacy</h2>
            <p className="mt-3 text-sm leading-relaxed text-sub">
              Your session is verified with Google every time you visit. We never ask for or store your password. Signing
              out below ends the session on this device.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-white p-3 anim-rise">
            {[
              { label: "My Campaigns", to: "/dashboard/campaigns", icon: <Megaphone size={17} /> },
              { label: "Reports", to: "/dashboard/reports", icon: <BarChart3 size={17} /> },
              { label: "Support", to: "/dashboard/support", icon: <Headphones size={17} /> },
              { label: "Book a New Campaign", to: "/book", icon: <Plus size={17} /> },
            ].map((l) => (
              <button key={l.to} onClick={() => navigate(l.to)} className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-ink transition-colors hover:bg-mist cursor-pointer">
                <span className="text-sub">{l.icon}</span>
                {l.label}
                <ArrowRight size={15} className="ml-auto text-faint" />
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 md:p-7 anim-rise">
            <button
              onClick={async () => {
                await logout();
                navigate("/");
              }}
              className={btnCls("secondary", "md", "w-full")}
            >
              <LogOut size={15} /> Sign out
            </button>
            <p className="mt-4 text-[11px] leading-relaxed text-faint">
              Signing out clears this session on your device. Your Google account and password stay with Google.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Page switch ----------------------------- */

export default function DashboardPage({ view }: { view: DashView }) {
  return (
    <DashboardShell active={view}>
      {view === "overview" && <Overview />}
      {view === "campaigns" && <CampaignsPage />}
      {view === "reports" && <ReportsPage />}
      {view === "notifications" && <NotificationsPage />}
      {view === "orders" && <OrdersPage />}
      {view === "payments" && <PaymentsPage />}
      {view === "support" && <SupportPage />}
      {view === "account" && <AccountPage />}
    </DashboardShell>
  );
}
