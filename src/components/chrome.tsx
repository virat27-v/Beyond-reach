import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, ChevronDown, Info, LogOut, Menu, X } from "lucide-react";
import { navigate, useHashRoute, parseRoute } from "../lib/router";
import { useStore } from "../lib/store";
import { Avatar, Logo, btnCls } from "./ui";
import { SUPPORT_EMAIL, WHATSAPP_LINK } from "../lib/data";

/* ------------------------------ Toasts ------------------------------ */

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed bottom-5 left-1/2 z-[120] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4 sm:left-auto sm:right-6 sm:translate-x-0 sm:items-end sm:px-0">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="anim-toast flex w-full items-start gap-3 rounded-2xl bg-ink px-4 py-3.5 text-left shadow-lift cursor-pointer"
        >
          {t.tone === "error" ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          ) : t.tone === "info" ? (
            <Info size={18} className="mt-0.5 shrink-0 text-white/70" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
          )}
          <span>
            <span className="block text-sm font-medium text-white">{t.title}</span>
            {t.body && <span className="mt-0.5 block text-[13px] leading-snug text-white/60">{t.body}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- Nav ------------------------------- */

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/", section: "how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

export function Nav() {
  const { user, logout } = useStore();
  const hash = useHashRoute();
  const { path } = parseRoute(hash);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [hash]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (to: string, section?: string) => {
    if (section) return false;
    if (to === "/") return path === "/";
    return path.startsWith(to);
  };

  const go = (to: string, section?: string) => navigate(to, section);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[90] transition-all duration-300 ${
          scrolled ? "bg-white/85 backdrop-blur-xl border-b border-line" : "bg-white/60 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 md:px-8">
          <button onClick={() => go("/")} className="cursor-pointer" aria-label="Beyond Reach — home">
            <Logo />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => go(l.to, l.section)}
                className={`rounded-full px-4 py-2 text-sm transition-colors cursor-pointer ${
                  isActive(l.to, l.section) ? "font-medium text-ink" : "text-sub hover:text-ink"
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <button onClick={() => go("/dashboard")} className={btnCls("secondary", "sm")}>
                  Dashboard
                </button>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5 transition-colors hover:border-ink/30 cursor-pointer"
                  >
                    <Avatar name={user.name} size={28} src={user.avatar} />
                    <ChevronDown size={14} className={`text-sub transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {menuOpen && (
                    <div className="anim-rise absolute right-0 top-[calc(100%+8px)] w-60 rounded-2xl border border-line bg-white p-2 shadow-lift">
                      <div className="px-3 py-2.5">
                        <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                        <p className="text-xs text-faint truncate">{user.email}</p>
                      </div>
                      <div className="my-1 h-px bg-line" />
                      {[
                        { label: "Overview", to: "/dashboard" },
                        { label: "My Campaigns", to: "/dashboard/campaigns" },
                        { label: "Reports", to: "/dashboard/reports" },
                        { label: "Payments", to: "/dashboard/payments" },
                        { label: "Support", to: "/dashboard/support" },
                        { label: "Account Settings", to: "/dashboard/account" },
                      ].map((item) => (
                        <button
                          key={item.to}
                          onClick={() => go(item.to)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-sub transition-colors hover:bg-mist hover:text-ink cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                      <div className="my-1 h-px bg-line" />
                      <button
                        onClick={async () => {
                          await logout();
                          go("/");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-sub transition-colors hover:bg-mist hover:text-ink cursor-pointer"
                      >
                        <LogOut size={14} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => go("/login")} className={btnCls("ghost", "sm")}>
                  Log in
                </button>
                <button onClick={() => go("/book")} className={btnCls("primary", "sm")}>
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* mobile menu */}
      <div
        className={`fixed inset-0 z-[110] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-lift transition-transform duration-400 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-[68px] items-center justify-between border-b border-line px-5">
            <Logo />
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line cursor-pointer"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-4 py-6">
            {NAV_LINKS.map((l, i) => (
              <button
                key={l.label}
                onClick={() => go(l.to, l.section)}
                className="flex items-center justify-between rounded-xl px-3 py-3.5 text-left text-lg font-medium tracking-tight text-ink transition-colors hover:bg-mist cursor-pointer"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {l.label}
                <ArrowUpRight size={16} className="text-faint" />
              </button>
            ))}
            <button
              onClick={() => go("/support")}
              className="flex items-center justify-between rounded-xl px-3 py-3.5 text-left text-lg font-medium tracking-tight text-ink transition-colors hover:bg-mist cursor-pointer"
            >
              Support
              <ArrowUpRight size={16} className="text-faint" />
            </button>
          </nav>
          <div className="mt-auto border-t border-line p-5">
            {user ? (
              <div className="flex flex-col gap-2.5">
                <button onClick={() => go("/dashboard")} className={btnCls("primary", "lg", "w-full")}>
                  Go to Dashboard
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    go("/");
                  }}
                  className={btnCls("secondary", "lg", "w-full")}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button onClick={() => go("/book")} className={btnCls("primary", "lg", "w-full")}>
                  Get Started — ₹399
                </button>
                <button onClick={() => go("/login")} className={btnCls("secondary", "lg", "w-full")}>
                  Log in
                </button>
              </div>
            )}
            <p className="mt-5 text-center text-xs text-faint">Your Business. Beyond Reach.</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------- Footer ----------------------------- */

export function Footer() {
  const go = (to: string, section?: string) => navigate(to, section);
  const col = "flex flex-col gap-3";
  const linkCls = "text-sm text-white/55 transition-colors hover:text-white text-left cursor-pointer w-fit";
  const headCls = "text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-1";

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo inverted />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/55">
              Professional digital advertising for businesses that want more visibility, more opportunities and measurable growth.
            </p>
            <p className="mt-6 text-sm text-white/40">Your Business. Beyond Reach.</p>
          </div>
          <div className={`${col} md:col-span-2`}>
            <span className={headCls}>Explore</span>
            <button className={linkCls} onClick={() => go("/")}>Home</button>
            <button className={linkCls} onClick={() => go("/", "how-it-works")}>How It Works</button>
            <button className={linkCls} onClick={() => go("/pricing")}>Pricing</button>
            <button className={linkCls} onClick={() => go("/about")}>About</button>
            <button className={linkCls} onClick={() => go("/book")}>Start Advertising</button>
          </div>
          <div className={`${col} md:col-span-2`}>
            <span className={headCls}>Services</span>
            <button className={linkCls} onClick={() => go("/", "services")}>Instagram Advertising</button>
            <button className={linkCls} onClick={() => go("/", "services")}>Facebook Advertising</button>
            <button className={linkCls} onClick={() => go("/", "services")}>YouTube Advertising</button>
            <button className={linkCls} onClick={() => go("/", "services")}>Google Advertising</button>
          </div>
          <div className={`${col} md:col-span-3`}>
            <span className={headCls}>Contact</span>
            <a className={linkCls} href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <a className={linkCls} href={WHATSAPP_LINK} target="_blank" rel="noreferrer">WhatsApp Support</a>
            <button className={linkCls} onClick={() => go("/support")}>Help Centre & FAQs</button>
            <button className={linkCls} onClick={() => go("/login")}>Client Login</button>
          </div>
        </div>

        <div className="mt-16 select-none overflow-hidden" aria-hidden="true">
          <p className="whitespace-nowrap text-center text-[13.5vw] font-bold leading-[0.85] tracking-[-0.02em] text-white/[0.05]">
            BEYOND REACH
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/40">© 2026 Beyond Reach. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="text-xs text-white/40 transition-colors hover:text-white cursor-pointer" onClick={() => go("/privacy")}>
              Privacy Policy
            </button>
            <button className="text-xs text-white/40 transition-colors hover:text-white cursor-pointer" onClick={() => go("/terms")}>
              Terms & Conditions
            </button>
            <button className="text-xs text-white/40 transition-colors hover:text-white cursor-pointer" onClick={() => go("/refund")}>
              Refund Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------- Page scaffold -------------------------- */

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main>{children}</main>
      <Footer />
      <Toasts />
    </div>
  );
}

/* Auth pages render their own toast stack via App-level usage. */
