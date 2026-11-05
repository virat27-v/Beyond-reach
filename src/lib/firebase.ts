/* ------------------------------------------------------------------ */
/*  Firebase Authentication — configuration comes exclusively from     */
/*  VITE_FIREBASE_* build-time environment variables. No credentials   */
/*  are hardcoded. Initialization is guarded so an environment problem */
/*  can never take the whole site down — the sign-in button then       */
/*  shows an actionable message instead of a raw SDK assertion.        */
/* ------------------------------------------------------------------ */

import { initializeApp, type FirebaseApp } from "firebase/app";
import { browserLocalPersistence, GoogleAuthProvider, getAuth, setPersistence, type Auth } from "firebase/auth";

const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim() || undefined;
const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined)?.trim() || undefined;
const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)?.trim() || undefined;
const storageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined)?.trim() || undefined;
const messagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined)?.trim() || undefined;
const appId = (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined)?.trim() || undefined;

/** The six VITE_FIREBASE_* variables were provided at build time. */
export const FIREBASE_CONFIGURED = !!(apiKey && authDomain && projectId && appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (FIREBASE_CONFIGURED) {
  try {
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    });
    // Module-level, single initialization — no component can trigger a second
    // one, so no duplicate-instance or double-init inconsistencies are possible.
    auth = getAuth(app);
    // Persist the session in IndexedDB so login survives refreshes and browser
    // restarts. If this particular browser blocks storage, Firebase falls back
    // internally; we log rather than crash.
    setPersistence(auth, browserLocalPersistence).catch((e) => {
      console.warn("[BR-AUTH] Persistence setup fell back (storage restricted in this browser):", e);
    });
  } catch (e) {
    // An environment that cannot initialize Firebase Auth (very old or
    // heavily restricted browser) should still let the rest of the site work.
    console.error("[BR-AUTH] Firebase Auth initialization failed in this browser:", e);
    app = null;
    auth = null;
  }
}

/** Auth is actually usable in this browser (configured AND initialized). */
export const AUTH_READY = !!auth;

export { auth };

export function googleProvider(): GoogleAuthProvider {
  const p = new GoogleAuthProvider();
  // Show the account chooser so users with multiple Google accounts can pick.
  p.setCustomParameters({ prompt: "select_account" });
  return p;
}

/**
 * Device heuristic for choosing the auth flow:
 * - mobile browsers → full-page redirect (popups are blocked or unreliable)
 * - desktop → native popup, with an automatic redirect fallback if the
 *   popup is blocked or the environment cannot support it.
 */
export const isLikelyMobile = () =>
  typeof window !== "undefined" &&
  (window.innerWidth < 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));

const INTERNAL_PATTERNS = /assert|internal|class definition|invalid argument/i;

export function authErrorCode(e: unknown): string | undefined {
  const code = (e as { code?: string })?.code;
  return typeof code === "string" && code ? code : undefined;
}

export function isInternalAuthError(e: unknown): boolean {
  const code = authErrorCode(e) ?? "";
  const message = e instanceof Error ? e.message : String(e ?? "");
  return code === "auth/internal-error" || code === "auth/internal-assert-failure" || INTERNAL_PATTERNS.test(message);
}

/**
 * User-facing messages. Raw SDK/internal errors are never shown to the user —
 * they are logged to the console for diagnostics with "[BR-AUTH]".
 */
export function friendlyFirebaseError(e: unknown): string {
  if (isInternalAuthError(e)) {
    console.warn("[BR-AUTH] Internal sign-in failure (details in this console log):", e);
    return "We couldn't complete sign-in in this browser. Please try again — if it keeps happening, refresh the page or use a different browser (Chrome works best).";
  }
  const code = authErrorCode(e) ?? "";
  const host = typeof window !== "undefined" ? window.location.host : "this domain";
  switch (code) {
    case "auth/popup-closed-before-sign-in":
    case "auth/cancelled-popup-request":
    case "auth/redirect-cancelled-by-user":
      return "Google sign-in was cancelled. You can try again anytime.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Please allow popups for this site and try again.";
    case "auth/operation-not-supported-in-this-environment":
      return "This browser doesn't support the sign-in window. Please try again — we'll use the sign-in page instead.";
    case "auth/unauthorized-domain":
      return `This site's domain (${host}) is not authorized in your Firebase project. Fix: Firebase Console → Project settings → Authorized domains → add "${host}" → then sign in again.`;
    case "auth/cookies-blocked":
      return "This browser is blocking cookies, so sign-in can't be completed. Please allow cookies for this site and try again.";
    case "auth/web-storage-unsupported":
      return "This browser blocks local storage, so sign-in can't be completed here. Please try Chrome or another browser that allows local storage.";
    case "auth/redirect-operation-in-progress":
    case "auth/redirect-action-in-progress":
      return "Another sign-in is already in progress. Finish or cancel that one first, then try again.";
    case "auth/invalid-api-key":
    case "auth/invalid-auth":
      return "Firebase is misconfigured. Check the VITE_FIREBASE_* environment variables and redeploy.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for your Firebase project yet. Enable it under Firebase Console → Authentication → Sign-in method → Google.";
    case "auth/network-request-failed":
      return "Network error — check your connection and try again.";
    case "auth/timeout":
      return "Timed out while talking to Google. Please try again.";
    default:
      console.warn("[BR-AUTH] Sign-in failed:", e);
      return "Google sign-in failed. Please try again.";
  }
}
