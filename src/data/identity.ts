// NativeID Identity — Phase 1 + 2 mock data
export type Tier = 1 | 2 | 3;
export type TierStatus = "verified" | "in_review" | "available" | "locked";

export interface IdentityUser {
  mobile: string;
  handle: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  cacNumber?: string;
  emailLegacy?: string;
  daysSinceMigrationPrompt?: number; // for the email→mobile migration banner
  registeredOn: string;
  tier: Tier;
  trustScore: number;
  tierStatus: Record<Tier, TierStatus>;
  badges: string[];
  impersonatorsBlocked: number;
  escrowLimit: number;
  productsLinked: { name: string; lastActiveAt: string }[];
}

export const identity: IdentityUser = {
  mobile: "+234 803 421 0099",
  handle: "mamas-kitchen",
  businessName: "Mama's Kitchen",
  category: "Food & Beverage",
  city: "Lagos",
  state: "Lagos State",
  cacNumber: "RC-1924881",
  emailLegacy: "amaka@mamaskitchen.ng",
  daysSinceMigrationPrompt: 6,
  registeredOn: "March 2026",
  tier: 2,
  trustScore: 72,
  tierStatus: { 1: "verified", 2: "verified", 3: "available" },
  badges: ["Identity Verified", "Formally Verified"],
  impersonatorsBlocked: 4,
  escrowLimit: 500_000,
  productsLinked: [
    { name: "NativeID Profile", lastActiveAt: "now" },
    { name: "Automation Engine", lastActiveAt: "2 min ago" },
    { name: "Business App", lastActiveAt: "1 hr ago" },
  ],
};

export const tierMatrix = [
  {
    tier: 1 as Tier,
    title: "Identity Verified",
    badge: "Basic",
    timeToComplete: "Under 5 minutes",
    requires: ["Mobile OTP via WhatsApp"],
    unlocks: ["NativeID profile + shareable link", "Basic verified badge", "Escrow up to ₦50,000"],
    color: "sky",
  },
  {
    tier: 2 as Tier,
    title: "Formally Verified",
    badge: "Full",
    timeToComplete: "Under 10 minutes",
    requires: ["Tier 1 complete", "CAC registration number"],
    unlocks: ["Full Verified badge", "Higher Trust Score", "Escrow up to ₦500,000", "Anti-impersonation monitoring"],
    color: "primary",
  },
  {
    tier: 3 as Tier,
    title: "Address Verified",
    badge: "Address",
    timeToComplete: "Manual review · within 24 hours",
    requires: ["Tier 2 complete", "Recent utility bill (under 3 months)"],
    unlocks: ["Address Verified badge", "Highest Trust Score", "Escrow up to ₦5,000,000", "KYC-lite API access"],
    color: "violet",
  },
];

export const trustBands = [
  { min: 80, label: "Highly Trusted", tone: "primary" as const, hint: "Tier 3, long history, zero fraud flags" },
  { min: 65, label: "Verified", tone: "success" as const, hint: "Tier 2 or 3, good standing" },
  { min: 50, label: "Identity Verified", tone: "info" as const, hint: "Tier 1 or 2, limited history" },
  { min: 0, label: "No badge", tone: "muted" as const, hint: "Below trust threshold" },
];

export function bandFor(score: number) {
  return trustBands.find((b) => score >= b.min)!;
}

// Phase 2 — customer wallet (per-customer) — for the demo it's the same identity
export interface WalletTransaction {
  id: string;
  type: "verified-payment" | "escrow" | "verification-check";
  business: string;
  handle: string;
  amount?: number;
  status: "verified" | "completed" | "released";
  at: string;
}
export const walletTransactions: WalletTransaction[] = [
  { id: "w1", type: "verified-payment", business: "Mama's Kitchen", handle: "mamas-kitchen", amount: 12500, status: "verified", at: "Today, 14:02" },
  { id: "w2", type: "verification-check", business: "Lagos Tech Hub", handle: "lagos-tech-hub", status: "verified", at: "Yesterday, 09:11" },
  { id: "w3", type: "escrow", business: "Aso Furniture Co.", handle: "aso-furniture", amount: 320000, status: "released", at: "2 days ago" },
  { id: "w4", type: "verified-payment", business: "Ife Beauty Bar", handle: "ife-beauty", amount: 8500, status: "completed", at: "5 days ago" },
];

// Phase 2 — Continue with NativeID demo apps
export const ssoApps = [
  { id: "loyalty", name: "Naija Loyalty", purpose: "Earn rewards across 200+ merchants", color: "orange" as const },
  { id: "lend", name: "QuickLend SME", purpose: "Compliance · KYC-lite verification", color: "violet" as const },
  { id: "market", name: "Market Square", purpose: "Verified seller listings", color: "teal" as const },
];

// Anti-impersonation alerts (Tier 2+)
export const impersonationAlerts = [
  { id: "i1", platform: "Instagram", handle: "@mamas.kitchen.ng", detectedAt: "Apr 19", status: "Reported · pending takedown" },
  { id: "i2", platform: "WhatsApp", handle: "+234 814 ••• 7733", detectedAt: "Apr 14", status: "Taken down" },
  { id: "i3", platform: "Facebook", handle: "Mamas Kitchen Lagos", detectedAt: "Apr 09", status: "Taken down" },
  { id: "i4", platform: "Instagram", handle: "@mamaskitchenofficial", detectedAt: "Mar 28", status: "Taken down" },
];

// Public verification log — what a customer sees on /id/:handle
export const publicVerificationEvents = [
  { label: "Mobile number verified via WhatsApp", at: "March 2026" },
  { label: "CAC registration confirmed", at: "March 2026", detail: "RC-1924881" },
  { label: "Anti-impersonation monitoring active", at: "Ongoing" },
];

// Merchant menu — surfaced on the public profile so customers don't just
// verify the business, they can also see what's on offer in the same flow.
export interface MerchantProduct {
  id: string;
  name: string;
  price: number;
  unit?: string;
  description: string;
  emoji: string;
  available: boolean;
}
export const merchantProducts: MerchantProduct[] = [
  { id: "p1", name: "Jollof Rice & Chicken", price: 3500, unit: "per plate", description: "Smoky party-style jollof, grilled chicken, fried plantain.", emoji: "🍛", available: true },
  { id: "p2", name: "Egusi Soup & Pounded Yam", price: 4200, unit: "per plate", description: "Rich egusi with assorted meat, soft pounded yam.", emoji: "🥣", available: true },
  { id: "p3", name: "Suya Platter", price: 5500, unit: "serves 2", description: "Spicy beef suya with onions, tomatoes and yaji.", emoji: "🍢", available: true },
  { id: "p4", name: "Small Chops Bowl", price: 6000, unit: "20 pieces", description: "Puff-puff, samosa, spring rolls, peppered gizzard.", emoji: "🥟", available: true },
  { id: "p5", name: "Weekend Party Tray", price: 45000, unit: "feeds 25", description: "Custom tray — message us 24h ahead.", emoji: "🎉", available: false },
];

// Public socials — verified contact channels shown on the profile tab.
export interface MerchantSocial {
  platform: "WhatsApp" | "Instagram" | "Facebook" | "TikTok" | "Website";
  handle: string;
  url: string;
  verified: boolean;
}
export const merchantSocials: MerchantSocial[] = [
  { platform: "WhatsApp", handle: "+234 803 421 0099", url: "https://wa.me/2348034210099", verified: true },
  { platform: "Instagram", handle: "@mamaskitchen.lagos", url: "https://instagram.com/mamaskitchen.lagos", verified: true },
  { platform: "Facebook", handle: "Mama's Kitchen Lagos", url: "https://facebook.com/mamaskitchenlagos", verified: true },
  { platform: "TikTok", handle: "@mamaskitchen", url: "https://tiktok.com/@mamaskitchen", verified: false },
  { platform: "Website", handle: "mamaskitchen.ng", url: "https://mamaskitchen.ng", verified: true },
];

export const merchantBio =
  "Home-style Nigerian cooking out of Lekki Phase 1. Family-run since 2019. Daily lunch delivery + weekend party trays. Order on WhatsApp before 10am for same-day delivery.";

export const merchantHours = [
  { day: "Mon – Fri", hours: "10:00 – 21:00" },
  { day: "Saturday", hours: "11:00 – 22:00" },
  { day: "Sunday", hours: "Closed" },
];
