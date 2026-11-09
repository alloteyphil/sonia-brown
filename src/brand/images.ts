/**
 * Site photography: free stock photos (credited in assets/photos/CREDITS.md)
 * until Sonia's own are shot. Source files live in assets/photos/ and are graded and
 * cropped into /public/images by `npm run photos` (scripts/grade-photos.mjs),
 * so every image shares one consistent look.
 *
 * To swap in a real photo: drop it in assets/photos/, point an entry in the
 * script at it, run `npm run photos`, and update the path here if it changed.
 * Warm, natural light, close-up food and hands cooking work best.
 * Recommended source sizes: hero 1800x1200 (landscape), portraits 1600x2000,
 * others 1600x1200.
 */
export const images = {
  hero: { src: "/images/hero-jollof-table.jpg", alt: "A dish of jollof rice topped with chicken and pepper skewers, with a whole grilled fish behind it" },
  /**
   * Sonia's portrait. Leave as null until there is a real photo: the About
   * sections show `table` instead. To add one, grade it to 4:5 and set e.g.
   * { src: "/images/sonia.jpg", alt: "Sonia Brown in her kitchen" }.
   */
  sonia: null as { src: string; alt: string } | null,
  table: { src: "/images/about-candlelit.jpg", alt: "Guests reaching across a candlelit dinner table" },
  services: {
    "private-dinner": { src: "/images/service-dinner-table.jpg", alt: "A candlelit dinner table set with sharing plates" },
    "weekly-meal-prep": { src: "/images/service-meal-prep-boxes.jpg", alt: "Stacked meal prep containers of rice, vegetables and chicken" },
    "event-catering": { src: "/images/service-catering.jpg", alt: "Guests serving themselves from a buffet of chafing dishes" },
  } as Record<string, { src: string; alt: string }>,
  // Laid out in 3 columns, top to bottom: keep each run of three as one tall + two squares
  // so the columns end level, and keep similar shots apart.
  gallery: [
    { src: "/images/gal-candlelit-dinner.jpg", alt: "A candlelit dinner table with glasses of wine", tall: false },
    { src: "/images/gal-fried-chicken-tray.jpg", alt: "A tray of fried chicken with bread rolls and fries", tall: true },
    { src: "/images/gal-red-velvet.jpg", alt: "Red velvet cake topped with redcurrants", tall: false },
    { src: "/images/gal-mac-skillet.jpg", alt: "Mac and cheese with crispy bacon in a skillet", tall: false },
    { src: "/images/gal-plantain.jpg", alt: "Golden fried ripe plantain", tall: false },
    { src: "/images/gal-ribs.jpg", alt: "Glazed barbecue ribs", tall: true },
    { src: "/images/gal-chicken-waffles.jpg", alt: "Fried chicken and waffles with red cabbage slaw", tall: false },
    { src: "/images/gal-buffet-serving.jpg", alt: "Serving from a catering buffet", tall: true },
    { src: "/images/gal-puff-puff.jpg", alt: "Puff puff with a creamy dipping sauce", tall: false },
  ],
};

export function serviceImage(slug: string) {
  return images.services[slug] ?? images.services["private-dinner"];
}
