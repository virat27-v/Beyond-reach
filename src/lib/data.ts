/* ------------------------------------------------------------------ */
/*  Beyond Reach — core data model, constants & demo seed data         */
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
  status: CampaignStatus;
  packageName: string;
  amount: number;
  purchaseDate: string; // ISO
  startDate?: string;
  endDate?: string;
  stats: Partial<Record<PlatformId, PlatformStat>>;
  daily: DayPoint[];
  demo?: boolean;
  lastReportUpdate?: string;
}

export interface Order {
  id: string;
  campaignId: string;
  campaignName: string;
  packageName: string;
  date: string;
  amount: number;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded";
  method?: string;
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
  name: string;
  email: string;
  phone?: string;
  business?: string;
  password?: string;
  provider: "email" | "google";
  createdAt: string;
  prefs: { emailNotifs: boolean; whatsappNotifs: boolean };
}

export interface UserData {
  campaigns: Campaign[];
  orders: Order[];
  notifications: AppNotification[];
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
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
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

export function isoDaysAgo(n: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

export function isoDaysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

let uidCounter = 0;
export function uid(prefix = ""): string {
  uidCounter += 1;
  return `${prefix}${Date.now().toString(36)}${uidCounter.toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}

export function newCampaignId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BR-${year}-${rand}`;
}

export function newOrderId(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${rand}`;
}

/* --------------------- deterministic demo series ------------------ */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PLATFORM_WEIGHT: Record<PlatformId, number> = {
  instagram: 0.42,
  facebook: 0.27,
  youtube: 0.19,
  google: 0.12,
};

export function buildDaily(seedKey: string, startIso: string, days: number, platforms: PlatformId[], dailyBase = 620): DayPoint[] {
  const rnd = mulberry32(hashStr(seedKey));
  const out: DayPoint[] = [];
  const start = new Date(startIso);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const growth = 1 + i * 0.045;
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 1.18 : 1;
    const by: Partial<Record<PlatformId, number>> = {};
    let total = 0;
    for (const p of platforms) {
      const noise = 0.72 + rnd() * 0.6;
      const v = Math.round(dailyBase * PLATFORM_WEIGHT[p] * 2.1 * growth * weekend * noise);
      by[p] = v;
      total += v;
    }
    out.push({ date: d.toISOString().slice(0, 10), total, by });
  }
  return out;
}

export function statsFromDaily(daily: DayPoint[], platforms: PlatformId[], seedKey: string): Partial<Record<PlatformId, PlatformStat>> {
  const rnd = mulberry32(hashStr(seedKey + ":stats"));
  const stats: Partial<Record<PlatformId, PlatformStat>> = {};
  for (const p of platforms) {
    const views = daily.reduce((s, d) => s + (d.by[p] || 0), 0);
    const reachFactor = 0.68 + rnd() * 0.12;
    const impFactor = 1.3 + rnd() * 0.25;
    const reach = Math.round(views * reachFactor);
    const impressions = Math.round(views * impFactor);
    const clicks = Math.round(impressions * (0.014 + rnd() * 0.012));
    const stat: PlatformStat = { views, reach, impressions, clicks };
    if (p === "youtube") stat.watchTimeHours = Math.round(views * 0.011 * 10) / 10;
    if (p === "google") stat.conversions = Math.max(1, Math.round(clicks * (0.05 + rnd() * 0.04)));
    stats[p] = stat;
  }
  return stats;
}

export function campaignTotals(c: Campaign): { views: number; reach: number; impressions: number; clicks: number } {
  let views = 0,
    reach = 0,
    impressions = 0,
    clicks = 0;
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

/* --------------------------- demo seed ---------------------------- */

export function seedDemoData(): UserData {
  const c1Start = isoDaysAgo(9);
  const c1Daily = buildDaily("br-c1", c1Start, 10, ["instagram", "facebook", "youtube"], 640);
  const c1: Campaign = {
    id: "BR-2026-1042",
    name: "Festive Collection Launch",
    businessName: "Sharma Jewellers",
    category: "Retail & E-commerce",
    contactName: "Aarav Kapoor",
    product: "Festive gold & diamond collection",
    description: "Festive season collection launch with up to 25% off on making charges.",
    creativeName: "festive-collection-reel.mp4",
    landingUrl: "https://instagram.com/sharmajewellers",
    location: "Delhi NCR",
    audience: "Women, 25–44, jewellery & fashion interests",
    language: "Hinglish",
    platforms: ["instagram", "facebook", "youtube"],
    status: "Active",
    packageName: PACKAGE.name,
    amount: PACKAGE.price,
    purchaseDate: isoDaysAgo(11),
    startDate: c1Start,
    endDate: isoDaysFromNow(4),
    stats: statsFromDaily(c1Daily, ["instagram", "facebook", "youtube"], "br-c1"),
    daily: c1Daily,
    demo: true,
    lastReportUpdate: isoDaysAgo(0, 8),
  };

  const c2Start = isoDaysAgo(38);
  const c2Daily = buildDaily("br-c2", c2Start, 14, ["instagram", "google"], 560);
  const c2: Campaign = {
    id: "BR-2026-0987",
    name: "Weekend Brunch Launch",
    businessName: "Café Aarogya",
    category: "Food & Beverage",
    contactName: "Aarav Kapoor",
    product: "Weekend brunch menu",
    description: "New weekend brunch menu launch at Café Aarogya, Indiranagar.",
    creativeName: "brunch-launch.jpg",
    landingUrl: "https://instagram.com/cafeaarogya",
    location: "Bengaluru",
    audience: "Food lovers, 22–40, within 8 km",
    language: "English",
    platforms: ["instagram", "google"],
    status: "Completed",
    packageName: PACKAGE.name,
    amount: PACKAGE.price,
    purchaseDate: isoDaysAgo(40),
    startDate: c2Start,
    endDate: isoDaysAgo(24),
    stats: statsFromDaily(c2Daily, ["instagram", "google"], "br-c2"),
    daily: c2Daily,
    demo: true,
    lastReportUpdate: isoDaysAgo(24),
  };

  const c3: Campaign = {
    id: "BR-2026-1108",
    name: "New Year Fitness Challenge",
    businessName: "FitLife Studio",
    category: "Health & Fitness",
    contactName: "Aarav Kapoor",
    product: "21-day fitness challenge",
    description: "New Year 21-day fitness challenge — enrolments open for January batch.",
    creativeName: "fitness-challenge.png",
    location: "Mumbai",
    audience: "Fitness enthusiasts, 20–35",
    language: "English",
    platforms: ["instagram", "youtube"],
    status: "Under Review",
    packageName: PACKAGE.name,
    amount: PACKAGE.price,
    purchaseDate: isoDaysAgo(0, 9),
    stats: {},
    daily: [],
    demo: true,
  };

  const orders: Order[] = [
    { id: "ORD-841206", campaignId: c3.id, campaignName: c3.name, packageName: PACKAGE.name, date: c3.purchaseDate, amount: 399, paymentStatus: "Paid", method: "UPI" },
    { id: "ORD-830517", campaignId: c1.id, campaignName: c1.name, packageName: PACKAGE.name, date: c1.purchaseDate, amount: 399, paymentStatus: "Paid", method: "Card" },
    { id: "ORD-802344", campaignId: c2.id, campaignName: c2.name, packageName: PACKAGE.name, date: c2.purchaseDate, amount: 399, paymentStatus: "Paid", method: "UPI" },
  ];

  const notifications: AppNotification[] = [
    { id: uid("n"), type: "report", title: "Report updated", body: "Your campaign “Festive Collection Launch” report was updated with yesterday’s performance.", time: isoDaysAgo(0, 8), read: false, campaignId: c1.id },
    { id: uid("n"), type: "received", title: "Campaign received", body: "We received “New Year Fitness Challenge”. Our team is reviewing your advertisement.", time: isoDaysAgo(0, 9), read: false, campaignId: c3.id },
    { id: uid("n"), type: "payment", title: "Payment confirmed", body: "We received your payment of ₹399 for “New Year Fitness Challenge”. Order ORD-841206.", time: isoDaysAgo(0, 9), read: true, campaignId: c3.id },
    { id: uid("n"), type: "started", title: "Campaign started", body: "“Festive Collection Launch” is now live across Instagram, Facebook and YouTube.", time: isoDaysAgo(9), read: true, campaignId: c1.id },
    { id: uid("n"), type: "approved", title: "Campaign approved", body: "“Festive Collection Launch” was approved and scheduled for launch.", time: isoDaysAgo(10), read: true, campaignId: c1.id },
    { id: uid("n"), type: "completed", title: "Campaign completed", body: "“Weekend Brunch Launch” has completed. Your final report is ready to download.", time: isoDaysAgo(24), read: true, campaignId: c2.id },
  ];

  return { campaigns: [c3, c1, c2], orders, notifications };
}

export function emptyData(): UserData {
  return { campaigns: [], orders: [], notifications: [] };
}

export function welcomeNotification(): AppNotification {
  return {
    id: uid("n"),
    type: "general",
    title: "Welcome to Beyond Reach",
    body: "Your account is ready. Book your first campaign and start reaching new customers today.",
    time: new Date().toISOString(),
    read: false,
  };
}
