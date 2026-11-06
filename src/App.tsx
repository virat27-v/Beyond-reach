import { useEffect } from "react";
import { AppProvider, useStore } from "./lib/store";
import { navigate, parseRoute, useHashRoute } from "./lib/router";
import { PublicShell, Toasts } from "./components/chrome";
import { Logo, Spinner, btnCls } from "./components/ui";
import Home from "./pages/Home";
import PricingPage from "./pages/Pricing";
import BookingPage from "./pages/Booking";
import { LoginPage } from "./pages/Auth";
import DashboardPage, { DashView } from "./pages/Dashboard";
import { AboutPage, PrivacyPage, RefundPage, SupportPage, TermsPage } from "./pages/Pages";

const TITLES: Record<string, string> = {
  "/": "Beyond Reach — Your Business. Beyond Reach.",
  "/pricing": "Pricing — Beyond Reach",
  "/about": "About — Beyond Reach",
  "/support": "Support — Beyond Reach",
  "/book": "Book a Campaign — Beyond Reach",
  "/login": "Log in — Beyond Reach",
  "/privacy": "Privacy Policy — Beyond Reach",
  "/terms": "Terms & Conditions — Beyond Reach",
  "/refund": "Refund Policy — Beyond Reach",
  "/dashboard": "Dashboard — Beyond Reach",
  "/dashboard/campaigns": "My Campaigns — Beyond Reach",
  "/dashboard/reports": "Reports — Beyond Reach",
  "/dashboard/notifications": "Notifications — Beyond Reach",
  "/dashboard/orders": "Orders — Beyond Reach",
  "/dashboard/payments": "Payments — Beyond Reach",
  "/dashboard/support": "Support — Beyond Reach",
  "/dashboard/account": "Account — Beyond Reach",
};

const DASH_VIEWS: Record<string, DashView> = {
  "/dashboard": "overview",
  "/dashboard/campaigns": "campaigns",
  "/dashboard/reports": "reports",
  "/dashboard/notifications": "notifications",
  "/dashboard/orders": "orders",
  "/dashboard/payments": "payments",
  "/dashboard/support": "support",
  "/dashboard/account": "account",
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
  const { user, ready } = useStore();
  useEffect(() => {
    if (ready && !user) navigate(`/login?next=${encodeURIComponent(next)}`);
  }, [user, ready, next]);
  if (!ready || !user) return <LoadingScreen />;
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
  const { path } = parseRoute(hash);
  const { user, ready } = useStore();

  useEffect(() => {
    const { path: p } = parseRoute(hash);
    document.title = TITLES[p] || "Beyond Reach";
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

  // After a successful Google sign-in, route the user where they wanted to go.
  useEffect(() => {
    if (user && path === "/login") {
      const { query } = parseRoute(hash);
      navigate(query.get("next") || "/dashboard");
    }
  }, [user, path, hash]);

  const pub = (el: React.ReactNode) => (
    <PublicShell>
      {el}
    </PublicShell>
  );

  switch (path) {
    case "/":
      return pub(<Home />);
    case "/pricing":
      return pub(<PricingPage />);
    case "/about":
      return pub(<AboutPage />);
    case "/support":
      return pub(<SupportPage />);
    case "/privacy":
      return pub(<PrivacyPage />);
    case "/terms":
      return pub(<TermsPage />);
    case "/refund":
      return pub(<RefundPage />);
    case "/book":
      return <BookingPage />;
    case "/login":
      return !ready || user ? <LoadingScreen /> : <LoginPage />;
    default: {
      const view = DASH_VIEWS[path];
      if (view) {
        return (
          <RequireAuth next={path}>
            <DashboardPage view={view} />
            <Toasts />
          </RequireAuth>
        );
      }
      return <NotFound />;
    }
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
