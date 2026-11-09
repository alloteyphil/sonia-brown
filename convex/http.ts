import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getPaymentProvider } from "./payments/paystack";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

/**
 * Paystack webhook. Configure in Paystack → Settings → API Keys & Webhooks:
 *   https://<your-deployment>.convex.site/paystack/webhook
 * The signature is verified against the raw body before anything is trusted.
 */
http.route({
  path: "/paystack/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const raw = await request.text();
    if (raw.length > 100_000) return new Response("Payload too large", { status: 413 });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    try {
      await ctx.runMutation(internal.webhooks.throttle, { key: `webhook:${ip}` });
    } catch {
      return new Response("Too many requests", { status: 429 });
    }

    let event;
    try {
      event = await getPaymentProvider().parseWebhook(raw, request.headers);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    if (!event) return new Response("Invalid signature", { status: 401 });

    if (event.type === "charge.success" && event.charge.status === "success") {
      await ctx.runMutation(internal.bookings.applyVerifiedCharge, {
        providerRef: event.charge.reference,
        amount: event.charge.amount,
        currency: event.charge.currency,
        channel: event.charge.channel,
        paidAt: event.charge.paidAt,
        eventKey: event.eventKey,
      });
    }
    return new Response("ok", { status: 200 });
  }),
});

export default http;
