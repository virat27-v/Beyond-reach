import { useState } from "react";
import { navigate, parseRoute, useHashRoute } from "../lib/router";
import { useStore } from "../lib/store";
import { btnCls } from "./ui";

export function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.58v2.97h3.88c2.27-2.09 3.57-5.17 3.57-8.74Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-2.97c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.96H1.28v3.07A11.99 11.99 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.31A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.58.38-2.31V6.62H1.28a12 12 0 0 0 0 10.76l4.01-3.07Z" />
      <path fill="#EA4335" d="M12 4.73c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 11.99 11.99 0 0 0 1.28 6.62l4.01 3.07C6.23 6.84 8.88 4.73 12 4.73Z" />
    </svg>
  );
}

function Spinner({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Real Google sign-in button (Firebase Authentication).
 * Desktop → Google popup. Mobile → full-page redirect flow.
 * Cancellation and errors are handled and shown inline.
 */
export function GoogleSignInButton() {
  const { googleLogin, firebaseConfigured, authReady } = useStore();
  const hash = useHashRoute();
  const { path } = parseRoute(hash);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const click = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setErrorCode("");
    try {
      // After any successful sign-in the user always lands on the dashboard
      // first — the booking form is reached from the dashboard, never as the
      // direct post-login screen.
      const res = await googleLogin("/dashboard");
      if (!res.ok) {
        setError(res.error);
        setErrorCode(res.code ?? "");
        return;
      }
      // Popup success: onAuthStateChanged has already set the authenticated
      // user (and created the account record on first sign-in). If we are on
      // a page that disappears after sign-in (login or the booking gate),
      // move to the dashboard. `hash`/`path` are captured from the render —
      // no hooks are called inside this event handler.
      if (path === "/login" || path === "/book") navigate("/dashboard");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button type="button" onClick={() => void click()} disabled={busy} className={btnCls("secondary", "lg", "w-full")}>
        {busy ? <Spinner /> : <GoogleG />}
        {busy ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {error && (
        <div role="alert" className="w-full rounded-xl border border-red-100 bg-red-50 px-4 py-3 anim-fade text-left">
          <p className="text-[13px] leading-relaxed text-red-700">{error}</p>
          {errorCode && (
            <p className="mt-1.5 font-mono text-[11px] text-red-500">
              Error code: {errorCode} <span className="text-red-400">— send this line to support if it keeps happening.</span>
            </p>
          )}
        </div>
      )}
      {!firebaseConfigured && (
        <p className="w-full rounded-xl bg-mist px-4 py-3 text-[12px] leading-relaxed text-sub text-left">
          Sign-in will activate as soon as the six VITE_FIREBASE_* environment variables are set on the deployment (see
          README). Nothing is stored by us — Google verifies you directly.
        </p>
      )}
      {firebaseConfigured && !authReady && (
        <p className="w-full rounded-xl bg-mist px-4 py-3 text-[12px] leading-relaxed text-sub text-left">
          Sign-in couldn't be started in this browser. Please refresh the page — if it keeps happening, try a current
          version of Chrome (details are logged in the browser console under [BR-AUTH]).
        </p>
      )}
    </div>
  );
}
