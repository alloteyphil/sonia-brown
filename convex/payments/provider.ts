/**
 * Payment provider abstraction. Paystack is the v1 implementation; Stripe or
 * Flutterwave can be added by implementing this interface and switching
 * `getPaymentProvider()`.
 */
export type InitializeArgs = {
  email: string;
  amount: number; // minor units (pesewas)
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string | number>;
};

export type VerifiedCharge = {
  reference: string;
  status: "success" | "failed" | "abandoned" | "pending";
  amount: number; // minor units
  currency: string;
  channel: string; // "card" | "mobile_money" | ...
  paidAt: number | null;
};

export type WebhookEvent =
  | { type: "charge.success"; eventKey: string; charge: VerifiedCharge }
  | { type: "ignored"; eventKey: string };

export interface PaymentProvider {
  name: "paystack";
  initialize(args: InitializeArgs): Promise<{ redirectUrl: string; reference: string }>;
  verify(reference: string): Promise<VerifiedCharge>;
  /** Returns the parsed event only if the signature is valid, otherwise null. */
  parseWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent | null>;
  refund?(reference: string, amount: number): Promise<void>;
}
