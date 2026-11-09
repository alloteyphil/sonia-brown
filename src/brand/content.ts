/** Site copy in Sonia's voice. Edit freely. */
import { brand } from "./tokens";

export type PublicService = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  pricePerGuest: number;
  minGuests: number;
  maxGuests: number;
  durationMinutes: number;
};

/** Shown before Convex is connected, and used as the build-time fallback. */
export const fallbackServices: PublicService[] = [
  {
    name: "Private Dinner",
    slug: "private-dinner",
    description:
      "A multi-course dinner cooked in your kitchen and served at your table. Perfect for birthdays, anniversaries and dinners you want to remember.",
    basePrice: 60000,
    pricePerGuest: 35000,
    minGuests: 2,
    maxGuests: 14,
    durationMinutes: 300,
  },
  {
    name: "Weekly Meal Prep",
    slug: "weekly-meal-prep",
    description:
      "A week of fresh, balanced meals cooked in your home, portioned and labelled in your fridge. Tailored to your goals and tastes.",
    basePrice: 80000,
    pricePerGuest: 20000,
    minGuests: 1,
    maxGuests: 6,
    durationMinutes: 240,
  },
  {
    name: "Event Catering",
    slug: "event-catering",
    description:
      "Beautiful food for gatherings of up to 80: small chops, buffet or family-style, with setup and service handled.",
    basePrice: 150000,
    pricePerGuest: 18000,
    minGuests: 15,
    maxGuests: 80,
    durationMinutes: 480,
  },
];

export type BusinessInfo = {
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  serviceArea: string;
  depositPercent: number;
  cancellationPolicy: string;
  leadTimeHours: number;
};

export const fallbackBusiness: BusinessInfo = {
  businessName: `${brand.name} — ${brand.descriptor}`,
  phone: brand.contact.phone,
  whatsapp: brand.contact.whatsapp,
  email: brand.contact.email,
  instagram: brand.contact.instagram,
  serviceArea: "Greater Accra",
  depositPercent: 30,
  cancellationPolicy:
    "Cancel more than 7 days before your booking for a full refund of your deposit. Within 7 days, the deposit covers ingredients already bought and isn't refundable.",
  leadTimeHours: 48,
};

export const howItWorks = [
  {
    title: "Pick your date",
    body: "Choose a service, see my real availability and book in a couple of minutes from your phone.",
  },
  {
    title: "We plan the menu",
    body: "I'll message you to shape the menu around your tastes, guests and any allergies.",
  },
  {
    title: "I cook, you relax",
    body: "I arrive with everything, cook in your kitchen, serve, and leave it spotless.",
  },
];

export const ghanaianDishes = [
  {
    name: "Jollof Rice",
    image: "/images/dish-jollof.jpg",
    alt: "Jollof rice with grilled chicken, fried plantain and fresh salad",
    description: "Smoky, slow-cooked tomato rice with charred chicken, sweet plantain and a crisp salad. The party favourite.",
  },
  {
    name: "Waakye",
    image: "/images/dish-waakye.jpg",
    alt: "Waakye with spaghetti, gari, boiled egg, plantain, shito and fish in stew",
    description: "Rice and beans with all the trimmings: my homemade shito, gari, stew, egg and fried plantain.",
  },
  {
    name: "Banku & Tilapia",
    image: "/images/dish-banku-tilapia.jpg",
    alt: "Two balls of banku beside a whole grilled tilapia and fresh pepper sauce",
    description: "Silky banku with whole grilled tilapia and a bright, fresh pepper. Best eaten with your hands.",
  },
  {
    name: "Fufu & Light Soup",
    image: "/images/dish-fufu-light-soup.jpg",
    alt: "Fufu in a bowl of light soup with goat meat and garden egg",
    description: "Smooth fufu in a peppery tomato light soup with tender goat. Comfort in a bowl.",
  },
  {
    name: "Kelewele",
    image: "/images/dish-kelewele.jpg",
    alt: "Spiced fried plantain cubes with roasted groundnuts",
    description: "Ripe plantain tossed in ginger and chilli, fried until caramelised. Served with roasted groundnuts.",
  },
  {
    name: "Red Red",
    image: "/images/dish-red-red.jpg",
    alt: "Black-eyed bean stew in palm oil with fried plantain and gari",
    description: "Black-eyed beans simmered in palm oil and tomato, with fried plantain and gari. Naturally vegetarian.",
  },
];

export const sampleMenus = [
  {
    title: "Accra Evening",
    service: "Private Dinner",
    courses: [
      "Kelewele bites with spiced peanut crumb",
      "Light soup with grilled tilapia",
      "Jollof risotto, charred chicken thigh, shito butter",
      "Coconut panna cotta, pineapple and lime",
    ],
  },
  {
    title: "Coastal Table",
    service: "Private Dinner",
    courses: [
      "Prawn and avocado salad, citrus dressing",
      "Grilled red snapper, green plantain mash",
      "Garden greens with palm-nut vinaigrette",
      "Bofrot with sea-salt caramel",
    ],
  },
  {
    title: "Balanced Week",
    service: "Weekly Meal Prep",
    courses: [
      "Grilled chicken, brown rice, garden egg stew",
      "Beef suya bowl with quinoa and slaw",
      "Kontomire stew with boiled yam (veg)",
      "Overnight oats with tropical fruit",
    ],
  },
];

export const faqs = [
  {
    q: "Where do you cook?",
    a: "In your home or venue. I bring the ingredients, equipment I need and my own aprons. You just need a working kitchen.",
  },
  {
    q: "Which areas do you cover?",
    a: "Anywhere in Greater Accra. For Tema, Aburi or further out, message me first and I'll confirm travel.",
  },
  {
    q: "Can you cater for allergies and diets?",
    a: "Yes. Tell me about allergies, intolerances and preferences when you book and I'll plan around them carefully.",
  },
  {
    q: "How does payment work?",
    a: "Pay a deposit by card or mobile money to lock in your date, or pay the full amount. You can also request a booking and pay in person once I confirm.",
  },
  {
    q: "Are ingredients included in the price?",
    a: "Yes. Prices include ingredients, cooking, serving and cleanup. Drinks and special-order items can be added on request.",
  },
  {
    q: "What if I need to cancel?",
    a: "Cancel more than 7 days before for a full deposit refund. After that the deposit covers ingredients already bought. You can reschedule once for free with 72 hours' notice.",
  },
];
