/**
 * Swap placeholders for real photos: drop a file in /public/images and change
 * the path here (e.g. "/images/hero.jpg"). Warm, natural light, close-up food
 * and hands cooking work best. Recommended sizes: hero 1600x1100, others 1200x900.
 */
export const images = {
  hero: { src: "/images/hero-table.jpg", alt: "A dinner table set with jollof rice, grilled tilapia, kelewele, salad and sobolo" },
  sonia: { src: "/images/sonia.svg", alt: "Portrait of Sonia Brown in her chef's whites" },
  services: {
    "private-dinner": { src: "/images/private-dinner.svg", alt: "A plated private dinner course" },
    "weekly-meal-prep": { src: "/images/meal-prep.svg", alt: "Labelled meal prep containers" },
    "event-catering": { src: "/images/event-catering.svg", alt: "Platters set out for an event" },
  } as Record<string, { src: string; alt: string }>,
  gallery: [
    { src: "/images/dish-jollof.jpg", alt: "Jollof rice with grilled chicken and fried plantain", tall: false },
    { src: "/images/dish-fufu-light-soup.jpg", alt: "Fufu in light soup with goat meat", tall: true },
    { src: "/images/dish-kelewele.jpg", alt: "A bowl of spiced kelewele with roasted groundnuts", tall: false },
    { src: "/images/dish-banku-tilapia.jpg", alt: "Banku with grilled tilapia and fresh pepper", tall: true },
    { src: "/images/dish-waakye.jpg", alt: "A full plate of waakye with shito, gari and egg", tall: false },
    { src: "/images/dish-red-red.jpg", alt: "Red red bean stew with fried plantain", tall: false },
  ],
};

export function serviceImage(slug: string) {
  return images.services[slug] ?? images.services["private-dinner"];
}
