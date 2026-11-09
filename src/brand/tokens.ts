/**
 * Sonia Brown — brand identity tokens.
 *
 * Sonia's favourite colour is blue, sky blue in particular, so the whole
 * identity is built around an open-sky palette: a deep "Night Sky" navy for
 * text, a "Harbour Blue" that carries enough contrast for buttons, and the
 * signature "Sky" blue used for highlights, illustration and accents.
 *
 * These values are mirrored as CSS variables in src/app/globals.css.
 * Change a colour in both places to re-skin the whole site and dashboard.
 */
export const brand = {
  name: "Sonia Brown",
  descriptor: "Private Chef & Catering",
  monogram: "SB",
  tagline: "Cooked for you, at your table.",
  voice:
    "Friendly, confident, first person from Sonia. Warm but never gushing.",
  colors: {
    nightSky: "#0B2239", // primary text, dark surfaces
    cloud: "#F5F9FD", // page background
    harbour: "#1C6DB5", // primary CTA (white text = 5.4:1, WCAG AA)
    harbourDeep: "#14548C", // CTA hover / pressed
    sky: "#7CC3EE", // signature sky blue: highlights, illustration
    skyMist: "#DDEFFB", // tinted cards, selected states
    horizon: "#E2EAF2", // borders, dividers
    sunlight: "#F2B544", // tiny warm accent (stars, "today" marker)
    meadow: "#2E7D5B", // success
    ember: "#B42318", // danger
  },
  fonts: {
    display: "Fraunces Variable",
    body: "DM Sans Variable",
  },
  contact: {
    // Placeholders: replace with Sonia's real details (or set in dashboard settings).
    phone: "+233 20 000 0000",
    whatsapp: "233200000000",
    email: "hello@soniabrown.com",
    instagram: "soniabrown.chef",
    city: "Accra, Ghana",
  },
} as const;

export const statusColors = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-900 ring-amber-300" },
  confirmed: { label: "Confirmed", className: "bg-sky-mist text-harbour-deep ring-sky" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-900 ring-emerald-300" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-700 ring-slate-300" },
  declined: { label: "Declined", className: "bg-rose-100 text-rose-900 ring-rose-300" },
} as const;

export const paymentStatusColors = {
  unpaid: { label: "Unpaid", className: "bg-slate-100 text-slate-700 ring-slate-300" },
  deposit_paid: { label: "Deposit paid", className: "bg-sky-mist text-harbour-deep ring-sky" },
  paid: { label: "Paid", className: "bg-emerald-100 text-emerald-900 ring-emerald-300" },
  refunded: { label: "Refunded", className: "bg-rose-100 text-rose-900 ring-rose-300" },
  partially_refunded: { label: "Part refunded", className: "bg-amber-100 text-amber-900 ring-amber-300" },
} as const;
