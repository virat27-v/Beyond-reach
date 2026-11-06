/* ------------------------------------------------------------------ */
/*  Beyond Reach — data model, constants & formatting helpers          */
/*  (No sample / generated data lives here. All records come from DB.) */
/* ------------------------------------------------------------------ */

export const SUPPORT_EMAIL = "support@beyondreach.agency";
export const SUPPORT_PHONE = "+91 98765 43210";
export const WHATSAPP_NUMBER = "919876543210";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Beyond%20Reach%2C%20I%20need%20help%20with%20my%20campaign.`;

export type PlatformId = "instagram" | "facebook" | "youtube" | "google";

export type CampaignStatus =
  | "Payment Pending"
  | "Payment Confirmed"
  | "Under Review"
  | "Approved"
  | "Scheduled"
  | "Active"
  | "Paused"
  | "Completed"
  | "Rejected";

export type AllocationStatus = "Not Allocated" | "Allocated" | "Live" | "Paused" | "Ended" | "Not Eligible";
export type OrderStatus = "Pending" | "Paid" | "Failed" | "Refunded" | "Cancelled";
export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";
export type ReportSource = "meta_marketing_api" | "google_ads_api" | "manual_verified";

/** A metric is `null` when the platform/report did not provide it. */
export interface MetricSet {
  views: number | null;
  reach: number | null;
  impressions: number | null;
  clicks: number | null;
  watch_time_seconds: number | null;
  conversions: number | null;
}

export interface Campaign {
  id: string; // uuid
  ref: string; // BR-2026-000123
  name: string;
  businessName: string;
  category: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string | null;
  product: string;
  description: string;
  creativeName?: string | null;
  creativePath?: string | null;
  creativeKind?: "image" | "video" | null;
  creativeHelp: boolean;
  landingUrl?: string | null;
  location: string;
  audience: string;
  language: string;
  platforms: PlatformId[];
  packageName: string;
  amountPaise: number;
  status: CampaignStatus;
  statusNote?: string | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAllocation {
  id: string;
  campaignId: string;
  platform: PlatformId;
  status: AllocationStatus;
  liveAt?: string | null;
  endedAt?: string | null;
  note?: string | null;
}

export interface PlatformTotals extends MetricSet {
  campaignId: string;
  platform: PlatformId;
  firstDay: string;
  lastDay: string;
  lastSyncedAt: string;
  daysReported: number;
}

export interface DailyStat extends MetricSet {
  campaignId: string;
  platform: PlatformId;
  day: string;
  source: ReportSource;
}

export interface CampaignReport {
  id: string;
  campaignId: string;
  periodStart: string;
  periodEnd: string;
  platforms: PlatformId[];
  totals: MetricSet;
  byPlatform: Partial<Record<PlatformId, MetricSet & { days_reported?: number }>>;
  source: ReportSource;
  isFinal: boolean;
  generatedAt: string;
}

export interface Order {
  id: string;
  ref: string;
  campaignId: string;
  amountPaise: number;
  currency: string;
  status: OrderStatus;
  gatewayOrderId?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentId: string;
  gatewayOrderId: string;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  method?: string | null;
  errorDescription?: string | null;
  verifiedBy: "signature" | "webhook" | "api";
  createdAt: string;
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
  time: string;
  read: boolean;
  campaignId?: string | null;
}

export interface SupportRequest {
  id: string;
  ref: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export interface User {
  id: string; // Firebase uid — unique internal user id, stable across logins
  name: string;
  email: string;
  phone?: string | null;
  business?: string | null;
  provider: "email" | "google";
  createdAt: string; // registration timestamp (set by Firebase on first sign-in)
  lastLoginAt?: string;
  isFirstLogin?: boolean; // true within ~15 min of account creation
  prefs: { emailNotifs: boolean; whatsappNotifs: boolean };
  avatar?: string | null;
}

export interface UserData {
  campaigns: Campaign[];
  allocations: PlatformAllocation[];
  totals: PlatformTotals[];
  reports: CampaignReport[];
  orders: Order[];
  payments: Payment[];
  notifications: AppNotification[];
  supportRequests: SupportRequest[];
}

/** Frontend-only build: every collection is always empty — nothing is persisted. */
export function emptyData(): UserData {
  return { campaigns: [], allocations: [], totals: [], reports: [], orders: [], payments: [], notifications: [], supportRequests: [] };
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
  creativeFile: File | null;
  creativeName: string;
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
  pricePaise: 39900,
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

export const PLATFORMS: Record<PlatformId, { name: string; short: string; serviceLine: string; metricNote: string; via: string }> = {
  instagram: {
    name: "Instagram",
    short: "IG",
    serviceLine: "Reels, Stories and Feed placements that put your product in front of people already looking to discover.",
    metricNote: "Views · Reach · Impressions · Clicks",
    via: "Meta Ads",
  },
  facebook: {
    name: "Facebook",
    short: "FB",
    serviceLine: "Precisely targeted campaigns across Feed and Audience Network, built for local and national reach.",
    metricNote: "Views · Reach · Impressions · Clicks",
    via: "Meta Ads",
  },
  youtube: {
    name: "YouTube",
    short: "YT",
    serviceLine: "Video advertising that plays before the content your customers already watch and trust.",
    metricNote: "Video Views · Impressions · Clicks",
    via: "Google Ads",
  },
  google: {
    name: "Google",
    short: "G",
    serviceLine: "Search and Display ads that capture customers at the exact moment they are looking to buy.",
    metricNote: "Impressions · Clicks · Conversions",
    via: "Google Ads",
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

export const STATUS_HELP: Record<CampaignStatus, string> = {
  "Payment Pending": "Complete payment to submit this campaign for review.",
  "Payment Confirmed": "Payment received. Your campaign is being queued for review.",
  "Under Review": "Our team is reviewing your advertisement and targeting.",
  Approved: "Approved. Platform allocation and scheduling are in progress.",
  Scheduled: "Scheduled for launch on the dates shown.",
  Active: "Live on the allocated platforms. Reporting updates as data is verified.",
  Paused: "Temporarily paused. Contact support for details.",
  Completed: "Campaign finished. Your final report is available once verified.",
  Rejected: "This campaign could not be approved. See the note from our team.",
};

/* ----------------------------- formatting ------------------------- */

export const fmtINR = (n: number) => "₹" + n.toLocaleString("en-IN");
export const fmtPaise = (p: number) => fmtINR(Math.round(p / 100));
export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-IN");

/** Formats a metric or returns an honest placeholder when it's unavailable. */
export const fmtMetric = (n: number | null | undefined, unavailable = "Not available") =>
  n === null || n === undefined ? unavailable : fmtNum(n);

export function fmtCompact(n: number): string {
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(Math.round(n));
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fmtDateShort(iso: string): string {
  return new Date(iso.length === 10 ? iso + "T00:00:00" : iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return fmtDate(iso);
}

let uidCounter = 0;
export function uid(prefix = ""): string {
  uidCounter += 1;
  return `${prefix}${Date.now().toString(36)}${uidCounter.toString(36)}`;
}

/* ---------------------- metric aggregation helpers ---------------- */

const KEYS: (keyof MetricSet)[] = ["views", "reach", "impressions", "clicks", "watch_time_seconds", "conversions"];

export function emptyMetrics(): MetricSet {
  return { views: null, reach: null, impressions: null, clicks: null, watch_time_seconds: null, conversions: null };
}

/** Sums metric sets; a key stays null only if *every* input lacks it. */
export function sumMetrics(sets: MetricSet[]): MetricSet {
  const out = emptyMetrics();
  for (const k of KEYS) {
    const vals = sets.map((s) => s[k]).filter((v): v is number => v !== null && v !== undefined);
    out[k] = vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  }
  return out;
}

export function campaignTotals(c: Campaign, totals: PlatformTotals[]): MetricSet {
  return sumMetrics(totals.filter((t) => t.campaignId === c.id));
}

export function hasAnyMetric(m: MetricSet): boolean {
  return KEYS.some((k) => m[k] !== null && m[k] !== undefined);
}

export function campaignHasStarted(c: Campaign): boolean {
  return !!c.startedAt || c.status === "Active" || c.status === "Paused" || c.status === "Completed";
}
