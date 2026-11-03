import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";

/* ------------------------------------------------------------------ */
/*  Firebase Authentication — Google sign-in, frontend only.           */
/*                                                                     */
/*  Configuration comes ONLY from Vite environment variables. No       */
/*  values are hardcoded and nothing is fabricated. If the variables    */
/*  are missing, Firebase is never initialised with placeholder data.   */
/* ------------------------------------------------------------------ */

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
  measurementId: (env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) || undefined,
};

const REQUIRED_ENV = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

export const missingFirebaseEnv: string[] = REQUIRED_ENV.filter((key) => {
  const value = (env as Record<string, unknown>)[key];
  return typeof value !== "string" || value.trim().length === 0;
});

/** Firebase is only initialised when a complete configuration exists. */
export const firebaseConfigured = missingFirebaseEnv.length === 0;

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  picture?: string;
  emailVerified: boolean;
  provider: "google";
  createdAt?: string;
  lastSignInAt?: string;
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

/** Returns the Firebase app/auth, or null when configuration is missing. */
export function getFirebaseAuth(): Auth | null {
  if (!firebaseConfigured) return null;
  if (!cachedAuth) {
    cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
    cachedAuth = getAuth(cachedApp);
    // Keep the session across refreshes/tabs (Firebase's persistent auth state).
    setPersistence(cachedAuth, browserLocalPersistence).catch(() => {
      /* If persistence is unavailable, Firebase falls back to in-memory state. */
    });
  }
  return cachedAuth;
}

function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    name: user.displayName || (user.email ? user.email.split("@")[0] : "Beyond Reach customer"),
    email: user.email || "",
    picture: user.photoURL || undefined,
    emailVerified: user.emailVerified,
    provider: "google",
    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : undefined,
    lastSignInAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toISOString() : undefined,
  };
}

/* ---------------------------- devices ------------------------------- */

/** Redirect flow is used on mobile browsers, where popups are unreliable. */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const mobileUa = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile|BlackBerry|Opera Mobi/i.test(ua);
  const narrow = window.matchMedia?.("(max-width: 767px)")?.matches ?? false;
  return mobileUa || narrow;
}

/* ----------------------------- errors ------------------------------- */

const FALLBACK_TO_REDIRECT = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/web-storage-unsupported",
]);

export function mapFirebaseError(code?: string, fallback?: string): string {
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return "Google sign-in was cancelled. You can try again anytime.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.";
    case "auth/redirect-cancelled-by-user":
      return "Google sign-in was cancelled. Please try again.";
    case "auth/unauthorized-domain": {
      const host = typeof window !== "undefined" ? window.location.hostname : "this domain";
      return `This domain (${host}) is not authorised in Firebase. Add it under Firebase Console → Authentication → Settings → Authorized domains, then try again.`;
    }
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this Firebase project. Enable the Google provider in Firebase Console → Authentication → Sign-in method.";
    case "auth/configuration-not-found":
      return "Firebase Authentication is not set up for this project yet. Enable Authentication and the Google provider in the Firebase Console.";
    case "auth/invalid-credential":
    case "auth/invalid-auth-event":
      return "The Firebase configuration could not be used. Re-check the six VITE_FIREBASE_* values in Vercel and redeploy.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":
      return "Google rejected this Firebase API key (it may be revoked, mistyped, or restricted). Open Firebase Console → Project settings → General → Your apps → Web app, copy the exact apiKey, update VITE_FIREBASE_API_KEY in Vercel, and redeploy.";
    case "auth/network-request-failed":
      return "Network error while contacting Google. Check your connection and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method. Please contact support.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/internal-error":
      return "Google sign-in could not be completed because of a configuration issue. Please try again shortly.";
    default:
      return fallback || "Google sign-in could not be completed. Please try again.";
  }
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}
function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

/* ---------------------------- sign-in ------------------------------- */

export interface SignInOutcome {
  ok: boolean;
  redirected?: boolean;
  user?: AppUser;
  error?: string;
  code?: string;
}

/**
 * Desktop → signInWithPopup.
 * Mobile (or popup blocked) → signInWithRedirect.
 * No simulated success: the user only exists after Firebase confirms it.
 */
export async function signInWithGoogleAccount(): Promise<SignInOutcome> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return {
      ok: false,
      error: `Google Sign-In is not configured in this deployment. Add the Firebase environment variables (${missingFirebaseEnv.join(", ")}) in Vercel and redeploy.`,
    };
  }

  const provider = googleProvider();

  if (isMobileDevice()) {
    try {
      await signInWithRedirect(auth, provider);
      return { ok: true, redirected: true };
    } catch (error) {
      return { ok: false, error: mapFirebaseError(errorCode(error), errorMessage(error)), code: errorCode(error) };
    }
  }

  try {
    const result = await signInWithPopup(auth, provider);
    return { ok: true, user: toAppUser(result.user) };
  } catch (error) {
    const code = errorCode(error);
    if (code && FALLBACK_TO_REDIRECT.has(code)) {
      try {
        await signInWithRedirect(auth, provider);
        return { ok: true, redirected: true };
      } catch (redirectError) {
        return {
          ok: false,
          error: mapFirebaseError(errorCode(redirectError), errorMessage(redirectError)),
          code: errorCode(redirectError),
        };
      }
    }
    return { ok: false, error: mapFirebaseError(code, errorMessage(error)), code };
  }
}

let redirectPromise: Promise<{ user?: AppUser; error?: string }> | null = null;

/** Completes a redirect-based sign-in (mobile) and surfaces its errors once. */
export function resolveRedirectSignIn(): Promise<{ user?: AppUser; error?: string }> {
  if (redirectPromise) return redirectPromise;
  redirectPromise = (async () => {
    const auth = getFirebaseAuth();
    if (!auth) return {};
    try {
      const result = await getRedirectResult(auth);
      return result?.user ? { user: toAppUser(result.user) } : {};
    } catch (error) {
      return { error: mapFirebaseError(errorCode(error), errorMessage(error)) };
    }
  })();
  return redirectPromise;
}

export async function signOutGoogle(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await signOut(auth);
    } catch {
      /* the auth state listener is still the source of truth */
    }
  }
}

/** Subscribes to Firebase's persistent auth state. Returns an unsubscribe function. */
export function watchAuthState(
  next: (user: AppUser | null) => void,
  onError?: (message: string) => void
): () => void {
  const auth = getFirebaseAuth();
  if (!auth) return () => {};
  return onAuthStateChanged(
    auth,
    (user) => next(user ? toAppUser(user) : null),
    (error) => onError?.(mapFirebaseError(errorCode(error), errorMessage(error)))
  );
}

export type { Auth, User };
