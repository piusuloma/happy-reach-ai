## Read

You want ROS kept **separate** from the existing Identity + Automation app — a different file tree, its own shell, its own theme. Same project (one Lovable app, one deploy), but you can browse it without ROS bleeding into the merchant dashboard, and vice versa.

## Structure

```
src/
├─ data/
│  ├─ identity.ts          (existing, untouched)
│  ├─ mock.ts              (existing automation, untouched)
│  └─ ros.ts               NEW — recipes, variances, cash, staff, shifts
│
├─ components/
│  ├─ identity/            (existing)
│  └─ ros/                 NEW — AlertBanner, StatBox, VarianceRow,
│                                CashKeypad, RecipeCard, RosLayout, RosSidebar
│
└─ pages/
   ├─ identity/, auth/     (existing)
   └─ ros/                 NEW
      ├─ Today.tsx
      ├─ Inventory.tsx
      ├─ Variances.tsx
      ├─ VarianceDetail.tsx
      ├─ Cash.tsx
      ├─ Staff.tsx
      └─ Reports.tsx
```

`App.tsx` gets one new route group `/ros/*` that mounts `RosLayout` (its own sidebar, its own header). Nothing in the existing Automation/Identity sidebars links to ROS. The only crossover: ROS reports show a small "Verified by NativeID" footer using the existing identity data — pure read, no coupling.

## Theme isolation

ROS uses its own scoped tokens in `index.css` so it looks operational/serious (teal/red/amber per the brief), without altering the Identity emerald palette:

```
.ros-scope {
  --primary: 168 75% 25%;   /* #0F6E56 teal */
  --destructive: 0 56% 41%; /* #A32D2D */
  --success: 88 71% 25%;    /* #3B6D11 */
  --warning: 31 76% 41%;    /* #BA7517 */
}
```

`RosLayout` wraps everything in `<div className="ros-scope">`, so every Tailwind semantic class inside ROS resolves to ROS colors. Identity/Automation are untouched.

## Phase A — what I'll build now

Esther's single-location manager experience, web (laptop + tablet responsive). Seven screens:

| Route | Screen |
|---|---|
| `/ros` | **Today** — alerts banner, sales / cash / variances stat row, quick actions, today's variances list |
| `/ros/inventory` | Recipe-driven stock list + "Count item" modal with live variance math |
| `/ros/variances` | All open variances |
| `/ros/variances/:id` | Drill-down: by shift, by staff, pattern detection, action buttons |
| `/ros/cash` | End-of-shift reconciliation: expected vs actual, large numpad, shortage detection |
| `/ros/staff` | Roster, on-shift, clock-in log, per-staff variance count |
| `/ros/reports` | Daily/weekly summary, variance trend |

Mock data in `src/data/ros.ts`:
- 8–10 menu items with recipes (Jollof Rice = 200g chicken + 150g rice + 100ml oil…)
- Today's sales totals, expected vs actual cash, 3 live variances
- 6 staff with roles, shifts, variance history — including a "Bartender James over-pouring" pattern so drill-down tells a story

## Phase B / C (later, only when you say go)

- **B** — Kunle: `/ros/locations`, location detail, `/ros/transfers`
- **C** — POS terminal simulator at `/ros/pos` (landscape menu grid + order pane + payment)

## Entry point

ROS is reachable at `/ros` directly. I won't add it to the existing sidebar. If later you want a launcher (e.g. account switcher → "Open Restaurant OS"), that's a one-line addition.

Proceeding with Phase A as above.
