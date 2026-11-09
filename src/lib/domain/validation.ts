import { z } from "zod";

const ghanaOrIntlPhone = /^\+?[0-9\s-]{9,16}$/;

export const bookingDetailsSchema = z.object({
  guests: z.coerce.number().int().min(1, "At least 1 guest").max(500),
  address: z.string().trim().min(5, "Please enter the full address").max(300),
  occasion: z.string().trim().max(120).optional().or(z.literal("")),
  dietaryNotes: z.string().trim().max(1000).optional().or(z.literal("")),
  notes: z.string().trim().max(1500).optional().or(z.literal("")),
  name: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z
    .string()
    .trim()
    .regex(ghanaOrIntlPhone, "Enter a valid phone number, e.g. 024 123 4567"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const bookingRequestSchema = bookingDetailsSchema.extend({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
  paymentChoice: z.enum(["deposit", "full", "later"]),
});

export type BookingDetailsInput = z.infer<typeof bookingDetailsSchema>;
export type BookingRequest = z.infer<typeof bookingRequestSchema>;

/** Unambiguous alphabet (no 0/O, 1/I/L). */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function randomCode(length: number, rand: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(rand() * ALPHABET.length)];
  return out;
}

export function makeReference(rand?: () => number): string {
  return `SB-${randomCode(6, rand)}`;
}
