import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  firebaseConfigured,
  missingFirebaseEnv,
  resolveRedirectSignIn,
  signInWithGoogleAccount,
  signOutGoogle,
  watchAuthState,
  type AppUser,
} from "./firebase";

/* ------------------------------------------------------------------ */
/*  Firebase Authentication session store.                             */
/*  The source of truth is Firebase's onAuthStateChanged listener, so   */
/*  the session is restored automatically after refresh and sign-out    */
/*  is real. No fake users, no local "logged in" flags.                 */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  title: string;
  body?: string;
}

export interface FirebaseState {
  configured: boolean;
  missingEnv: string[];
}

interface Store {
  user: AppUser | null;
  authLoading: boolean;
  firebase: FirebaseState;
  toasts: Toast[];
  toast: (title: string, body?: string) => void;
  dismissToast: (id: string) => void;
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string; redirected?: boolean }>;
  logout: () => Promise<void>;
  authError: string;
  clearAuthError: () => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside AppProvider");
  return ctx;
}

let toastCounter = 0;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((title: string, body?: string) => {
    toastCounter += 1;
    const id = `t${Date.now().toString(36)}${toastCounter}`;
    setToasts((t) => [...t, { id, title, body }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const clearAuthError = useCallback(() => setAuthError(""), []);

  useEffect(() => {
    if (!firebaseConfigured) {
      setAuthLoading(false);
      return;
    }
    let active = true;
    let unsubscribe = () => {};

    // Finish a mobile redirect sign-in (also surfaces redirect errors once).
    resolveRedirectSignIn().then((result) => {
      if (!active) return;
      if (result.error) setAuthError(result.error);
      if (result.user) setUser(result.user);
    });

    // Firebase restores persisted sessions itself; this listener is the source of truth.
    unsubscribe = watchAuthState(
      (nextUser) => {
        if (!active) return;
        setUser(nextUser);
        setAuthLoading(false);
      },
      (message) => {
        if (!active) return;
        setAuthError(message);
        setAuthLoading(false);
      }
    );

    // Safety net if the SDK cannot initialise at all.
    const timer = window.setTimeout(() => {
      if (active) setAuthLoading(false);
    }, 8000);

    return () => {
      active = false;
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError("");
    const result = await signInWithGoogleAccount();
    if (!result.ok) {
      setAuthError(result.error || "Google sign-in could not be completed.");
      return { ok: false, error: result.error };
    }
    if (result.redirected) {
      // Navigating to Google; the auth listener takes over after the redirect returns.
      return { ok: true, redirected: true };
    }
    if (result.user) {
      setUser(result.user);
      toast("Signed in with Google", `Welcome, ${result.user.name}.`);
    }
    return { ok: true };
  }, [toast]);

  const logout = useCallback(async () => {
    await signOutGoogle();
    setUser(null);
    setAuthError("");
    toast("Signed out", "You have been signed out of Beyond Reach.");
  }, [toast]);

  const value = useMemo<Store>(
    () => ({
      user,
      authLoading,
      firebase: { configured: firebaseConfigured, missingEnv: missingFirebaseEnv },
      toasts,
      toast,
      dismissToast,
      signInWithGoogle,
      logout,
      authError,
      clearAuthError,
    }),
    [user, authLoading, toasts, toast, dismissToast, signInWithGoogle, logout, authError, clearAuthError]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
