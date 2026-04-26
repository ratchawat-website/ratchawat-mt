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
  homepageFeatured?: boolean;
  yearsExperience?: number;
  totalFights?: number;
  fightingStyle?: string;
  certifications?: string[];
  instagramUrl?: string;
}

export const trainers: Trainer[] = [
  {
    id: "ratchawat",
    name: "Kru Ratchawat",
    role: "Founder & Head Coach",
    camps: ["bo-phut", "plai-laem"],
    bio: "Founded Ratchawat and still teaches every day. 25 years in Muay Thai, 450 fights, 15 years coaching. C-license certified, has run seminars across Europe, and built both Bo Phut and Plai Laem from the ground up. Also works as a fight promoter, so he sees the sport end to end, from drill to fight night. Technical fighter with a strong kicking game.",
    specialties: ["Pad work", "Fighter development", "Leadership"],
    fightingStyle: "Technical fighter with strong kicking game",
    totalFights: 450,
    yearsExperience: 25,
    certifications: ["C-license Muay Thai trainer"],
    image: "/images/trainers/trainer-ratchawat.jpeg",
    imageAlt: "Kru Ratchawat, founder and head coach of Ratchawat Muay Thai",
    featured: true,
    homepageFeatured: true,
  },
  {
    id: "kuan",
    name: "Kru Kuan",
    role: "Head Trainer, Bo Phut",
    camps: ["bo-phut", "plai-laem"],
    bio: "Three-time Muay Thai champion, 280 fights, C-license certified. As Head Trainer at Bo Phut, Kuan sets the tone of the room. Knee fighter with a sharp clinch and a deep technical game. He runs the most demanding pad rounds at the camp, and rotates to Plai Laem when needed.",
    specialties: ["Professional-level clinch", "Pad work", "Fighter prep"],
    fightingStyle: "Knee fighter with strong technical skills",
    totalFights: 280,
    certifications: ["C-license Muay Thai trainer"],
    image: "/images/trainers/trainer-kuan.jpeg",
    imageAlt: "Kru Kuan, head trainer at Ratchawat Bo Phut",
    homepageFeatured: true,
  },
  {
    id: "mam",
    name: "Kru Mam",
    role: "Trainer",
    camps: ["plai-laem"],
    bio: "Southern Thailand Champion at 126 lbs, 500 fights, 20 years in the ring. Mam is a knee fighter and a pad work specialist. 8 years coaching beginners and advanced students with the same focus and patience.",
    specialties: ["Pad work", "Private sessions", "Beginners"],
    fightingStyle: "Knee fighter",
    totalFights: 500,
    yearsExperience: 20,
    image: "/images/trainers/trainer-mam.jpeg",
    imageAlt: "Kru Mam, trainer at Ratchawat Plai Laem",
    homepageFeatured: true,
  },
  {
    id: "kit",
    name: "Kru Kit",
    role: "Trainer",
    camps: ["plai-laem"],
    bio: "Muay Thai champion, 200 fights. Fast hands, dynamic, demanding on the pads. Kit gets students to clean up their technique quickly and stops bad habits before they stick.",
    specialties: ["Pad work", "Technique"],
    fightingStyle: "Technical fighter",
    totalFights: 200,
    image: "/images/trainers/trainer-kit.jpeg",
    imageAlt: "Kru Kit, trainer at Ratchawat Plai Laem",
  },
  {
    id: "kheng",
    name: "Kru Kheng",
    role: "Trainer",
    camps: ["plai-laem"],
    bio: "National gold medalist and Muay Thai champion. C-license certified. 300 fights. Famous for his elbow strikes, both the way he throws them and the way he teaches them. Sharp on technical fundamentals.",
    specialties: ["Pad work", "Elbows", "Technique"],
    fightingStyle: "Technical fighter with strong elbows",
    totalFights: 300,
    certifications: ["C-license Muay Thai trainer"],
    image: "/images/trainers/trainer-kheng.jpeg",
    imageAlt: "Kru Kheng, trainer at Ratchawat Plai Laem",
  },
  {
    id: "dam",
    name: "Kru Dam",
    role: "Trainer",
    camps: ["bo-phut", "plai-laem"],
    bio: "300 fights, technical with strong knees. Dam rotates between Bo Phut and Plai Laem and brings fight-night discipline to every session, no matter the level.",
    specialties: ["Pad work", "Knees", "Technique"],
    fightingStyle: "Technical fighter with knee strikes",
    totalFights: 300,
    image: "/images/trainers/trainer-dam.jpeg",
    imageAlt: "Kru Dam, trainer at Ratchawat Bo Phut and Plai Laem",
  },
  {
    id: "tae",
    name: "Kru Tae",
    role: "Trainer",
    camps: ["plai-laem"],
    bio: "Puncher, 300 fights. Tae's specialty is professional-level clinch work. If you want to learn how to win the inside game, he is your trainer.",
    specialties: ["Professional-level clinch", "Punches"],
    fightingStyle: "Puncher",
    totalFights: 300,
    image: "/images/trainers/trainer-tae.jpeg",
    imageAlt: "Kru Tae, trainer at Ratchawat Plai Laem",
  },
  {
    id: "sing",
    name: "Kru Sing",
    role: "Trainer",
    camps: ["bo-phut"],
    bio: "Two-time Muay Thai champion, 250 fights. Sing is technical and precise. Students mention how quickly their technique cleans up after a few sessions with him.",
    specialties: ["Pad work", "Technique"],
    fightingStyle: "Technical fighter",
    totalFights: 250,
    image: "/images/trainers/trainer-sing.jpeg",
    imageAlt: "Kru Sing, trainer at Ratchawat Bo Phut",
  },
  {
    id: "jet",
    name: "Kru Jet",
    role: "Trainer",
    camps: ["bo-phut"],
    bio: "One Muay Thai championship, one national amateur Muay Thai gold, and eight national amateur boxing gold medals. 20 years fighting, 9 years coaching, 470 fights. Jet brings the power and precision that come from a lifetime in the ring.",
    specialties: ["Pad work", "Heavy weapons", "Technique"],
    fightingStyle: "Technical fighter with heavy weapons",
    totalFights: 470,
    yearsExperience: 20,
    image: "/images/trainers/trainer-jet.jpeg",
    imageAlt: "Kru Jet, trainer at Ratchawat Bo Phut",
  },
  {
    id: "tan",
    name: "Kru Tan",
    role: "Kids Instructor",
    camps: ["bo-phut"],
    bio: "Amateur Muay Thai medalist, both gold and silver. Tan runs the kids classes at Bo Phut with patience and energy. Kids book her sessions back to back.",
    specialties: ["Kids training", "Knees"],
    fightingStyle: "Knee fighter",
    totalFights: 40,
    image: "/images/trainers/trainer-tan.jpeg",
    imageAlt: "Kru Tan, kids instructor at Ratchawat Bo Phut",
  },
];

export const featuredTrainer = trainers.find((t) => t.featured);
export const teamMembers = trainers.filter((t) => !t.featured);
export const homepageTrainers = trainers.filter((t) => t.homepageFeatured);

export function trainerCampLabel(trainer: Trainer): string {
  if (trainer.camps.length >= 2) return "Both camps";
  return trainer.camps[0] === "bo-phut" ? "Bo Phut" : "Plai Laem";
}
