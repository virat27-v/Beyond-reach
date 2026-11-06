import { Fragment, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Download,
  Headphones,
  Info,
  Lock,
  MapPin,
  Megaphone,
  Plus,
  Users,
} from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import {
  BookingDraft,
  CampaignStatus,
  PLATFORMS,
  PlatformId,
  campaignTotals,
  fmtDate,
  fmtDateShort,
  fmtINR,
  fmtNum,
} from "../lib/data";
import { downloadCampaignReport } from "../lib/pdf";
import { AreaChart, CompareBars, DemoBadge, EmptyState, PlatformChip, StatusPill, btnCls } from "../components/ui";
import { DashboardShell } from "./Dashboard";
import { PaymentModal } from "./Booking";

const STATUS_FLOW: CampaignStatus[] = ["Under Review", "Approved", "Scheduled", "Active", "Completed"];
const RANGES = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "All", days: 0 },
];

function flowIndex(status: CampaignStatus): number {
  if (status === "Payment Pending" || status === "Rejected" || status === "Paused") return -1;
  return STATUS_FLOW.indexOf(status);
}

function platformMetrics(id: PlatformId, c: Parameters<typeof campaignTotals>[0]): { label: string; value: string }[] {
  const s = c.stats[id];
  if (!s) return [];
  const n = (v: number) => fmtNum(v);
  switch (id) {
    case "instagram":
    case "facebook":
      return [
        { label: "Views", value: n(s.views) },
        { label: "Reach", value: n(s.reach) },
        { label: "Impressions", value: n(s.impressions) },
        { label: "Clicks", value: n(s.clicks) },
      ];
    case "youtube":
      return [
        { label: "Video Views", value: n(s.views) },
        { label: "Watch Time", value: `${fmtNum(s.watchTimeHours || 0)} hrs` },
        { label: "Impressions", value: n(s.impressions) },
        { label: "Reach", value: n(s.reach) },
      ];
    case "google":
      return [
        { label: "Impressions", value: n(s.impressions) },
        { label: "Clicks", value: n(s.clicks) },
        { label: "Conversions", value: n(s.conversions || 0) },
        { label: "Reach", value: n(s.reach) },
      ];
  }
}

export default function CampaignDetailPage({ id }: { id: string }) {
  const { user, data, payExistingCampaign, toast } = useStore();
  const [range, setRange] = useState(14);
  const [payOpen, setPayOpen] = useState(false);
  const campaign = data.campaigns.find((c) => c.id === id);

  const chartData = useMemo(() => {
    if (!campaign) return [];
    const rows = range === 0 ? campaign.daily : campaign.daily.slice(-range);
    return rows.map((d) => ({ label: fmtDateShort(d.date), value: d.total }));
  }, [campaign, range]);

  if (!user) return null;

  if (!campaign) {
    return (
      <DashboardShell active="campaigns">
        <EmptyState
          icon={<Megaphone size={22} />}
          title="Campaign not found"
          body="This campaign doesn't exist or may have been removed from your account."
          action={
            <button onClick={() => navigate("/dashboard/campaigns")} className={btnCls("primary", "md")}>
              Back to My Campaigns
            </button>
          }
        />
      </DashboardShell>
    );
  }

  const totals = campaignTotals(campaign);
  const hasData = campaign.daily.length > 0;
  const fi = flowIndex(campaign.status);
  const bars = campaign.platforms.map((p) => ({
    id: p,
    name: PLATFORMS[p].name,
    value: campaign.stats[p]?.views || 0,
    sub: totals.views ? `${Math.round(((campaign.stats[p]?.views || 0) / totals.views) * 100)}% of views` : undefined,
  }));

  const retryDraft: BookingDraft = {
    businessName: campaign.businessName,
    category: campaign.category,
    contactName: campaign.contactName,
    email: user.email,
    phone: user.phone || "",
    website: "",
    campaignName: campaign.name,
    product: campaign.product,
    description: campaign.description,
    creativeName: campaign.creativeName || "",
    creativeHelp: !!campaign.creativeHelp,
    landingUrl: campaign.landingUrl || "",
    location: campaign.location,
    audience: campaign.audience,
    language: campaign.language,
    platforms: campaign.platforms,
  };

  const detailRow = (label: string, value?: string) => (
    <div className="flex justify-between gap-6 py-2.5 text-sm">
      <span className="shrink-0 text-sub">{label}</span>
      <span className="text-right font-medium text-ink break-words">{value || "—"}</span>
    </div>
  );

  return (
    <DashboardShell active="campaigns">
      <button
        onClick={() => navigate("/dashboard/campaigns")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-sub transition-colors hover:text-ink cursor-pointer anim-fade"
      >
        <ArrowLeft size={15} /> My Campaigns
      </button>

      {/* header */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 anim-rise">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[30px]">{campaign.name}</h1>
            {campaign.demo && <DemoBadge />}
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sub">
            <span className="font-mono text-[13px]">{campaign.id}</span>
            <span aria-hidden="true">·</span>
            <span>{campaign.businessName}</span>
            <span aria-hidden="true">·</span>
            <span>Purchased {fmtDate(campaign.purchaseDate)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={campaign.status} />
          <button
            onClick={() => downloadCampaignReport(campaign, user.name)}
            disabled={!hasData}
            className={btnCls("secondary", "sm")}
            title={hasData ? "Download PDF report" : "Report available once the campaign is live"}
          >
            <Download size={14} /> Report
          </button>
          <button onClick={() => navigate("/book")} className={btnCls("primary", "sm")}>
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </div>

      {campaign.demo && (
        <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-dashed border-ink/20 bg-white px-4 py-3.5 anim-fade">
          <Info size={16} className="mt-0.5 shrink-0 text-sub" />
          <p className="text-[13px] leading-relaxed text-sub">
            <span className="font-semibold text-ink">Demonstration data.</span> The performance figures below are sample data
            shown for preview. Live campaigns display verified statistics synced from each advertising platform — managed by
            our team and updated here automatically.
          </p>
        </div>
      )}

      {campaign.status === "Payment Pending" && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 anim-fade">
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Payment pending.</span> Complete your payment of {fmtINR(campaign.amount)} to send
            this campaign for review.
          </p>
          <button onClick={() => setPayOpen(true)} className={btnCls("primary", "sm")}>
            <Lock size={13} /> Complete Payment
          </button>
        </div>
      )}

      {/* status timeline */}
      {fi >= 0 && (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-white px-6 py-6 md:px-8 anim-rise">
          <div className="flex min-w-[540px] items-center">
            {STATUS_FLOW.map((s, i) => (
              <Fragment key={s}>
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold transition-all ${
                      i < fi
                        ? "border-ink bg-ink text-white"
                        : i === fi
                          ? "border-ink bg-white text-ink ring-4 ring-ink/10"
                          : "border-line bg-white text-faint"
                    }`}
                  >
                    {i < fi ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`whitespace-nowrap text-[11px] font-medium ${i <= fi ? "text-ink" : "text-faint"}`}>{s}</span>
                </div>
                {i < STATUS_FLOW.length - 1 && <span className={`mx-2 mb-6 h-px flex-1 ${i < fi ? "bg-ink" : "bg-line"}`} />}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* big totals */}
      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total Views", value: totals.views },
          { label: "Total Reach", value: totals.reach },
          { label: "Impressions", value: totals.impressions },
          { label: "Clicks", value: totals.clicks },
        ].map((m, i) => (
          <div key={m.label} className="anim-rise rounded-3xl border border-line bg-white p-6" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{m.label}</p>
            <p className="mt-3 text-[30px] font-semibold leading-none tracking-tight tnum">
              {hasData ? fmtNum(m.value) : "—"}
            </p>
            <p className="mt-2 text-xs text-sub">{hasData ? "All selected platforms" : "Awaiting campaign launch"}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* chart */}
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink">Daily views</h2>
                <p className="mt-0.5 text-xs text-sub">
                  {campaign.lastReportUpdate ? `Last report update · ${fmtDate(campaign.lastReportUpdate)}` : "Updates as your campaign runs"}
                </p>
              </div>
              <div className="flex rounded-full border border-line bg-white p-1">
                {RANGES.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRange(r.days)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                      range === r.days ? "bg-ink text-white" : "text-sub hover:text-ink"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              {hasData ? (
                <AreaChart data={chartData} height={230} />
              ) : (
                <div className="flex h-[230px] flex-col items-center justify-center px-6 text-center">
                  <Clock3 size={22} className="text-faint" />
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-sub">
                    No performance data yet. Once your campaign is approved and launched, daily views will chart here
                    automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* platform-wise reporting */}
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight text-ink">Platform-wise reporting</h2>
                <p className="mt-0.5 text-xs text-sub">Individual statistics for every platform in this campaign</p>
              </div>
              {campaign.demo && <DemoBadge />}
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {campaign.platforms.map((p) => {
                const metrics = platformMetrics(p, campaign);
                return (
                  <div key={p} className="rounded-2xl border border-line p-5 transition-shadow hover:shadow-soft">
                    <div className="flex items-center gap-3">
                      <PlatformChip id={p} size={40} />
                      <div>
                        <p className="text-sm font-semibold text-ink">{PLATFORMS[p].name}</p>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{PLATFORMS[p].metricNote}</p>
                      </div>
                      {campaign.stats[p] && (
                        <span className="ml-auto text-right">
                          <span className="block text-lg font-semibold leading-none tnum">{fmtNum(campaign.stats[p]!.views)}</span>
                          <span className="text-[10px] uppercase tracking-wider text-faint">views</span>
                        </span>
                      )}
                    </div>
                    {metrics.length ? (
                      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-4">
                        {metrics.map((m) => (
                          <div key={m.label} className="bg-white px-4 py-3.5">
                            <p className="text-base font-semibold tracking-tight tnum">{m.value}</p>
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-faint">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-[13px] text-sub">
                        Awaiting launch — {PLATFORMS[p].name} statistics will appear here.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* comparison */}
          {hasData && (
            <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Platform comparison</h2>
              <p className="mt-0.5 text-xs text-sub">Where your views are coming from</p>
              <div className="mt-6">
                <CompareBars items={bars} />
              </div>
            </div>
          )}
        </div>

        {/* right column */}
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Campaign details</h2>
            <div className="mt-3 divide-y divide-line/70">
              {detailRow("Campaign ID", campaign.id)}
              {detailRow("Package", campaign.packageName)}
              {detailRow("Amount paid", fmtINR(campaign.amount))}
              {detailRow("Business", campaign.businessName)}
              {detailRow("Category", campaign.category)}
              {detailRow("Product / Service", campaign.product)}
              {detailRow("Creative", campaign.creativeHelp ? "Designed by Beyond Reach" : campaign.creativeName)}
              {detailRow("Landing page", campaign.landingUrl)}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Schedule & audience</h2>
            <div className="mt-4 flex flex-col gap-4 text-sm">
              <p className="flex gap-3">
                <CalendarDays size={17} className="mt-0.5 shrink-0 text-faint" />
                <span>
                  <span className="block font-medium text-ink">
                    {campaign.startDate ? `${fmtDate(campaign.startDate)} — ${fmtDate(campaign.endDate)}` : "Dates assigned at launch"}
                  </span>
                  <span className="text-sub">Campaign duration</span>
                </span>
              </p>
              <p className="flex gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-faint" />
                <span>
                  <span className="block font-medium text-ink">{campaign.location}</span>
                  <span className="text-sub">Target location · {campaign.language}</span>
                </span>
              </p>
              <p className="flex gap-3">
                <Users size={17} className="mt-0.5 shrink-0 text-faint" />
                <span>
                  <span className="block font-medium text-ink">{campaign.audience}</span>
                  <span className="text-sub">Target audience</span>
                </span>
              </p>
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <p className="text-xs text-sub leading-relaxed">{campaign.description}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-ink p-6 text-white md:p-7">
            <h2 className="text-[15px] font-semibold tracking-tight">Need changes?</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
              Pause your campaign, update your creative or ask anything — our team replies within a few hours.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button onClick={() => navigate("/support")} className={btnCls("white", "md", "w-full")}>
                <Headphones size={15} /> Contact Support
              </button>
              <button
                onClick={() => downloadCampaignReport(campaign, user.name)}
                disabled={!hasData}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-40 cursor-pointer"
              >
                <Download size={15} /> Download PDF Report
              </button>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/40">
              Reports include platform-wise statistics <ArrowRight size={11} />
            </p>
          </div>
        </div>
      </div>

      <PaymentModal
        open={payOpen}
        draft={retryDraft}
        onClose={() => setPayOpen(false)}
        onSuccess={(method) => {
          payExistingCampaign(campaign.id, method);
          setPayOpen(false);
          toast("Payment successful", "Your campaign is now under review.");
        }}
        onFailure={() => {
          setPayOpen(false);
          toast("Payment failed", "No amount was charged. You can try again anytime.");
        }}
      />
    </DashboardShell>
  );
}
