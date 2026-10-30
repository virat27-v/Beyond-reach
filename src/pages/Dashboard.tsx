import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Flag,
  Headphones,
  Inbox,
  LayoutGrid,
  LogOut,
  Megaphone,
  Pause,
  Play,
  Plus,
  Receipt,
  Search,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import {
  AppNotification,
  Campaign,
  NotificationType,
  PACKAGE,
  PLATFORMS,
  campaignTotals,
  fmtDate,
  fmtINR,
  fmtNum,
  timeAgo,
} from "../lib/data";
import { downloadCampaignReport, downloadReceipt } from "../lib/pdf";
import {
  AreaChart,
  Avatar,
  Btn,
  CompareBars,
  DemoBadge,
  EmptyState,
  Field,
  Input,
  Logo,
  PlatformChip,
  Spinner,
  StatusPill,
  btnCls,
} from "../components/ui";
import { CountUp } from "./Home";

/* ------------------------------- Shell ------------------------------- */

export type DashView = "overview" | "campaigns" | "campaign" | "reports" | "notifications" | "orders" | "account";

const SIDE_ITEMS: { id: DashView; label: string; to: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", to: "/dashboard", icon: <LayoutGrid size={18} /> },
  { id: "campaigns", label: "My Campaigns", to: "/dashboard/campaigns", icon: <Megaphone size={18} /> },
  { id: "orders", label: "My Orders", to: "/dashboard/orders", icon: <Receipt size={18} /> },
  { id: "reports", label: "Reports", to: "/dashboard/reports", icon: <BarChart3 size={18} /> },
  { id: "notifications", label: "Notifications", to: "/dashboard/notifications", icon: <Bell size={18} /> },
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
      {/* sidebar */}
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
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all cursor-pointer ${
                  isActive ? "bg-ink font-medium text-white shadow-soft" : "text-sub hover:bg-mist hover:text-ink"
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "notifications" && unread > 0 && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${isActive ? "bg-white text-ink" : "bg-ink text-white"}`}>
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => navigate("/book")}
            className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-ink/25 px-3.5 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink hover:bg-mist cursor-pointer"
          >
            <Plus size={18} /> New Campaign
          </button>
        </nav>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user.name} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-faint">{user.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
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

      {/* mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-[60px] items-center justify-between border-b border-line bg-white/90 px-5 backdrop-blur-lg lg:hidden">
        <button onClick={() => navigate("/")} aria-label="Beyond Reach home" className="cursor-pointer">
          <Logo markSize={30} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/book")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white cursor-pointer"
            aria-label="New campaign"
          >
            <Plus size={18} />
          </button>
          <button onClick={() => navigate("/dashboard/account")} aria-label="Account" className="cursor-pointer">
            <Avatar name={user.name} size={34} />
          </button>
        </div>
      </header>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_ITEMS.map((item) => {
            const isActive = active === item.id || (item.id === "campaigns" && active === "campaign");
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.to)}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium cursor-pointer ${
                  isActive ? "text-ink" : "text-faint"
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === "notifications" && unread > 0 && (
                  <span className="absolute right-[22%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">
                    {unread}
                  </span>
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

export function PageHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
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

/* ------------------------------ Overview ----------------------------- */

function Overview() {
  const { user, data } = useStore();
  if (!user) return null;
  const { campaigns, notifications } = data;

  const totals = useMemo(() => {
    let views = 0,
      reach = 0;
    for (const c of campaigns) {
      const t = campaignTotals(c);
      views += t.views;
      reach += t.reach;
    }
    return { views, reach };
  }, [campaigns]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of campaigns) for (const d of c.daily) map.set(d.date, (map.get(d.date) || 0) + d.total);
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, value]) => ({
        label: new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value,
      }));
  }, [campaigns]);

  const hasDemo = campaigns.some((c) => c.demo);
  const activeCount = campaigns.filter((c) => c.status === "Active").length;
  const completedCount = campaigns.filter((c) => c.status === "Completed").length;
  const firstName = user.name.split(" ")[0];
  const latestWithData = campaigns.find((c) => c.daily.length > 0);

  const metrics = [
    { label: "Total Views", value: totals.views, sub: "Across all campaigns" },
    { label: "Total Reach", value: totals.reach, sub: "Unique people reached" },
    { label: "Active Campaigns", value: activeCount, sub: activeCount === 1 ? "Campaign live now" : "Campaigns live now", raw: true },
    { label: "Completed Campaigns", value: completedCount, sub: "Finished campaigns", raw: true },
  ];

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

      {hasDemo && (
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-dashed border-ink/20 bg-white px-4 py-3 anim-fade">
          <DemoBadge />
          <p className="text-[13px] text-sub">
            Demonstration workspace — sample campaigns are shown so you can explore. Campaigns you book will appear here with live data.
          </p>
        </div>
      )}

      {/* metrics */}
      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={m.label} className="anim-rise rounded-3xl border border-line bg-white p-6" style={{ animationDelay: `${i * 70}ms` }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{m.label}</p>
            <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight">
              {m.raw ? <span className="tnum">{m.value}</span> : <CountUp end={m.value} />}
            </p>
            <p className="mt-2.5 text-xs text-sub">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* chart + recent */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink">Performance</h2>
                <p className="mt-0.5 text-xs text-sub">Daily views · last 14 days · all campaigns</p>
              </div>
              <button onClick={() => navigate("/dashboard/reports")} className="text-[13px] font-medium text-sub transition-colors hover:text-ink cursor-pointer">
                View reports →
              </button>
            </div>
            <div className="mt-5">
              {chartData.length ? (
                <AreaChart data={chartData} height={210} />
              ) : (
                <div className="flex h-[210px] flex-col items-center justify-center text-center">
                  <BarChart3 size={22} className="text-faint" />
                  <p className="mt-3 max-w-xs text-sm text-sub">No performance data yet. Charts appear here once your first campaign goes live.</p>
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
                title="No campaigns yet"
                body="Launch your first campaign in about ten minutes — packages start at ₹399."
                action={
                  <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
                    Start Advertising — ₹399
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

        {/* right rail */}
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

          <div className="rounded-3xl bg-ink p-6 text-white">
            <h2 className="text-[15px] font-semibold tracking-tight">Grow further</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
              Run another campaign, or download your latest performance report to share with your team.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button onClick={() => navigate("/book")} className={btnCls("white", "md", "w-full")}>
                <Plus size={15} /> Book a Campaign
              </button>
              <button
                disabled={!latestWithData}
                onClick={() => latestWithData && downloadCampaignReport(latestWithData, user.name)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                <Download size={15} /> Latest Report (PDF)
              </button>
              <button
                onClick={() => navigate("/support")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white/70 transition-all hover:text-white cursor-pointer"
              >
                <Headphones size={15} /> Talk to Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- shared list pieces ------------------------ */

export function CampaignRow({ campaign, compact = false }: { campaign: Campaign; compact?: boolean }) {
  const t = campaignTotals(campaign);
  return (
    <button
      onClick={() => navigate(`/dashboard/campaigns/${campaign.id}`)}
      className="group flex w-full items-center gap-4 py-4 text-left cursor-pointer"
    >
      <div className="hidden -space-x-1.5 sm:flex">
        {campaign.platforms.slice(0, 3).map((p) => (
          <span key={p} className="ring-2 ring-white rounded-[10px]">
            <PlatformChip id={p} size={34} />
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-black">{campaign.name}</p>
        <p className="mt-0.5 truncate text-xs text-faint">
          {campaign.id} · {fmtDate(campaign.purchaseDate)}
        </p>
      </div>
      {!compact && <span className="hidden text-sm text-sub tnum md:block">{fmtNum(t.views)} views</span>}
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
  general: <Bell size={16} />,
};

export function NotificationItem({ n, compact = false }: { n: AppNotification; compact?: boolean }) {
  const { markRead } = useStore();
  return (
    <button
      onClick={() => {
        markRead(n.id);
        if (n.campaignId) navigate(`/dashboard/campaigns/${n.campaignId}`);
      }}
      className={`flex w-full items-start gap-3.5 rounded-2xl px-3 py-3.5 text-left transition-colors cursor-pointer ${
        n.read ? "hover:bg-mist" : "bg-mist/80 hover:bg-mist"
      } ${compact ? "-mx-3" : ""}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-sub">
        {NOTIF_ICON[n.type]}
      </span>
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

/* ------------------------------ Campaigns ---------------------------- */

const STATUS_FILTERS = ["All", "Active", "Under Review", "Scheduled", "Approved", "Paused", "Completed", "Payment Pending", "Rejected"] as const;

function CampaignsPage() {
  const { data } = useStore();
  const [filter, setFilter] = useState<string>("All");
  const [q, setQ] = useState("");
  const campaigns = data.campaigns;

  const filtered = campaigns.filter((c) => {
    if (filter !== "All" && c.status !== filter) return false;
    if (q && !`${c.name} ${c.id} ${c.businessName}`.toLowerCase().includes(q.toLowerCase())) return false;
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
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all cursor-pointer ${
                filter === s ? "border-ink bg-ink text-white" : "border-line bg-white text-sub hover:border-ink/40 hover:text-ink"
              }`}
            >
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
            title="No campaigns yet"
            body="Your campaigns will appear here. Book your first one — it takes about ten minutes and costs ₹399."
            action={
              <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
                Book Your First Campaign
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={22} />}
            title="Nothing matches"
            body="No campaigns match your current search or filter. Try a different combination."
            action={
              <button
                onClick={() => {
                  setFilter("All");
                  setQ("");
                }}
                className={btnCls("secondary", "md")}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            {/* table header (desktop) */}
            <div className="hidden grid-cols-[1fr_130px_120px_150px_28px] items-center gap-4 border-b border-line bg-mist/60 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint md:grid">
              <span>Campaign</span>
              <span>Platforms</span>
              <span className="text-right">Views</span>
              <span>Status</span>
              <span />
            </div>
            <div className="divide-y divide-line px-3 sm:px-3 md:px-6">
              {filtered.map((c) => {
                const t = campaignTotals(c);
                return (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}
                    className="group flex w-full items-center gap-4 py-4 text-left cursor-pointer md:grid md:grid-cols-[1fr_130px_120px_150px_28px]"
                  >
                    <span className="min-w-0 flex-1 md:flex-none">
                      <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-faint">
                        {c.id} · {c.businessName} · {fmtDate(c.purchaseDate)}
                        {c.demo && <DemoBadge className="ml-2 align-middle" />}
                      </span>
                    </span>
                    <span className="hidden -space-x-1.5 md:flex">
                      {c.platforms.slice(0, 4).map((p) => (
                        <span key={p} className="rounded-[10px] ring-2 ring-white">
                          <PlatformChip id={p} size={30} />
                        </span>
                      ))}
                    </span>
                    <span className="hidden text-right text-sm font-medium text-ink tnum md:block">
                      {c.daily.length ? fmtNum(t.views) : "—"}
                    </span>
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

function ReportsPage() {
  const { user, data } = useStore();
  if (!user) return null;
  const campaigns = data.campaigns;

  const totals = useMemo(() => {
    let views = 0,
      reach = 0,
      impressions = 0,
      clicks = 0;
    const perPlatform = new Map<string, number>();
    for (const c of campaigns) {
      const t = campaignTotals(c);
      views += t.views;
      reach += t.reach;
      impressions += t.impressions;
      clicks += t.clicks;
      for (const p of c.platforms) perPlatform.set(p, (perPlatform.get(p) || 0) + (c.stats[p]?.views || 0));
    }
    return { views, reach, impressions, clicks, perPlatform };
  }, [campaigns]);

  const bars = [...totals.perPlatform.entries()].map(([id, value]) => ({
    id,
    name: PLATFORMS[id as keyof typeof PLATFORMS].name,
    value,
    sub: totals.views ? `${Math.round((value / totals.views) * 100)}% of views` : undefined,
  }));

  return (
    <div>
      <PageHead title="Reports" sub="Download branded PDF reports and compare performance across platforms." />

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total Views", value: totals.views },
          { label: "Total Reach", value: totals.reach },
          { label: "Impressions", value: totals.impressions },
          { label: "Clicks", value: totals.clicks },
        ].map((m, i) => (
          <div key={m.label} className="anim-rise rounded-3xl border border-line bg-white p-6" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{m.label}</p>
            <p className="mt-3 text-[30px] font-semibold leading-none tracking-tight">
              <CountUp end={m.value} />
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-line bg-white p-6 md:p-7 xl:col-span-1">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Platform comparison</h2>
          <p className="mt-0.5 text-xs text-sub">Views by platform · all campaigns</p>
          <div className="mt-6">
            {bars.length ? <CompareBars items={bars} /> : <p className="py-8 text-center text-sm text-faint">No platform data yet.</p>}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-line bg-white xl:col-span-2">
          <div className="border-b border-line px-6 py-5 md:px-7">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Campaign reports</h2>
            <p className="mt-0.5 text-xs text-sub">PDF includes branding, campaign details and platform-wise statistics.</p>
          </div>
          {campaigns.length === 0 ? (
            <EmptyState
              icon={<FileText size={22} />}
              title="No reports yet"
              body="Reports are generated automatically once your campaigns start receiving data."
              action={
                <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
                  Book a Campaign
                </button>
              }
            />
          ) : (
            <div className="divide-y divide-line">
              {campaigns.map((c) => {
                const t = campaignTotals(c);
                const hasData = c.daily.length > 0;
                return (
                  <div key={c.id} className="flex flex-wrap items-center gap-4 px-6 py-5 md:px-7">
                    <div className="min-w-0 flex-1 basis-52">
                      <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                      <p className="mt-0.5 text-xs text-faint">
                        {c.id} · {c.startDate ? `${fmtDate(c.startDate)} — ${fmtDate(c.endDate)}` : `Purchased ${fmtDate(c.purchaseDate)}`}
                        {c.demo && <DemoBadge className="ml-2 align-middle" />}
                      </p>
                    </div>
                    <div className="hidden gap-8 text-right sm:flex">
                      <div>
                        <p className="text-sm font-semibold tnum">{hasData ? fmtNum(t.views) : "—"}</p>
                        <p className="text-[10px] uppercase tracking-wider text-faint">Views</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold tnum">{hasData ? fmtNum(t.reach) : "—"}</p>
                        <p className="text-[10px] uppercase tracking-wider text-faint">Reach</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}
                        className={btnCls("secondary", "sm")}
                      >
                        View
                      </button>
                      <button
                        disabled={!hasData}
                        onClick={() => downloadCampaignReport(c, user.name)}
                        className={btnCls("primary", "sm")}
                        title={hasData ? "Download PDF report" : "Report available once the campaign is live"}
                      >
                        <Download size={14} /> PDF
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
  const { data, unread, markAllRead } = useStore();
  return (
    <div>
      <PageHead
        title="Notifications"
        sub={unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You're all caught up"}
        action={
          unread > 0 ? (
            <button onClick={markAllRead} className={btnCls("secondary", "sm")}>
              <CheckCircle2 size={14} /> Mark all as read
            </button>
          ) : undefined
        }
      />
      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white p-2 sm:p-3 anim-rise">
        {data.notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={22} />}
            title="No notifications"
            body="Payment confirmations, campaign approvals and report updates will appear here."
          />
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
  const colors: Record<string, string> = { Paid: "#1f9d55", Failed: "#dc2626", Pending: "#d97706", Refunded: "#a3a3a3" };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-mist px-2.5 py-1 text-[11px] font-medium text-ink/80">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors[status] || "#a3a3a3" }} />
      {status}
    </span>
  );
}

function OrdersPage() {
  const { user, data } = useStore();
  if (!user) return null;
  const campaignById = new Map(data.campaigns.map((c) => [c.id, c]));

  return (
    <div>
      <PageHead title="My Orders" sub="Your purchases, payment status and downloadable receipts." />
      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white anim-rise">
        {data.orders.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="No orders yet"
            body="When you book a campaign, your order and receipt will appear here."
            action={
              <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
                Book a Campaign — {fmtINR(PACKAGE.price)}
              </button>
            }
          />
        ) : (
          <>
            <div className="hidden grid-cols-[1fr_1.2fr_110px_100px_120px_170px] items-center gap-4 border-b border-line bg-mist/60 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint lg:grid">
              <span>Order</span>
              <span>Campaign</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Payment</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-line">
              {data.orders.map((o) => {
                const c = campaignById.get(o.campaignId);
                return (
                  <div key={o.id} className="grid grid-cols-1 gap-3 px-5 py-5 sm:px-7 lg:grid-cols-[1fr_1.2fr_110px_100px_120px_170px] lg:items-center lg:gap-4">
                    <div>
                      <p className="font-mono text-[13px] font-semibold text-ink">{o.id}</p>
                      <p className="text-xs text-faint">{o.packageName}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{o.campaignName}</p>
                      {c && <p className="text-xs text-faint">{c.id}</p>}
                    </div>
                    <p className="text-sm text-sub">{fmtDate(o.date)}</p>
                    <p className="text-sm font-semibold tnum">{fmtINR(o.amount)}</p>
                    <div>{payPill(o.paymentStatus)}</div>
                    <div className="flex gap-2 lg:justify-end">
                      {c && (
                        <button onClick={() => navigate(`/dashboard/campaigns/${c.id}`)} className={btnCls("secondary", "sm")}>
                          View
                        </button>
                      )}
                      <button
                        disabled={o.paymentStatus !== "Paid"}
                        onClick={() => downloadReceipt(o, c, user.name, user.email)}
                        className={btnCls("primary", "sm")}
                      >
                        <Download size={14} /> Receipt
                      </button>
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

/* ------------------------------- Account ----------------------------- */

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 cursor-pointer ${on ? "bg-ink" : "bg-line"}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function AccountPage() {
  const { user, updateUser, changePassword, logout, deleteAccount, toast } = useStore();
  if (!user) return null;
  const [name, setName] = useState(user.name);
  const [business, setBusiness] = useState(user.business || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveProfile = () => {
    if (name.trim().length < 2) return toast("Please enter your name");
    setSaving(true);
    window.setTimeout(() => {
      updateUser({ name: name.trim(), business: business.trim() || undefined, phone: phone.trim() || undefined });
      setSaving(false);
      toast("Profile updated", "Your account details have been saved.");
    }, 500);
  };

  const savePassword = () => {
    setPwError("");
    if (newPw.length < 6) return setPwError("New password must be at least 6 characters.");
    const res = changePassword(curPw, newPw);
    if (!res.ok) return setPwError(res.error || "Could not update password.");
    setCurPw("");
    setNewPw("");
    toast("Password updated", "Use your new password the next time you log in.");
  };

  const doDelete = () => {
    setDeleting(true);
    window.setTimeout(() => {
      deleteAccount();
      navigate("/");
      toast("Account deleted", "Your account and data have been removed.");
    }, 700);
  };

  return (
    <div>
      <PageHead title="Account" sub="Manage your profile, preferences and security." />

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* profile */}
          <div className="rounded-3xl border border-line bg-white p-6 md:p-8 anim-rise">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} size={56} />
              <div>
                <p className="text-lg font-semibold tracking-tight text-ink">{user.name}</p>
                <p className="text-sm text-sub">{user.email}</p>
                <p className="mt-0.5 text-xs text-faint">
                  {user.provider === "google" ? "Signed in with Google" : "Email account"} · Member since {fmtDate(user.createdAt)}
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Business name" optional>
                <Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Your business" />
              </Field>
              <Field label="Phone number" optional>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Email address">
                <Input value={user.email} disabled className="opacity-60" />
              </Field>
            </div>
            <div className="mt-7 flex justify-end">
              <Btn onClick={saveProfile} disabled={saving}>
                {saving ? <Spinner size={16} /> : "Save Changes"}
              </Btn>
            </div>
          </div>

          {/* password */}
          <div className="rounded-3xl border border-line bg-white p-6 md:p-8 anim-rise">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Password & security</h2>
            {user.provider === "google" ? (
              <p className="mt-3 text-sm leading-relaxed text-sub">
                You sign in with Google, so your password is managed by Google. Visit your Google Account to update it.
              </p>
            ) : (
              <>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Current password">
                    <Input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} autoComplete="current-password" />
                  </Field>
                  <Field label="New password">
                    <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" />
                  </Field>
                </div>
                {pwError && <p className="mt-4 text-[13px] text-red-600 anim-fade">{pwError}</p>}
                <div className="mt-6 flex justify-end">
                  <Btn variant="secondary" onClick={savePassword} disabled={!curPw || !newPw}>
                    Update Password
                  </Btn>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* preferences */}
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7 anim-rise">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Notifications</h2>
            <div className="mt-5 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">Email updates</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-sub">Campaign status, approvals and report alerts by email.</p>
                </div>
                <Toggle on={user.prefs.emailNotifs} onChange={(v) => updateUser({ prefs: { ...user.prefs, emailNotifs: v } })} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">WhatsApp updates</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-sub">Important campaign milestones on WhatsApp.</p>
                </div>
                <Toggle on={user.prefs.whatsappNotifs} onChange={(v) => updateUser({ prefs: { ...user.prefs, whatsappNotifs: v } })} />
              </div>
            </div>
          </div>

          {/* quick links */}
          <div className="rounded-3xl border border-line bg-white p-3 anim-rise">
            {[
              { label: "My Orders & Receipts", to: "/dashboard/orders", icon: <Receipt size={17} /> },
              { label: "Support & FAQs", to: "/support", icon: <Headphones size={17} /> },
              { label: "Book a New Campaign", to: "/book", icon: <Plus size={17} /> },
            ].map((l) => (
              <button
                key={l.to + l.label}
                onClick={() => navigate(l.to)}
                className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-ink transition-colors hover:bg-mist cursor-pointer"
              >
                <span className="text-sub">{l.icon}</span>
                {l.label}
                <ArrowRight size={15} className="ml-auto text-faint" />
              </button>
            ))}
          </div>

          {/* session / danger */}
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7 anim-rise">
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className={btnCls("secondary", "md", "w-full")}
            >
              <LogOut size={15} /> Log out
            </button>
            <div className="my-5 h-px bg-line" />
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className={btnCls("danger-ghost", "md", "w-full")}>
                <Trash2 size={15} /> Delete account
              </button>
            ) : (
              <div className="anim-fade">
                <p className="text-[13px] leading-relaxed text-red-600">
                  This permanently deletes your account, campaigns and reports. This cannot be undone.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={doDelete}
                    disabled={deleting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                  >
                    {deleting ? <Spinner size={15} /> : "Yes, delete"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className={btnCls("secondary", "md", "flex-1")}>
                    Keep account
                  </button>
                </div>
              </div>
            )}
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
      {view === "account" && <AccountPage />}
    </DashboardShell>
  );
}
