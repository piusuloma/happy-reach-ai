// Shared mock data for the NativeID Automation Engine
export const business = {
  name: "Mama's Kitchen",
  handle: "mamas-kitchen",
  verified: true,
  optedInContacts: 1240,
  totalCustomers: 3186,
};

export type CampaignStatus = "draft" | "scheduled" | "sending" | "completed" | "paused" | "live";
// Unified campaign model. A "campaign" is one message OR a sequence OR a triggered automation.
// What differs is only HOW it starts and WHETHER it has follow-ups.
export type CampaignKind = "one-time" | "sequence" | "triggered";
export interface Campaign {
  id: string;
  name: string;
  type: "broadcast" | "sequence";   // legacy — kept for back-compat
  kind: CampaignKind;                // new unified field
  startCondition: string;            // human readable: "Send now", "Scheduled Sat 10:00", "On: Cart abandoned 1h"
  status: CampaignStatus;
  audience: string;
  reach: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  orders: number;
  optedOut: number;
  scheduledFor?: string;
  steps?: number;
  preview: string;
  updatedAt: string;
}

export const campaigns: Campaign[] = [
  { id: "c1", name: "Weekend menu launch", type: "broadcast", kind: "one-time", startCondition: "Sent now", status: "completed", audience: "All opted-in", reach: 1240, sent: 1240, delivered: 1218, read: 982, replied: 184, orders: 96, optedOut: 4, preview: "Hi {{customer_name}}! Big news — we have a new menu at Mama's Kitchen this weekend.", updatedAt: "2h ago" },
  { id: "c2", name: "Lunch hour flash promo", type: "broadcast", kind: "one-time", startCondition: "Scheduled · Today 12:00", status: "scheduled", audience: "Lagos · Last 30 days", reach: 412, sent: 0, delivered: 0, read: 0, replied: 0, orders: 0, optedOut: 0, scheduledFor: "Today, 12:00", preview: "Beat the queue 🍛 — order in the next hour and skip the wait.", updatedAt: "10m ago" },
  { id: "c3", name: "New jollof drop", type: "sequence", kind: "sequence", startCondition: "Manual · 3-step sequence", status: "sending", audience: "Repeat buyers", reach: 684, sent: 684, delivered: 671, read: 540, replied: 92, orders: 71, optedOut: 2, steps: 3, preview: "Day 0 launch · Day 2 follow-up · Day 5 final w/ 10% off", updatedAt: "Step 2 of 3" },
  { id: "c4", name: "Win-back · 60 day inactive", type: "sequence", kind: "sequence", startCondition: "Manual · 3-step sequence", status: "sending", audience: "No order in 60d", reach: 318, sent: 318, delivered: 311, read: 220, replied: 38, orders: 21, optedOut: 6, steps: 3, preview: "We miss you · Day 3 nudge · Day 7 last call", updatedAt: "Step 1 of 3" },
  { id: "c5", name: "Father's Day pre-order", type: "broadcast", kind: "one-time", startCondition: "Draft", status: "draft", audience: "—", reach: 0, sent: 0, delivered: 0, read: 0, replied: 0, orders: 0, optedOut: 0, preview: "Treat dad this Sunday — pre-order before Friday.", updatedAt: "Yesterday" },
  { id: "c6", name: "Q1 satisfaction NPS", type: "broadcast", kind: "one-time", startCondition: "Sent now", status: "paused", audience: "Last 90 days buyers", reach: 822, sent: 410, delivered: 402, read: 318, replied: 64, orders: 0, optedOut: 3, preview: "Quick favour — how was your last order? Reply 1–5.", updatedAt: "3d ago" },
  { id: "c7", name: "Order confirmation", type: "broadcast", kind: "triggered", startCondition: "On: Order placed · Immediate", status: "live", audience: "Every customer who orders", reach: 1284, sent: 1284, delivered: 1271, read: 1190, replied: 12, orders: 0, optedOut: 1, preview: "Order #{{order_id}} confirmed — ETA 35 mins.", updatedAt: "Always on" },
  { id: "c8", name: "Abandoned cart recovery", type: "broadcast", kind: "triggered", startCondition: "On: Cart inactive 1h", status: "live", audience: "Cart abandoners", reach: 268, sent: 268, delivered: 264, read: 198, replied: 22, orders: 59, optedOut: 1, preview: "You left items in your cart 🛒 Tap to finish your order.", updatedAt: "Always on" },
  { id: "c9", name: "Satisfaction rating", type: "broadcast", kind: "triggered", startCondition: "On: Order delivered · 3h", status: "live", audience: "Delivered customers", reach: 1102, sent: 1102, delivered: 1090, read: 902, replied: 706, orders: 0, optedOut: 2, preview: "How was your order? Reply 1–5 ⭐", updatedAt: "Always on" },
  { id: "c10", name: "Welcome message", type: "broadcast", kind: "triggered", startCondition: "On: First message", status: "live", audience: "New contacts", reach: 412, sent: 412, delivered: 408, read: 388, replied: 156, orders: 38, optedOut: 0, preview: "Welcome to Mama's Kitchen 👋 Reply MENU to see today's specials.", updatedAt: "Always on" },
];

export interface TriggerAutomation {
  id: string;
  key: string;
  name: string;
  description: string;
  delay: string;
  enabled: boolean;
  fired30d: number;
  conv: number; // %
  category: "lifecycle" | "recovery" | "retention" | "ops";
  example: string;
}
export const triggers: TriggerAutomation[] = [
  { id: "t1", key: "welcome", name: "Welcome message", description: "First message or QR scan", delay: "Immediate", enabled: true, fired30d: 412, conv: 38, category: "lifecycle", example: "Welcome to Mama's Kitchen 👋 Reply MENU to see today's specials." },
  { id: "t2", key: "order_confirmation", name: "Order confirmation", description: "Customer places an order", delay: "Immediate", enabled: true, fired30d: 1284, conv: 100, category: "lifecycle", example: "Order #4821 confirmed — 2x Jollof, 1x Plantain. ETA 35 mins." },
  { id: "t3", key: "abandoned_cart", name: "Abandoned cart recovery", description: "Items in cart, no order placed", delay: "1 hour", enabled: true, fired30d: 268, conv: 22, category: "recovery", example: "You left 2 items in your cart 🛒 Tap to finish your order." },
  { id: "t4", key: "satisfaction", name: "Satisfaction rating", description: "Order marked delivered", delay: "3 hours", enabled: true, fired30d: 1102, conv: 64, category: "ops", example: "How was your order? Reply 1–5 ⭐" },
  { id: "t5", key: "offer_expiry", name: "Offer expiry reminder", description: "Active offer expires in 24h", delay: "Immediate", enabled: true, fired30d: 184, conv: 31, category: "retention", example: "⏰ Your 15% off expires tomorrow — use code MAMA15." },
  { id: "t6", key: "comeback", name: "Comeback campaign", description: "No order in X days (you set X)", delay: "Daily check", enabled: false, fired30d: 0, conv: 0, category: "retention", example: "We miss you! Here's 10% off your next order." },
  { id: "t7", key: "slow_product", name: "Slow product boost", description: "Product no orders for 7 days", delay: "24 hours", enabled: false, fired30d: 0, conv: 0, category: "retention", example: "Try our Egusi soup today — 10% off this week only." },
];

export interface Contact {
  id: string;
  name: string;
  phone: string;
  optedIn: boolean;
  lastOrder: string;
  orders: number;
  tags: string[];
  segment: string;
}
export const contacts: Contact[] = [
  { id: "u1", name: "Adaeze O.", phone: "+234 803 ••• 1208", optedIn: true, lastOrder: "2d ago", orders: 14, tags: ["VIP", "Lagos"], segment: "Repeat buyer" },
  { id: "u2", name: "Tunde A.", phone: "+234 805 ••• 4421", optedIn: true, lastOrder: "5d ago", orders: 6, tags: ["Lagos"], segment: "Active" },
  { id: "u3", name: "Chiamaka E.", phone: "+234 802 ••• 9912", optedIn: true, lastOrder: "21d ago", orders: 3, tags: ["Abuja"], segment: "At risk" },
  { id: "u4", name: "Ifeanyi N.", phone: "+234 813 ••• 0034", optedIn: true, lastOrder: "63d ago", orders: 2, tags: ["Win-back"], segment: "Dormant" },
  { id: "u5", name: "Ngozi B.", phone: "+234 706 ••• 2218", optedIn: false, lastOrder: "—", orders: 0, tags: ["No opt-in"], segment: "Cannot message" },
  { id: "u6", name: "Sade L.", phone: "+234 809 ••• 7781", optedIn: true, lastOrder: "1d ago", orders: 22, tags: ["VIP", "Lagos"], segment: "Repeat buyer" },
];

export const segments = [
  { id: "s1", name: "All opted-in", count: 1240 },
  { id: "s2", name: "Repeat buyers (3+ orders)", count: 684 },
  { id: "s3", name: "Lagos · Last 30 days", count: 412 },
  { id: "s4", name: "VIP (10+ orders)", count: 96 },
  { id: "s5", name: "At risk (no order 21–60d)", count: 218 },
  { id: "s6", name: "Dormant (60d+)", count: 318 },
];

// Phase 2 — Chatbot flows
export interface ChatFlow {
  id: string;
  name: string;
  template: string;
  status: "active" | "paused" | "draft";
  trigger: string;
  nodes: number;
  sessions7d: number;
  resolution: number;
  handoffRate: number;
}
export const flows: ChatFlow[] = [
  { id: "f1", name: "Main menu", template: "Main Menu", status: "active", trigger: "Default", nodes: 12, sessions7d: 842, resolution: 71, handoffRate: 14 },
  { id: "f2", name: "FAQ — opening hours & delivery", template: "FAQ Handler", status: "active", trigger: "Keywords: hours, delivery, open", nodes: 8, sessions7d: 318, resolution: 88, handoffRate: 6 },
  { id: "f3", name: "Catering lead qualifier", template: "Lead Qualifier", status: "active", trigger: "Keyword: catering", nodes: 14, sessions7d: 64, resolution: 52, handoffRate: 41 },
  { id: "f4", name: "Reservation booking", template: "Appointment Booking", status: "draft", trigger: "Keyword: book, reserve", nodes: 10, sessions7d: 0, resolution: 0, handoffRate: 0 },
  { id: "f5", name: "Complaint logger", template: "Complaint Logger", status: "active", trigger: "Keywords: complaint, refund", nodes: 7, sessions7d: 22, resolution: 36, handoffRate: 64 },
];

// Inbox / handoff
export interface Conversation {
  id: string;
  customer: string;
  phone: string;
  state: "bot" | "agent" | "queued" | "resolved";
  lastMessage: string;
  unread: number;
  updatedAt: string;
  tag?: "Hot" | "Warm" | "Cold";
  avatar: string;
}
export const conversations: Conversation[] = [
  { id: "k1", customer: "Adaeze O.", phone: "+234 803 ••• 1208", state: "bot", lastMessage: "Bot: Great! How many people are you ordering for?", unread: 0, updatedAt: "now", avatar: "AO" },
  { id: "k2", customer: "Tunde A.", phone: "+234 805 ••• 4421", state: "queued", lastMessage: "Customer: I'd like to speak to someone please", unread: 2, updatedAt: "1m", tag: "Hot", avatar: "TA" },
  { id: "k3", customer: "Chiamaka E.", phone: "+234 802 ••• 9912", state: "agent", lastMessage: "You: I've added the extra plantain to your order.", unread: 0, updatedAt: "3m", avatar: "CE" },
  { id: "k4", customer: "Ifeanyi N.", phone: "+234 813 ••• 0034", state: "bot", lastMessage: "Bot: Reply 1 for menu, 2 for delivery, 3 for an agent", unread: 0, updatedAt: "8m", tag: "Warm", avatar: "IN" },
  { id: "k5", customer: "Sade L.", phone: "+234 809 ••• 7781", state: "resolved", lastMessage: "Bot: Order #4828 confirmed ✅", unread: 0, updatedAt: "1h", avatar: "SL" },
];

// Phase 3 — back in stock
export const stockNotifications = [
  { id: "p1", product: "Smoky jollof — family pack", price: "₦12,500", status: "out_of_stock", waiting: 84, lastRestock: "8 days ago" },
  { id: "p2", product: "Pepper soup mix (250g)", price: "₦3,200", status: "low_stock", waiting: 21, lastRestock: "2 days ago" },
  { id: "p3", product: "Chapman 1L bottle", price: "₦4,800", status: "in_stock", waiting: 0, lastRestock: "today" },
  { id: "p4", product: "Mama's chin chin (500g)", price: "₦2,500", status: "out_of_stock", waiting: 142, lastRestock: "12 days ago" },
];

// Phase 4 — shipment statuses
export const shipmentTemplates = [
  { id: "sh1", status: "Confirmed", message: "✅ Order #{{order_id}} confirmed. We'll let you know when it's on the way.", enabled: true },
  { id: "sh2", status: "Dispatched", message: "📦 Your order #{{order_id}} has been dispatched. Rider: {{rider_name}} ({{rider_phone}}).", enabled: true },
  { id: "sh3", status: "Out for delivery", message: "🛵 Out for delivery! ETA ~25 mins. Track: {{tracking_url}}", enabled: true },
  { id: "sh4", status: "Delivered", message: "🎉 Delivered. Enjoy your meal! We'll ask you to rate it shortly.", enabled: true },
  { id: "sh5", status: "Delayed", message: "⏳ Slight delay on order #{{order_id}}. New ETA: {{new_eta}}. Sorry for the wait.", enabled: false },
];

// API endpoints (Phase 3)
export const apiEndpoints = [
  { method: "POST", path: "/v1/automations/trigger", desc: "Trigger any active automation for a phone number" },
  { method: "POST", path: "/v1/flows/start", desc: "Start a specific chatbot flow for a customer" },
  { method: "POST", path: "/v1/broadcasts/send", desc: "Send a broadcast to a defined segment" },
  { method: "POST", path: "/v1/contacts/opt-in", desc: "Register a contact as opted-in" },
  { method: "GET", path: "/v1/conversations/{id}", desc: "Retrieve a conversation transcript" },
];

// Performance series for charts (last 14 days)
export const messagesSeries = [
  { d: "Apr 8", sent: 380, delivered: 372, read: 280 },
  { d: "Apr 9", sent: 412, delivered: 401, read: 308 },
  { d: "Apr 10", sent: 398, delivered: 388, read: 295 },
  { d: "Apr 11", sent: 510, delivered: 498, read: 402 },
  { d: "Apr 12", sent: 612, delivered: 596, read: 488 },
  { d: "Apr 13", sent: 540, delivered: 528, read: 412 },
  { d: "Apr 14", sent: 488, delivered: 472, read: 360 },
  { d: "Apr 15", sent: 720, delivered: 702, read: 561 },
  { d: "Apr 16", sent: 802, delivered: 781, read: 632 },
  { d: "Apr 17", sent: 690, delivered: 672, read: 530 },
  { d: "Apr 18", sent: 612, delivered: 596, read: 478 },
  { d: "Apr 19", sent: 884, delivered: 860, read: 712 },
  { d: "Apr 20", sent: 760, delivered: 744, read: 598 },
  { d: "Apr 21", sent: 422, delivered: 408, read: 318 },
];
