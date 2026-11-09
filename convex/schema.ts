import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const bookingStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("completed"),
  v.literal("cancelled"),
  v.literal("declined"),
);

export const paymentStatus = v.union(
  v.literal("unpaid"),
  v.literal("deposit_paid"),
  v.literal("paid"),
  v.literal("refunded"),
  v.literal("partially_refunded"),
);

export const paymentMethod = v.union(
  v.literal("card"),
  v.literal("mobile_money"),
  v.literal("cash"),
  v.literal("bank_transfer"),
  v.literal("other"),
);

export const lineItem = v.object({
  label: v.string(),
  quantity: v.number(),
  unitAmount: v.number(),
  amount: v.number(),
});

export default defineSchema({
  services: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    basePrice: v.number(), // pesewas
    pricePerGuest: v.number(), // pesewas
    minGuests: v.number(),
    maxGuests: v.number(),
    durationMinutes: v.number(),
    sortOrder: v.number(),
    archived: v.boolean(),
    // Phase 2 hook: packages/menus attach here without a rewrite.
    imageUrl: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_archived_order", ["archived", "sortOrder"]),

  customers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  bookings: defineTable({
    reference: v.string(),
    accessToken: v.string(), // unguessable token for the guest confirmation link
    serviceId: v.id("services"),
    serviceName: v.string(), // snapshot at booking time
    customerId: v.id("customers"),
    date: v.string(), // yyyy-MM-dd in Africa/Accra
    startTime: v.string(), // HH:mm
    endTime: v.string(), // HH:mm
    startAt: v.number(), // epoch ms
    guests: v.number(),
    address: v.string(),
    occasion: v.optional(v.string()),
    dietaryNotes: v.optional(v.string()),
    notes: v.optional(v.string()),
    internalNotes: v.optional(v.string()),
    status: bookingStatus,
    // Money (pesewas)
    lineItems: v.array(lineItem),
    total: v.number(),
    depositDue: v.number(),
    amountPaid: v.number(),
    amountRefunded: v.number(),
    paymentStatus: paymentStatus,
    paymentChoice: v.union(v.literal("deposit"), v.literal("full"), v.literal("later")),
    // Slot hold while the guest is on the Paystack checkout page.
    holdExpiresAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
    needsAttention: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_reference", ["reference"])
    .index("by_date", ["date"])
    .index("by_startAt", ["startAt"])
    .index("by_status_startAt", ["status", "startAt"])
    .index("by_customer", ["customerId"]),

  payments: defineTable({
    bookingId: v.id("bookings"),
    kind: v.union(v.literal("charge"), v.literal("refund")),
    amount: v.number(), // pesewas, always positive
    currency: v.string(),
    method: paymentMethod,
    provider: v.union(v.literal("paystack"), v.literal("manual")),
    providerRef: v.optional(v.string()),
    status: v.union(v.literal("initiated"), v.literal("succeeded"), v.literal("failed")),
    paidAt: v.optional(v.number()),
    note: v.optional(v.string()),
    recordedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_providerRef", ["providerRef"])
    .index("by_status_paidAt", ["status", "paidAt"]),

  // Processed webhook events, for idempotency.
  webhookEvents: defineTable({
    provider: v.string(),
    eventKey: v.string(),
    receivedAt: v.number(),
  }).index("by_key", ["provider", "eventKey"]),

  availabilityRules: defineTable({
    weekday: v.number(),
    enabled: v.boolean(),
    start: v.string(),
    end: v.string(),
  }).index("by_weekday", ["weekday"]),

  blockedDates: defineTable({
    date: v.string(),
    reason: v.optional(v.string()),
  }).index("by_date", ["date"]),

  settings: defineTable({
    businessName: v.string(),
    phone: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    instagram: v.optional(v.string()),
    serviceArea: v.string(),
    depositPercent: v.number(),
    cancellationPolicy: v.string(),
    leadTimeHours: v.number(),
    maxBookingsPerDay: v.number(),
    bufferMinutes: v.number(),
    slotIntervalMinutes: v.number(),
    maxAdvanceDays: v.number(),
    autoConfirmPaid: v.boolean(),
    notifyOwnerEmail: v.optional(v.string()),
    notifyOnNewBooking: v.boolean(),
    sendClientReminders: v.boolean(),
  }),

  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),
});
