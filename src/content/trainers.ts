import type { Camp } from "./reviews";
export type { Camp } from "./reviews";

export interface Trainer {
  id: string;
  name: string;
  role: string;
  camps: Camp[];
  bio: string;
  specialties: string[];
  image: string | null;
  imageAlt: string;
  pos?: string;
  featured?: boolean;
  yearsExperience?: number;
  instagramUrl?: string;
}

/**
 * PLACEHOLDER DATA — bios and some names pending owner confirmation.
 * Confirmed trainer names (from recent Google reviews 2026-Q1/Q2):
 *   Kruu Wat (owner), Tae, Kuan, Kit, Sing, Mam, Mon.
 * 5 additional trainers TBD with owner.
 */
export const trainers: Trainer[] = [
  {
    id: "kruu-wat",
    name: "Kruu Wat",
    role: "Owner & Head Coach",
    camps: ["bo-phut", "plai-laem"],
    bio: "Kruu Wat founded Ratchawat and still teaches every day at the Bo Phut camp on Soi Sunday. Calm, technical, and patient. He can break down a kick for a first-timer and push an experienced fighter in the same hour. [Full biography pending owner confirmation.]",
    specialties: ["Head coaching", "Technique", "Fighter prep", "Pad work"],
    image: null,
    imageAlt: "Kruu Wat, owner and head coach of Ratchawat Muay Thai",
    featured: true,
  },
  {
    id: "tae",
    name: "Tae",
    role: "Senior Trainer",
    camps: ["bo-phut", "plai-laem"],
    bio: "Tae travels between Bo Phut and Plai Laem. Frequently mentioned in reviews for his sharp pad work and the way he corrects technique without breaking the flow of a session. [Full bio pending.]",
    specialties: ["Pad work", "Private sessions", "Technique"],
    image: null,
    imageAlt: "Tae, senior trainer at Ratchawat Muay Thai",
  },
  {
    id: "kuan",
    name: "Kuan",
    role: "Trainer",
    camps: ["bo-phut"],
    bio: "Kuan teaches at the Bo Phut camp. Known for welcoming first-time students and turning a one-off discovery session into a full week of training. [Full bio pending.]",
    specialties: ["Beginners", "Pad work", "Group classes"],
    image: null,
    imageAlt: "Kuan, trainer at Ratchawat Bo Phut",
  },
  {
    id: "kit",
    name: "Kit",
    role: "Trainer",
    camps: ["bo-phut"],
    bio: "Kit teaches private sessions and group classes at Bo Phut. Patient and precise, he spends the time it takes to make every strike land the right way. [Full bio pending.]",
    specialties: ["Private sessions", "Technique", "Pad work"],
    image: null,
    imageAlt: "Kit, trainer at Ratchawat Bo Phut",
  },
  {
    id: "sing",
    name: "Sing",
    role: "Trainer",
    camps: ["bo-phut"],
    bio: "Sing runs pad work and technical drills at the Bo Phut camp. Students mention the intensity and clarity of his sessions. [Full bio pending.]",
    specialties: ["Pad work", "Drills", "Conditioning"],
    image: null,
    imageAlt: "Sing, trainer at Ratchawat Bo Phut",
  },
  {
    id: "mam",
    name: "Mam",
    role: "Trainer",
    camps: ["plai-laem"],
    bio: "Mam is a go-to trainer for private sessions at Plai Laem. Welcoming to both beginners and advanced students, often booked for introductory 1:1 lessons. [Full bio pending.]",
    specialties: ["Private sessions", "Beginners", "Advanced technique"],
    image: null,
    imageAlt: "Mam, trainer at Ratchawat Plai Laem",
  },
  {
    id: "mon",
    name: "Mon",
    role: "Trainer",
    camps: ["plai-laem"],
    bio: "Mon teaches at Plai Laem and often leads group sessions. Students mention his energy and enthusiasm as a defining part of the experience. [Full bio pending.]",
    specialties: ["Group classes", "Pad work", "Conditioning"],
    image: null,
    imageAlt: "Mon, trainer at Ratchawat Plai Laem",
  },
  {
    id: "tbd-08",
    name: "Name TBD",
    role: "Trainer",
    camps: ["bo-phut"],
    bio: "[Name, role, and bio pending owner confirmation.]",
    specialties: ["Specialty TBD"],
    image: null,
    imageAlt: "Ratchawat Muay Thai trainer",
  },
  {
    id: "tbd-09",
    name: "Name TBD",
    role: "Trainer",
    camps: ["plai-laem"],
    bio: "[Name, role, and bio pending owner confirmation.]",
    specialties: ["Specialty TBD"],
    image: null,
    imageAlt: "Ratchawat Muay Thai trainer",
  },
  {
    id: "tbd-10",
    name: "Name TBD",
    role: "Trainer",
    camps: ["bo-phut", "plai-laem"],
    bio: "[Name, role, and bio pending owner confirmation.]",
    specialties: ["Specialty TBD"],
    image: null,
    imageAlt: "Ratchawat Muay Thai trainer",
  },
  {
    id: "tbd-11",
    name: "Name TBD",
    role: "Trainer",
    camps: ["bo-phut"],
    bio: "[Name, role, and bio pending owner confirmation.]",
    specialties: ["Specialty TBD"],
    image: null,
    imageAlt: "Ratchawat Muay Thai trainer",
  },
  {
    id: "tbd-12",
    name: "Name TBD",
    role: "Trainer",
    camps: ["plai-laem"],
    bio: "[Name, role, and bio pending owner confirmation.]",
    specialties: ["Specialty TBD"],
    image: null,
    imageAlt: "Ratchawat Muay Thai trainer",
  },
];

export const featuredTrainer = trainers.find((t) => t.featured);
export const teamMembers = trainers.filter((t) => !t.featured);

export function trainerCampLabel(trainer: Trainer): string {
  if (trainer.camps.length >= 2) return "Both camps";
  return trainer.camps[0] === "bo-phut" ? "Bo Phut" : "Plai Laem";
}
