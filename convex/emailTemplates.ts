/** Branded, inline-styled HTML emails (works in Gmail/Outlook). */
import { formatMoney } from "../src/lib/domain/money";
import { formatDateLong, formatTime12 } from "../src/lib/domain/time";

export type EmailTemplate =
  | "request_received"
  | "payment_received"
  | "status_confirmed"
  | "status_declined"
  | "status_cancelled"
  | "status_completed"
  | "rescheduled"
  | "reminder"
  | "owner_new_booking";

export type EmailData = {
  reference: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  address: string;
  dietaryNotes?: string;
  total: number;
  amountPaid: number;
  balance: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  confirmationUrl: string;
  icsUrl: string;
  dashboardUrl: string;
  whatsapp: string;
  cancellationPolicy: string;
  cancellationReason?: string;
};

const C = {
  ink: "#0B2239",
  cloud: "#F5F9FD",
  harbour: "#1C6DB5",
  sky: "#7CC3EE",
  mist: "#DDEFFB",
  horizon: "#E2EAF2",
  muted: "#4A5D72",
};

function button(href: string, label: string, color = C.harbour) {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:999px;margin:4px 8px 4px 0">${label}</a>`;
}

function summary(d: EmailData) {
  const row = (k: string, val: string) =>
    `<tr><td style="padding:6px 0;color:${C.muted};width:120px">${k}</td><td style="padding:6px 0;color:${C.ink};font-weight:600">${val}</td></tr>`;
  return `<table style="width:100%;border-collapse:collapse;font-size:15px;margin:16px 0;background:${C.cloud};border:1px solid ${C.horizon};border-radius:14px;padding:12px 16px">
    ${row("Reference", d.reference)}
    ${row("Service", d.serviceName)}
    ${row("Date", formatDateLong(d.date))}
    ${row("Time", `${formatTime12(d.startTime)} – ${formatTime12(d.endTime)}`)}
    ${row("Guests", String(d.guests))}
    ${row("Address", d.address)}
    ${row("Total", formatMoney(d.total))}
    ${row("Paid", formatMoney(d.amountPaid))}
    ${row("Balance", formatMoney(d.balance))}
  </table>`;
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:${C.cloud};font-family:Helvetica,Arial,sans-serif;color:${C.ink}">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:${C.ink};border-radius:18px 18px 0 0;padding:22px 24px;border-bottom:4px solid ${C.sky}">
      <div style="font-family:Georgia,serif;font-size:24px;color:#fff">Sonia Brown</div>
      <div style="font-size:12px;letter-spacing:.08em;color:${C.sky};text-transform:uppercase">Private Chef &amp; Catering</div>
    </div>
    <div style="background:#fff;border:1px solid ${C.horizon};border-top:0;border-radius:0 0 18px 18px;padding:24px">
      <h1 style="font-family:Georgia,serif;font-weight:500;font-size:24px;margin:0 0 12px">${title}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:${C.muted};text-align:center;margin-top:16px">Sonia Brown · Private Chef &amp; Catering · Accra</p>
  </div></body></html>`;
}

export function renderEmail(t: EmailTemplate, d: EmailData): { subject: string; html: string; to: "client" | "owner" } {
  const first = d.customerName.split(" ")[0];
  const wa = button(`https://wa.me/${d.whatsapp}?text=${encodeURIComponent(`Hi Sonia, about booking ${d.reference}`)}`, "Chat on WhatsApp", "#1f8a5a");
  const links = `<p>${button(d.confirmationUrl, "View booking")}${button(d.icsUrl, "Add to calendar")}${wa}</p>`;

  switch (t) {
    case "request_received":
      return {
        to: "client",
        subject: `Booking request received · ${d.reference}`,
        html: layout(
          `Thanks, ${first}! I've got your request.`,
          `<p>I'll look over the details and confirm within 24 hours. You can pay in person or by mobile money once it's confirmed.</p>${summary(d)}${links}`,
        ),
      };
    case "payment_received":
      return {
        to: "client",
        subject:
          d.status === "confirmed"
            ? `You're booked! ${d.serviceName} on ${formatDateLong(d.date)}`
            : `Payment received · ${d.reference}`,
        html: layout(
          d.status === "confirmed" ? `You're booked, ${first}!` : `Payment received — thank you!`,
          `<p>I've received ${formatMoney(d.amountPaid)}. ${d.balance > 0 ? `The remaining ${formatMoney(d.balance)} is due on the day.` : "You're fully paid."} I'll handle the cooking, the cleanup and everything in between.</p>${summary(d)}${links}<p style="font-size:13px;color:${C.muted}">${d.cancellationPolicy}</p>`,
        ),
      };
    case "status_confirmed":
      return {
        to: "client",
        subject: `Confirmed: ${d.serviceName} on ${formatDateLong(d.date)}`,
        html: layout(`Your booking is confirmed, ${first}!`, `<p>I'm looking forward to cooking for you.</p>${summary(d)}${links}`),
      };
    case "status_declined":
      return {
        to: "client",
        subject: `About your booking request ${d.reference}`,
        html: layout(
          `I'm sorry, ${first}`,
          `<p>Unfortunately I can't take this booking${d.cancellationReason ? `: ${d.cancellationReason}` : "."} ${d.amountPaid > 0 ? "Any payment you've made will be refunded." : ""} I'd love to cook for you another time — message me on WhatsApp and we'll find a date.</p>${wa}`,
        ),
      };
    case "status_cancelled":
      return {
        to: "client",
        subject: `Booking cancelled · ${d.reference}`,
        html: layout(
          `Your booking has been cancelled`,
          `<p>${d.cancellationReason ?? "This booking has been cancelled."}</p>${summary(d)}<p style="font-size:13px;color:${C.muted}">${d.cancellationPolicy}</p>${wa}`,
        ),
      };
    case "status_completed":
      return {
        to: "client",
        subject: `Thank you, ${first}!`,
        html: layout(
          `Thank you for having me, ${first}`,
          `<p>It was a pleasure cooking for you. If you enjoyed it, I'd be so grateful if you'd tell a friend or tag me on Instagram.</p>${wa}`,
        ),
      };
    case "rescheduled":
      return {
        to: "client",
        subject: `New date for your booking · ${d.reference}`,
        html: layout(`Your booking has a new date`, `<p>Here are the updated details:</p>${summary(d)}${links}`),
      };
    case "reminder":
      return {
        to: "client",
        subject: `See you soon! ${d.serviceName} on ${formatDateLong(d.date)}`,
        html: layout(
          `See you in two days, ${first}`,
          `<p>Just a reminder of your booking. Please make sure I'll have access to your kitchen and let me know about any changes to guest numbers or allergies.</p>${summary(d)}${links}`,
        ),
      };
    case "owner_new_booking":
      return {
        to: "owner",
        subject: `New booking: ${d.serviceName} · ${formatDateLong(d.date)} (${d.reference})`,
        html: layout(
          `New booking from ${d.customerName}`,
          `<p>${d.customerPhone} · ${d.customerEmail}</p>${d.dietaryNotes ? `<p><strong>Dietary:</strong> ${d.dietaryNotes}</p>` : ""}${summary(d)}<p>${button(d.dashboardUrl, "Open in dashboard")}</p>`,
        ),
      };
  }
}
