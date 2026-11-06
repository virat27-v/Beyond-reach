import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Headphones,
  Info,
  Mail,
  MapPin,
  Megaphone,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import { PLATFORMS, fmtDate, fmtDateTime } from "../lib/data";
import { getCampaign, subscribeCampaigns, withdrawCampaign, type StoredCampaign } from "../lib/campaigns";
import { EmptyState, PlatformChip, btnCls } from "../components/ui";
import { SUPPORT_EMAIL } from "../lib/data";
import { BriefStatusPill, DashboardShell } from "./Dashboard";

/* ------------------------------------------------------------------ */
/*  Campaign detail — one saved brief, honest status.                  */
/*  Nothing is shown as reviewed, allocated, live or measured.         */
/* ------------------------------------------------------------------ */

const FLOW = [
  { label: "Brief Submitted", note: "Saved to your account" },
  { label: "Agency Review", note: "Our team reviews the brief by email" },
  { label: "Launch", note: "Starts only after approval & payment" },
];

export default function CampaignDetailPage({ id }: { id: string }) {
  const { user, toast } = useStore();
  const [campaign, setCampaign] = useState<StoredCampaign | undefined>(() => getCampaign(user?.uid, id));
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  useEffect(() => {
    if (!user) return;
    setCampaign(getCampaign(user.uid, id));
    return subscribeCampaigns(user.uid, () => setCampaign(getCampaign(user.uid, id)));
  }, [user, id]);

  if (!user) return null;

  if (!campaign) {
    return (
      <DashboardShell active="campaigns">
        <EmptyState
          icon={<Megaphone size={22} />}
          title="Campaign not found"
          body="This campaign is not saved in this browser for your account. It may have been created on another device or removed."
          action={
            <button onClick={() => navigate("/dashboard/campaigns")} className={btnCls("primary", "md")}>
              Back to My Campaigns
            </button>
          }
        />
      </DashboardShell>
    );
  }

  const withdrawn = campaign.status === "Withdrawn";
  const detailRow = (label: string, value?: string) => (
    <div className="flex justify-between gap-6 py-2.5 text-sm">
      <span className="shrink-0 text-sub">{label}</span>
      <span className="text-right font-medium text-ink break-words">{value || "—"}</span>
    </div>
  );

  const withdraw = () => {
    if (!user) return;
    const ok = withdrawCampaign(user.uid, campaign.id);
    setConfirmWithdraw(false);
    if (ok) {
      toast("Campaign withdrawn", `${campaign.id} was marked as withdrawn.`);
    } else {
      toast("Could not withdraw", "This browser blocked local storage. Please email our team instead.");
    }
  };

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Campaign ${campaign.id} — ${campaign.name}`)}&body=${encodeURIComponent(
    `Hello Beyond Reach,\n\nI'm following up on my campaign brief ${campaign.id} (${campaign.name}).\nAccount ID: ${campaign.accountId}\nEmail: ${campaign.email}\n\nThank you.`
  )}`;

  return (
    <DashboardShell active="campaigns">
      <button
        onClick={() => navigate("/dashboard/campaigns")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-sub transition-colors hover:text-ink cursor-pointer anim-fade"
      >
        <ArrowLeft size={15} /> My Campaigns
      </button>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 anim-rise">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink md:text-[30px]">{campaign.name}</h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sub">
            <span className="font-mono text-[13px]">{campaign.id}</span>
            <span aria-hidden="true">·</span>
            <span>{campaign.businessName}</span>
            <span aria-hidden="true">·</span>
            <span>Created {fmtDate(campaign.createdAt)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BriefStatusPill status={campaign.status} />
          <a href={mailto} className={btnCls("secondary", "sm")}>
            <Mail size={14} /> Contact team
          </a>
          <button onClick={() => navigate("/book")} className={btnCls("primary", "sm")}>
            <Plus size={14} /> New Campaign
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 anim-fade">
        <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-[13px] leading-relaxed text-amber-900">
          <span className="font-semibold">Not running yet.</span> This is a saved brief. Review, payment and advertising-platform
          delivery require our team and a secure backend, so no campaign, payment or analytics data is shown here.
          {campaign.emailSent ? " Your email draft was created so our team can follow up." : " Use “Contact team” to email us about it."}
        </p>
      </div>

      {/* honest timeline */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-white px-6 py-6 md:px-8 anim-rise">
        <div className="flex min-w-[520px] items-start overflow-x-auto">
          {FLOW.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-start gap-3">
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold ${
                    i === 0 && !withdrawn ? "border-ink bg-ink text-white" : "border-line bg-white text-faint"
                  }`}
                >
                  {i === 0 && !withdrawn ? <Check size={13} strokeWidth={3} /> : i + 1}
                </span>
              </div>
              <div className="pb-2">
                <p className={`text-[13px] font-medium ${i === 0 && !withdrawn ? "text-ink" : "text-faint"}`}>{step.label}</p>
                <p className="mt-0.5 max-w-[150px] text-[11px] leading-relaxed text-faint">{step.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* analytics honesty */}
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Performance</h2>
            <div className="mt-2 grid grid-cols-2 gap-4 xl:grid-cols-4">
              {["Views", "Reach", "Impressions", "Clicks"].map((m) => (
                <div key={m} className="rounded-2xl border border-line p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">{m}</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-faint">—</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-mist px-4 py-3">
              <Clock3 size={15} className="mt-0.5 shrink-0 text-sub" />
              <p className="text-[13px] leading-relaxed text-sub">
                Analytics Not Available Yet. Verified platform reporting appears only after a campaign actually launches through an
                authorised advertising integration.
              </p>
            </div>
          </div>

          {/* platforms / allocation */}
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Platforms requested</h2>
            <p className="mt-0.5 text-xs text-sub">Nothing has been allocated or launched.</p>
            <div className="mt-4 flex flex-col gap-3">
              {campaign.platforms.map((p) => (
                <div key={p} className="flex items-center gap-3 rounded-2xl border border-line p-4">
                  <PlatformChip id={p} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{PLATFORMS[p].name}</p>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Not Allocated</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Campaign details</h2>
            <div className="mt-3 divide-y divide-line/70">
              {detailRow("Campaign ID", campaign.id)}
              {detailRow("Account ID", campaign.accountId)}
              {detailRow("Status", campaign.status)}
              {detailRow("Submitted", fmtDateTime(campaign.createdAt))}
              {detailRow("Business", campaign.businessName)}
              {detailRow("Category", campaign.category)}
              {detailRow("Product / Service", campaign.product)}
              {detailRow("Package", "Starter Reach · ₹399")}
              {detailRow("Payment", "Not paid — payments disabled")}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 md:p-7">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Brief & audience</h2>
            <div className="mt-4 flex flex-col gap-4 text-sm">
              <p className="flex gap-3">
                <CalendarDays size={17} className="mt-0.5 shrink-0 text-faint" />
                <span>
                  <span className="block font-medium text-ink">Not scheduled</span>
                  <span className="text-sub">Campaign dates are set only at launch</span>
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
              <p className="text-xs leading-relaxed text-sub">{campaign.description}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-ink p-6 text-white md:p-7">
            <h2 className="text-[15px] font-semibold tracking-tight">Need changes?</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
              Reply to our team with your campaign ID and we'll update the brief before anything is launched.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a href={mailto} className={btnCls("white", "md", "w-full")}>
                <Headphones size={15} /> Contact Support
              </a>
              {!withdrawn &&
                (!confirmWithdraw ? (
                  <button
                    onClick={() => setConfirmWithdraw(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 cursor-pointer"
                  >
                    <Trash2 size={15} /> Withdraw brief
                  </button>
                ) : (
                  <div className="rounded-2xl border border-white/20 p-4">
                    <p className="text-[12px] leading-relaxed text-white/70">
                      Withdraw this brief? It stays in your history and nothing is charged.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={withdraw}
                        className="flex-1 rounded-full bg-white px-3 py-2 text-[13px] font-medium text-ink cursor-pointer"
                      >
                        Yes, withdraw
                      </button>
                      <button
                        onClick={() => setConfirmWithdraw(false)}
                        className="flex-1 rounded-full border border-white/25 px-3 py-2 text-[13px] font-medium text-white cursor-pointer"
                      >
                        Keep
                      </button>
                    </div>
                  </div>
                ))}
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
                Campaign updates are handled by email <ArrowRight size={11} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
