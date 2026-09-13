# CampusFlow — Design Brief

**Version:** 1.0 · **Date:** 2026-09-08 · **Scope:** MVP (portfolio build)
**Source:** `PRD.md` · **Stack:** React + Tailwind CSS, client-side storage only (no backend)

---

## 1. Design Thesis

The PRD's core insight is that existing tools *list* tasks but don't *direct* students. So the entire design is organized around one question the student asks every time they open the app:

> **"What should I do right now?"**

Three principles follow from that:

| # | Principle | Practical meaning |
|---|---|---|
| **P1** | **Answer first, list second** | The top of the home screen is a single recommended task, not a backlog. The list is the fallback, not the hero. |
| **P2** | **Explain the ranking** | Every prioritized item shows *why* it ranks there ("Due in 6h · High priority"). An unexplained algorithm is an untrusted one. |
| **P3** | **Low-stimulus by default** | This is a deadline app for stressed users. Calm surfaces, restrained color, urgency reserved for genuinely urgent things. No red everywhere. |

**Design anti-goals (explicitly not doing):** gamification/streaks, social comparison, notification nags, dashboard analytics, drag-everything interfaces.

---

## 2. Priority Model (the design core)

Priority is the product. It must be deterministic, explainable, and testable.

### 2.1 Inputs

- **`importance`** — user-set at creation: `High = 3`, `Medium = 2`, `Low = 1`
- **`urgency`** — derived from `dueAt` relative to *now*

### 2.2 Urgency bands

| Band | Rule | Score | Label shown | Token |
|---|---|---|---|---|
| `overdue` | `dueAt < now` | 5 | "Overdue by 3h" | `urgent.overdue` |
| `critical` | 0 – 24h | 4 | "Due today, 5:00 PM" | `urgent.critical` |
| `soon` | 24 – 72h | 3 | "Due tomorrow" / "Due in 2 days" | `urgent.soon` |
| `upcoming` | 3 – 7 days | 2 | "Due Thu" | `urgent.upcoming` |
| `later` | > 7 days | 1 | "Due Sep 28" | `urgent.later` |
| `unscheduled` | no `dueAt` | 0 | "No due date" | `neutral.400` |

### 2.3 Composite score

```
score = (urgency × 2) + importance        // range 2–13 for dated tasks
```

**Tiebreakers, in order:** earlier `dueAt` → higher `importance` → older `createdAt`.

**Hard rule (PRD edge case):** `unscheduled` tasks sort **below every dated task regardless of importance.** They remain fully visible and actionable in their own collapsed group — deprioritized, never hidden.

### 2.4 Conflict detection (PRD edge case)

A **clash** is flagged when either:
- 2+ tasks are due within the same **6-hour window**, or
- 3+ tasks are due on the same **calendar day**

Clashes surface as a `ClashWarning` on the Dashboard and a `⚠` marker on the affected Week cells. Resolution CTA: *"Reschedule one"* → opens the Task Editor with the date field focused.

### 2.5 Scannability at 50+ tasks (PRD edge case)

- Group by urgency band with **sticky headers** carrying live counts
- `Completed` and `Unscheduled` groups **collapsed by default**
- **Virtualize** the list above 30 rendered rows
- **Density toggle:** Comfortable (56px rows) / Compact (36px rows)
- "Next Up" queue caps at **5 visible**; remainder behind *"Show full queue (18)"*

---

## 3. User Flows

### F1 · First run → productive dashboard
```
Land on /  →  storage empty?
  ├─ YES → S1 Onboarding
  │         1. Name (optional, skippable)
  │         2. Add 2–4 courses (name + code + color)
  │         3. Choice: "Load sample week" | "Start empty"
  │         → S2 Dashboard
  └─ NO  → S2 Dashboard (hydrated)
```
*Design note:* onboarding must be completable in **under 60 seconds** and every step skippable. Sample data is the single highest-leverage choice — an empty dashboard teaches nothing.

### F2 · Add a task (two paths)
```
QUICK (default, ~4s)                FULL (~20s)
Press [N] or click [+ New]          [+ New] → "More details"
→ QuickAddBar focuses               → S6 Task Editor (modal/drawer)
→ type "cs201 worksheet fri 5pm"    → Title, Course, Date, Time,
→ parsed inline, chips preview         Priority, Notes, Estimated effort
→ [Enter] saves                     → [Save task]
→ UndoToast + row animates into
  the correct band
```
Natural-language date parsing in Quick Add is **nice-to-have, not MVP-blocking** — ship with explicit chips + date picker if parsing slips.

### F3 · "What do I do next?" (the primary loop)
```
Open app → S2 → read NextUpCard
  ├─ [Start]    → marks in-progress, card holds position
  ├─ [✓ Done]   → CelebrationBurst, card exits, queue advances,
  │                next task slides up (animated, 320ms)
  ├─ [Snooze ▾] → +1h / +3h / Tomorrow 9am / Pick date
  └─ [Not now]  → demote to bottom of queue for this session only
```
*Critical:* completing a task must feel **instant**. Optimistic update, no spinner, write to storage after paint.

### F4 · Plan the week
```
S3 Week View → scan density strip → spot ⚠ clash
  → click a task → S7 Task Detail drawer
  → [Reschedule] → date picker → save
  → cell re-renders, clash badge clears
```

### F5 · Focus one course
```
Sidebar course chip  ─┐
FilterBar on S4      ─┼→ filtered view, course color applied to page accent
Deep link /c/cs201   ─┘    "Clear filter" always visible
```

### F6 · Delete + undo (PRD edge case)
```
[Delete] → ConfirmDialog ONLY if task has notes or is overdue
        → otherwise delete immediately + UndoToast (8s, pauses on hover/focus)
        → [Undo] restores exact prior state incl. position
```
*Deliberate:* no confirmation on the common path. Confirmation fatigue trains users to click through blindly; a reliable undo is both faster and safer.

### F7 · Recover an overdue task
```
Overdue band (red-tinted, max 1 visible + "N more")
  → each row offers [Done] [Reschedule] — never a bare "overdue" label
  → rescheduling clears the band immediately
```
*Design stance:* overdue is a **rescheduling prompt**, not a shame state. No streak-breaking language, no accumulating counters.

---

## 4. Screen Inventory

| ID | Screen | Route | Priority | Notes |
|---|---|---|---|---|
| **S1** | Onboarding | `/welcome` | P0 | 3 steps, all skippable |
| **S2** | Dashboard | `/` | P0 | The product. Next Up + queue + week strip |
| **S3** | Week View | `/week` | P0 | 7-day grid + list toggle |
| **S4** | All Tasks | `/tasks` | P0 | Filterable, sortable, grouped list |
| **S5** | Course Detail | `/courses/[id]` | P1 | Course tasks + stats |
| **S6** | Task Editor | modal/drawer | P0 | Create **and** edit, one component |
| **S7** | Task Detail | drawer | P1 | Read view + actions; collapses into S6 on mobile |
| **S8** | Settings | `/settings` | P1 | Courses, appearance, data |
| **S9** | Courses Index | `/courses` | P2 | Fold into S8 sidebar section if time-constrained |

**Overlays (not screens):** QuickAddBar, CommandPalette *(optional, P2)*, ConfirmDialog, UndoToast, ShortcutHelpSheet (`?`).

**Deliberately absent** (PRD out-of-scope): login/auth, notifications center, analytics dashboard, integrations settings, sync/conflict UI, collaboration.

---

## 5. Layouts

### 5.1 Global shell

**Desktop ≥1024px** — persistent left rail (240px, collapsible to 64px icon rail):
```
┌────────────────────────────────────────────────────────────────┐
│ ◈ CampusFlow     [Search tasks…            ⌘K]    [+ New]  ◐  │
├──────────┬─────────────────────────────────────────────────────┤
│ HOME     │                                                     │
│ ⌂ Dashboard│                                                 │
│ ▦ Week   │                  <screen content>                   │
│ ☰ Tasks  │                                                     │
│          │                                                     │
│ COURSES  │                                                     │
│ ▣ CS201 3│                                                     │
│ ▣ MA110 2│                                                     │
│ ▣ EN105 1│                                                     │
│ + Add    │                                                     │
│          │                                                     │
│ ⚙ Settings│                                                    │
└──────────┴─────────────────────────────────────────────────────┘
```

**Mobile <768px** — bottom tab bar, 5 slots, center FAB:
```
┌──────────────────────────┐
│  <screen content>        │
│                          │
│                          │
├────┬────┬────┬────┬──────┤
│ ⌂  │ ▦  │ (+)│ ☰  │ ⚙   │
│Home│Week│New │Task│ More │
└────┴────┴────┴────┴──────┘
```
FAB is 56×56, raised 8px above the bar, `brand.600` fill, persistent on every screen (the fastest path to F2).

---

### 5.2 S2 · Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│  Good evening, Sam                        Tue 8 Sep · Week 37     │
│                                                                   │
│  ┌─ NEXT UP ─────────────────────────────────────────────────┐   │
│  │ ▣ CS201 · Data Structures                                 │   │
│  │ Binary tree worksheet                                     │   │
│  │ 🔴 Due today, 5:00 PM  (in 6h)  ·  High priority          │   │
│  │                                                           │   │
│  │ [ ✓ Done ]  [ Start ]  [ Snooze ▾ ]  [ ⋯ ]               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ⚠ 2 deadlines clash on Wed evening        [Reschedule one →]     │
│                                                                   │
│  ┌─ QUEUE ──────────────┐  ┌─ THIS WEEK ──────────────────────┐  │
│  │ 2 ▣MA110 Problem set 6│  │ deadlines/day                   │  │
│  │   Wed 11:59 PM · Med  │  │ ▁ ▃ ▅ ▂ ▁ ▇ ▁                   │  │
│  │ 3 ▣EN105 Essay draft  │  │ M T W T F S S                   │  │
│  │   Thu 9:00 AM · High  │  │                                 │  │
│  │ 4 ▣PH220 Lab report   │  │ Tue ▸ 1 due                     │  │
│  │   Fri 5:00 PM · Low   │  │ Wed ▸ 3 due  ⚠                  │  │
│  │ Show full queue (18)  │  │ Fri ▸ 1 due                     │  │
│  └──────────────────────┘  │ [Open Week View →]                │  │
│                            └─────────────────────────────────┘  │
│  ▸ Overdue (2)   ▸ Unscheduled (5)   ▸ Completed today (3)      │
└──────────────────────────────────────────────────────────────────┘
```

**Layout rules**
- `NextUpCard` is **always full-width and visually heaviest** — 2xl type, elevated card, generous padding. Nothing competes with it.
- Two-column below at ≥1024px (queue 60% / week 40%); single column stacked below, queue first.
- Collapsible bands (`Overdue`, `Unscheduled`, `Completed today`) live at the page bottom as disclosure rows — present, not prominent.
- Greeting is time-of-day aware; week number gives semester orientation.

---

### 5.3 S3 · Week View

```
┌──────────────────────────────────────────────────────────────────┐
│ ‹ ›  Week of Sep 8 – 14        [Week] [List]     [+ New]  ⚠ 1    │
│                                                                   │
│ deadlines  ▁ ▃ ▅ ▂ ▁ ▇ ▁      ← DeadlineDensityStrip (clickable)│
│            M T W T F S S                                          │
├────────┬────────┬────────┬────────┬────────┬────────┬────────────┤
│ MON 8  │ TUE 9  │ WED 10 │ THU 11 │ FRI 12 │ SAT 13 │ SUN 14     │
│        │ ●today │        │        │        │        │            │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────┤
│▣CS201  │        │▣MA110  │▣EN105  │        │        │            │
│Bin.tree│▣PH220  │Prob.s6 │Essay   │▣CS201  │        │            │
│5:00 PM │Lab rpt │11:59 PM│draft   │Quiz    │        │            │
│        │2:00 PM │▣CS201 ⚠│9:00 AM│5:00 PM │        │            │
│        │▣MA110  │Quiz    │        │        │        │            │
│        │Tute    │6:00 PM │        │        │        │            │
│        │4:00 PM │        │        │        │        │            │
│        │        │        │        │        │        │            │
│ + add  │ + add  │ + add  │ + add  │ + add  │ + add  │ + add      │
└────────┴────────┴────────┴────────┴────────┴────────┴────────────┘
```

**Layout rules**
- Equal-width 7 columns at ≥1024px. Today's column gets a subtle `brand.50` wash + `●` marker.
- Each column is a **vertical list of compact task chips** sorted by time, not a positioned time-grid — most student deadlines are day-level, not hour-level, so a time axis wastes 80% of the canvas.
- Chips show: course monogram + color bar, truncated title (2 lines max), time. Overflow → `+3 more`.
- Per-column `+ add` ghost button pre-fills that date.
- **Mobile:** horizontal day scroller, one day per screen, snap-to-day; density strip becomes the day navigator.
- `[List]` toggle swaps the grid for a day-grouped list — this is also the **accessible fallback** for the grid.

---

### 5.4 S4 · All Tasks

```
┌──────────────────────────────────────────────────────────────────┐
│  All tasks  (26)                                                  │
│  [Search…]  Course: All ▾  Status: Open ▾  Due: Any ▾  Sort: Smart▾│
│  ▣CS201 ▣MA110 ▣EN105 ▣PH220        [Comfortable|Compact]       │
│                                                                   │
│  ▾ OVERDUE — 2                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │☐ ▣CS201 Recursive proofs        Overdue by 2d  High    ⋯  │  │
│  │☐ ▣EN105 Reading response        Overdue by 5h  Med     ⋯  │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ▾ DUE TODAY — 1                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │☐ ▣CS201 Binary tree worksheet   Today 5:00 PM  High    ⋯  │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ▾ THIS WEEK — 6                                                  │
│  ▸ LATER — 12                                                     │
│  ▸ NO DUE DATE — 5                                                │
│  ▸ COMPLETED — 8                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Layout rules**
- Row = `[checkbox 24px] [monogram 20px] [title flex-1] [due label 140px] [priority pill 72px] [⋯ menu 32px]`
- Checkbox is the **primary affordance** — the whole row is also clickable to open S7.
- `Sort: Smart` = the §2 priority model (default). Alternatives: Due date, Priority, Course, Recently added, Alphabetical.
- Active filters render as removable chips above the list; a **"Clear all"** appears whenever ≥2 are active.
- Group headers are sticky and show counts.

---

### 5.5 S5 · Course Detail

```
┌──────────────────────────────────────────────────────────────────┐
│  ← All courses                                                    │
│  ▣ CS201 · Data Structures                          [⋯ Edit]      │
│  Dr. Ahmed · Fall 2026                                            │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 4        │ │ 1        │ │ 2        │ │ 68%      │            │
│  │ Open     │ │ Due ≤3d  │ │ Overdue  │ │ Done     │            │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                   │
│  [+ Add task to CS201]                                            │
│  <task list, same rows as S4, pre-filtered>                       │
└──────────────────────────────────────────────────────────────────┘
```
Course color drives the page accent (header rule, monogram, active nav chip). Stat tiles are **counts only — no charts, no trends** (analytics is out of scope).

---

### 5.6 S6 · Task Editor

**Desktop:** centered modal, 560px wide. **Mobile:** bottom sheet, full-width, drag-to-dismiss.

```
┌────────────────────────────────────────────┐
│  New task                             ✕    │
├────────────────────────────────────────────┤
│  Title *                                   │
│  [Binary tree worksheet                 ]  │
│                                             │
│  Course                                     │
│  [▣ CS201 · Data Structures        ▾]      │
│                                             │
│  Due date              Due time             │
│  [Tue, Sep 8    📅]    [5:00 PM      ▾]    │
│  ⓘ Leave empty for "someday" tasks          │
│                                             │
│  Priority                                   │
│  [ Low ][ Medium ][ High ]   ← segmented    │
│                                             │
│  ▸ Notes & estimate (optional)              │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ Ranked #1 in your queue              │  │
│  │ Due in 6h · High priority            │  │ ← live PreviewRank
│  └──────────────────────────────────────┘  │
├────────────────────────────────────────────┤
│              [Cancel]   [Save task]         │
└────────────────────────────────────────────┘
```

**Layout rules**
- Single column, one field per row, **labels always visible above inputs** (never placeholder-only).
- Only `Title` is required. Everything else has a sane default (Course = last used, Priority = Medium).
- `PreviewRank` updates live as fields change — this is **P2 (Explain the ranking)** made tangible, and it teaches the model without documentation.
- `[Save task]` is the only primary button; `Cancel` is tertiary.
- Edit mode reuses the same component; header becomes "Edit task", primary becomes "Save changes", and a `Delete` text button appears bottom-left.

---

### 5.7 S7 · Task Detail

Right-anchored drawer, 420px (desktop) / bottom sheet (mobile).

```
┌──────────────────────────────────┐
│  ▣ CS201 · Data Structures   ✕   │
│  Binary tree worksheet           │  ← h1
│  🔴 Due today, 5:00 PM (in 6h)   │
│  High priority · Ranked #1       │
├──────────────────────────────────┤
│  [ ✓ Mark done ]  [ Start ]      │
│  [ Snooze ▾ ]  [ Reschedule ]    │
├──────────────────────────────────┤
│  Notes                           │
│  Chapters 4.1–4.3, problems      │
│  1–12 odd.                       │
│                                  │
│  Estimated  2h                   │
│  Created    Sep 1                │
│  Last edit  Sep 7                │
├──────────────────────────────────┤
│  [Edit]              [Delete]    │
└──────────────────────────────────┘
```
Actions are **large, labelled, thumb-reachable** at the top — the drawer exists to act, not to read.

---

### 5.8 S1 · Onboarding

Full-bleed centered column, max 480px, progress dots at top, `Skip` persistent top-right.

```
Step 2 of 3
What are you taking this semester?

┌────────────────────────────────────┐
│ ▣ CS201  Data Structures        ✕  │
│ ▣ MA110  Linear Algebra         ✕  │
│ [ + Add another course           ] │
└────────────────────────────────────┘

Color and code are optional — you can
change them later in Settings.

              [Back]   [Continue →]
```

Step 3 ends with a **fork**, visually equal-weight:
`[ Load a sample week ]` (primary) · `[ Start with an empty list ]` (secondary).

---

### 5.9 S8 · Settings

Single column, max 640px, grouped sections with dividers.

| Section | Contents |
|---|---|
| **Profile** | Display name, term label, week-start day (Mon/Sun) |
| **Courses** | Inline list — rename, recolor, reorder, archive, delete |
| **Appearance** | Theme (Light / Dark / System), Density (Comfortable / Compact) |
| **Data** | Export JSON, Import JSON, Storage used (`14.2 KB of 5 MB`), Reset all data |
| **Keyboard** | Shortcut table + `[Show shortcut help]` |
| **About** | Version, "Built as a portfolio project" |

*Data section is a first-class concern here, not an afterthought:* with no backend, localStorage **is** the user's data, and there is no recovery path. Export must be prominent and un-scary.

---

## 6. Component Inventory

### Navigation & shell
`AppShell` · `SidebarRail` · `SidebarRailCollapsed` · `MobileTabBar` · `TopBar` · `SearchInput` · `Breadcrumb` · `PageHeader` · `SectionHeader` · `TabSwitcher` (Week/List)

### Data display
`NextUpCard` · `TaskCard` · `TaskRow` · `TaskRowCompact` · `TaskGroupHeader` · `WeekGrid` · `DayColumn` · `TaskChip` · `DeadlineDensityStrip` · `ClashWarning` · `StatTile` · `CourseMonogram` · `CourseChip` · `UrgencyBadge` · `DueLabel` · `PriorityPill` · `PreviewRank` · `DisclosureRow` · `VirtualTaskList`

### Input
`QuickAddBar` · `TaskForm` · `TextField` · `TextArea` · `DatePicker` · `TimePicker` · `CourseSelect` · `PrioritySegmented` · `Checkbox` · `FilterBar` · `FilterChip` · `SortMenu` · `DensityToggle` · `ThemeToggle` · `ColorSwatchPicker`

### Feedback & overlay
`Modal` · `Drawer` · `BottomSheet` · `ConfirmDialog` · `Toast` · `UndoToast` · `InlineError` · `ErrorSummary` · `EmptyState` · `SkeletonBlock` · `CelebrationBurst` · `Tooltip` · `OverflowMenu` · `ShortcutHelpSheet` · `CommandPalette` *(P2)*

### Primitives
`Button` (primary/secondary/tertiary/ghost/danger × sm/md/lg) · `IconButton` · `Card` · `Badge` · `Divider` · `Stack` · `Icon` (Lucide, 20px default, 1.75 stroke)

**Total: ~70 components.** P0 subset needed to ship: ~34.

---

## 7. Design Tokens

### 7.1 Color

**Brand — "Campus Indigo"**
| Token | Hex | Use |
|---|---|---|
| `brand.50` | `#EEF2FF` | Today wash, selected bg |
| `brand.100` | `#E0E7FF` | Hover bg |
| `brand.300` | `#A5B4FC` | Decorative borders |
| `brand.500` | `#6366F1` | Icons, links |
| `brand.600` | `#4F46E5` | **Primary actions** |
| `brand.700` | `#4338CA` | Primary hover |
| `brand.900` | `#312E81` | Primary active / dark-mode accent |

**Neutrals — warm-tinted gray, not pure neutral (reduces clinical feel)**
| Token | Light | Dark |
|---|---|---|
| `neutral.0` (surface) | `#FFFFFF` | `#121214` |
| `neutral.25` (subtle) | `#FAFAF9` | `#1A1A1D` |
| `neutral.50` (raised) | `#F5F5F4` | `#222226` |
| `neutral.100` | `#E7E5E4` | `#2C2C31` |
| `neutral.200` (border) | `#D6D3D1` | `#3A3A40` |
| `neutral.400` (disabled) | `#A8A29E` | `#6B6B73` |
| `neutral.600` (secondary text) | `#57534E` | `#A8A29E` |
| `neutral.800` (primary text) | `#292524` | `#F5F5F4` |
| `neutral.900` (heading) | `#1C1917` | `#FFFFFF` |

**Urgency semantic scale** — the product's most important color system
| Token | Hex | Contrast on white | Use |
|---|---|---|---|
| `urgent.overdue` | `#B42318` | 6.9:1 ✅ | Overdue text/icon |
| `urgent.overdue-bg` | `#FEF3F2` | — | Overdue row wash |
| `urgent.critical` | `#C4320A` | 5.5:1 ✅ | Due <24h |
| `urgent.critical-bg` | `#FFF4ED` | — | |
| `urgent.soon` | `#B54708` | 5.1:1 ✅ | 24–72h |
| `urgent.soon-bg` | `#FFFAEB` | — | |
| `urgent.upcoming` | `#4F46E5` | 7.1:1 ✅ | 3–7 days (= brand) |
| `urgent.later` | `#57534E` | 7.8:1 ✅ | >7 days |
| `success.600` | `#067647` | 5.0:1 ✅ | Completed, confirmations |
| `success.50` | `#ECFDF4` | — | Success bg |

**Course palette — 8 hues, max saturation capped so none competes with urgency red**
| # | Token | Hex | | # | Token | Hex |
|---|---|---|---|---|---|---|
| 1 | `course.indigo` | `#4C6EF5` | | 5 | `course.violet` | `#7048E8` |
| 2 | `course.teal` | `#0CA678` | | 6 | `course.cyan` | `#1098AD` |
| 3 | `course.amber` | `#E8A33D` | | 7 | `course.plum` | `#A61E4D` |
| 4 | `course.slate` | `#5C7CFA` | | 8 | `course.olive` | `#66801A` |

> **Mandatory pairing rule:** course color is **never** the sole identifier. Every course instance renders `CourseMonogram` (up to 4 chars of the course code, e.g. `CS201` → `CS`) inside the color. Color encodes, text identifies.

### 7.2 Type scale

**Family:** `Inter var` (UI + text). Single family — no display face in an MVP.
`font-feature-settings: "cv11", "ss01"` · **All dates, times, and counts use `font-variant-numeric: tabular-nums`** so columns align and ticking countdowns don't jitter.

| Token | Size / Line-height | Weight | Letter-spacing | Use |
|---|---|---|---|---|
| `type.display` | 36 / 44 | 700 | −0.02em | Onboarding headlines only |
| `type.h1` | 30 / 38 | 700 | −0.015em | Page titles |
| `type.h2` | 24 / 32 | 600 | −0.01em | Section headers |
| `type.h3` | 20 / 28 | 600 | −0.005em | Card titles, Next Up task |
| `type.body-lg` | 18 / 28 | 400 | 0 | Next Up title, onboarding body |
| `type.body` | 16 / 24 | 400 | 0 | Default text, form inputs |
| `type.body-sm` | 14 / 20 | 400 | 0 | Task rows, secondary text |
| `type.caption` | 12 / 16 | 500 | +0.01em | Badges, timestamps, hints |
| `type.overline` | 11 / 16 | 600 | +0.08em · UPPERCASE | Group headers, section labels |

**Minimum body text: 14px.** Nothing interactive renders below 12px. Root font-size in `rem` so browser zoom and user defaults are respected.

### 7.3 Spacing

4px base grid.
| Token | px | Typical use |
|---|---|---|
| `space.0` | 0 | |
| `space.1` | 4 | Icon-to-label gap |
| `space.2` | 8 | Inline element gaps |
| `space.3` | 12 | Input padding, chip padding |
| `space.4` | 16 | Card padding (mobile), row gap |
| `space.5` | 20 | Card padding (desktop) |
| `space.6` | 24 | Section gap, page gutter (mobile) |
| `space.8` | 32 | Between page sections |
| `space.10` | 40 | Page gutter (tablet) |
| `space.12` | 48 | Hero spacing |
| `space.16` | 64 | Page gutter (desktop) |
| `space.20` | 80 | Vertical page rhythm |

**Layout constants:** `sidebar.w = 240px` · `sidebar.wCollapsed = 64px` · `drawer.w = 420px` · `modal.w = 560px` · `content.maxW = 1200px` · `row.comfortable = 56px` · `row.compact = 36px` · `touchTarget.min = 44×44px`

### 7.4 Radius, elevation, motion

**Radius:** `radius.sm 6` (badges, inputs) · `md 10` (buttons, chips) · `lg 14` (cards) · `xl 20` (modals, sheets) · `full 999` (pills, FAB, monogram)

**Elevation** — light mode uses shadow + 1px border; dark mode drops shadow and relies on border + fill (shadows are invisible on dark surfaces):
| Token | Light | Dark |
|---|---|---|
| `elev.0` | none | none |
| `elev.1` | `0 1px 2px rgba(28,25,23,.06)` | border `neutral.200` |
| `elev.2` | `0 2px 8px rgba(28,25,23,.08)` | bg `neutral.50` |
| `elev.3` | `0 8px 24px rgba(28,25,23,.12)` | bg `neutral.50` + border |
| `elev.4` | `0 16px 48px rgba(28,25,23,.18)` | bg `neutral.50` + border |

`NextUpCard` is the only component permitted `elev.3` on the dashboard — elevation is a hierarchy signal, spend it deliberately.

**Motion**
| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion.instant` | 120ms | `cubic-bezier(.2,0,0,1)` | Hover, press, checkbox |
| `motion.fast` | 200ms | `cubic-bezier(.2,0,0,1)` | Drawer, tooltip, menu |
| `motion.base` | 320ms | `cubic-bezier(.2,0,0,1)` | Queue re-order, card exit |
| `motion.slow` | 480ms | `cubic-bezier(.16,1,.3,1)` | Celebration burst |

All motion wrapped in `@media (prefers-reduced-motion: no-preference)`. Reduced-motion users get instant state changes with **no loss of information** — completion is confirmed by text + live region, not animation.

### 7.5 Breakpoints
Tailwind defaults: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`. **Mobile-first authoring.** Design verified at 360px (smallest common), 768px, 1280px, and 200% zoom.

---

## 8. States

### 8.1 Loading

**Reality check first:** there is no network. Data comes from `localStorage`, which is synchronous and effectively instant. Designing elaborate loading states here would be **theatre, not UX.**

| Situation | Treatment |
|---|---|
| Initial app hydrate | Single `AppShellSkeleton` — sidebar + one card-shaped block. Shown only if hydration exceeds **150ms**; otherwise render straight through. Never flash a skeleton for a 20ms read. |
| Navigation between screens | None. Instant. Content is already in memory. |
| Saving a task | **Optimistic.** Row appears immediately; storage write happens after paint. No spinner on the Save button. |
| Completing a task | **Optimistic.** Immediate visual response. |
| Importing JSON (S8) | Real work → button shows inline spinner + disabled state. Only place a spinner is justified. |
| Exporting JSON | Button → `Preparing…` → `Downloaded ✓` |

`SkeletonBlock` shapes mirror real layout (card, row, chip) to avoid reflow on swap.

### 8.2 Empty

Every empty state = **illustration or icon + one line of copy + exactly one primary action.** No dead ends.

| Context | Copy | Action |
|---|---|---|
| First run, no data | handled by S1 Onboarding | — |
| Dashboard, zero tasks | "Nothing on your plate. Enjoy it, or get ahead." | `[+ Add your first task]` `[Load sample data]` |
| **Next Up, nothing due soon** | "You're clear for the next 3 days." | `[Plan ahead →]` |
| All Tasks, no tasks | "No tasks yet." | `[+ New task]` |
| **Filtered, no results** | "No tasks match 3 filters." | `[Clear filters]` |
| Week View, empty week | "No deadlines this week." | `[+ Add a task]` |
| Single empty day column | *(no copy — just the `+ add` ghost button)* | `+` |
| Course Detail, no tasks | "No tasks in CS201 yet." | `[+ Add task to CS201]` |
| Unscheduled group | "Tasks without a due date land here — they won't show up in Next Up until you schedule them." | `[+ Schedule one]` |
| Search, no matches | "Nothing matches “midterm”. Try a course code or a shorter word." | `[Clear search]` |

**Distinct empty states matter most in the filtered case** — "no results because you filtered" and "no results because there's nothing" need different copy and different actions, or users conclude their data vanished.

### 8.3 Error

| Error | Detection | Treatment |
|---|---|---|
| **Form validation** | On blur + on submit | `InlineError` under the field, red 2px border, error icon, `aria-describedby` link. **Never on keystroke** — no yelling while someone types. |
| Multiple field errors | On submit | `ErrorSummary` at top of form: "2 fields need attention" + focusable list. Focus moves to the first invalid field. |
| Due date in the past | On submit | **Warning, not an error.** "That date has already passed — save it as overdue?" `[Save anyway]` `[Change date]`. Students legitimately backfill tasks. |
| **localStorage unavailable** (private mode, disabled) | On boot | Blocking `Banner`: *"CampusFlow can't save your tasks in this browser. Private windows and disabled storage will lose data on refresh."* + `[Export as you go]`. App remains usable in-memory. |
| **localStorage quota exceeded** (~5 MB) | On write | `Toast` danger: *"Storage is full. Export and archive completed tasks to free space."* `[Export]` `[Archive completed]`. Failed write is **retried**, never silently dropped. |
| Corrupted / unparseable JSON | On hydrate | Non-destructive recovery: quarantine the raw string under a timestamped key, load what parses, show `Banner`: *"Some saved data couldn't be read. Your original data is preserved — export it from Settings."* **Never auto-purge user data.** |
| Schema version mismatch | On hydrate | Silent migration; on failure, fall back to the quarantine path above. |
| Invalid import file | On import | `InlineError` in the import dialog: *"That file isn't CampusFlow JSON."* Existing data untouched. Import is **preview-then-confirm**, never blind-overwrite. |
| Date parse failure (Quick Add) | On submit | Fall back to the full Task Editor with the raw text preserved in Title. No data loss, no error scolding. |
| JS crash | Error boundary | Full-page fallback: "Something broke. Your tasks are saved." `[Reload]` `[Export data]`. |

**Global rule:** because there is no server, **there is no "try again later."** Every error must be self-recoverable by the user in the moment, and no error path may destroy data.

### 8.4 Success

| Event | Feedback | Duration |
|---|---|---|
| Task created | `UndoToast`: "Task added to CS201 · Due today 5:00 PM" `[Undo]` + row animates into its band | 5s |
| **Task completed** | `CelebrationBurst` (12 subtle particles, 480ms) + checkbox fill + row fades/collapses + queue advances. `Toast`: "Binary tree worksheet done. 3 left today." | burst 480ms, toast 4s |
| Task edited | `Toast`: "Changes saved" `[Undo]` | 5s |
| Task deleted | `UndoToast`: "Task deleted" `[Undo]` | **8s** |
| Rescheduled out of clash | `ClashWarning` clears with a 200ms fade; `Toast`: "Moved to Thu, Sep 10" `[Undo]` | 5s |
| Data exported | Button → `Downloaded ✓` (2s) then reverts | — |
| Onboarding complete | Confetti-free. Straight into the dashboard — the populated Next Up card *is* the reward. | — |
| All tasks for today done | Dashboard shows "You're clear for today" empty state + `[Plan ahead →]` | — |

**Restraint rule:** celebration fires on completion **only**. No streaks, no points, no badges, no confetti on trivial actions. The reward for finishing work is seeing the work disappear.

---

## 9. Accessibility

**Target: WCAG 2.2 Level AA.** Verified with keyboard-only, NVDA/VoiceOver, and 200% zoom.

### 9.1 Contrast
- Body text ≥ **4.5:1**; large text (≥24px, or ≥19px bold) ≥ **3:1**; UI components and graphical objects ≥ **3:1**.
- Every urgency token in §7.1 was selected against white at ≥5:1 — the `urgent.*-bg` washes are decorative only and **never carry text contrast responsibility** (text on washes still uses the ≥5:1 foreground token).
- **Dark mode is re-audited separately, not inverted.** `neutral.400` disabled text and `course.amber` are the two tokens most likely to fail on dark surfaces; both get dark-mode-specific values.
- Focus ring: 2px `brand.600` + 2px offset — visible on both light and dark surfaces.

### 9.2 Color independence (the big one for this product)
This design encodes **three** things in color: urgency, course, and priority. All three carry redundant non-color cues:

| Encoded by color | Redundant cue |
|---|---|
| Urgency | Icon (🔴⚠○) + text label ("Overdue by 2d") + sort position |
| Course | `CourseMonogram` text (`CS`, `MA`) + course name in the row |
| Priority | Text pill ("High") + position in the segmented control |
| Completion | Checkbox glyph change (empty → check) + strikethrough + move to Completed group |
| Today (Week View) | `●` marker + "Today" text label + column wash |

**No information is ever conveyed by color alone.**

### 9.3 Keyboard
Full task CRUD must be achievable without a pointer.

| Key | Action |
|---|---|
| `N` | New task (focus QuickAddBar) |
| `/` or `⌘K` | Focus search |
| `?` | Shortcut help sheet |
| `Esc` | Close modal/drawer/menu; blur search |
| `G` then `D` / `W` / `T` / `S` | Go to Dashboard / Week / Tasks / Settings |
| `↑` `↓` | Move through task list |
| `Enter` | Open focused task (S7) |
| `Space` | Toggle complete on focused row |
| `E` | Edit focused task |
| `Del` / `Backspace` | Delete focused task (→ UndoToast) |

- Visible focus indicator on **every** interactive element — never `outline: none` without a replacement.
- Logical DOM order matches visual order (sidebar → content → FAB).
- **Focus management:** opening a modal/drawer traps focus and moves it to the first field; closing **restores focus to the exact trigger element**. Deleting a row moves focus to the next row, not to `<body>`.
- Skip link ("Skip to main content") as the first focusable element.
- **Drag-and-drop is optional, never required.** Week View rescheduling must be fully achievable via `[Reschedule]` → date picker. (Pointer-only DnD is the most common way calendar UIs fail keyboard users.)

### 9.4 Screen readers
- Landmarks: `<header>` `<nav aria-label="Primary">` `<main id="main">` `<aside>`; one `<h1>` per screen, no skipped heading levels.
- Task list = `<ul>`/`<li>` with group headers as `<h2>`; announce position via `aria-setsize` / `aria-posinset` on virtualized rows (critical — virtualization otherwise hides the true list length).
- **`DueLabel` always exposes both relative and absolute time** in the accessible name: *"Due today at 5:00 PM, in 6 hours"* — never relative-only, which is meaningless after a tab sits open overnight.
- `aria-live="polite"` on the toast region and on the Next Up card (so queue advancement is announced after a completion).
- `aria-live="assertive"` reserved for form error summaries and storage-failure banners only.
- Decorative elements (`CelebrationBurst`, density strip bars, course color swatches) are `aria-hidden="true"`.
- Checkbox rows: the row is a link to detail, the checkbox is a separate control — **two distinct focus stops with distinct labels**, not one ambiguous clickable blob.
- Icon-only buttons carry `aria-label` (`⋯` → "More actions for Binary tree worksheet").
- `<html lang="en">`; all timestamps rendered as real text, never baked into images.

### 9.5 Forms
- Every field has a persistent visible `<label>` — **no placeholder-as-label** (placeholders fail contrast and vanish on input).
- Required fields marked with the word "Required" in text, not just `*`.
- Errors: icon + text + red border (three channels), linked via `aria-describedby`, `aria-invalid="true"`.
- `DatePicker` and `TimePicker` must be fully keyboard-operable grid/spinbutton implementations — **never a native-only control wrapped in a custom skin that breaks keyboard access.** Include a plain-text fallback input.
- `PrioritySegmented` uses `radiogroup` semantics with arrow-key navigation.
- Course select: combobox pattern, typeahead, options carry monogram text.

### 9.6 Motion, sizing, and input
- `prefers-reduced-motion: reduce` disables all animation. **No information is lost** — completion is confirmed by text and live-region announcement, not by the burst.
- `prefers-color-scheme` honored by default; manual override in Settings wins.
- Touch targets ≥ **44×44px** on mobile, including checkbox rows and day-column `+` buttons.
- Layout holds at **200% zoom** and at **320px** viewport width with no horizontal scroll (Week View excepted — it scrolls deliberately and exposes a List toggle as the no-scroll alternative).
- No fixed-height containers that clip text when a user sets a larger base font size; all sizing in `rem`.
- `UndoToast` timers **pause on hover and on keyboard focus**, and the toast is reachable by Tab. An 8-second undo window that can't be paused is not an undo window.
- No `title`-only tooltips for critical info; tooltips are also reachable on focus.

### 9.7 Content & tone
- Plain language, present tense, second person. "Due today, 5:00 PM" not "Deadline imminent".
- **No shame vocabulary anywhere.** No "You missed this," no red counters that only grow, no streak-break messaging. Overdue copy is neutral and offers an action: *"Overdue by 2 days — [Done] [Reschedule]"*.
- Numbers always with units and context ("3 left today", not "3").
- Never rely on relative time alone in copy — a student may open the app after three days away.

---

## 10. Responsive Summary

| Breakpoint | Shell | Dashboard | Week View | Task Editor | Task Detail |
|---|---|---|---|---|---|
| **<640** | Bottom tab bar + FAB | Single column, NextUpCard → queue → week strip → disclosures | 1 day/screen, snap scroller | Bottom sheet | Bottom sheet |
| **640–1023** | Bottom tab bar + FAB | Single column, week strip beside queue | 7 narrow columns, chips truncated hard | Bottom sheet | Bottom sheet |
| **≥1024** | Left rail + top bar | NextUpCard full-width, then queue (60%) / week (40%) | 7 equal columns | Centered modal 560px | Right drawer 420px |
| **≥1440** | Left rail expanded | `content.maxW` 1200px, centered | 7 columns, more chip detail | Centered modal | Right drawer |

---

## 11. Open Questions for Build

1. **Quick Add natural-language parsing** — ship in MVP or defer to explicit chips + picker? Recommend: ship the field, parse only `course code` + `weekday` + `time`; defer full NLP.
2. **Sample data set** — needs a realistic 12–15 task, 4-course week authored before S1 can be tested. This is a content task, not an engineering one, and it blocks usability testing (a PRD success metric).
3. **Course limit** — cap at 8 (palette size) or generate colors past 8? Recommend cap at 8 for MVP.
4. **Completed task retention** — purge after N days to protect the 5 MB quota, or archive manually? Recommend: keep, but add `[Archive completed]` in Settings and surface storage usage.
5. **`DesignBrief.md` and `PRD.md` currently live in `server/`** — but the MVP has no server. Suggest moving both to a root-level `docs/` before the repo grows.

---

## 12. Verification Checklist (pre-ship)

- [ ] Keyboard-only: create, complete, edit, reschedule, delete, and undo a task
- [ ] NVDA + VoiceOver: navigate Dashboard, Week View, and Task Editor end-to-end
- [ ] Contrast audit on all 9 urgency tokens × light and dark
- [ ] 200% zoom and 320px width — no horizontal scroll, no clipped text
- [ ] `prefers-reduced-motion` — completion still fully comprehensible
- [ ] Seed 60 tasks — verify list stays responsive and scannable
- [ ] Fill localStorage to quota — verify the warning path and that no write is silently dropped
- [ ] Corrupt the stored JSON by hand — verify non-destructive recovery
- [ ] Create a 3-task same-day clash — verify detection and the reschedule resolution path
- [ ] 5 first-time users complete "add a task and find what's due next" unaided (PRD: ≥80% success)
