import { ArrowRight, Check, Eye, Info, MessageCircle } from "lucide-react";
import { navigate } from "../lib/router";
import { DISCLAIMER, PACKAGE, fmtINR } from "../lib/data";
import { Accordion, Reveal, SectionHead, btnCls } from "../components/ui";

export const FAQS = [
  {
    q: "What exactly does the ₹399 package include?",
    a: "Your ₹399 covers everything needed to run one campaign: ₹300 of advertising media spend on your selected platforms, a ₹70 campaign management fee for setup, targeting and optimisation, and ₹29 GST. There are no hidden charges.",
  },
  {
    q: "Are 7,000–10,000 views guaranteed?",
    a: "No — and we will never promise that. 7,000–10,000 views is an estimated target based on similar campaigns. Actual performance depends on the advertising platform, your audience, creative quality and campaign conditions. Your dashboard always shows real, verified numbers.",
  },
  {
    q: "Which platforms can I advertise on?",
    a: "You can choose from Instagram, Facebook, YouTube and Google during booking. Platform availability depends on your creative — for example, YouTube requires a video. Eligible platforms are shown clearly in the booking flow.",
  },
  {
    q: "How long does it take for my campaign to go live?",
    a: "Most campaigns are reviewed within 24–48 hours. Once approved, your campaign is scheduled and launched, and you can follow every status change from your dashboard and notifications.",
  },
  {
    q: "How do I track my campaign's performance?",
    a: "Every customer gets a personal dashboard with total views, reach and platform-wise statistics for Instagram, Facebook, YouTube and Google. You can view daily performance, compare platforms and download branded PDF reports anytime.",
  },
  {
    q: "Do I need my own advertising accounts?",
    a: "No. Campaigns are created, managed and optimised by the Beyond Reach team on managed advertising accounts, so you never have to deal with Ads Manager complexity.",
  },
  {
    q: "What is your refund policy?",
    a: "If we cannot launch your campaign, you receive a full refund. If a campaign is stopped early by us, the unspent media budget is refunded. Once a campaign is live, spent media budget is non-refundable. See the full Refund Policy for details.",
  },
  {
    q: "Can I run more campaigns or increase my budget later?",
    a: "Yes. You can book additional Starter Reach campaigns anytime from your dashboard. Larger packages are in development — join the waitlist on the pricing page to be notified.",
  },
];

export function PricingSection({ hideHead = false }: { hideHead?: boolean }) {
  return (
    <section id="pricing" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {!hideHead && (
          <SectionHead
            eyebrow="Pricing"
            title={
              <>
                One simple package.
                <br />
                <span className="font-light italic text-sub">Everything included.</span>
              </>
            }
            sub="Transparent pricing with no hidden charges, no lock-ins and no inflated promises. Start small, measure everything, scale when you're ready."
          />
        )}

        <Reveal delay={150} className={hideHead ? "" : "mt-16"}>
          <div className="relative mx-auto max-w-xl">
            <div className="absolute -inset-3 rounded-[36px] bg-mist" aria-hidden="true" />
            <div className="relative rounded-[28px] border border-line bg-white p-8 shadow-soft md:p-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sub">Starter Reach</span>
                <span className="rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-white">Featured Package</span>
              </div>

              <div className="mt-8 flex items-end gap-3">
                <span className="text-6xl font-semibold tracking-[-0.04em] tnum">{fmtINR(PACKAGE.price)}</span>
                <span className="pb-2 text-sm text-sub">
                  one-time
                  <br />
                  per campaign
                </span>
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-mist px-3.5 py-1.5 text-[13px] font-medium text-ink">
                <Eye size={15} className="text-sub" />
                Estimated {PACKAGE.estViews} views
              </div>

              <div className="my-8 h-px bg-line" />

              <ul className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
                {PACKAGE.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink/85">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-ink text-white">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <button onClick={() => navigate("/book")} className={btnCls("primary", "lg", "mt-9 w-full")}>
                Get Started — {fmtINR(PACKAGE.price)}
                <ArrowRight size={17} />
              </button>

              <p className="mt-5 text-center text-xs leading-relaxed text-faint">
                {fmtINR(PACKAGE.mediaSpend)} media spend · {fmtINR(PACKAGE.fee)} campaign management · {fmtINR(PACKAGE.tax)} GST.
                <br />
                No hidden charges. Ever.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-10 flex max-w-xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-faint">
            <Info size={14} className="mt-px shrink-0" />
            {DISCLAIMER}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <div className="anim-fade">
      <section className="pb-4 pt-36 md:pt-44">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead
            eyebrow="Pricing"
            title="Honest pricing, built for growing businesses."
            sub="One featured package today — designed so any business can start advertising professionally for less than a team lunch."
          />
        </div>
      </section>

      <div className="[&>section]:pt-10">
        <PricingSection hideHead />
      </div>

      {/* what the price covers */}
      <section className="bg-mist py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead
            align="left"
            eyebrow="Transparency"
            title="What your ₹399 actually covers."
            sub="Every rupee is accounted for before you pay. This breakdown is also printed on your receipt."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {[
              {
                amount: fmtINR(PACKAGE.mediaSpend),
                label: "Advertising media spend",
                body: "Your budget spent directly on Instagram, Facebook, YouTube or Google to put your ad in front of real customers.",
              },
              {
                amount: fmtINR(PACKAGE.fee),
                label: "Campaign management fee",
                body: "Audience research, campaign setup, ad review, scheduling, monitoring and optimisation by our team.",
              },
              {
                amount: fmtINR(PACKAGE.tax),
                label: "Taxes (GST)",
                body: "Government taxes, included in the price you see. The amount on this page is the amount you pay — nothing more at checkout.",
              },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 100}>
                <div className="group h-full rounded-3xl border border-line bg-white p-8 transition-all duration-300 hover:shadow-soft">
                  <p className="text-4xl font-semibold tracking-tight tnum">{c.amount}</p>
                  <p className="mt-3 text-sm font-medium text-ink">{c.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-sub">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={150}>
            <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-3xl bg-ink px-8 py-7 text-white sm:flex-row">
              <p className="text-sm text-white/70">
                Total payable — <span className="text-white font-medium">no hidden charges, no upsells at checkout.</span>
              </p>
              <p className="text-3xl font-semibold tracking-tight tnum">{fmtINR(PACKAGE.price)}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* future packages */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead
            eyebrow="Coming Soon"
            title="More ways to grow, on the way."
            sub="Our pricing architecture is built to grow with you. These packages are in development — tell us what you need and we'll let you know when they're available."
          />
          <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
            {[
              { name: "Growth Reach", price: "In development", note: "Larger media budget · priority launch · advanced targeting" },
              { name: "Scale Reach", price: "Custom", note: "Dedicated strategist · multi-campaign planning · monthly reporting calls" },
            ].map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <div className="flex h-full flex-col rounded-3xl border border-dashed border-ink/20 bg-white p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sub">{p.name}</span>
                    <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-medium text-sub">In Development</span>
                  </div>
                  <p className={`mt-6 font-semibold tracking-tight ${p.price.length > 8 ? "text-2xl text-sub" : "text-4xl"}`}>{p.price}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-sub">{p.note}</p>
                  <button onClick={() => navigate("/support")} className={btnCls("secondary", "md", "mt-7 w-full")}>
                    <MessageCircle size={15} /> Talk to Us
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-mist py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <SectionHead eyebrow="FAQ" title="Questions, answered honestly." />
          <Reveal delay={120} className="mt-12">
            <Accordion items={FAQS} />
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-10 text-center text-sm text-sub">
              Still have a question?{" "}
              <button onClick={() => navigate("/support")} className="font-medium text-ink u-link cursor-pointer">
                Talk to our team
              </button>
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
