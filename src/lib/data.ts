/* ------------------------------------------------------------------ */
/*  Beyond Reach — shared types, constants & formatting.               */
/*  All customer data comes from the backend API (see lib/api.ts).    */
/*  There is intentionally no demo/seed data in this file.             */
/* ------------------------------------------------------------------ */

export const SUPPORT_EMAIL = "support@beyondreach.agency";
export const SUPPORT_PHONE = "+91 98765 43210";
export const WHATSAPP_LINK = "https://wa.me/919876543210?text=Hi%20Beyond%20Reach%2C%20I%20need%20help%20with%20my%20campaign.";

export type PlatformId = "instagram" | "facebook" | "youtube" | "google";

export type CampaignStatus =
  | "Payment Pending"
  | "Under Review"
  | "Approved"
  | "Scheduled"
  | "Active"
  | "Paused"
  | "Completed"
  | "Rejected";

export interface PlatformStat {
  views: number;
  reach: number;
  impressions: number;
  clicks: number;
  watchTimeHours?: number;
  conversions?: number;
}

export interface DayPoint {
  date: string; // ISO yyyy-mm-dd
  total: number;
  by: Partial<Record<PlatformId, number>>;
}

export interface PlatformAllocation {
  label: string;
  externalId: string;
}

export interface Campaign {
  id: string;
  name: string;
  businessName: string;
  category: string;
  contactName: string;
  product: string;
  description: string;
  creativeName?: string;
  creativeHelp?: boolean;
  landingUrl?: string;
  location: string;
  audience: string;
  language: string;
  platforms: PlatformId[];
  allocations?: Partial<Record<PlatformId, PlatformAllocation | null>>;
  status: CampaignStatus;
  packageName: string;
  amount: number;
  purchaseDate: string; // ISO
  startDate?: string;
  endDate?: string;
  stats: Partial<Record<PlatformId, PlatformStat>>;
  daily: DayPoint[];
  lastReportUpdate?: string;
  report?: Report | null;
}

export interface Order {
  id: string;
  campaignId: string;
  campaignName: string;
  packageName: string;
  date: string;
  paidAt?: string;
  amount: number;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded";
  method?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number; // paise
  currency: string;
  status: string;
  method?: string;
  error?: string;
  date: string;
}

export interface Report {
  id: string;
  campaignId: string;
  campaignName?: string;
  periodStart?: string;
  periodEnd?: string;
  source: string;
  generatedAt: string;
  summary: {
    totals: { views: number; reach: number; impressions: number; clicks: number };
    perPlatform: Partial<Record<PlatformId, { views: number; reach: number; impressions: number; clicks: number }>>;
  };
}

export type NotificationType =
  | "payment"
  | "received"
  | "approved"
  | "scheduled"
  | "started"
  | "paused"
  | "report"
  | "completed"
  | "rejected"
  | "general";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string; // ISO
  read: boolean;
  campaignId?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  business?: string;
  avatar?: string;
  provider: "email" | "google";
  googleLinked?: boolean;
  hasPassword?: boolean;
  createdAt: string;
  prefs: { emailNotifs: boolean; whatsappNotifs: boolean };
}

export interface SupportTicket {
  id: string;
  subject: string;
  campaignId?: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface BookingDraft {
  businessName: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  campaignName: string;
  product: string;
  description: string;
  creativeName: string;
  creativeDataUrl?: string;
  creativeHelp: boolean;
  landingUrl: string;
  location: string;
  audience: string;
  language: string;
  platforms: PlatformId[];
}

/* ------------------------------ package --------------------------- */

export const PACKAGE = {
  name: "Starter Reach",
  price: 399,
  mediaSpend: 300,
  fee: 70,
  tax: 29,
  estViews: "7,000–10,000",
  includes: [
    "Digital advertising campaign",
    "Eligible platform selection",
    "Campaign performance tracking",
    "Personal customer dashboard",
    "Campaign status updates",
    "Performance reporting",
  ],
};

export const DISCLAIMER =
  "7,000–10,000 views represent an estimated target and are not guaranteed. Actual performance depends on advertising platform, audience, creative and campaign conditions.";

/* ----------------------------- platforms -------------------------- */

export const PLATFORMS: Record<
  PlatformId,
  { name: string; short: string; serviceLine: string; metricNote: string }
> = {
  instagram: {
    name: "Instagram",
    short: "IG",
    serviceLine:
      "Reels, Stories and Feed placements that put your product in front of people already looking to discover.",
    metricNote: "Views · Reach · Impressions · Clicks",
  },
  facebook: {
    name: "Facebook",
    short: "FB",
    serviceLine:
      "Precisely targeted campaigns across Feed and Audience Network, built for local and national reach.",
    metricNote: "Views · Reach · Impressions · Clicks",
  },
  youtube: {
    name: "YouTube",
    short: "YT",
    serviceLine:
      "Video advertising that plays before the content your customers already watch and trust.",
    metricNote: "Video Views · Watch Time · Impressions",
  },
  google: {
    name: "Google",
    short: "G",
    serviceLine:
      "Search and Display ads that capture customers at the exact moment they are looking to buy.",
    metricNote: "Impressions · Clicks · Conversions",
  },
};

export const PLATFORM_ORDER: PlatformId[] = ["instagram", "facebook", "youtube", "google"];

export const CATEGORIES = [
  "Retail & E-commerce",
  "Food & Beverage",
  "Fashion & Beauty",
  "Health & Fitness",
  "Education",
  "Real Estate",
  "Travel & Hospitality",
  "Professional Services",
  "Technology",
  "Entertainment",
  "Other",
];

export const LANGUAGES = ["English", "Hindi", "Hinglish", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada", "Malayalam", "Other"];

/* --------------------------- integration status --------------------------- */

export interface IntegrationStatus {
  provider: string;
  label: string;
  configured: boolean;
  mode?: string;
  keyIdPreview?: string | null;
  webhookSecretConfigured?: boolean;
  missing?: string[];
  requiredEnv?: string[];
  note?: string;
  redirectUri?: string;
}

export interface SystemStatus {
  ok: boolean;
  backend: string;
  env: string;
  package: { name: string; price: number; currency: string };
  integrations: Record<string, IntegrationStatus>;
}

export interface OfflineStatus {
  ok: false;
  backend: "offline";
  integrations: Record<string, IntegrationStatus>;
  package: { name: string; price: number; currency: string };
}

/* ----------------------------- formatting ------------------------- */

export const fmtINR = (n: number) => "₹" + n.toLocaleString("en-IN");
export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-IN");

export function fmtCompact(n: number): string {
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(Math.round(n));
}

export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(iso);
}

/* ------------------------- derived totals -------------------------- */

export function campaignTotals(c: Pick<Campaign, "platforms" | "stats">): { views: number; reach: number; impressions: number; clicks: number } {
  let views = 0, reach = 0, impressions = 0, clicks = 0;
  for (const p of c.platforms) {
    const s = c.stats[p];
    if (!s) continue;
    views += s.views;
    reach += s.reach;
    impressions += s.impressions;
    clicks += s.clicks;
  }
  return { views, reach, impressions, clicks };
}

export function hasReportData(c: Pick<Campaign, "daily">): boolean {
  return c.daily.length > 0;
}
