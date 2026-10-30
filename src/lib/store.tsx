import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BookingDraft,
  Campaign,
  Order,
  PACKAGE,
  User,
  UserData,
  emptyData,
  newCampaignId,
  newOrderId,
  seedDemoData,
  uid,
  welcomeNotification,
} from "./data";

/* ------------------------------------------------------------------ */

interface Persisted {
  users: User[];
  session: string | null;
  data: Record<string, UserData>;
}

const LS_KEY = "beyondreach:v1";

const DEMO_USER: User = {
  name: "Aarav Kapoor",
  email: "demo@beyondreach.agency",
  phone: "+91 98110 22334",
  business: "Sharma Jewellers",
  password: "demo1234",
  provider: "email",
  createdAt: new Date().toISOString(),
  prefs: { emailNotifs: true, whatsappNotifs: true },
};

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (parsed && Array.isArray(parsed.users)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return {
    users: [DEMO_USER],
    session: null,
    data: { [DEMO_USER.email]: seedDemoData() },
  };
}

/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  title: string;
  body?: string;
}

interface Store {
  user: User | null;
  data: UserData;
  unread: number;
  toasts: Toast[];
  toast: (title: string, body?: string) => void;
  dismissToast: (id: string) => void;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string, phone?: string) => { ok: boolean; error?: string };
  googleLogin: () => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  changePassword: (current: string, next: string) => { ok: boolean; error?: string };
  deleteAccount: () => void;
  completeBooking: (draft: BookingDraft, method: string) => Campaign;
  failBooking: (draft: BookingDraft) => Campaign;
  payExistingCampaign: (campaignId: string, method: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(loadPersisted);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      /* storage full — ignore */
    }
  }, [state]);

  const toast = useCallback((title: string, body?: string) => {
    const id = uid("t");
    setToasts((t) => [...t, { id, title, body }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const user = useMemo(
    () => state.users.find((u) => u.email === state.session) || null,
    [state.users, state.session]
  );

  const data: UserData = user ? state.data[user.email] || emptyData() : emptyData();
  const unread = data.notifications.filter((n) => !n.read).length;

  const patchData = useCallback((email: string, fn: (d: UserData) => UserData) => {
    setState((s) => ({ ...s, data: { ...s.data, [email]: fn(s.data[email] || emptyData()) } }));
  }, []);

  const login = useCallback((email: string, password: string) => {
    const e = email.trim().toLowerCase();
    const found = state.users.find((u) => u.email === e);
    if (!found) return { ok: false, error: "No account found with this email. Please create an account." };
    if (found.provider === "google") {
      setState((s) => ({ ...s, session: e }));
      return { ok: true };
    }
    if (found.password !== password) return { ok: false, error: "Incorrect password. Please try again." };
    setState((s) => ({ ...s, session: e }));
    return { ok: true };
  }, [state.users]);

  const register = useCallback((name: string, email: string, password: string, phone?: string) => {
    const e = email.trim().toLowerCase();
    if (state.users.some((u) => u.email === e)) {
      return { ok: false, error: "An account with this email already exists. Please log in." };
    }
    const newUser: User = {
      name: name.trim(),
      email: e,
      phone: phone?.trim() || undefined,
      password,
      provider: "email",
      createdAt: new Date().toISOString(),
      prefs: { emailNotifs: true, whatsappNotifs: false },
    };
    setState((s) => ({
      ...s,
      users: [...s.users, newUser],
      session: e,
      data: { ...s.data, [e]: { ...emptyData(), notifications: [welcomeNotification()] } },
    }));
    return { ok: true };
  }, [state.users]);

  const googleLogin = useCallback(() => {
    const e = "aarav.kapoor@gmail.com";
    setState((s) => {
      const exists = s.users.some((u) => u.email === e);
      const users = exists
        ? s.users
        : [
            ...s.users,
            {
              name: "Aarav Kapoor",
              email: e,
              provider: "google" as const,
              createdAt: new Date().toISOString(),
              prefs: { emailNotifs: true, whatsappNotifs: true },
            },
          ];
      const data = s.data[e] ? s.data : { ...s.data, [e]: seedDemoData() };
      return { ...s, users, data, session: e };
    });
  }, []);

  const logout = useCallback(() => setState((s) => ({ ...s, session: null })), []);

  const updateUser = useCallback(
    (patch: Partial<User>) => {
      if (!user) return;
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.email === user.email ? { ...u, ...patch } : u)),
      }));
    },
    [user]
  );

  const changePassword = useCallback(
    (current: string, next: string) => {
      if (!user) return { ok: false, error: "Not signed in." };
      if (user.provider === "google") return { ok: false, error: "Password is managed by your Google account." };
      if (user.password !== current) return { ok: false, error: "Current password is incorrect." };
      updateUser({ password: next });
      return { ok: true };
    },
    [user, updateUser]
  );

  const deleteAccount = useCallback(() => {
    if (!user) return;
    const email = user.email;
    setState((s) => {
      const data = { ...s.data };
      delete data[email];
      return { ...s, users: s.users.filter((u) => u.email !== email), data, session: null };
    });
  }, [user]);

  const completeBooking = useCallback(
    (draft: BookingDraft, method: string): Campaign => {
      const campaign: Campaign = {
        id: newCampaignId(),
        name: draft.campaignName,
        businessName: draft.businessName,
        category: draft.category,
        contactName: draft.contactName,
        product: draft.product,
        description: draft.description,
        creativeName: draft.creativeName || undefined,
        creativeHelp: draft.creativeHelp,
        landingUrl: draft.landingUrl || undefined,
        location: draft.location,
        audience: draft.audience,
        language: draft.language,
        platforms: draft.platforms,
        status: "Under Review",
        packageName: PACKAGE.name,
        amount: PACKAGE.price,
        purchaseDate: new Date().toISOString(),
        stats: {},
        daily: [],
      };
      if (!user) return campaign;
      const order: Order = {
        id: newOrderId(),
        campaignId: campaign.id,
        campaignName: campaign.name,
        packageName: PACKAGE.name,
        date: campaign.purchaseDate,
        amount: PACKAGE.price,
        paymentStatus: "Paid",
        method,
      };
      patchData(user.email, (d) => ({
        campaigns: [campaign, ...d.campaigns],
        orders: [order, ...d.orders],
        notifications: [
          {
            id: uid("n"),
            type: "received",
            title: "Campaign received",
            body: `We received “${campaign.name}”. Our team is reviewing your advertisement — most campaigns launch within 24–48 hours.`,
            time: new Date().toISOString(),
            read: false,
            campaignId: campaign.id,
          },
          {
            id: uid("n"),
            type: "payment",
            title: "Payment confirmed",
            body: `We received your payment of ₹399 for “${campaign.name}”. Order ${order.id}.`,
            time: new Date().toISOString(),
            read: false,
            campaignId: campaign.id,
          },
          ...d.notifications,
        ],
      }));
      return campaign;
    },
    [user, patchData]
  );

  const failBooking = useCallback(
    (draft: BookingDraft): Campaign => {
      const campaign: Campaign = {
        id: newCampaignId(),
        name: draft.campaignName,
        businessName: draft.businessName,
        category: draft.category,
        contactName: draft.contactName,
        product: draft.product,
        description: draft.description,
        creativeName: draft.creativeName || undefined,
        creativeHelp: draft.creativeHelp,
        landingUrl: draft.landingUrl || undefined,
        location: draft.location,
        audience: draft.audience,
        language: draft.language,
        platforms: draft.platforms,
        status: "Payment Pending",
        packageName: PACKAGE.name,
        amount: PACKAGE.price,
        purchaseDate: new Date().toISOString(),
        stats: {},
        daily: [],
      };
      if (!user) return campaign;
      const order: Order = {
        id: newOrderId(),
        campaignId: campaign.id,
        campaignName: campaign.name,
        packageName: PACKAGE.name,
        date: campaign.purchaseDate,
        amount: PACKAGE.price,
        paymentStatus: "Failed",
      };
      patchData(user.email, (d) => ({
        campaigns: [campaign, ...d.campaigns],
        orders: [order, ...d.orders],
        notifications: d.notifications,
      }));
      return campaign;
    },
    [user, patchData]
  );

  const payExistingCampaign = useCallback(
    (campaignId: string, method: string) => {
      if (!user) return;
      patchData(user.email, (d) => {
        const campaign = d.campaigns.find((c) => c.id === campaignId);
        if (!campaign) return d;
        const now = new Date().toISOString();
        const existing = d.orders.find((o) => o.campaignId === campaignId);
        const orders = existing
          ? d.orders.map((o) => (o.campaignId === campaignId ? { ...o, paymentStatus: "Paid" as const, method, date: now } : o))
          : [
              {
                id: newOrderId(),
                campaignId,
                campaignName: campaign.name,
                packageName: campaign.packageName,
                date: now,
                amount: campaign.amount,
                paymentStatus: "Paid" as const,
                method,
              },
              ...d.orders,
            ];
        return {
          campaigns: d.campaigns.map((c) => (c.id === campaignId ? { ...c, status: "Under Review" as const } : c)),
          orders,
          notifications: [
            {
              id: uid("n"),
              type: "payment" as const,
              title: "Payment confirmed",
              body: `We received your payment of ₹${campaign.amount} for “${campaign.name}”. Your campaign is now under review.`,
              time: now,
              read: false,
              campaignId,
            },
            ...d.notifications,
          ],
        };
      });
    },
    [user, patchData]
  );

  const markAllRead = useCallback(() => {
    if (!user) return;
    patchData(user.email, (d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, [user, patchData]);

  const markRead = useCallback(
    (id: string) => {
      if (!user) return;
      patchData(user.email, (d) => ({
        ...d,
        notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    },
    [user, patchData]
  );

  const value: Store = {
    user,
    data,
    unread,
    toasts,
    toast,
    dismissToast,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    changePassword,
    deleteAccount,
    completeBooking,
    failBooking,
    payExistingCampaign,
    markAllRead,
    markRead,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
