import React, { useMemo } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  CalendarClock,
  ExternalLink,
  FileText,
  Headphones,
  LayoutGrid,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  MessageCircle,
  Plus,
  Receipt,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import { SUPPORT_EMAIL, WHATSAPP_LINK, fmtDateTime } from "../lib/data";
import { Avatar, EmptyState, Logo, btnCls } from "../components/ui";

/* ------------------------------------------------------------------ */
/*  Frontend-only client dashboard.                                    */
/*  Shows the signed-in Google profile and honest empty states only.   */
/*  No campaign, payment or analytics data is ever fabricated.         */
/* ------------------------------------------------------------------ */

export type DashView = "overview" | "campaigns" | "reports" | "notifications" | "orders" | "support" | "account";

const SIDE_ITEMS: { id: DashView; label: string; to: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", to: "/dashboard", icon: <LayoutGrid size={18} /> },
  { id: "campaigns", label: "My Campaigns", to: "/dashboard/campaigns", icon: <Megaphone size={18} /> },
  { id: "reports", label: "Reports", to: "/dashboard/reports", icon: <BarChart3 size={18} /> },
  { id: "orders", label: "Orders & Payments", to: "/dashboard/orders", icon: <Receipt size={18} /> },
  { id: "notifications", label: "Notifications", to: "/dashboard/notifications", icon: <Bell size={18} /> },
  { id: "support", label: "Support", to: "/dashboard/support", icon: <Headphones size={18} /> },
  { id: "account", label: "My Profile", to: "/dashboard/account", icon: <UserIcon size={18} /> },
];

const MOBILE_ITEMS: { id: DashView; label: string; to: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", to: "/dashboard", icon: <LayoutGrid size={20} /> },
  { id: "campaigns", label: "Campaigns", to: "/dashboard/campaigns", icon: <Megaphone size={20} /> },
  { id: "reports", label: "Reports", to: "/dashboard/reports", icon: <BarChart3 size={20} /> },
  { id: "support", label: "Support", to: "/dashboard/support", icon: <Headphones size={20} /> },
  { id: "account", label: "Profile", to: "/dashboard/account", icon: <UserIcon size={20} /> },
];

export function DashboardShell({ active, children }: { active: DashView; children: React.ReactNode }) {
  const { user, logout } = useStore();
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
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
          {SIDE_ITEMS.map((item) => {
            const isActive = active === item.id;
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
              </button>
            );
          })}
          <button
            onClick={() => navigate("/book")}
            className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-ink/25 px-3.5 py-2.5 text-sm font-medium text-ink transition-all hover:border-ink hover:bg-mist cursor-pointer"
          >
            <Plus size={18} /> Start a Campaign
          </button>
        </nav>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user.name} size={38} src={user.picture} />
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
              aria-label="Sign out"
              title="Sign out"
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
            aria-label="Start a campaign"
          >
            <Plus size={18} />
          </button>
          <button onClick={() => navigate("/dashboard/account")} aria-label="Profile" className="cursor-pointer">
            <Avatar name={user.name} size={34} src={user.picture} />
          </button>
        </div>
      </header>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_ITEMS.map((item) => {
            const isActive = active === item.id;
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

/* --------------------------- shared pieces --------------------------- */

function SessionBanner() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white px-5 py-4">
      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-sub" />
      <p className="text-[13px] leading-relaxed text-sub">
        <span className="font-semibold text-ink">Signed in securely with Firebase.</span> Your Google identity is used to
        personalise this dashboard. This deployment has no database or payment processing, so campaign and payment records are
        not available here.
      </p>
    </div>
  );
}

function Metric({ label, sub, icon }: { label: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="anim-rise rounded-3xl border border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</p>
        <span className="text-faint">{icon}</span>
      </div>
      <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight tnum">0</p>
      <p className="mt-2.5 text-xs leading-relaxed text-sub">{sub}</p>
    </div>
  );
}

/* ------------------------------ Overview ----------------------------- */

function Overview() {
  const { user, logout } = useStore();
  if (!user) return null;
  const firstName = user.name.split(" ")[0];

  return (
    <div>
      <PageHead
        title={`Welcome, ${firstName}`}
        sub={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        action={
          <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
            <Plus size={16} /> Start a Campaign
          </button>
        }
      />

      <SessionBanner />

      {/* profile */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="overflow-hidden rounded-3xl border border-line bg-white xl:col-span-2 anim-rise">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5 md:px-7">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} size={56} src={user.picture} />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight text-ink">{user.name}</p>
                <p className="truncate text-sm text-sub">{user.email}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                  <BadgeCheck size={12} /> Google account · email verified
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate("/dashboard/account")} className={btnCls("secondary", "sm")}>
                <UserIcon size={14} /> View profile
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className={btnCls("secondary", "sm")}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-3">
            {[
              { k: "Sign-in method", v: "Google · Firebase Authentication" },
              { k: "Last sign-in", v: user.lastSignInAt ? fmtDateTime(user.lastSignInAt) : "Just now" },
              { k: "Session", v: "Persists across refreshes" },
            ].map((row) => (
              <div key={row.k} className="bg-white px-6 py-4 md:px-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">{row.k}</p>
                <p className="mt-1 text-[13px] font-medium text-ink">{row.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-ink p-6 text-white md:p-7 anim-rise">
          <h2 className="text-[15px] font-semibold tracking-tight">Your next step</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
            Share your campaign brief with our team. Booking, review and secure payments require an operations backend, which
            isn’t part of this frontend-only deployment — we’ll continue by email.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button onClick={() => navigate("/book")} className={btnCls("white", "md", "w-full")}>
              <Plus size={15} /> Start a campaign brief
            </button>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Beyond%20Reach%20—%20Campaign%20enquiry`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <Mail size={15} /> Email our team
            </a>
          </div>
        </div>
      </div>

      {/* honest metrics */}
      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Metric label="Campaigns" sub="No campaigns yet." icon={<Megaphone size={16} />} />
        <Metric label="Active campaigns" sub="None running through this site." icon={<CalendarClock size={16} />} />
        <Metric label="Reports" sub="Analytics not available yet." icon={<FileText size={16} />} />
        <Metric label="Payments" sub="No payment has been recorded." icon={<Lock size={16} />} />
      </div>

      {/* empty state */}
      <div className="mt-4 rounded-3xl border border-line bg-white p-2 anim-rise">
        <EmptyState
          icon={<Megaphone size={22} />}
          title="No campaigns yet"
          body="This frontend-only account has no campaign records. Campaigns and verified analytics appear here when a secure advertising backend is connected."
          action={
            <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
              Start Your First Campaign
            </button>
          }
        />
      </div>
    </div>
  );
}

/* ------------------------------ Sections ----------------------------- */

function CampaignsPage() {
  return (
    <div>
      <PageHead
        title="My Campaigns"
        sub="Campaigns linked to this Google account."
        action={
          <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
            <Plus size={16} /> Start a Campaign
          </button>
        }
      />
      <SessionBanner />
      <div className="mt-4 rounded-3xl border border-line bg-white p-2">
        <EmptyState
          icon={<Megaphone size={22} />}
          title="No campaigns yet"
          body="No campaigns are stored for this session. This site is frontend-only and does not create campaign records. Start a brief and our team will continue by email."
          action={
            <button onClick={() => navigate("/book")} className={btnCls("primary", "md")}>
              Start Your First Campaign
            </button>
          }
        />
      </div>
    </div>
  );
}

function ReportsPage() {
  return (
    <div>
      <PageHead title="Reports" sub="Campaign performance reporting." />
      <SessionBanner />
      <div className="mt-4 rounded-3xl border border-line bg-white p-2">
        <EmptyState
          icon={<BarChart3 size={22} />}
          title="Analytics not available yet"
          body="Reporting data appears only when campaigns run through an authorised advertising integration. This deployment has no server, integrations or analytics data."
          action={
            <button onClick={() => navigate("/support")} className={btnCls("secondary", "md")}>
              Ask about reporting
            </button>
          }
        />
      </div>
    </div>
  );
}

function OrdersPage() {
  return (
    <div>
      <PageHead title="Orders & Payments" sub="Your purchases and receipts." />
      <SessionBanner />
      <div className="mt-4 rounded-3xl border border-line bg-white p-2">
        <EmptyState
          icon={<Receipt size={22} />}
          title="No orders or payments"
          body="This frontend-only deployment does not process payments, and no payment has been recorded. Secure payment requires server-side verification, which is not enabled here."
          action={
            <button onClick={() => navigate("/book")} className={btnCls("secondary", "md")}>
              Review the package
            </button>
          }
        />
      </div>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div>
      <PageHead title="Notifications" sub="Account and campaign updates." />
      <SessionBanner />
      <div className="mt-4 rounded-3xl border border-line bg-white p-2">
        <EmptyState
          icon={<Bell size={22} />}
          title="No notifications"
          body="There are no notifications. Campaign and payment notifications require an operations backend, which is not part of this deployment."
          action={
            <a href={`mailto:${SUPPORT_EMAIL}`} className={btnCls("secondary", "md")}>
              Contact us instead
            </a>
          }
        />
      </div>
    </div>
  );
}

/* ------------------------------- Support ----------------------------- */

function SupportPage() {
  const { user } = useStore();
  const subject = encodeURIComponent("Beyond Reach — Campaign enquiry");
  const body = encodeURIComponent(
    `Hello Beyond Reach,\n\nI'd like to talk about advertising my business.\n\nName: ${user?.name || ""}\nEmail: ${user?.email || ""}\n\n`
  );
  return (
    <div>
      <PageHead title="Support" sub="Real humans, by email or WhatsApp." />
      <SessionBanner />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-white p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-ink">
            <Mail size={20} />
          </span>
          <h2 className="mt-5 text-base font-semibold tracking-tight">Email support</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-sub">
            Best for campaign briefs, creative files and detailed questions. Replies within a few working hours.
          </p>
          <p className="mt-4 text-sm font-medium text-ink">{SUPPORT_EMAIL}</p>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`} className={btnCls("primary", "md", "mt-5 w-full")}>
            <Mail size={15} /> Write an email
          </a>
        </div>
        <div className="rounded-3xl border border-line bg-white p-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-ink">
            <MessageCircle size={20} />
          </span>
          <h2 className="mt-5 text-base font-semibold tracking-tight">WhatsApp</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-sub">
            Fastest response during business hours. Monday to Saturday, 10:00 AM – 7:00 PM IST.
          </p>
          <p className="mt-4 text-sm font-medium text-ink">+91 98765 43210</p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className={btnCls("secondary", "md", "mt-5 w-full")}>
            <ExternalLink size={15} /> Chat on WhatsApp
          </a>
        </div>
      </div>
      <p className="mt-4 text-center text-xs leading-relaxed text-faint">
        Support requests are not stored in this frontend-only deployment. Nothing is sent until you send the email or message
        yourself.
      </p>
    </div>
  );
}

/* ------------------------------- Account ----------------------------- */

function AccountPage() {
  const { user, logout } = useStore();
  if (!user) return null;

  return (
    <div>
      <PageHead title="My Profile" sub="Your Google identity, authenticated with Firebase." />

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <div className="rounded-3xl border border-line bg-white p-6 md:p-8 anim-rise">
            <div className="flex flex-wrap items-center gap-5">
              <Avatar name={user.name} size={64} src={user.picture} />
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-tight text-ink">{user.name}</p>
                <p className="text-sm text-sub">{user.email}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                  <BadgeCheck size={12} /> Verified by Google
                </p>
              </div>
            </div>

            <div className="mt-7 divide-y divide-line rounded-2xl border border-line">
              {[
                { k: "Full name", v: user.name },
                { k: "Email address", v: user.email, verified: true },
                { k: "Google account ID", v: user.uid },
                { k: "Sign-in method", v: "Google · Firebase Authentication" },
                { k: "Email verified by Google", v: user.emailVerified ? "Yes" : "No" },
                { k: "Account created", v: user.createdAt ? fmtDateTime(user.createdAt) : "—" },
                { k: "Last sign-in", v: user.lastSignInAt ? fmtDateTime(user.lastSignInAt) : "—" },
              ].map((row) => (
                <div key={row.k} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <span className="text-[13px] text-sub">{row.k}</span>
                  <span className="flex min-w-0 items-center gap-1.5 text-right text-[13px] font-medium text-ink">
                    <span className="truncate">{row.v}</span>
                    {row.verified && <BadgeCheck size={13} className="shrink-0 text-emerald-600" />}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href="https://myaccount.google.com/"
                target="_blank"
                rel="noreferrer"
                className={btnCls("secondary", "md")}
              >
                Manage Google Account <ExternalLink size={14} />
              </a>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className={btnCls("secondary", "md")}
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 md:p-8 anim-rise">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Security & privacy</h2>
            <div className="mt-4 flex flex-col gap-3 text-[13px] leading-relaxed text-sub">
              <p className="flex items-start gap-2.5">
                <Lock size={15} className="mt-0.5 shrink-0 text-ink" />
                This site never receives or stores your Google password. Authentication happens inside Google's own popup.
              </p>
              <p className="flex items-start gap-2.5">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-ink" />
                Your Google ID token is checked for issuer, audience, expiry and verified email, and is kept only in this tab's
                session storage until it expires.
              </p>
              <p className="flex items-start gap-2.5">
                <UserIcon size={15} className="mt-0.5 shrink-0 text-ink" />
                This identity is <span className="font-medium text-ink">not</span> authorization for payments, private campaign
                records or other sensitive data. This deployment has no backend, database or payment processing.
              </p>
            </div>
            <p className="mt-5 rounded-xl bg-mist px-4 py-3 text-xs leading-relaxed text-sub">
              To delete your Google sign-in association with this site, remove it from your Google Account → Security → Third-party
              apps &amp; services. This site stores no server-side account.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7 anim-rise">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Quick links</h2>
            <div className="mt-2">
              {[
                { label: "Start a Campaign", to: "/book", icon: <Plus size={17} /> },
                { label: "Support & FAQs", to: "/dashboard/support", icon: <Headphones size={17} /> },
                { label: "Pricing", to: "/pricing", icon: <Receipt size={17} /> },
                { label: "Home", to: "/", icon: <ArrowRight size={17} /> },
              ].map((l) => (
                <button
                  key={l.label}
                  onClick={() => navigate(l.to)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-ink transition-colors hover:bg-mist cursor-pointer"
                >
                  <span className="text-sub">{l.icon}</span>
                  {l.label}
                  <ArrowRight size={15} className="ml-auto text-faint" />
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-ink p-6 text-white md:p-7 anim-rise">
            <h2 className="text-[15px] font-semibold tracking-tight">Need help?</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
              Our team can walk you through the package and what’s required to launch your advertising.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Beyond%20Reach%20—%20Account%20help`}
              className={btnCls("white", "md", "mt-5 w-full")}
            >
              <Mail size={15} /> Email support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Page switch ----------------------------- */

export default function DashboardPage({ view }: { view: DashView }) {
  const normalized: DashView = useMemo(
    () => (["overview", "campaigns", "reports", "notifications", "orders", "support", "account"].includes(view) ? view : "overview"),
    [view]
  );
  return (
    <DashboardShell active={normalized}>
      {normalized === "overview" && <Overview />}
      {normalized === "campaigns" && <CampaignsPage />}
      {normalized === "reports" && <ReportsPage />}
      {normalized === "orders" && <OrdersPage />}
      {normalized === "notifications" && <NotificationsPage />}
      {normalized === "support" && <SupportPage />}
      {normalized === "account" && <AccountPage />}
    </DashboardShell>
  );
}
