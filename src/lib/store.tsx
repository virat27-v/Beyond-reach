import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  clearLastIssue,
  completeRedirectSignIn,
  firebaseConfigured,
  lastIssue,
  missingEnv,
  signInWithGoogle,
  signOutGoogle,
  subscribeAuth,
  type AuthIssue,
  type AuthUser,
} from "./firebase";
import { clearPendingAuth, markPendingAuth } from "./postAuth";

/* ------------------------------------------------------------------ */
/*  One auth store for the whole app.                                  */
/*  A single Firebase listener feeds it (see lib/firebase.ts), so       */
/*  authentication state can never be duplicated or raced.              */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  title: string;
  body?: string;
}

interface Store {
  user: AuthUser | null;
  authLoading: boolean;
  configured: boolean;
  missingEnv: string[];
  authError: string;
  authIssue: AuthIssue | null;
  clearAuthError: () => void;
  signIn: (fullPage?: boolean) => Promise<{ ok: boolean; redirected?: boolean; error?: string }>;
  logout: () => Promise<void>;
  toasts: Toast[];
  toast: (title: string, body?: string) => void;
  dismissToast: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside AppProvider");
  return ctx;
}

let counter = 0;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authIssue, setAuthIssue] = useState<AuthIssue | null>(() => lastIssue());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const busy = useRef(false);
  const announced = useRef<string | null>(null);

  const toast = useCallback((title: string, body?: string) => {
    counter += 1;
    const id = `t${Date.now().toString(36)}${counter}`;
    setToasts((list) => [...list, { id, title, body }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const clearAuthError = useCallback(() => {
    clearLastIssue();
    setAuthIssue(null);
  }, []);

  const announce = useCallback(
    (account: AuthUser) => {
      if (announced.current === account.uid) return;
      announced.current = account.uid;
      if (account.isNewUser) {
        toast("Account created", `Welcome, ${account.name}! Your Beyond Reach account ${account.accountId} is active.`);
      } else {
        toast("Welcome back", `${account.name} · ${account.email}`);
      }
    },
    [toast]
  );

  /* Single subscription + one redirect completion, on app start. */
  useEffect(() => {
    let active = true;

    completeRedirectSignIn()
      .then((result) => {
        if (!active || !result) return;
        if (result.issue) setAuthIssue(result.issue);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("[Beyond Reach auth] redirect result failed", error);
      });

    const unsubscribe = subscribeAuth((nextUser) => {
      if (!active) return;
      setUser(nextUser);
      setAuthLoading(false);
      if (nextUser) {
        announce(nextUser);
        clearPendingAuth();
      }
    });

    const timeout = window.setTimeout(() => {
      if (active) setAuthLoading(false);
    }, 8000);

    return () => {
      active = false;
      unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [announce]);

  const start = useCallback(
    async (fullPage: boolean) => {
      if (busy.current) return { ok: false, error: "Sign-in is already in progress." };
      busy.current = true;
      clearAuthError();
      markPendingAuth();
      try {
        const result = await signInWithGoogle(fullPage);
        if (!result.ok) {
          clearPendingAuth();
          setAuthIssue(result.issue || null);
          return { ok: false, error: result.issue?.message || "Google sign-in could not be completed." };
        }
        if (result.redirected) return { ok: true, redirected: true };
        if (result.user) {
          setUser(result.user);
          setAuthLoading(false);
          announce(result.user);
        }
        return { ok: true };
      } catch (error) {
        clearPendingAuth();
        // eslint-disable-next-line no-console
        console.error("[Beyond Reach auth] unexpected sign-in failure", error);
        const issue = lastIssue();
        setAuthIssue(issue);
        return { ok: false, error: issue?.message || "Google sign-in could not be completed." };
      } finally {
        busy.current = false;
      }
    },
    [announce, clearAuthError]
  );

  const signIn = useCallback((fullPage = false) => start(fullPage), [start]);

  const logout = useCallback(async () => {
    await signOutGoogle();
    setUser(null);
    clearAuthError();
    announced.current = null;
    toast("Signed out", "You have been signed out of Beyond Reach.");
  }, [clearAuthError, toast]);

  const value = useMemo<Store>(
    () => ({
      user,
      authLoading,
      configured: firebaseConfigured,
      missingEnv,
      authError: authIssue?.message || "",
      authIssue,
      clearAuthError,
      signIn,
      logout,
      toasts,
      toast,
      dismissToast,
    }),
    [user, authLoading, authIssue, clearAuthError, signIn, logout, toasts, toast, dismissToast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
