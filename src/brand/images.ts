/**
 * Swap placeholders for real photos: drop a file in /public/images and change
 * the path here (e.g. "/images/hero.jpg"). Warm, natural light, close-up food
 * and hands cooking work best. Recommended sizes: hero 1600x1100, others 1200x900.
 */
export const images = {
  hero: { src: "/images/hero.svg", alt: "A table set for dinner with plated food and glasses" },
  sonia: { src: "/images/sonia.svg", alt: "Portrait of Sonia Brown in her chef's whites" },
  services: {
    "private-dinner": { src: "/images/private-dinner.svg", alt: "A plated private dinner course" },
    "weekly-meal-prep": { src: "/images/meal-prep.svg", alt: "Labelled meal prep containers" },
    "event-catering": { src: "/images/event-catering.svg", alt: "Platters set out for an event" },
  } as Record<string, { src: string; alt: string }>,
  gallery: [
    { src: "/images/gallery-1.svg", alt: "Signature plated main", tall: false },
    { src: "/images/gallery-2.svg", alt: "Stew simmering on the stove", tall: true },
    { src: "/images/gallery-3.svg", alt: "Starter with a glass of wine", tall: false },
    { src: "/images/gallery-4.svg", alt: "Meal prep for the week", tall: true },
    { src: "/images/gallery-5.svg", alt: "Soup course", tall: false },
    { src: "/images/gallery-6.svg", alt: "Sharing plates for the table", tall: false },
  ],
};

export function serviceImage(slug: string) {
  return images.services[slug] ?? images.services["private-dinner"];
}
