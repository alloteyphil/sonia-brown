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

export type Dish = { name: string; image: string; alt: string; description: string };

export const ghanaianDishes: Dish[] = [
  {
    name: "Jollof Rice",
    image: "/images/gh-jollof.jpg",
    alt: "Jollof rice topped with grilled chicken and pepper skewers, with a whole grilled fish",
    description: "Smoky, slow-cooked tomato rice with charred chicken skewers. The party favourite, and yes, Ghana's is the best.",
  },
  {
    name: "Waakye",
    image: "/images/gh-waakye.jpg",
    alt: "A neat mound of waakye rice and beans on a white plate",
    description: "Rice and beans cooked with sorghum leaves, served with my homemade shito, gari, stew, egg and plantain.",
  },
  {
    name: "Ghana-Style Fried Rice",
    image: "/images/gh-fried-rice.jpg",
    alt: "Vegetable fried rice with an omelette, fried chicken, salad and shito",
    description: "Wok-fried rice with vegetables, an omelette, crispy chicken and a spoon of shito on the side.",
  },
  {
    name: "Grilled Tilapia",
    image: "/images/gh-grilled-tilapia.jpg",
    alt: "Whole grilled tilapia topped with peppers and onions, with three dipping sauces",
    description: "Whole tilapia grilled over charcoal with fresh pepper and onions. Served with banku or kenkey.",
  },
  {
    name: "Fufu & Light Soup",
    image: "/images/gh-fufu-light-soup.jpg",
    alt: "Fufu in a bowl of light soup with tender goat meat",
    description: "Smooth fufu in a peppery tomato light soup with tender goat. Comfort in a bowl.",
  },
  {
    name: "Plantain & Groundnuts",
    image: "/images/gh-plantain-groundnuts.jpg",
    alt: "Fried ripe plantain scattered with roasted groundnuts in a white bowl",
    description: "Sweet ripe plantain fried until caramelised, with roasted groundnuts. A snack Ghanaians never say no to.",
  },
  {
    name: "Chichinga",
    image: "/images/gh-kebabs.jpg",
    alt: "Spiced beef and chicken kebabs grilling over charcoal",
    description: "Beef and chicken kebabs rubbed with suya spice and grilled over charcoal. Perfect for parties.",
  },
  {
    name: "Koose",
    image: "/images/gh-koose.jpg",
    alt: "A bowl of golden fried bean fritters",
    description: "Light, crispy black-eyed bean fritters with fresh pepper. Breakfast with hausa koko, or small chops.",
  },
  {
    name: "Bofrot",
    image: "/images/gh-bofrot.jpg",
    alt: "A bowl of golden bofrot (puff puff) doughnuts",
    description: "Soft, golden Ghanaian doughnuts dusted with sugar. They disappear first at every party.",
  },
];

/** Ghanaian dishes I cook that aren't pictured above. */
export const moreGhanaianDishes = [
  "Kenkey & fried fish",
  "Banku & okro stew",
  "Red red",
  "Kelewele",
  "Groundnut soup",
  "Palm nut soup",
  "Ampesi & kontomire",
  "Tuo zaafi & ayoyo",
  "Omo tuo",
  "Fried yam & pepper",
  "Sobolo",
];

export const soulFoodDishes: Dish[] = [
  {
    name: "Baked Mac & Cheese",
    image: "/images/soul-mac-cheese.jpg",
    alt: "Baked macaroni and cheese with a golden top in a cast-iron skillet",
    description: "Three cheeses, baked until the top is golden and the edges are crispy. The one everybody fights over.",
  },
  {
    name: "Southern Fried Chicken",
    image: "/images/soul-fried-chicken.jpg",
    alt: "Crispy fried chicken drumsticks on a white plate",
    description: "Buttermilk-brined, seasoned all the way through and fried till it crackles.",
  },
  {
    name: "Chicken & Waffles",
    image: "/images/soul-chicken-waffles.jpg",
    alt: "Fried chicken tenders on a waffle with syrup being drizzled over",
    description: "Crispy fried chicken on a buttery waffle with hot honey or maple syrup. Brunch, sorted.",
  },
  {
    name: "Shrimp & Grits",
    image: "/images/soul-shrimp-grits.jpg",
    alt: "A bowl of shrimp over creamy grits with tomatoes and herbs",
    description: "Creamy cheese grits topped with garlicky shrimp, smoked sausage and a little heat.",
  },
  {
    name: "Gumbo",
    image: "/images/soul-gumbo.jpg",
    alt: "A bowl of dark gumbo topped with white rice",
    description: "Dark roux, chicken, andouille and shrimp, simmered low and slow and served over rice.",
  },
  {
    name: "Braised Oxtails",
    image: "/images/soul-oxtails.jpg",
    alt: "Braised oxtails in a rich dark gravy with fresh thyme",
    description: "Oxtails braised for hours until they fall off the bone, in a rich, peppery gravy.",
  },
  {
    name: "BBQ Ribs",
    image: "/images/soul-ribs.jpg",
    alt: "Sticky glazed barbecue pork ribs on a plate",
    description: "Dry-rubbed, slow-cooked and glazed with my own barbecue sauce.",
  },
  {
    name: "Fried Catfish",
    image: "/images/soul-catfish.jpg",
    alt: "Cornmeal-fried fish with fries and hush puppies",
    description: "Cornmeal-crusted catfish, fried crisp, with hush puppies and tartar sauce.",
  },
  {
    name: "Candied Yams",
    image: "/images/soul-candied-yams.jpg",
    alt: "Sweet potatoes glazed in a glossy brown sugar syrup",
    description: "Sweet potatoes baked in butter, brown sugar and warm spices until sticky and glossy.",
  },
  {
    name: "Peach Cobbler",
    image: "/images/soul-peach-cobbler.jpg",
    alt: "Peach cobbler with a golden crumble topping",
    description: "Juicy spiced peaches under a buttery, golden crust. Best warm with vanilla ice cream.",
  },
  {
    name: "Banana Pudding",
    image: "/images/soul-banana-pudding.jpg",
    alt: "Banana pudding layered with vanilla wafers in glasses",
    description: "Layers of vanilla custard, fresh banana and wafers, chilled overnight.",
  },
  {
    name: "Red Velvet Cake",
    image: "/images/soul-red-velvet.jpg",
    alt: "A slice of red velvet layer cake with cream cheese frosting",
    description: "Soft, tangy red velvet layers with real cream cheese frosting.",
  },
];

/** Soul food dishes I cook that aren't pictured above. */
export const moreSoulFoodDishes = [
  "Collard greens",
  "Cornbread",
  "Smothered pork chops",
  "Smothered chicken",
  "Black-eyed peas",
  "Red beans & rice",
  "Jambalaya",
  "Fried green tomatoes",
  "Hush puppies",
  "Sweet potato pie",
  "Pound cake",
  "Sweet tea",
];

export type SampleMenu = {
  title: string;
  /** Slug of the service this menu belongs to. */
  service: string;
  /** Short label such as "Vegetarian" or "For two". */
  tag?: string;
  courses: string[];
};

/** Shown on /services, grouped by service in the order services are listed. */
export const sampleMenus: SampleMenu[] = [
  // Private Dinner
  {
    title: "Accra Evening",
    service: "private-dinner",
    courses: [
      "Kelewele bites with spiced peanut crumb",
      "Light soup with grilled tilapia",
      "Jollof risotto, charred chicken thigh, shito butter",
      "Coconut panna cotta, pineapple and lime",
    ],
  },
  {
    title: "Coastal Table",
    service: "private-dinner",
    courses: [
      "Prawn and avocado salad, citrus dressing",
      "Grilled red snapper, green plantain mash",
      "Garden greens with palm-nut vinaigrette",
      "Bofrot with sea-salt caramel",
    ],
  },
  {
    title: "Date Night",
    service: "private-dinner",
    tag: "For two",
    courses: [
      "Grilled prawns with shito butter and lime",
      "Seared tuna, avocado and green plantain crisps",
      "Lamb chops with suya spice, roasted yam and garden egg relish",
      "Dark chocolate pot made with Ghanaian cocoa, sobolo granita",
    ],
  },
  {
    title: "Harmattan Supper",
    service: "private-dinner",
    courses: [
      "Groundnut soup with smoked guinea fowl",
      "Grilled guinea fowl, yam croquettes, kontomire",
      "Tomato and garden egg salad with toasted agushie",
      "Tiger nut (atadwe) ice cream with roasted coconut",
    ],
  },
  {
    title: "Green Ghana",
    service: "private-dinner",
    tag: "Vegetarian",
    courses: [
      "Koose (bean fritters) with fresh pepper relish",
      "Kontomire stew with ampesi: yam, plantain and cocoyam",
      "Red red with avocado and crispy gari",
      "Mango and passion fruit sorbet",
    ],
  },
  {
    title: "Sunday Lunch",
    service: "private-dinner",
    tag: "Family style",
    courses: [
      "Fufu with light soup and goat meat",
      "Smoky party jollof and grilled chicken",
      "Kelewele, coleslaw and fried plantain",
      "Pineapple upside-down cake with sobolo",
    ],
  },

  {
    title: "Sunday Soul Supper",
    service: "private-dinner",
    tag: "Soul food",
    courses: [
      "Fried green tomatoes with remoulade",
      "Shrimp and grits with smoked sausage gravy",
      "Braised oxtails, baked mac and cheese, collard greens",
      "Peach cobbler with vanilla ice cream",
    ],
  },
  {
    title: "Accra to Atlanta",
    service: "private-dinner",
    tag: "Fusion",
    courses: [
      "Suya-spiced chicken wings with hot honey",
      "Jollof jambalaya with prawns and smoked sausage",
      "Buttermilk fried chicken, kelewele, greens with smoked turkey",
      "Red velvet cake with sobolo glaze",
    ],
  },

  // Weekly Meal Prep
  {
    title: "Balanced Week",
    service: "weekly-meal-prep",
    courses: [
      "Grilled chicken, brown rice, garden egg stew",
      "Beef suya bowl with quinoa and slaw",
      "Kontomire stew with boiled yam (veg)",
      "Overnight oats with tropical fruit",
    ],
  },
  {
    title: "Family Week",
    service: "weekly-meal-prep",
    tag: "Kid friendly",
    courses: [
      "Chicken light soup with omo tuo",
      "Jollof with grilled fish and coleslaw",
      "Beef and tomato stew with boiled plantain",
      "Red red with gari and ripe plantain",
    ],
  },
  {
    title: "Lean & Green",
    service: "weekly-meal-prep",
    tag: "High protein",
    courses: [
      "Grilled tilapia with palava sauce and brown rice",
      "Chicken suya salad with lime and groundnut dressing",
      "Turkey and vegetable stir-fry with cauliflower rice",
      "Pineapple, ginger and mint water",
    ],
  },

  {
    title: "Comfort Week",
    service: "weekly-meal-prep",
    tag: "Soul food",
    courses: [
      "Smothered chicken with rice and green beans",
      "Turkey meatloaf with mashed sweet potatoes",
      "Red beans and rice with andouille",
      "Baked catfish, collard greens and cornbread",
    ],
  },

  // Event Catering
  {
    title: "Small Chops Party",
    service: "event-catering",
    courses: [
      "Spring rolls and samosas",
      "Chichinga: beef and chicken kebabs with suya spice",
      "Kelewele cups with roasted groundnuts",
      "Bofrot with chocolate dip",
      "Sobolo and pineapple-ginger punch",
    ],
  },
  {
    title: "Celebration Buffet",
    service: "event-catering",
    tag: "Buffet",
    courses: [
      "Jollof and fried rice with grilled chicken",
      "Waakye station with shito, gari and talia",
      "Fried yam and plantain with pepper sauce",
      "Garden salad and coleslaw",
      "Fruit platter and mini bofrot",
    ],
  },
  {
    title: "Office Lunch",
    service: "event-catering",
    courses: [
      "Assorted fried rice with grilled chicken",
      "Banku bites with grilled tilapia and fresh pepper",
      "Ampesi with kontomire stew (veg)",
      "Mini meat pies",
      "Sobolo and asaana",
    ],
  },
  {
    title: "Southern Cookout",
    service: "event-catering",
    tag: "Soul food",
    courses: [
      "BBQ ribs and Southern fried chicken",
      "Baked mac and cheese, collard greens, candied yams",
      "Cornbread and hush puppies",
      "Banana pudding and peach cobbler",
      "Sweet tea and fresh lemonade",
    ],
  },
];

/** URL-safe id for a sample menu, used for /book?menu=… links. */
export function menuSlug(title: string) {
  return title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function findSampleMenu(slug: string | null | undefined) {
  return slug ? sampleMenus.find((m) => menuSlug(m.title) === slug) : undefined;
}

export type Testimonial = {
  quote: string;
  name: string;
  /** e.g. "Anniversary dinner, East Legon" */
  occasion: string;
};

/**
 * Real client reviews only. The section stays hidden on the site until at least
 * one is added. Ask permission and use first name + initial. Example:
 * { quote: "Sonia cooked for my parents' 40th…", name: "Ama K.", occasion: "Anniversary dinner, East Legon" },
 */
export const testimonials: Testimonial[] = [];

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
