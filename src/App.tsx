import { useEffect } from "react";
import { AppProvider, useStore } from "./lib/store";
import { navigate, parseRoute, useHashRoute } from "./lib/router";
import { PublicShell, Toasts } from "./components/chrome";
import { Logo, Spinner, btnCls } from "./components/ui";
import Home from "./pages/Home";
import PricingPage from "./pages/Pricing";
import BookingPage from "./pages/Booking";
import { ForgotPage, LoginPage, RegisterPage } from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import CampaignDetailPage from "./pages/CampaignDetail";
import { AboutPage, PrivacyPage, RefundPage, SupportPage, TermsPage } from "./pages/Pages";

const TITLES: Record<string, string> = {
  "/": "Beyond Reach — Your Business. Beyond Reach.",
  "/pricing": "Pricing — Beyond Reach",
  "/about": "About — Beyond Reach",
  "/support": "Support — Beyond Reach",
  "/book": "Book a Campaign — Beyond Reach",
  "/login": "Log in — Beyond Reach",
  "/register": "Create Account — Beyond Reach",
  "/forgot": "Reset Password — Beyond Reach",
  "/privacy": "Privacy Policy — Beyond Reach",
  "/terms": "Terms & Conditions — Beyond Reach",
  "/refund": "Refund Policy — Beyond Reach",
  "/dashboard": "Dashboard — Beyond Reach",
  "/dashboard/campaigns": "My Campaigns — Beyond Reach",
  "/dashboard/reports": "Reports — Beyond Reach",
  "/dashboard/notifications": "Notifications — Beyond Reach",
  "/dashboard/orders": "My Orders — Beyond Reach",
  "/dashboard/account": "Account — Beyond Reach",
};

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white">
      <Logo />
      <Spinner size={22} className="text-faint" />
    </div>
  );
}

function RequireAuth({ children, next }: { children: React.ReactNode; next: string }) {
  const { user } = useStore();
  useEffect(() => {
    if (!user) navigate(`/login?next=${encodeURIComponent(next)}`);
  }, [user, next]);
  if (!user) return <LoadingScreen />;
  return <>{children}</>;
}

function NotFound() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-xl px-5 pb-28 pt-40 text-center anim-fade">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-faint">404</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.03em]">Out of reach.</h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-sub">
          The page you're looking for doesn't exist — but your next customers are still out there.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={() => navigate("/")} className={btnCls("primary", "lg")}>
            Back to Home
          </button>
          <button onClick={() => navigate("/book")} className={btnCls("secondary", "lg")}>
            Start Advertising — ₹399
          </button>
        </div>
      </div>
    </PublicShell>
  );
}

function Router() {
  const hash = useHashRoute();
  const { path, segments } = parseRoute(hash);
  const { user } = useStore();

  useEffect(() => {
    const { path: p, segments: segs } = parseRoute(hash);
    document.title = TITLES[p] || (segs[1] === "campaigns" && segs[2] ? "Campaign — Beyond Reach" : "Beyond Reach");
    const pending = sessionStorage.getItem("br:scroll");
    if (pending && p === "/") {
      sessionStorage.removeItem("br:scroll");
      const t = window.setTimeout(() => {
        document.getElementById(pending)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 140);
      return () => window.clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [hash]);

  useEffect(() => {
    if (user && (path === "/login" || path === "/register")) navigate("/dashboard");
  }, [user, path]);

  switch (path) {
    case "/":
      return (
        <PublicShell>
          <Home />
        </PublicShell>
      );
    case "/pricing":
      return (
        <PublicShell>
          <PricingPage />
        </PublicShell>
      );
    case "/about":
      return (
        <PublicShell>
          <AboutPage />
        </PublicShell>
      );
    case "/support":
      return (
        <PublicShell>
          <SupportPage />
        </PublicShell>
      );
    case "/privacy":
      return (
        <PublicShell>
          <PrivacyPage />
        </PublicShell>
      );
    case "/terms":
      return (
        <PublicShell>
          <TermsPage />
        </PublicShell>
      );
    case "/refund":
      return (
        <PublicShell>
          <RefundPage />
        </PublicShell>
      );
    case "/book":
      return <BookingPage />;
    case "/login":
      return user ? <LoadingScreen /> : <LoginPage />;
    case "/register":
      return user ? <LoadingScreen /> : <RegisterPage />;
    case "/forgot":
      return <ForgotPage />;
    case "/dashboard":
      return (
        <RequireAuth next="/dashboard">
          <DashboardPage view="overview" />
          <Toasts />
        </RequireAuth>
      );
    case "/dashboard/campaigns":
      return (
        <RequireAuth next="/dashboard/campaigns">
          <DashboardPage view="campaigns" />
          <Toasts />
        </RequireAuth>
      );
    case "/dashboard/reports":
      return (
        <RequireAuth next="/dashboard/reports">
          <DashboardPage view="reports" />
          <Toasts />
        </RequireAuth>
      );
    case "/dashboard/notifications":
      return (
        <RequireAuth next="/dashboard/notifications">
          <DashboardPage view="notifications" />
          <Toasts />
        </RequireAuth>
      );
    case "/dashboard/orders":
      return (
        <RequireAuth next="/dashboard/orders">
          <DashboardPage view="orders" />
          <Toasts />
        </RequireAuth>
      );
    case "/dashboard/account":
      return (
        <RequireAuth next="/dashboard/account">
          <DashboardPage view="account" />
          <Toasts />
        </RequireAuth>
      );
    default:
      if (segments[0] === "dashboard" && segments[1] === "campaigns" && segments[2]) {
        return (
          <RequireAuth next={`/dashboard/campaigns/${segments[2]}`}>
            <CampaignDetailPage id={segments[2]} />
            <Toasts />
          </RequireAuth>
        );
      }
      return <NotFound />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
