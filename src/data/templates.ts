/**
 * Pre-filled message templates for the Automations engine.
 *
 * The merchant never picks a "template" directly. Instead, picking an audience
 * (broadcast mode) or a trigger event (automated mode) on step 2 of the
 * NewAutomation wizard *is* the template selection. Each (category × mode ×
 * audience-or-trigger) tuple resolves to one template, with a sensible
 * fallback to the generic "other" category when the merchant's category has
 * no specific copy.
 *
 * Every template carries the first message AND its single follow-up so a
 * merchant picks one option and the entire two-message flow is loaded.
 *
 * The {{menu_link}} token resolves at send-time to the merchant's public
 * NativeID profile (e.g. nativeid.io/mamas-kitchen). Templates link to that
 * profile rather than asking customers to type a keyword like "MENU" — taps
 * convert better than typing.
 */

export type TemplateMode = "campaign" | "trigger";

export type TemplateCategory =
  | "food"
  | "fashion"
  | "electronics"
  | "services"
  | "logistics"
  | "health"
  | "other";

export interface TemplateFollowUp {
  /** Human-readable delay key — see FOLLOWUP_LABELS in NewAutomation. */
  delay: string;
  message: string;
}

export interface MessageTemplate {
  category: TemplateCategory;
  mode: TemplateMode;
  /** Required when mode = "campaign" — matches segments.id in mock.ts. */
  audienceId?: string;
  /** Required when mode = "trigger" — matches a TRIGGERS.id in NewAutomation. */
  triggerId?: string;
  initial: string;
  followUp: TemplateFollowUp;
}

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  food: "Food & Beverage",
  fashion: "Fashion & Beauty",
  electronics: "Electronics",
  services: "Services",
  logistics: "Logistics",
  health: "Health",
  other: "Other",
};

/**
 * Map the signup-time category label back to a TemplateCategory. Single
 * source of truth for the mapping.
 */
export function categoryFromLabel(label: string): TemplateCategory {
  const l = label.toLowerCase();
  if (l.includes("food") || l.includes("beverage")) return "food";
  if (l.includes("fashion") || l.includes("beauty")) return "fashion";
  if (l.includes("electronic")) return "electronics";
  if (l.includes("service")) return "services";
  if (l.includes("logistic") || l.includes("shipping")) return "logistics";
  if (l.includes("health")) return "health";
  return "other";
}

/* ──────────────────────────────────────────────────────────────────────
 * Food & Beverage — full coverage (6 audiences + 6 triggers)
 * ────────────────────────────────────────────────────────────────────── */

const food: MessageTemplate[] = [
  // ── Broadcast / audiences ─────────────────────────────────────────
  {
    category: "food", mode: "campaign", audienceId: "s1",
    initial:
      "Hi {{customer_name}} 🍛 Today's menu at {{business_name}} is live — smoky jollof, peppered chicken, fresh palm wine. Tap to order: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, kitchen is still warm 😋 Today's plates haven't sold out yet — see what's left at {{menu_link}}",
    },
  },
  {
    category: "food", mode: "campaign", audienceId: "s2",
    initial:
      "Hi {{customer_name}} ⭐ As one of our regulars at {{business_name}}, you get first dibs on this week's specials. Have a look: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, holding your usual spot 💚 Tap {{menu_link}} and we'll get your order moving the moment you order.",
    },
  },
  {
    category: "food", mode: "campaign", audienceId: "s3",
    initial:
      "Hey {{customer_name}} 🍲 Loved having you recently — there's something new on the {{business_name}} menu we think you'll like. Check it out: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, the new dish is going fast 🔥 Tap {{menu_link}} to grab yours while it's still on today.",
    },
  },
  {
    category: "food", mode: "campaign", audienceId: "s4",
    initial:
      "Hi {{customer_name}} 👑 VIP-only menu drop at {{business_name}} this week — limited plates, early access just for you. See it here: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, opens to the public tomorrow 🕐 Lock yours in tonight at {{menu_link}}.",
    },
  },
  {
    category: "food", mode: "campaign", audienceId: "s5",
    initial:
      "Hey {{customer_name}} 👋 Been a few weeks — we're saving 10% off your next plate at {{business_name}}. Pick what you fancy: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, your 10% off expires soon ⏰ Tap {{menu_link}} today and we'll have it ready for you.",
    },
  },
  {
    category: "food", mode: "campaign", audienceId: "s6",
    initial:
      "Hi {{customer_name}} 💚 We genuinely miss you at {{business_name}}. New menu, same kitchen. Take a look whenever — {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, holding 10% off for you at {{business_name}}. No rush — when you're ready, {{menu_link}} is here.",
    },
  },

  // ── Trigger events ────────────────────────────────────────────────
  {
    category: "food", mode: "trigger", triggerId: "order_placed",
    initial:
      "✅ Order #{{order_id}} confirmed at {{business_name}}, {{customer_name}}! ETA 35 mins. Track or add more: {{menu_link}}",
    followUp: { delay: "3h", message:
      "{{customer_name}}, how was your meal from {{business_name}}? ⭐ Reply 1–5 so we know how we did.",
    },
  },
  {
    category: "food", mode: "trigger", triggerId: "abandoned_cart",
    initial:
      "Hi {{customer_name}} 🛒 You left a plate in your cart at {{business_name}}. Finish your order before kitchen closes: {{menu_link}}",
    followUp: { delay: "3h", message:
      "Last call, {{customer_name}} 🔔 Cart's about to expire. Tap {{menu_link}} and we'll hold it for 30 more minutes.",
    },
  },
  {
    category: "food", mode: "trigger", triggerId: "delivered",
    initial:
      "🎉 Delivered! Hope you're enjoying it {{customer_name}}. Reply 1–5 so we know how we did — and the next round is here whenever: {{menu_link}}",
    followUp: { delay: "3h", message:
      "{{customer_name}}, a quick 1–5 rating really helps {{business_name}} 🙏 Takes one tap.",
    },
  },
  {
    category: "food", mode: "trigger", triggerId: "welcome",
    initial:
      "Welcome to {{business_name}} 👋 Today's menu is live at {{menu_link}}. Tap, pick, eat — we deliver across Lagos.",
    followUp: { delay: "3h", message:
      "Hey {{customer_name}} 🌟 Got any questions before you order? Or just take a look — {{menu_link}}",
    },
  },
  {
    category: "food", mode: "trigger", triggerId: "offer_expiry",
    initial:
      "⏰ Your offer at {{business_name}} expires tomorrow {{customer_name}}. Use it before it's gone: {{menu_link}}",
    followUp: { delay: "3h", message:
      "{{customer_name}}, last few hours on your offer ⏳ {{menu_link}} — one tap and we'll handle the rest.",
    },
  },
  {
    category: "food", mode: "trigger", triggerId: "comeback",
    initial:
      "Hi {{customer_name}} 💚 We've missed you at {{business_name}} — here's 10% off your next plate. Take a look: {{menu_link}}",
    followUp: { delay: "3h", message:
      "{{customer_name}}, your 10% off is ready when you are. Tap {{menu_link}} whenever the craving hits.",
    },
  },
];

/* ──────────────────────────────────────────────────────────────────────
 * Generic "Other" — fallback set used when the merchant's category has no
 * specific copy for the chosen audience or trigger.
 * ────────────────────────────────────────────────────────────────────── */

const other: MessageTemplate[] = [
  // Broadcast / audiences
  {
    category: "other", mode: "campaign", audienceId: "s1",
    initial:
      "Hi {{customer_name}} 👋 Quick update from {{business_name}} — see what's new: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, didn't want you to miss this one 🙌 Have a look at {{menu_link}} when you get a sec.",
    },
  },
  {
    category: "other", mode: "campaign", audienceId: "s2",
    initial:
      "Hi {{customer_name}} ⭐ As one of our best customers at {{business_name}}, you get first access. Take a look: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, holding your spot 💚 {{menu_link}} — just tap when you're ready.",
    },
  },
  {
    category: "other", mode: "campaign", audienceId: "s3",
    initial:
      "Hey {{customer_name}} 🌟 Loved having you recently — something new from {{business_name}} we think you'll like. {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, going fast 🔥 Have a look at {{menu_link}} while it's still up.",
    },
  },
  {
    category: "other", mode: "campaign", audienceId: "s4",
    initial:
      "Hi {{customer_name}} 👑 VIP early access at {{business_name}} — limited spots, just for you. {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, opens to the public tomorrow 🕐 Lock yours in at {{menu_link}}.",
    },
  },
  {
    category: "other", mode: "campaign", audienceId: "s5",
    initial:
      "Hey {{customer_name}} 👋 Been a while — saving 10% off your next order at {{business_name}}: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, your 10% expires soon ⏰ Tap {{menu_link}} today.",
    },
  },
  {
    category: "other", mode: "campaign", audienceId: "s6",
    initial:
      "Hi {{customer_name}} 💚 We miss you at {{business_name}}. No pressure — just letting you know we're still here: {{menu_link}}",
    followUp: { delay: "2", message:
      "{{customer_name}}, holding 10% off for whenever you're ready 🙏 {{menu_link}}",
    },
  },

  // Trigger events
  {
    category: "other", mode: "trigger", triggerId: "order_placed",
    initial:
      "✅ Order #{{order_id}} confirmed {{customer_name}} — thanks for choosing {{business_name}}. Track it here: {{menu_link}}",
    followUp: { delay: "3h", message:
      "{{customer_name}}, how was your order from {{business_name}}? ⭐ Reply 1–5 to let us know.",
    },
  },
  {
    category: "other", mode: "trigger", triggerId: "abandoned_cart",
    initial:
      "Hi {{customer_name}} 🛒 You left items in your cart at {{business_name}}. Finish checkout: {{menu_link}}",
    followUp: { delay: "3h", message:
      "Last call, {{customer_name}} 🔔 Your cart is about to expire — {{menu_link}}",
    },
  },
  {
    category: "other", mode: "trigger", triggerId: "delivered",
    initial:
      "🎉 Delivered! Hope you're happy with your order {{customer_name}}. Rate us 1–5 — and the next round is at {{menu_link}}",
    followUp: { delay: "3h", message:
      "{{customer_name}}, a quick 1–5 rating helps {{business_name}} a lot 🙏",
    },
  },
  {
    category: "other", mode: "trigger", triggerId: "welcome",
    initial:
      "Welcome to {{business_name}} 👋 Take a look around: {{menu_link}}. Reply anytime — a real person is on the other side.",
    followUp: { delay: "3h", message:
      "Hey {{customer_name}} 🌟 Found what you were looking for? {{menu_link}}",
    },
  },
  {
    category: "other", mode: "trigger", triggerId: "offer_expiry",
    initial:
      "⏰ Your offer at {{business_name}} expires tomorrow {{customer_name}}. Use it: {{menu_link}}",
    followUp: { delay: "3h", message:
      "{{customer_name}}, last few hours on your offer ⏳ {{menu_link}}",
    },
  },
  {
    category: "other", mode: "trigger", triggerId: "comeback",
    initial:
      "Hi {{customer_name}} 💚 Missing you at {{business_name}} — here's 10% off your next order: {{menu_link}}",
    followUp: { delay: "3h", message:
      "{{customer_name}}, your 10% is ready when you are. {{menu_link}}",
    },
  },
];

const allTemplates: MessageTemplate[] = [...food, ...other];

/**
 * Resolve a template for the merchant's category, the chosen mode, and the
 * picked context id (audienceId for broadcasts, triggerId for triggers).
 *
 * Falls back to the "other" category when the merchant's category has no
 * specific copy for that context. Returns null if even the fallback has no
 * entry — the caller should handle this by leaving the editor blank.
 */
export function templateFor(
  category: TemplateCategory,
  mode: TemplateMode,
  contextId: string,
): MessageTemplate | null {
  const matches = (t: MessageTemplate, cat: TemplateCategory) =>
    t.category === cat &&
    t.mode === mode &&
    (mode === "campaign" ? t.audienceId === contextId : t.triggerId === contextId);

  return (
    allTemplates.find((t) => matches(t, category)) ??
    allTemplates.find((t) => matches(t, "other")) ??
    null
  );
}
