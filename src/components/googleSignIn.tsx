import { useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useStore } from "../lib/store";
import { isEmbeddedBrowser } from "../lib/firebase";
import { btnCls } from "./ui";

/* ------------------------------------------------------------------ */
/*  Google Sign-In — the only thing on this control.                   */
/*  Official Google branding · real Firebase GoogleAuthProvider ·      */
/*  loading + disabled states · clear error with a retry.               */
/* ------------------------------------------------------------------ */

function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.58v2.97h3.88c2.27-2.09 3.57-5.17 3.57-8.74Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-2.97c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.96H1.28v3.07A11.99 11.99 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.31A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.58.38-2.31V6.62H1.28a12 12 0 0 0 0 10.76l4.01-3.07Z" />
      <path fill="#EA4335" d="M12 4.73c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 11.99 11.99 0 0 0 1.28 6.62l4.01 3.07C6.23 6.84 8.88 4.73 12 4.73Z" />
    </svg>
  );
}

export default function GoogleSignIn({
  next = "/dashboard",
  mode = "login",
  onSignedIn,
}: {
  next?: string;
  mode?: "login" | "register";
  onSignedIn?: () => void;
}) {
  const { signIn, authIssue, authError, clearAuthError, configured } = useStore();
  const [busy, setBusy] = useState(false);
  const embedded = useMemo(() => isEmbeddedBrowser(), []);
  const message = authError || authIssue?.message || "";

  const handle = async (fullPage: boolean) => {
    if (busy) return;
    setBusy(true);
    clearAuthError();
    const result = await signIn(fullPage);
    if (result.redirected) return; // browser is navigating to Google
    setBusy(false);
    if (result.ok) {
      onSignedIn?.();
      window.location.hash = next;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => handle(false)}
        disabled={busy || !configured}
        className={btnCls("secondary", "lg", "w-full")}
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : <GoogleMark />}
        {busy ? "Connecting to Google…" : mode === "login" ? "Continue with Google" : "Sign up with Google"}
      </button>

      {!configured && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>Sign-in is temporarily unavailable. Please contact support.</span>
        </p>
      )}

      {message && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 anim-fade">
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-red-700">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            {message}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handle(true)}
              disabled={busy}
              className="text-[12px] font-semibold text-ink underline underline-offset-2 disabled:opacity-50 cursor-pointer"
            >
              Try full-page Google sign-in
            </button>
            <button
              type="button"
              onClick={() => handle(false)}
              disabled={busy}
              className="text-[12px] font-medium text-sub underline underline-offset-2 disabled:opacity-50 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}


      {embedded && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-relaxed text-amber-900">
          This page is open inside an app. Tap the menu (⋯) → <span className="font-semibold">Open in browser</span>, then sign in
          with Chrome or Safari.
        </p>
      )}
    </div>
  );
}

export function GoogleAuthHeader() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white shadow-soft">
        <GoogleMark size={19} />
      </span>
      <div>
        <p className="text-[13px] font-semibold leading-tight text-ink">Continue with Google</p>
        <p className="text-[11px] text-faint">One tap signs you in — new accounts are created automatically</p>
      </div>
    </div>
  );
}
