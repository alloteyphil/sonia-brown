import type { PaymentProvider, VerifiedCharge } from "./provider";

const API = "https://api.paystack.co";

function secret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Online payments aren't set up yet (missing PAYSTACK_SECRET_KEY).");
  return key;
}

async function hmacSha512Hex(key: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type PaystackTx = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  channel: string;
  paid_at?: string | null;
  id?: number;
};

function toCharge(tx: PaystackTx): VerifiedCharge {
  const status =
    tx.status === "success" || tx.status === "failed" || tx.status === "abandoned"
      ? tx.status
      : "pending";
  return {
    reference: tx.reference,
    status,
    amount: tx.amount,
    currency: tx.currency,
    channel: tx.channel,
    paidAt: tx.paid_at ? Date.parse(tx.paid_at) : null,
  };
}

export const paystack: PaymentProvider = {
  name: "paystack",

  async initialize(args) {
    const res = await fetch(`${API}/transaction/initialize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: args.email,
        amount: args.amount,
        currency: args.currency,
        reference: args.reference,
        callback_url: args.callbackUrl,
        channels: ["card", "mobile_money"],
        metadata: args.metadata,
      }),
    });
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; reference: string };
    };
    if (!res.ok || !json.status || !json.data) {
      throw new Error(`Paystack couldn't start the payment: ${json.message}`);
    }
    return { redirectUrl: json.data.authorization_url, reference: json.data.reference };
  },

  async verify(reference) {
    const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret()}` },
    });
    const json = (await res.json()) as { status: boolean; message: string; data?: PaystackTx };
    if (!res.ok || !json.status || !json.data) {
      throw new Error(`Paystack verify failed: ${json.message}`);
    }
    return toCharge(json.data);
  },

  async parseWebhook(rawBody, headers) {
    const signature = headers.get("x-paystack-signature") ?? "";
    const expected = await hmacSha512Hex(secret(), rawBody);
    if (!signature || !timingSafeEqual(signature, expected)) return null;
    const event = JSON.parse(rawBody) as { event: string; data: PaystackTx };
    const eventKey = `${event.event}:${event.data?.id ?? event.data?.reference}`;
    if (event.event === "charge.success") {
      return { type: "charge.success", eventKey, charge: toCharge(event.data) };
    }
    return { type: "ignored", eventKey };
  },

  async refund(reference, amount) {
    const res = await fetch(`${API}/refund`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ transaction: reference, amount }),
    });
    const json = (await res.json()) as { status: boolean; message: string };
    if (!res.ok || !json.status) throw new Error(`Paystack refund failed: ${json.message}`);
  },
};

export function getPaymentProvider(): PaymentProvider {
  return paystack;
}
