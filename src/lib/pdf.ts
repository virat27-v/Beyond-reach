import { jsPDF } from "jspdf";
import { Campaign, Order, PLATFORMS, campaignTotals, fmtDate, fmtINR, fmtNum } from "./data";

function header(doc: jsPDF, title: string, subtitle: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, w, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("B E Y O N D   R E A C H", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text("Your Business. Beyond Reach.", 14, 20);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(title, w - 14, 14, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text(subtitle, w - 14, 20, { align: "right" });
  doc.setTextColor(17, 17, 17);
}

function footer(doc: jsPDF, demo?: boolean) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(234, 234, 234);
  doc.line(14, h - 16, w - 14, h - 16);
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text("Beyond Reach · Digital Advertising · support@beyondreach.agency", 14, h - 10);
  doc.text(demo ? "Demonstration report — sample data for preview purposes." : "Generated from your Beyond Reach dashboard.", w - 14, h - 10, {
    align: "right",
  });
  doc.setTextColor(17, 17, 17);
}

function kv(doc: jsPDF, x: number, y: number, label: string, value: string) {
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(label.toUpperCase(), x, y);
  doc.setFontSize(10);
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.text(value, x, y + 5.5);
  doc.setFont("helvetica", "normal");
}

export function downloadCampaignReport(campaign: Campaign, userName: string) {
  const doc = new jsPDF();
  const period =
    campaign.startDate && campaign.endDate
      ? `${fmtDate(campaign.startDate)} — ${fmtDate(campaign.endDate)}`
      : `Purchased ${fmtDate(campaign.purchaseDate)}`;
  header(doc, "Campaign Performance Report", period);

  let y = 48;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(campaign.name, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`${campaign.businessName} · Prepared for ${userName}`, 14, y + 6);
  doc.setTextColor(17, 17, 17);

  y += 18;
  kv(doc, 14, y, "Campaign ID", campaign.id);
  kv(doc, 62, y, "Status", campaign.status);
  kv(doc, 110, y, "Package", campaign.packageName);
  kv(doc, 158, y, "Amount", fmtINR(campaign.amount));

  y += 16;
  kv(doc, 14, y, "Start date", fmtDate(campaign.startDate));
  kv(doc, 62, y, "End date", fmtDate(campaign.endDate));
  kv(doc, 110, y, "Target location", campaign.location);
  kv(doc, 158, y, "Language", campaign.language);

  const totals = campaignTotals(campaign);
  y += 24;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Overall performance", 14, y);
  y += 8;
  const summary: [string, string][] = [
    ["Total views", fmtNum(totals.views)],
    ["Total reach", fmtNum(totals.reach)],
    ["Total impressions", fmtNum(totals.impressions)],
    ["Total clicks", fmtNum(totals.clicks)],
  ];
  summary.forEach(([label, value], i) => {
    const x = 14 + i * 46;
    doc.setFillColor(247, 247, 247);
    doc.roundedRect(x, y, 42, 18, 2, 2, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(value, x + 4, y + 8);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(label.toUpperCase(), x + 4, y + 14);
    doc.setTextColor(17, 17, 17);
  });

  y += 32;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Platform-wise performance", 14, y);
  y += 6;

  // table header
  doc.setFillColor(17, 17, 17);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  const cols = [16, 62, 92, 122, 152, 176];
  ["Platform", "Views", "Reach", "Impressions", "Clicks", "Extra"].forEach((h, i) => doc.text(h, cols[i], y + 5.5));
  doc.setTextColor(17, 17, 17);
  y += 8;

  campaign.platforms.forEach((p, idx) => {
    const s = campaign.stats[p];
    y += 8;
    if (idx % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(14, y - 5.5, 182, 8, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(PLATFORMS[p].name, cols[0], y);
    doc.setFont("helvetica", "normal");
    const extra =
      p === "youtube" && s?.watchTimeHours !== undefined
        ? `${s.watchTimeHours}h watch`
        : p === "google" && s?.conversions !== undefined
          ? `${s.conversions} conv.`
          : "—";
    doc.text(s ? fmtNum(s.views) : "—", cols[1], y);
    doc.text(s ? fmtNum(s.reach) : "—", cols[2], y);
    doc.text(s ? fmtNum(s.impressions) : "—", cols[3], y);
    doc.text(s ? fmtNum(s.clicks) : "—", cols[4], y);
    doc.text(extra, cols[5], y);
    doc.setDrawColor(238, 238, 238);
    doc.line(14, y + 2.5, 196, y + 2.5);
  });

  y += 16;
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  const note =
    "Views are an estimated target and are not guaranteed. Actual performance depends on advertising platform, audience, creative and campaign conditions. Statistics shown here are the latest verified figures synced to your dashboard.";
  doc.text(doc.splitTextToSize(note, 182), 14, y);

  footer(doc, campaign.demo);
  doc.save(`BeyondReach-Report-${campaign.id}.pdf`);
}

export function downloadReceipt(order: Order, campaign: Campaign | undefined, userName: string, email: string) {
  const doc = new jsPDF();
  header(doc, "Payment Receipt", order.id);
  let y = 50;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Payment receipt", 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`Billed to ${userName} (${email})`, 14, y + 6);
  doc.setTextColor(17, 17, 17);

  y += 20;
  kv(doc, 14, y, "Order ID", order.id);
  kv(doc, 72, y, "Date", fmtDate(order.date));
  kv(doc, 130, y, "Payment status", order.paymentStatus);
  y += 16;
  kv(doc, 14, y, "Package", order.packageName);
  kv(doc, 72, y, "Campaign", order.campaignName);
  kv(doc, 130, y, "Method", order.method || "—");

  y += 22;
  doc.setFillColor(247, 247, 247);
  doc.roundedRect(14, y, 182, 30, 2, 2, "F");
  doc.setFontSize(9);
  doc.text("Advertising media spend", 18, y + 9);
  doc.text(fmtINR(300), 192, y + 9, { align: "right" });
  doc.text("Campaign management fee", 18, y + 16);
  doc.text(fmtINR(70), 192, y + 16, { align: "right" });
  doc.text("Taxes (GST)", 18, y + 23);
  doc.text(fmtINR(29), 192, y + 23, { align: "right" });

  y += 42;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total paid", 14, y);
  doc.text(fmtINR(order.amount), 196, y, { align: "right" });
  doc.setFont("helvetica", "normal");

  if (campaign) {
    y += 12;
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`Campaign ID ${campaign.id} · Status: ${campaign.status}`, 14, y);
  }
  footer(doc, campaign?.demo);
  doc.save(`BeyondReach-Receipt-${order.id}.pdf`);
}
