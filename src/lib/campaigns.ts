import type { PlatformId } from "./data";

/* ------------------------------------------------------------------ */
/*  Campaign briefs started from the dashboard.                       */
/*                                                                     */
/*  Frontend-only build: there is no server database, so briefs are    */
/*  saved in this browser, scoped to the signed-in Firebase UID. They  */
/*  survive refresh/logout on the same device and are never shared     */
/*  between accounts. The same brief is also handed to the customer's  */
/*  own email app so the Beyond Reach team actually receives it.       */
/*  Nothing here claims a campaign is running or reviewed.             */
/* ------------------------------------------------------------------ */

export type BriefStatus = "Brief Submitted" | "Withdrawn";

export interface StoredCampaign {
  id: string;
  /** Internal Beyond Reach account ID (derived from Firebase UID). */
  accountId: string;
  createdAt: string;
  status: BriefStatus;
  emailSent: boolean;
  businessName: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  name: string;
  product: string;
  description: string;
  location: string;
  audience: string;
  language: string;
  platforms: PlatformId[];
}

export const CAMPAIGN_EVENT = "beyondreach:campaigns";

const KEY = (uid: string) => `beyondreach.campaigns.v1.${uid}`;
const memory = new Map<string, StoredCampaign[]>();

function read(uid: string): StoredCampaign[] {
  try {
    const raw = localStorage.getItem(KEY(uid));
    if (!raw) return memory.get(uid) || [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is StoredCampaign =>
        !!c && typeof c.id === "string" && typeof c.name === "string" && typeof c.createdAt === "string"
    );
  } catch {
    return memory.get(uid) || [];
  }
}

function write(uid: string, campaigns: StoredCampaign[]): boolean {
  memory.set(uid, campaigns);
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(campaigns));
    return true;
  } catch {
    return false;
  }
}

function emit() {
  try {
    window.dispatchEvent(new CustomEvent(CAMPAIGN_EVENT));
  } catch {
    /* ignore */
  }
}

function newId(existing: Set<string>): string {
  const year = new Date().getFullYear();
  for (let i = 0; i < 50; i++) {
    const id = `BR-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!existing.has(id)) return id;
  }
  return `BR-${year}-${Date.now().toString().slice(-4)}`;
}

export function listCampaigns(uid: string | undefined): StoredCampaign[] {
  if (!uid) return [];
  return [...read(uid)].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export interface CreateCampaignInput {
  accountId: string;
  businessName: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  name: string;
  product: string;
  description: string;
  location: string;
  audience: string;
  language: string;
  platforms: PlatformId[];
}

export function createCampaign(uid: string, input: CreateCampaignInput): { ok: boolean; campaign?: StoredCampaign; error?: string } {
  if (!uid) return { ok: false, error: "Please sign in again to start a campaign." };
  const existing = read(uid);
  const id = newId(new Set(existing.map((c) => c.id)));
  const campaign: StoredCampaign = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
    status: "Brief Submitted",
    emailSent: false,
  };
  const persisted = write(uid, [campaign, ...existing]);
  emit();
  if (!persisted) {
    return {
      ok: true,
      campaign,
      error: "This browser blocked local storage, so the brief is shown for this session only. Please send the email copy to our team.",
    };
  }
  return { ok: true, campaign };
}

export function getCampaign(uid: string | undefined, id: string): StoredCampaign | undefined {
  if (!uid) return undefined;
  return read(uid).find((c) => c.id === id);
}

export function markEmailSent(uid: string, id: string): void {
  const campaigns = read(uid);
  const next = campaigns.map((c) => (c.id === id ? { ...c, emailSent: true } : c));
  write(uid, next);
  emit();
}

export function withdrawCampaign(uid: string, id: string): boolean {
  const campaigns = read(uid);
  if (!campaigns.some((c) => c.id === id)) return false;
  const next = campaigns.map((c) => (c.id === id ? { ...c, status: "Withdrawn" as BriefStatus } : c));
  const ok = write(uid, next);
  emit();
  return ok;
}

/** Simple reactive helper for dashboard components. */
export function subscribeCampaigns(uid: string | undefined, onChange: () => void): () => void {
  if (!uid) return () => {};
  const handler = () => onChange();
  window.addEventListener(CAMPAIGN_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CAMPAIGN_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
