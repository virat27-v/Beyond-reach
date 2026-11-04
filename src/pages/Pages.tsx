import React, { useState } from "react";
import { ArrowRight, Clock3, Mail, MessageCircle } from "lucide-react";
import { navigate } from "../lib/router";
import { useStore } from "../lib/store";
import { SUPPORT_EMAIL, SUPPORT_PHONE, WHATSAPP_LINK, WHATSAPP_NUMBER } from "../lib/data";
import { Accordion, Eyebrow, Field, Input, Reveal, SectionHead, Select, Textarea, btnCls } from "../components/ui";
import { FAQS } from "./Pricing";

const OFFICE_IMG =
  "https://images.pexels.com/photos/7652541/pexels-photo-7652541.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

/* -------------------------------- About ------------------------------ */

export function AboutPage() {
  return (
    <div className="anim-fade">
      <section className="pt-36 md:pt-44">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-3xl">
            <Reveal>
              <Eyebrow>About Beyond Reach</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-7 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-balance md:text-7xl">
                Helping businesses <span className="font-light italic text-ink/70">get seen.</span>
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-sub">
                Beyond Reach is a digital advertising service built on a simple belief: professional advertising shouldn't
                require a big budget, an agency retainer, or a degree in Ads Manager. We make online promotion accessible,
                transparent and measurable for every business.
              </p>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div className="relative mt-14 overflow-hidden rounded-[28px]">
              <img src={OFFICE_IMG} alt="People planning a marketing campaign" className="h-[320px] w-full object-cover md:h-[480px]" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-6 text-sm font-medium text-white/90">Campaigns planned, launched and measured — with nothing to hide.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* mission / approach / services */}
      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {[
              {
                num: "01",
                title: "Our Mission",
                body: "To give every business — from a single neighbourhood store to a growing national brand — the same quality of advertising that was once reserved for companies with in-house marketing teams.",
              },
              {
                num: "02",
                title: "Our Approach",
                body: "Start simple, measure everything. One transparent package, honest estimates instead of guaranteed numbers, and platform-wise reporting that shows exactly what your money did.",
              },
              {
                num: "03",
                title: "Our Services",
                body: "Managed advertising campaigns across Instagram, Facebook, YouTube and Google — including audience targeting, creative guidance, launch management and ongoing optimisation.",
              },
            ].map((c, i) => (
              <Reveal key={c.num} delay={i * 100}>
                <div className="border-t-2 border-ink pt-7">
                  <span className="text-sm font-medium text-faint tnum">{c.num}</span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-sub">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* values */}
      <section className="bg-mist py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <SectionHead
                align="left"
                eyebrow="What We Stand For"
                title={
                  <>
                    Advertising with
                    <br />
                    <span className="font-light italic text-sub">nothing to hide.</span>
                  </>
                }
                sub="The advertising industry runs on jargon and inflated reports. We started Beyond Reach to run on the opposite."
              />
              <div className="mt-12 grid grid-cols-3 gap-8">
                {[
                  { v: "₹399", l: "One clear price" },
                  { v: "4", l: "Ad platforms" },
                  { v: "24–48h", l: "Typical review time" },
                ].map((st) => (
                  <div key={st.l}>
                    <p className="text-3xl font-semibold tracking-tight tnum md:text-4xl">{st.v}</p>
                    <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{st.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col divide-y divide-line rounded-3xl border border-line bg-white px-7">
              {[
                ["No guaranteed-view promises", "Estimates are labelled as estimates. Your dashboard only shows verified platform data."],
                ["Every rupee, itemised", "Media spend, management fee and taxes — broken down before you pay, printed on your receipt."],
                ["Your data stays yours", "Your business details and campaign data are never sold and never shared beyond what's needed to run your ads."],
                ["Humans who answer", "Support from people who can see your campaign and answer in plain language."],
              ].map(([t, b]) => (
                <div key={t} className="py-6">
                  <h3 className="text-base font-semibold tracking-tight">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-sub">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-balance md:text-5xl">
              Let's take your business <span className="font-light italic text-ink/70">beyond reach.</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => navigate("/book")} className={btnCls("primary", "lg")}>
                Start Advertising — ₹399 <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate("/support")} className={btnCls("secondary", "lg")}>
                Talk to Our Team
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------- Support ------------------------------ */

export function SupportPage() {
  const { user, toast } = useStore();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", subject: "Campaign question", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const compose = () => `${form.subject}: ${form.message.trim()}\n\n— ${form.name} (${form.email})`;

  const valid = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Please enter a valid email.";
    if (form.message.trim().length < 10) errs.message = "Please describe how we can help (min. 10 characters).";
    setErrors(errs);
    setFormError("");
    return Object.keys(errs).length === 0;
  };

  const sendWhatsApp = () => {
    if (!valid()) return;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(compose())}`, "_blank", "noopener");
    toast("Request prepared", "WhatsApp is opening with your message — send it to reach us.");
  };

  const sendEmail = () => {
    if (!valid()) return;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(compose())}`;
    toast("Request prepared", "Your email app is opening — hit send to reach us.");
  };

  return (
    <div className="anim-fade">
      <section className="pt-36 md:pt-44">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHead
            eyebrow="Support"
            title="Real humans. Real answers."
            sub="Questions about a campaign, a payment or getting started — reach us on whichever channel suits you."
          />

          <div className="mx-auto mt-16 grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              {
                icon: <MessageCircle size={20} />,
                title: "WhatsApp Support",
                body: "Fastest response — usually within the hour during business hours.",
                meta: SUPPORT_PHONE,
                action: (
                  <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className={btnCls("primary", "md", "w-full")}>
                    Chat on WhatsApp
                  </a>
                ),
              },
              {
                icon: <Mail size={20} />,
                title: "Email Support",
                body: "Best for detailed questions, creative files and report requests.",
                meta: SUPPORT_EMAIL,
                action: (
                  <a href={`mailto:${SUPPORT_EMAIL}`} className={btnCls("secondary", "md", "w-full")}>
                    Send an Email
                  </a>
                ),
              },
              {
                icon: <Clock3 size={20} />,
                title: "Working Hours",
                body: "Monday to Saturday. Campaign reviews run on business days.",
                meta: "10:00 AM – 7:00 PM IST",
                action: (
                  <button onClick={() => navigate("/book")} className={btnCls("secondary", "md", "w-full")}>
                    Book a Campaign
                  </button>
                ),
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 90} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-7 transition-shadow duration-300 hover:shadow-soft">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-ink">{c.icon}</div>
                  <h3 className="mt-5 text-base font-semibold tracking-tight">{c.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-sub">{c.body}</p>
                  <p className="mt-4 text-sm font-medium text-ink">{c.meta}</p>
                  <div className="mt-5">{c.action}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* contact form */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <SectionHead eyebrow="Contact Form" title="Send us a message." />
          <Reveal delay={120}>
            <div className="mt-12 rounded-[24px] border border-line bg-white p-7 shadow-soft md:p-10">
              <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your Name" error={errors.name}>
                    <Input value={form.name} onChange={set("name")} placeholder="Full name" error={!!errors.name} />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <Input type="email" value={form.email} onChange={set("email")} placeholder="you@business.com" error={!!errors.email} />
                  </Field>
                </div>
                <Field label="Subject">
                  <Select value={form.subject} onChange={set("subject")}>
                    {["Campaign question", "Payment & billing", "Report issue", "Creative help", "Account help", "Something else"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Message" error={errors.message}>
                  <Textarea rows={5} value={form.message} onChange={set("message")} placeholder="How can we help?" error={!!errors.message} maxLength={4000} />
                </Field>
                {formError && <p className="text-[13px] text-red-600 anim-fade">{formError}</p>}
                <div className="flex flex-wrap gap-2">
                  <button onClick={sendWhatsApp} className={btnCls("primary", "lg")}>
                    <MessageCircle size={16} /> Send on WhatsApp
                  </button>
                  <button onClick={sendEmail} className={btnCls("secondary", "lg")}>
                    <Mail size={16} /> Send by Email
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-faint">
                  The buttons open WhatsApp or your email app with your message pre-filled — nothing is sent until you press send there.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-mist py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <SectionHead eyebrow="FAQs" title="Before you ask." />
          <Reveal delay={120} className="mt-12">
            <Accordion items={FAQS} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------- Legal ------------------------------- */

function LegalLayout({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: { h: string; body: string[] }[];
}) {
  return (
    <div className="anim-fade">
      <section className="pt-36 pb-24 md:pt-44">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <Reveal>
            <Eyebrow>Legal</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{title}</h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-4 text-sm text-faint">Last updated · {updated}</p>
            <p className="mt-6 text-base leading-relaxed text-sub">{intro}</p>
          </Reveal>
          <div className="mt-12 flex flex-col">
            {sections.map((s, i) => (
              <Reveal key={s.h} delay={Math.min(i * 60, 200)}>
                <div className="border-t border-line py-8">
                  <h2 className="text-lg font-semibold tracking-tight">
                    <span className="mr-3 text-faint tnum">{String(i + 1).padStart(2, "0")}</span>
                    {s.h}
                  </h2>
                  <div className="mt-3 flex flex-col gap-3 pl-0 sm:pl-9">
                    {s.body.map((p, j) => (
                      <p key={j} className="text-[15px] leading-relaxed text-sub">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-4 rounded-2xl bg-mist p-6 text-sm leading-relaxed text-sub">
              Questions about this policy? Contact us at{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-ink underline underline-offset-2">
                {SUPPORT_EMAIL}
              </a>{" "}
              or visit our{" "}
              <button onClick={() => navigate("/support")} className="font-medium text-ink underline underline-offset-2 cursor-pointer">
                Support page
              </button>
              .
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="1 January 2026"
      intro="Beyond Reach respects your privacy. This policy explains what information we collect when you use our advertising services, how we use it, and the choices you have."
      sections={[
        {
          h: "Information we collect",
          body: [
            "Account information: your name, email address, phone number and business details when you register or book a campaign.",
            "Campaign information: the advertisements, creatives, targeting preferences and landing pages you submit so we can run your campaigns.",
            "Payment information: this website does not take online payments today. When online payments are introduced, they will be processed by a PCI-DSS compliant payment partner, and we will never store your full card or UPI credentials on our servers.",
            "Usage information: how you interact with your dashboard, so we can improve the product and keep your account secure.",
          ],
        },
        {
          h: "How we use your information",
          body: [
            "To create, manage and optimise your advertising campaigns across Instagram, Facebook, YouTube and Google.",
            "To provide your dashboard, performance reports, notifications, receipts and customer support.",
            "To communicate important updates about your campaigns, payments and account security.",
          ],
        },
        {
          h: "Sharing with advertising platforms",
          body: [
            "To run your campaigns, your ad creative and targeting preferences are shared with the advertising platforms you select (Meta, Google). Their handling of data is governed by their own privacy policies.",
            "We do not sell your personal information, and we do not share it with third parties for their own marketing.",
          ],
        },
        {
          h: "Data security & retention",
          body: [
            "We use industry-standard encryption in transit and access controls to protect your data. Campaign and billing records are retained as required for accounting and legal purposes, after which they are deleted or anonymised.",
          ],
        },
        {
          h: "Your rights",
          body: [
            "You may access, correct or delete your personal information at any time from your Account page, or by contacting us. You can opt out of non-essential notifications in your account preferences.",
          ],
        },
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      updated="1 January 2026"
      intro="These terms govern your use of Beyond Reach's digital advertising services. By booking a campaign, you agree to these terms."
      sections={[
        {
          h: "The service",
          body: [
            "Beyond Reach plans, launches and manages digital advertising campaigns on third-party platforms including Instagram, Facebook, YouTube and Google, and provides performance reporting through your customer dashboard.",
            "Campaigns are run on managed advertising accounts. Platform availability depends on your creative format, business category and each platform's advertising policies.",
          ],
        },
        {
          h: "Pricing & payments",
          body: [
            "The Starter Reach package is priced at ₹399 per campaign, comprising ₹300 of advertising media spend, a ₹70 campaign management fee and ₹29 GST. The price shown at checkout is final — there are no additional charges.",
            "Payment is collected securely through our payment partner. A campaign enters review only after successful payment.",
          ],
        },
        {
          h: "Performance estimates",
          body: [
            "View figures such as “7,000–10,000 estimated views” are targets based on historical campaign data. They are not a guarantee of results. Actual performance depends on the platform, audience, creative quality and market conditions. Beyond Reach is not liable for variance from estimates.",
          ],
        },
        {
          h: "Your responsibilities",
          body: [
            "You are responsible for the accuracy and legality of your advertisements, including claims, imagery and landing pages. Ads must comply with applicable law and platform policies. We may reject or pause creatives that violate policy, and will notify you with the reason.",
          ],
        },
        {
          h: "Reports & data",
          body: [
            "Performance statistics are sourced from advertising platforms and updated periodically. Minor delays or discrepancies between platform dashboards and your Beyond Reach reports may occur while data syncs.",
          ],
        },
        {
          h: "Limitation of liability",
          body: [
            "To the maximum extent permitted by law, Beyond Reach's liability for any claim arising from a campaign is limited to the amount paid for that campaign. We are not responsible for indirect or consequential losses.",
          ],
        },
      ]}
    />
  );
}

export function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      updated="1 January 2026"
      intro="We want booking advertising to feel risk-free. This policy explains exactly when refunds apply and how they are processed."
      sections={[
        {
          h: "Full refund — campaign not launched",
          body: [
            "If we are unable to launch your campaign for any reason on our side — for example, platform rejection we cannot resolve, or a service issue — you receive a 100% refund of the amount paid.",
            "If you cancel before your campaign goes live, you also receive a full refund.",
          ],
        },
        {
          h: "Partial refund — campaign stopped early",
          body: [
            "If a live campaign is stopped early by Beyond Reach, the unspent portion of your media spend is refunded. The management fee for work already performed, spent media budget and GST on those amounts are non-refundable.",
          ],
        },
        {
          h: "Non-refundable situations",
          body: [
            "Media budget already spent on delivered advertising cannot be refunded, because it has been consumed by the advertising platforms.",
            "Campaigns paused or rejected due to policy-violating creatives supplied by the customer are not eligible for a refund of spent amounts.",
            "Dissatisfaction with performance relative to estimated view ranges is not grounds for a refund, as estimates are not guaranteed results.",
          ],
        },
        {
          h: "How refunds are processed",
          body: [
            "Approved refunds are processed to your original payment method within 5–7 business days. You will receive a confirmation by email and in your dashboard notifications as soon as a refund is initiated.",
            "Failed payments are never charged. If an amount was debited during a failed transaction, your bank reverses it automatically, typically within 5–7 business days.",
          ],
        },
        {
          h: "Requesting a refund",
          body: [
            "Contact us via WhatsApp or email with your Campaign ID, and our team will review and respond within one business day.",
          ],
        },
      ]}
    />
  );
}
