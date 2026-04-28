import { format, parseISO } from "date-fns";

export type Camp = "bo-phut" | "plai-laem";

export type ReviewLanguage = "en" | "fr" | "es" | "de" | "nl" | "he";

export interface Review {
  id: string;
  author: string;
  camp: Camp;
  rating: 5;
  text: string;
  language: ReviewLanguage;
  flag?: string;
  approxDate: string;
  trainersMentioned?: string[];
}

export function reviewDisplayDate(review: Review): string {
  return format(parseISO(review.approxDate), "MMMM yyyy");
}

export const CAMP_LABELS: Record<Camp, string> = {
  "bo-phut": "Bo Phut",
  "plai-laem": "Plai Laem",
};

export const CAMP_GBP_URLS: Record<Camp, string> = {
  "bo-phut": "https://maps.app.goo.gl/yxkGkZtzkn1Lq48Y9",
  "plai-laem": "https://maps.app.goo.gl/fLdyZsRm9r5WRCU86",
};

export const CAMP_STATS = {
  "bo-phut": { rating: 5.0, reviewCount: 255 },
  "plai-laem": { rating: 5.0, reviewCount: 141 },
} as const;

export const TOTAL_REVIEWS =
  CAMP_STATS["bo-phut"].reviewCount + CAMP_STATS["plai-laem"].reviewCount;

// Display string used in user-facing copy. The numeric TOTAL_REVIEWS stays for
// schema.org reviewCount (which requires an integer); the display value is
// rounded to a stable threshold so the site does not need updating each time
// new Google reviews come in.
export const TOTAL_REVIEWS_DISPLAY = "400+";

export const OVERALL_RATING = 5.0;

export const reviews: Review[] = [
  // Bo Phut
  {
    id: "bp-laurynas",
    author: "Laurynas Radzevicius",
    camp: "bo-phut",
    rating: 5,
    text: "Had an amazing training session with Tae and fixed a lot of my mistakes.",
    language: "en",
    approxDate: "2026-04-09",
    trainersMentioned: ["Tae"],
  },
  {
    id: "bp-nathan",
    author: "Nathan Bernède",
    camp: "bo-phut",
    rating: 5,
    text: "Super découverte pour mon premier cours de Muay Thaï et plus généralement de sport de combat. J'y suis retourné le lendemain car j'ai adoré l'expérience, notamment grâce à Kuan, qui a été un super entraîneur, merci à toi. Si vous cherchez un endroit pour découvrir ce sport, n'hésitez pas et venez ici.",
    language: "fr",
    flag: "🇫🇷",
    approxDate: "2026-04-09",
    trainersMentioned: ["Kuan"],
  },
  {
    id: "bp-dyane",
    author: "Dyane Dumarnier",
    camp: "bo-phut",
    rating: 5,
    text: "Exceptional experience at this box. Thank you Kit for the lesson and the kindness. Highly recommended.",
    language: "en",
    approxDate: "2026-04-09",
    trainersMentioned: ["Kit"],
  },
  {
    id: "bp-emma",
    author: "Emma Pededieu",
    camp: "bo-phut",
    rating: 5,
    text: "Merci Kuan pour ce cours intense et fun. On a choisi le cours avec 1 coach pour 2 et c'était parfait, une vraie initiation au Muay Thaï avec de bons conseils et assez de temps pour pratiquer et comprendre les premières bases du sport. Je recommande vivement.",
    language: "fr",
    flag: "🇫🇷",
    approxDate: "2026-04-02",
    trainersMentioned: ["Kuan"],
  },
  {
    id: "bp-chris",
    author: "Chris Haswani",
    camp: "bo-phut",
    rating: 5,
    text: "Tae is amazing trainer. Best muay thai coach.",
    language: "en",
    approxDate: "2026-04-02",
    trainersMentioned: ["Tae"],
  },
  {
    id: "bp-balance",
    author: "balance1ish",
    camp: "bo-phut",
    rating: 5,
    text: "Train with Kru Tae private with my 11 year old boy. Excellent technique and perfect training.",
    language: "en",
    approxDate: "2026-04-02",
    trainersMentioned: ["Tae"],
  },
  // Plai Laem
  {
    id: "pl-alba",
    author: "Alba",
    camp: "plai-laem",
    rating: 5,
    text: "He sido muy feliz estos días en Chor.Ratchawat Plai Leam. He disfrutado mucho del Muay Thai tanto por la calidad de los entrenadores, como por la variedad de los entrenamientos. Ha sido una combinación de trabajo técnico, físico, paos, sparring y clinch, que me ha permitido aprender en muchos aspectos. Además, el tener el alojamiento a segundos del gimnasio, y una piscina, ha hecho que pueda estar tranquila y centrada en lo que me gusta. Estoy muy agradecida a todos por estos días, y estoy segura de que volveré.",
    language: "es",
    flag: "🇪🇸",
    approxDate: "2026-03-19",
  },
  {
    id: "pl-matthew",
    author: "Matthew Martin",
    camp: "plai-laem",
    rating: 5,
    text: "Had an awesome experience today at Chor Ratchawat. These guys are amazing, knowledgeable and welcoming. Looking forward to another 1:1 training session soon with Tae.",
    language: "en",
    approxDate: "2026-03-19",
    trainersMentioned: ["Tae"],
  },
  {
    id: "pl-elsa",
    author: "Elsa Trang",
    camp: "plai-laem",
    rating: 5,
    text: "Amazing private session with Mam. So welcoming for beginners or advanced. Technique was very good.",
    language: "en",
    approxDate: "2026-03-12",
    trainersMentioned: ["Mam"],
  },
  {
    id: "pl-eva",
    author: "Eva C",
    camp: "plai-laem",
    rating: 5,
    text: "We were with a group of 4 having two teachers. It was great fun. They are very professional and look at the postures. I can highly recommend going here to try out Muay Thai or if you're more experienced do a session. Special thanks to Mon. I really liked his energy and enthusiasm.",
    language: "en",
    approxDate: "2026-03-12",
    trainersMentioned: ["Mon"],
  },
  {
    id: "pl-sophie",
    author: "Sophie K",
    camp: "plai-laem",
    rating: 5,
    text: "Een super fijne 1:1 training gehad van Tae. Schone omgeving ook. Was erg leuk.",
    language: "nl",
    flag: "🇳🇱",
    approxDate: "2026-03-12",
    trainersMentioned: ["Tae"],
  },
  {
    id: "pl-steffen",
    author: "Steffen Kjevik",
    camp: "plai-laem",
    rating: 5,
    text: "I had never tried Muay Thai before, and had a private session at this gym with Mam. Really great trainer, we had a fun session. Very nice gym where you can also do some strength training if you want. Will definitely come back.",
    language: "en",
    approxDate: "2026-03-05",
    trainersMentioned: ["Mam"],
  },
];

// Star content for homepage testimonials (3 hand-picked across camps + languages)
export const featuredHomepageReviews: Review[] = [
  {
    id: "home-joanna",
    author: "Joanna Nadolska",
    camp: "bo-phut",
    rating: 5,
    text: "I was getting ready here for the Muay Thai World Championship, and that was an excellent camp. Not only from the professional point of view, but also I have seen people and tourists who had a really good fun and learning. Great level of the fighting girls, and a very friendly vibe at the same time. I also had a chance to have sparring with a former ONE Championship fighter who visited the gym. Thank you to the whole team and members for helping me during my preparation.",
    language: "en",
    approxDate: "2026-04-02",
  },
  {
    id: "home-alba",
    author: "Alba",
    camp: "plai-laem",
    rating: 5,
    text: "He sido muy feliz estos días en Chor.Ratchawat Plai Leam. He disfrutado mucho del Muay Thai tanto por la calidad de los entrenadores, como por la variedad de los entrenamientos. Además, el tener el alojamiento a segundos del gimnasio, y una piscina, ha hecho que pueda estar tranquila y centrada en lo que me gusta.",
    language: "es",
    flag: "🇪🇸",
    approxDate: "2026-03-19",
  },
  {
    id: "home-nathan",
    author: "Nathan Bernède",
    camp: "bo-phut",
    rating: 5,
    text: "Super découverte pour mon premier cours de Muay Thaï et plus généralement de sport de combat. J'y suis retourné le lendemain car j'ai adoré l'expérience, notamment grâce à Kuan. Si vous cherchez un endroit pour découvrir ce sport, n'hésitez pas et venez ici.",
    language: "fr",
    flag: "🇫🇷",
    approxDate: "2026-04-09",
    trainersMentioned: ["Kuan"],
  },
];

export const reviewHighlightTags = [
  "Patient trainers",
  "Beginner friendly",
  "Kid friendly",
  "Female friendly",
  "Clean gym",
  "International community",
  "Private sessions",
  "Fighter preparation",
  "On-site accommodation",
  "Authentic atmosphere",
];
