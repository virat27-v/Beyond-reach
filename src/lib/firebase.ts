/* ------------------------------------------------------------------ */
/*  Firebase Authentication — configuration comes exclusively from     */
/*  VITE_FIREBASE_* build-time environment variables. No credentials   */
/*  are hardcoded; if they are missing, auth is simply unavailable     */
/*  and the app says so instead of pretending.                         */
/* ------------------------------------------------------------------ */

import { initializeApp, type FirebaseApp } from "firebase/app";
import { browserLocalPersistence, GoogleAuthProvider, getAuth, setPersistence, type Auth } from "firebase/auth";

const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim() || undefined;
const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined)?.trim() || undefined;
const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)?.trim() || undefined;
const storageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined)?.trim() || undefined;
const messagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined)?.trim() || undefined;
const appId = (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined)?.trim() || undefined;

/** True only when the required Firebase variables were provided at build time. */
export const FIREBASE_CONFIGURED = !!(apiKey && authDomain && projectId && appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (FIREBASE_CONFIGURED) {
  app = initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  });
  auth = getAuth(app);
  // Explicitly persist the session in IndexedDB so login survives refreshes and
  // browser restarts. Restored automatically via onAuthStateChanged.
  void setPersistence(auth, browserLocalPersistence);
}

export { auth };

export function googleProvider(): GoogleAuthProvider {
  const p = new GoogleAuthProvider();
  // Show the account chooser so users with multiple Google accounts can pick.
  p.setCustomParameters({ prompt: "select_account" });
  return p;
}

/** Heuristic: narrow viewports get the redirect flow (popups are unreliable on mobile). */
export const isLikelyMobile = () =>
  typeof window !== "undefined" && (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

export function friendlyFirebaseError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/popup-closed-before-sign-in":
    case "auth/cancelled-popup-request":
    case "auth/redirect-cancelled-by-user":
      return "Google sign-in was cancelled. You can try again anytime.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Please allow popups for this site and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in your Firebase project. Add it under Firebase Console → Project settings → Authorized domains, then redeploy.";
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
      return e instanceof Error && e.message ? e.message : "Google sign-in failed. Please try again.";
  }
}
