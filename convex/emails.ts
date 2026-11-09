import { v } from "convex/values";
import { addDays, format } from "date-fns";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { getSettings } from "./lib/settings";
import { renderEmail, type EmailData, type EmailTemplate } from "./emailTemplates";
import { todayInAccra } from "../src/lib/domain/time";
import { parse } from "date-fns";

const templateValidator = v.union(
  v.literal("request_received"),
  v.literal("payment_received"),
  v.literal("status_confirmed"),
  v.literal("status_declined"),
  v.literal("status_cancelled"),
  v.literal("status_completed"),
  v.literal("rescheduled"),
  v.literal("reminder"),
  v.literal("owner_new_booking"),
);

function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export const emailData = internalQuery({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }): Promise<(EmailData & { ownerEmail?: string }) | null> => {
    const b = await ctx.db.get(bookingId);
    if (!b) return null;
    const c = await ctx.db.get(b.customerId);
    if (!c) return null;
    const s = await getSettings(ctx);
    const base = siteUrl();
    return {
      reference: b.reference,
      serviceName: b.serviceName,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      guests: b.guests,
      address: b.address,
      dietaryNotes: b.dietaryNotes,
      total: b.total,
      amountPaid: b.amountPaid - b.amountRefunded,
      balance: Math.max(0, b.total - b.amountPaid + b.amountRefunded),
      status: b.status,
      customerName: c.name,
      customerEmail: c.email,
      customerPhone: c.phone,
      confirmationUrl: `${base}/book/confirmation/${b.reference}?t=${b.accessToken}`,
      icsUrl: `${base}/api/ics/${b.reference}?t=${b.accessToken}`,
      dashboardUrl: `${base}/dashboard/bookings/${b._id}`,
      whatsapp: s.whatsapp,
      cancellationPolicy: s.cancellationPolicy,
      cancellationReason: b.cancellationReason,
      ownerEmail: s.notifyOwnerEmail ?? (process.env.OWNER_EMAILS ?? "").split(",")[0]?.trim(),
    };
  },
});

export const send = internalAction({
  args: { template: templateValidator, bookingId: v.id("bookings") },
  handler: async (ctx, { template, bookingId }) => {
    const data = await ctx.runQuery(internal.emails.emailData, { bookingId });
    if (!data) return;
    const email = renderEmail(template as EmailTemplate, data);
    const to = email.to === "owner" ? data.ownerEmail : data.customerEmail;
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? "Sonia Brown <bookings@soniabrown.com>";
    if (!apiKey || !to) {
      console.log(`[email skipped: ${!apiKey ? "no RESEND_API_KEY" : "no recipient"}] ${email.subject} → ${to}`);
      return;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: email.subject, html: email.html, reply_to: data.ownerEmail }),
    });
    if (!res.ok) console.error(`Resend error ${res.status}: ${await res.text()}`);
  },
});

export const bookingsForReminder = internalQuery({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const s = await getSettings(ctx);
    if (!s.sendClientReminders) return [];
    const rows = await ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
    return rows.filter((b) => b.status === "confirmed").map((b) => b._id);
  },
});

export const sendReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const target = format(addDays(parse(todayInAccra(), "yyyy-MM-dd", new Date()), 2), "yyyy-MM-dd");
    const ids = await ctx.runQuery(internal.emails.bookingsForReminder, { date: target });
    for (const bookingId of ids) {
      await ctx.runAction(internal.emails.send, { template: "reminder", bookingId });
    }
  },
});
