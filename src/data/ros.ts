// NativeID Restaurant OS — mock data for Esther's single-location prototype.
// All numbers in NGN. Quantities are sane and tell a story (James over-pours beer).

export type Unit = "g" | "kg" | "ml" | "L" | "bottle" | "piece";

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  costPerUnit: number; // NGN per base unit
  expected: number;    // expected stock at start of day, in base unit
  actual: number;      // last counted stock; if null we haven't counted
  emoji: string;
}

export interface Recipe {
  itemId: string;
  name: string;
  emoji: string;
  price: number;
  category: "Mains" | "Drinks" | "Sides" | "Sweets";
  components: { ingredientId: string; qty: number }[]; // qty in ingredient base unit
  soldToday: number;
}

export type Shift = "Lunch" | "Dinner" | "Night";

export interface StaffMember {
  id: string;
  name: string;
  role: "Bartender" | "Chef" | "Waiter" | "Cashier" | "Manager";
  shift: Shift;
  onDuty: boolean;
  variancesThisWeek: number;
  clockedInAt?: string;
  photo?: string;
}

export interface Variance {
  id: string;
  ingredientId: string;
  ingredientName: string;
  qty: number;          // negative = missing
  unit: Unit;
  valueNgn: number;     // absolute NGN impact
  shift: Shift;
  staffId?: string;
  pattern?: string;     // human-readable note
  status: "open" | "investigating" | "resolved";
  detectedAt: string;
}

export interface ShiftCash {
  shift: Shift;
  cashier: string;
  expected: number;
  actual?: number;
  closedAt?: string;
}

// ── Ingredients (ground truth for recipe deduction) ──────────────────────────
export const ingredients: Ingredient[] = [
  { id: "chicken",  name: "Chicken",     unit: "kg",     costPerUnit: 4500, expected: 25,   actual: 23,   emoji: "🍗" },
  { id: "rice",     name: "Rice",        unit: "kg",     costPerUnit: 1800, expected: 30,   actual: 30,   emoji: "🍚" },
  { id: "oil",      name: "Palm oil",    unit: "L",      costPerUnit: 2000, expected: 8,    actual: 7.5,  emoji: "🫒" },
  { id: "beef",     name: "Beef",        unit: "kg",     costPerUnit: 6000, expected: 12,   actual: 12,   emoji: "🥩" },
  { id: "beer",     name: "Beer",        unit: "bottle", costPerUnit: 800,  expected: 60,   actual: 57,   emoji: "🍺" },
  { id: "coke",     name: "Coke",        unit: "bottle", costPerUnit: 350,  expected: 80,   actual: 80,   emoji: "🥤" },
  { id: "pepper",   name: "Pepper mix",  unit: "kg",     costPerUnit: 2200, expected: 4,    actual: 4,    emoji: "🌶️" },
  { id: "plantain", name: "Plantain",    unit: "piece",  costPerUnit: 250,  expected: 40,   actual: 38,   emoji: "🍌" },
];

// ── Recipes (tied to ingredients) ────────────────────────────────────────────
export const recipes: Recipe[] = [
  { itemId: "jollof",   name: "Jollof Rice + Chicken", emoji: "🍛", price: 3500, category: "Mains",
    components: [{ ingredientId: "chicken", qty: 0.2 }, { ingredientId: "rice", qty: 0.15 }, { ingredientId: "oil", qty: 0.1 }],
    soldToday: 42 },
  { itemId: "pepper",   name: "Pepper Soup",           emoji: "🍲", price: 4000, category: "Mains",
    components: [{ ingredientId: "beef", qty: 0.25 }, { ingredientId: "pepper", qty: 0.02 }],
    soldToday: 18 },
  { itemId: "suya",     name: "Beef Suya",             emoji: "🍢", price: 2000, category: "Sides",
    components: [{ ingredientId: "beef", qty: 0.15 }, { ingredientId: "pepper", qty: 0.01 }],
    soldToday: 22 },
  { itemId: "plantain", name: "Fried Plantain",        emoji: "🍌", price: 1500, category: "Sides",
    components: [{ ingredientId: "plantain", qty: 2 }, { ingredientId: "oil", qty: 0.05 }],
    soldToday: 16 },
  { itemId: "beer",     name: "Beer (bottle)",         emoji: "🍺", price: 1000, category: "Drinks",
    components: [{ ingredientId: "beer", qty: 1 }],
    soldToday: 30 },
  { itemId: "coke",     name: "Coke (bottle)",         emoji: "🥤", price: 500,  category: "Drinks",
    components: [{ ingredientId: "coke", qty: 1 }],
    soldToday: 48 },
];

// ── Staff ────────────────────────────────────────────────────────────────────
export const staff: StaffMember[] = [
  { id: "james",  name: "James Okafor",   role: "Bartender", shift: "Dinner", onDuty: true,  variancesThisWeek: 4, clockedInAt: "5:02 PM" },
  { id: "mary",   name: "Mary Adesina",   role: "Chef",      shift: "Dinner", onDuty: true,  variancesThisWeek: 2, clockedInAt: "4:55 PM" },
  { id: "ahmed",  name: "Ahmed Bello",    role: "Waiter",    shift: "Dinner", onDuty: true,  variancesThisWeek: 0, clockedInAt: "5:00 PM" },
  { id: "ngozi",  name: "Ngozi Eze",      role: "Cashier",   shift: "Dinner", onDuty: true,  variancesThisWeek: 1, clockedInAt: "4:48 PM" },
  { id: "tunde",  name: "Tunde Bakare",   role: "Waiter",    shift: "Lunch",  onDuty: false, variancesThisWeek: 0 },
  { id: "esther", name: "Esther (you)",   role: "Manager",   shift: "Dinner", onDuty: true,  variancesThisWeek: 0, clockedInAt: "9:00 AM" },
];

// ── Today's variances ────────────────────────────────────────────────────────
export const variances: Variance[] = [
  { id: "v1", ingredientId: "beer", ingredientName: "Beer", qty: -3, unit: "bottle", valueNgn: 2400,
    shift: "Dinner", staffId: "james", pattern: "James — over-pouring pattern (4th this week)",
    status: "open", detectedAt: "8:42 PM" },
  { id: "v2", ingredientId: "chicken", ingredientName: "Chicken", qty: -2, unit: "kg", valueNgn: 9000,
    shift: "Dinner", staffId: "mary", pattern: "Portion size drift on Jollof",
    status: "open", detectedAt: "9:10 PM" },
  { id: "v3", ingredientId: "oil", ingredientName: "Palm oil", qty: -0.5, unit: "L", valueNgn: 1000,
    shift: "Dinner", pattern: "Likely measurement, low priority",
    status: "investigating", detectedAt: "9:15 PM" },
];

// ── Sales + cash ─────────────────────────────────────────────────────────────
export const today = {
  date: "Thursday, May 14",
  salesNgn: recipes.reduce((s, r) => s + r.soldToday * r.price, 0), // computed
  refundsNgn: 5_000,
  expensesNgn: 12_000,
  cashOnHandNgn: 0, // set below
};
today.cashOnHandNgn = today.salesNgn - today.refundsNgn - today.expensesNgn - 1500; // ₦1,500 short

export const expectedCashNgn = today.salesNgn - today.refundsNgn - today.expensesNgn;
export const cashShortageNgn = expectedCashNgn - today.cashOnHandNgn;

export const shifts: ShiftCash[] = [
  { shift: "Lunch",  cashier: "Tunde",  expected: 145_000, actual: 145_000, closedAt: "4:30 PM" },
  { shift: "Dinner", cashier: "Ngozi",  expected: expectedCashNgn - 145_000, actual: undefined },
];

// ── Weekly trend (for reports) ───────────────────────────────────────────────
export const weeklyVarianceTrend = [
  { day: "Fri", value: 8200 },
  { day: "Sat", value: 11500 },
  { day: "Sun", value: 6800 },
  { day: "Mon", value: 9200 },
  { day: "Tue", value: 7400 },
  { day: "Wed", value: 5100 },
  { day: "Thu", value: variances.reduce((s, v) => s + v.valueNgn, 0) },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export function ingredient(id: string) {
  return ingredients.find((i) => i.id === id)!;
}
export function staffById(id?: string) {
  return id ? staff.find((s) => s.id === id) : undefined;
}
export function totalVarianceNgn() {
  return variances.reduce((s, v) => s + v.valueNgn, 0);
}
export function formatNgn(n: number) {
  return "₦" + Math.round(n).toLocaleString();
}
