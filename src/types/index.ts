/* ─── Navigation ─── */
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

/* ─── SEO ─── */
export interface SEOProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/* ─── Blog ─── */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  image: string;
  author: string;
  tags: string[];
}

/* ─── Booking ─── */
export interface BookingDate {
  date: string;
  time: string;
  available: boolean;
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  location: "bo-phut" | "plai-laem";
  date: string;
  time: string;
  participants: number;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
  createdAt: string;
}

/* ─── Trainers ─── */
export interface Trainer {
  id: string;
  name: string;
  nickname?: string;
  bio: string;
  image: string;
  specialties: string[];
  experience: string;
  location: "bo-phut" | "plai-laem" | "both";
}

/* ─── Programs ─── */
export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  image: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced" | "all";
  priceFrom: number;
  currency: string;
  features: string[];
}

/* ─── Testimonials ─── */
export interface Testimonial {
  id: string;
  name: string;
  country: string;
  rating: number;
  text: string;
  date: string;
  program?: string;
  avatar?: string;
}

/* ─── FAQ ─── */
export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}
