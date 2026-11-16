# Atrium — Design System

> **Direction in one line:** *Sleek, smooth, minimal. A quiet, dimensional start page where a near-black "cosmic obsidian" canvas, hairline glass, and one breathing accent deliver calm focus with zero excess — the goal isn't a pretty page, it's the fewest possible elements moving perfectly.*

This document defines the intended visual direction and design constraints for Atrium. It is a forward-looking guide, not a claim that every listed rule is already implemented or audited. When implementation differs, treat the relevant section as a target for future work and update the guide when the product direction changes. This document is tracked with the project so contributors can consult the same guidance.

**The product’s short name is Atrium.** Use “Atrium” in interface copy where a short product reference fits; use the full project name “Atrium Tabs” in legal, repository, extension-store, and other contexts where the listed name is required. Avoid abbreviations and decorative taglines. See [TRADEMARKS.md](./TRADEMARKS.md) for branding guidance.

---

## 1. Design Direction

**Ambient, not lush. Dimensional, not decorated.** Every decision in this system answers to three pillars:

1. **Minimal — the goal.** Cut until the page breaks, then cut once more. There is exactly one focal element (the greeting), one accent, one glow, one font pairing, one hero motion. A feature earns its pixels or it's removed. When designing something new, first ask what this page can *stop doing*.
2. **Sleek** — surfaces are clean and precise: hairline glass, hairline dividers, shapes resolved to pills / panels / rounds, no borders where whitespace or tint already separates. Sharp where it must be sharp, soft where it floats.
3. **Smooth** — motion glides on one curve (`cubic-bezier(0.16, 1, 0.3, 1)`), stays in one duration band, and touches only opacity/transform. Nothing hops, snaps, or lingers.

The page should feel like a well-tuned instrument: dark surfaces with depth (not flat black), glass that exists only where it floats over content, one accent hue doing quiet work, and motion that breathes rather than bounces.

**The feeling:** a new tab opened at night — the screen darkens with a slow radial glow, your greeting fades up, and everything else stays out of the way. You are always one glance away from searching. *Sleek is how it looks, smooth is how it moves, minimal is why it feels good.*

**Explicitly not:** cyberpunk gradients, purple/cyan nebulas, glowing card borders, glass everywhere, bold color blocks, or anything that competes with the content.

### Guiding principles

1. **Minimal is the brand.** When in doubt, remove. If it doesn't serve search, navigation, or calm focus, it doesn't ship. One glow, one accent, one focal element.
2. **Everything visible is functional.** Every decorative element (the breathing glow, the gradient greeting, the accent dot) earns its place by orienting or delighting — if it stops earning, delete it.
3. **The wallpaper rules.** Custom backgrounds are a first-class feature. UI must remain legible over arbitrary photography, via dimming, vignette, and text-shadow safeguards.
4. **Motion has a kill switch.** Low-motion/performance mode disables all animation, blur, and ambient effects. Anything new must respect that.
5. **Themes are structural, not skins.** Colors flow through CSS variables; components never hardcode hex values (exceptions: the `#030307` underlay, and rose for destructive states).

---

## 2. Color System

**Palette = 1 structural dark hue + 1 configurable accent.** The neutral dark canvas (cosmic obsidian `#030307`) and the foreground ink (`#f8f9fc`) are fixed. The accent is a single hue the user chooses (default: sage), and everything accent-colored derives from it via the token system. Semantic colors (error/destructive) stay outside the accent system so a red wallpaper never recolors your delete button.

### Tokens

All colors are CSS variables — components must use `var(--token)` / Tailwind arbitrary `bg-[var(--token)]`, never literals.

| Token | Cosmic Obsidian Dark Canvas | Notes |
|---|---|---|
| `--background` | `#030307` | Deep cosmic obsidian base |
| background wash | radial `#0a0b16` @ 50%/30% → `#030307` | Ambient vignette wash |
| `--foreground` | `#f8f9fc` | Near-white, slightly cool ink |
| `--accent` | `#7ca38e` sage (default) | Configurable active accent hue |
| `--accent-glow` | `rgba(124,163,142,.15)` | Derived soft ambient glow |
| `--glass-bg` | `rgba(10,11,22,.45)` | Hairline frosted glass base |
| `--glass-bg-dropdown` | `rgba(10,11,22,.95)` | High-opacity glass for floating menus |
| `--glass-border` | `rgba(255,255,255,.06)` | Hairline edge |
| `--glass-border-focus` | accent @ 40% | Dynamic accent ring |
| `--divider` | `rgba(255,255,255,.09)` | Hairline group divider |
| `--solid-bg` | `#0e0f1a` | High-contrast opaque solid card |
| `--solid-bg-dropdown` | `#121324` | Solid dropdown menu surface |
| `--solid-border` | `rgba(255,255,255,.08)` | Solid surface edge |
| underlay for imagery | `#030307` | Fixed base under wallpapers |

**Surface values must never be pure black** — the dark canvas is blue-tinted obsidian (`#030307`), which keeps dark surfaces from feeling flat and dead.

### Accent presets (user-selectable, default sage)

Each preset ships an obsidian-calibrated value plus a derived glow:

| Preset | Color | Glow Token |
|---|---|---|
| Sage *(default)* | `#7ca38e` | `rgba(124, 163, 142, 0.15)` |
| Violet | `#A78BFA` | `rgba(167, 139, 250, 0.15)` |
| Amber | `#FBBF24` | `rgba(251, 191, 36, 0.15)` |
| Rose | `#FB7185` | `rgba(251, 113, 133, 0.15)` |
| Cyan | `#22D3EE` | `rgba(34, 211, 238, 0.15)` |
| Custom | user-picked `--custom-accent` | dynamic 15% alpha glow |
| Auto | dynamically extracted `--auto-accent` matching active wallpaper | dynamic 15% alpha glow |

Rules:
- The accent is used sparingly: focus rings, the greeting dot, active toggles, selected states, icon accents, hover glows. Never for large filled surfaces except small controls (toggles, segmented selections) where it flips to `text-[var(--background)]`.
- Accent fills on dark surfaces must be light & muted (sage, soft violet); never neon.
- **One hue at a time.** The glow, focus ring, and selected states all use the same active accent.

### Semantic colors (separate from the accent system)

| Meaning | Token | Notes |
|---|---|---|
| Destructive / error | rose (`rose-500`, `rose-500/10` bg, `rose-500/20` border) | delete buttons, validation errors |
| Success / info / warning | not yet used | add as tokens when needed; do not invent hues inline |

---

## 3. Typography

**Outfit (sans) + Geist Mono (mono).** The pairing is a soft geometric UI face with a technical, squared mono for metadata — "friendly instrument panel". These two families are the whole system; adding a third family is a design decision that requires updating this document.

- **Sans:** `Outfit` 200–600, loaded at 200/300/400/500/600. Using weight for hierarchy, not additional families.
- **Mono:** `Geist Mono` 400/700 — number badges, shortcut hints, any technical/telemetry text.

### Type scale

| Role | Size / weight / tracking | Example |
|---|---|---|
| Hero (greeting) | 36 / 48 / 60px (`text-4xl sm:text-5xl lg:text-6xl`), **font-light (300)**, `tracking-tight` | "Good evening, Sarah" |
| Subtext line | 12–16px, `font-light`, optional `tracking-[0.2em] uppercase` for the pool copy | greeting subtext |
| UI body (settings, descriptions) | 13–14px, normal weight, `leading-relaxed` at ≥14px | setting descriptions |
| Control labels & toggles | 13–14px (`text-sm`), up to `font-medium` | drawer rows, tab labels |
| Micro-labels (meta only) | 9–11px, uppercase, `tracking-[0.15em]–[0.2em]`, `font-light`–`font-medium` | footer ©, "Preferences" eyebrow, weather time, badge counts |
| Forms & inputs | 14px (`text-sm`) | search bar, settings inputs |

Rules:
- Micro-labels are **metadata, not body copy** — they may run small. Anything read as a sentence must be ≥14px, and paragraphs ≥16px.
- No weight above 600 in Outfit. `font-semibold` is the ceiling; bold accents happen via the mono face or size, not weight stacking.
- Tabular numerals (`tabular-nums`) for anything numeric — weather temps, temperatures.

### The gradient greeting (signature element)

The hero headline is the one sanctioned use of gradient text: `linear-gradient(135deg, var(--foreground) 30%, var(--accent) 95%)` clipped to the text. It ties the page's two hues together and must not be replicated elsewhere. Near the greeting sits a small accent dot (`w-1.5 h-1.5 rounded-full bg-[var(--accent)]`) — the "tuning light" — as the only other hero decoration.

---

## 4. Spacing & Layout

**8pt grid with 4px half-steps.** All spacing values are multiples of 8 (4 allowed as a half-step). No 13px, 37px, etc.

### Page composition (home)

- Page padding: `p-6 sm:p-12`, generous and asymmetric-feeling via the fixed corners.
- Vertical rhythm: greeting sits at `pt-[18vh]` — content floats in the upper-third, not dead center.
- Column: `max-w-4xl mx-auto`, centered stack: **Greeting → Search → Quicklinks** with `gap-10` between sections.
- Corners carry the ambient furniture:
  - Top-left: weather (whispers until interacted with)
  - Top-right: quick-action mail trigger (Gmail, Outlook, Proton, etc. in pill, icon, or glass)
  - Bottom-right: customize affordance (pencil trigger; footer & links housed inside drawer)
  - Bottom-left: photographer credit pill (only when a curated wallpaper is active)

### Spacing conventions

| Gap | Use |
|---|---|
| 4 | icon ↔ text micro-gaps, dot alignment offsets |
| 8 (`gap-2`) | adjacent controls, pill inter-button spacing |
| 12–16 (`gap-3`–`gap-4`) | inside-card row spacing, quicklink tiles |
| 24–32 (`gap-6`–`gap-8`) | between related sections, form fields |
| 40+ (`gap-10`–`gap-12`) | between major sections (greeting/search/quicklinks) |

### Shape language

- **Pills** (`rounded-full`): icon buttons, toggles, control pill, quicklink tiles, credits chip, scrollbar thumbs.
- **Panels** (`rounded-2xl`): drawers, settings card, modals, forecast popover, dropdowns.
- **Controls** (`rounded-lg`/`rounded-xl`): inputs, segmented buttons, tab rows, buttons.

A **hairline divider** (`w-[1px] h-4.5 bg-[var(--divider)]` vertical, or `border-b border-[var(--divider)]` / `h-[1px] bg-[var(--divider)]` horizontal) separates groups inside the drawer and panels — not boxed borders.

---

## 5. Surfaces & Depth

**Glass is a controlled material, not a default.** This project deliberately uses glassmorphism — but calibrated, and only where a surface floats *over* other content (backgrounds, images). Everything else separates by lightness shift first.

### The glass rules

1. **Glass only over content.** Search bar, control pill, settings drawer, dropdowns/popovers, modals. Never glass a card sitting on an empty flat background just for looks.
2. **Blur is fixed and modest:** inputs `20px`, dropdowns `24px`, drawer `30px`. No gold-plating beyond 30px.
3. **Borders are hairlines, always:** `rgba(255,255,255,.06)` dark / `rgba(44,37,32,.12)` light — deliberately barely-there. Never a flat 1px gray.
4. **One elevation level at a time.** Surface hierarchy: flat → tinted (`bg-[var(--foreground)]/5`) → glass. A glass panel may contain flat rows; a flat card may not contain glass.
5. **Shadows are three-stop, tinted, soft** (`--glass-shadow`): a tight contact shadow, a mid ambient shadow, and a long low-elevation shadow. Accent-tinted glow (`--accent-glow`) is reserved for focus and hover on interactive elements, and one instance at a time.
6. **Inset highlight** (`inset 0 1px 1px 0 rgba(255,255,255,.05)`) keeps dark glass edges readable — this is the "lit edge", not a border.

### Over imagery

Wallpapers get a three-layer protection stack (implemented in `BackgroundOverlay`):
1. **Base underlay** `#030307` — keeps dark-blend integrity under all imagery.
2. **Dim overlay** — user-controlled (default 40%) for legibility.
3. **Ambient vignette** — radial transparent→`rgba(3,3,7,.3)`→`rgba(3,3,7,.65)` with 30% transparent core; protects corner furniture.

When a custom background is active (`data-bg-custom="true"`): greeting/text/weather get `font-weight: 500` + a soft `text-shadow` for guaranteed separation. This system is law — never put text over an image without it.

---

## 6. Components

### 6.1 Customize affordance (bottom-right)
A whisper-state customization trigger in the bottom-right corner. **Idle:** a lone pencil glyph (`text-[var(--foreground)]/45`, no background, no border) that reads as part of the canvas, inside a `px-2.5 py-2.5` (34px) hit area. **Hover / focus:** all feedback lives in the glyph — the pencil brightens to the accent, grows (`scale-125`), and tilts 12° within a larger whisper-tint circle (`hover:bg-[var(--foreground)]/4` at the same 34px padding). The control never changes shape and never reveals a label; `focus-visible` gets the accent ring. No native `title` tooltip — the accessible name comes from `aria-label` only. **Touch:** `pointer-coarse` keeps a faint tinted pill (`bg-[var(--foreground)]/4`, hairline border, blur, pencil at `/55`) at all times so the trigger still reads as tappable. Clicking opens the Preferences Drawer. The accent palette selector lives at the top of the drawer overview alongside auto-extraction and custom color toggles.

### 6.2 Settings drawer
Right-side sheet, `w-full sm:w-[380px]`, glass blur 30px, hairline left border, translate-x slide with expo curve. Sections are **rows separated by hairlines** (`border-b border-[var(--divider)]` or `h-[1px] bg-[var(--divider)]`), not boxed cards. Each row: 13px label + 11px muted description + control (toggle/segmented pill). Staggered entrance: rows slide in ~50–250ms delays. Seven-step rule: whatever you add to the drawer, keep the row anatomy identical.

**Smart settings search** (`SettingsSearch`) sits pinned at the top of the main overview: a quiet pill input (`38px`, tinted, accent focus) with a 2-char threshold. Typing replaces the overview with ranked results — every setting is a catalog entry (label + keywords/aliases + group), matched label-first with whole-word/prefix/substring tiers and typo-tolerant subsequence on labels only (keyword lists are concatenated and would otherwise manufacture phantom matches). Rows reuse the drawer's icon-tile anatomy, carry `GROUP · description` micro-copy and the live current value on the right, and rank by relevance, not pane order. Picking a result either slides to that pane and deep-reveals the target row (accent `setting-flash` outline, expo scroll) or flashes the matching block on the overview; ↑/↓/Enter drive the list, Esc clears the query before closing. Low Motion mode kills the flash via the global perf switch.

### 6.3 Search bar & engine picker
The signature interaction. The search field supports user-selectable materials: **Glassy** (`glass-input`, translucent frosted glass with 20px blur) or **Solid** (`solid-input`, fully opaque `#0e0f1a` card with soft elevation and zero background bleed-through for maximum legibility over photography). Both styles support custom corner shapes (pill, rounded, sharp) and **Color Customization**: **Default** (theme neutral obsidian/paper), **Theme Accent** (dynamically adapts to active accent hue), **Curated Presets** (Sage, Violet, Amber, Rose, Cyan), or **Custom Hex Color** (tinted with smooth sRGB color-mix; do not claim APCA contrast is guaranteed unless it has been measured for the rendered color and background). Focus = accent hairline + 1px ring + soft `--accent-glow`, **no outer box-shadow color change beyond the accent**. Suggestions drop into a matching glass or solid dropdown with keyboard (↑/↓/Enter/Esc) and a 250ms debounce.

Engine switching: clicking the search engine icon button directly opens the dedicated **Search Settings slideout drawer** (`openSettingsDrawer("search")`), displaying curated search providers alongside their privacy profiles, bangs support, and custom engine management without awkward popup overflow.

### 6.4 Quicklinks
Unified, tactile shortcut archetypes designed for daily productivity and clean aesthetics:
- **Fluid Pills *(default)*:** Lightweight horizontal pill tags (`px-3.5 py-1.5`, `h-9`) with subtle whisper surfaces (`bg-[var(--foreground)]/4`), hairline glass borders, smooth hover lift, minimal hotkey badge, and clean edit triggers.
- **Glass Shelf:** The unified floating frosted glass dock centered under search (`backdrop-blur-xl bg-[var(--glass-bg)]/80`) with fluid spring hover scaling, spotlight reflections, and floating frosted tooltips (`Title · 1`).
- **Quiet Grid:** Refined classic browser shortcuts (icon disc + wallpaper-safe label underneath), borderless 4% lightness shift, frosted glass hover bloom (`scale-110`), and protected text shadow for full legibility over wallpapers.
All styles support user-configurable corner geometry (**Pill**, **Rounded**, **Sharp**) and toggleable **Tactile Keycaps**. Favicon fallbacks: emoji, badge (accent-tinted letter), initial. Max 12 tiles, drag-to-reorder, keys 1–9 activate numbered links.

### 6.5 Weather
A quiet text pill (13px, `font-light`, `text-[var(--foreground)]/50`, thin 1.5px-stroke icons) — it *whispers* until interacted with. Hovering reveals the glass forecast popover (hourly strip + today/tomorrow) with `animate-suggest-in`. No weather = a subdued "Show Weather" ghost affordance — never an empty dead corner.

### 6.6 Modals
Center-scaled glass panel (`animate-scale-up` pop, `scaleUp` 0.95→1) with a `bg-black/65 backdrop-blur-md` scrim. Title 16px, form fields follow the input anatomy (38px height inputs, `rounded-lg`, accent focus). Destructive actions are rose-text buttons on rose-tinted chips; primary actions are accent-filled with a hover glow.

### 6.7 Preferences drawer
Settings are presented in the right-side Preferences Drawer, with overview and category panes rather than a separate settings page. Follow the drawer and row patterns in §6.2; preserve keyboard navigation, responsive full-width mobile presentation, and the existing focus behavior.

---

## 7. Motion

### Curves
- **Primary curve (expo-out):** `cubic-bezier(0.16, 1, 0.3, 1)` — everything: drawers, glows, fades, theme transitions.
- **Overshoot (spring-ish):** `cubic-bezier(0.34, 1.56, 0.64, 1)` — reserved for *pop* moments: orb engine ring, scale-ups, icon micro-interactions. Use sparingly; overshoot everywhere reads as toy-like.
- **Linear/fast:** `0.25s ease-out` for suggestion reveals; `0.3s ease-in` for dismissals.

### Durations (300–600ms band)
| Duration | Use |
|---|---|
| 200–300ms | hover states, suggestion in/out, icon swaps |
| 400ms | control pill transitions, row borders |
| 500–600ms | drawer slide, theme crossfade, glow settle |
| 6–8s | ambient `breathe` loop; short busy-state loops should remain clearly functional |

### Motion rules
1. **Entrances are staggered, not simultaneous:** home `animate-fade-in-up` 600ms, drawer rows ~50ms delays, controls in panel.
2. **Ambient motion:** the breathing glow is controlled by `data-glow="true"`. Other short loops should communicate a functional loading or progress state, not decorate the page.
3. **`data-perf="true"` (Low Motion) kills everything:** `animation/transition-duration: 0`, iteration 1, no backdrop-filter, no delays. New animations must be covered by this switch.
4. Motion is opacity/transform-only where possible (`will-change: transform, opacity`) — never layout properties.

---

## 8. Accessibility & Contrast

- **Contrast target (APCA):** body text `Lc ≥ 75`; large/bold `Lc ≥ 45`; non-text UI (icons, borders, controls) `Lc ≥ 30`. Verify each new surface pair against these, especially glass-on-wallpaper, where the dim + vignette layers carry the burden (they're part of the contrast budget, not decoration).
- **Default text alphas are dimmed on purpose** (`/40`, `/50`, `/60`) *on the fixed canvas* — acceptable at large sizes and for metadata, but never for sentence-copy; interactive labels must brighten to ≥80% on hover/active.
- **Over imagery:** the `data-bg-custom` weight + shadow boost is mandatory (see §5).
- **Keyboard:** every surface interactive element keeps a visible focus treatment; Esc closes drawers/modals/pickers; `/` and `Ctrl/⌘K` focus search; ↑/↓/Enter drive suggestions; 1–9 open quicklinks. New controls must slot into this model.
- **Focus ring:** accent hairline + 1px ring — `--glass-border-focus`. Never remove outline without replacing it.
- **Reduced motion:** the saved Low Motion setting or the system’s `prefers-reduced-motion: reduce` preference activates the `data-perf` rules. The home page applies both before first paint. System changes take effect while the page is open without changing the saved switch. Settings search uses instant scrolling when either preference requests reduced motion.

---

## 9. Implementation Conventions

- **Theming = attributes on `<html>`:** `data-theme` (dark), `data-accent` (preset id: sage/violet/amber/rose/cyan/custom/auto), `data-glow`, `data-perf`, `data-bg-custom`. Every new themeable dimension follows this pattern and resolves through CSS variables in `src/globals.css`.
- **New colors go into the token layer first** (`:root` / `[data-*]` blocks), then get consumed via `var(--token)`. No inline hex in components (underlay `#030307` and rose destructive are the standing exceptions).
- **Tailwind v4** via `@theme inline`; the two font families are self-hosted locally in `public/fonts/` and declared via `@font-face` in `src/globals.css` with preload in `index.html`. This keeps font loading local; other features may make network requests as described in the Privacy Policy.
- **Every setting persists** through `src/utils/settings` with the `settings-*` key convention, and components react via the subscribe pattern — UI state and stored state must never drift.
- **Icons:** Lucide, stroke 1.5 for ambient text icons (weather), 2–2.5 for control icons. Don't mix stroke weights inside one cluster.

---

## 10. Slop Guardrails (do NOT)

- ❌ No new hues beyond the active accent + neutrals + semantic rose. No violet/cyan *nebula* gradients, no rainbow glows.
- ❌ No flat gray `#e5e7eb`-style borders. Hairlines come from `--glass-border` tokens only.
- ❌ Do not introduce a new display/body font family or choose Inter, Roboto, or Poppins as a brand face without updating this guide. Existing system fallback stacks may include browser-default sans-serif fonts.
- ❌ No glass added to flat contexts, no borders around cards that already separate by whitespace or tint.
- ❌ No glow stacking: one accent glow per view/state maximum.
- ❌ No oversized headline blocks, no pill-badge+CTAs marketing heroes — this is a tool page, not a landing page.
- ❌ Keep motion within the curve/duration band. Prefer finite animations; ambient loops should be deliberate, unobtrusive, and documented (the current code may contain legacy loading loops that still need review).
- ❌ No components rendered with hardcoded colors, radii, or shadows when a token exists.

---

## 11. Mobile & Touch

**The start page is a phone surface too.** The calm obsidian canvas must survive a 375px viewport and a thumb, not just a mouse. Rules for anything new:

- **Safe areas are tokens.** `--safe-area-top/right/bottom/left` (from `env(safe-area-inset-*)`) wrap every fixed corner surface — weather, mail, customize trigger, credits pill — via `max()` so notchless devices keep the original padding. `viewport-fit=cover` in every HTML head makes them real.
- **Dynamic viewport units.** Sheets and page containers use `h-dvh` / `min-h-dvh`, never `h-screen`, so mobile browser chrome can't clip or jump the layout.
- **Pointer-coarse mode is a product mode, not an afterthought.** Hover-only affordances (edit pencils, tooltips, hover glows) must have an always-visible or tap-reachable equivalent on touch; the globals.css `@media (pointer: coarse)` block kills sticky hover transforms and tap-flash globally.
- **Touch target goal: 44px minimum.** New suggestion rows, drawer rows, and icon-only controls should target ~44px on `max-sm:` breakpoints; audit existing controls against this goal.
- **Mobile input goal: 16px.** New form fields should be ≥16px on mobile to avoid iOS focus zoom; audit existing inputs against this goal.
- **Full-bleed surfaces on phones.** The preferences drawer is full-width with a top hairline on `max-sm:` (sheet, not side panel); the search suggestions and weather forecast drop as bottom-anchored cards pinned above the home indicator instead of floating dropdowns.
- **Breakpoint vocabulary:** `max-sm:` (phones) tightens, `sm:` keeps the spec'd desktop values. Greeting drops from `pt-[18vh]` to `pt-[12vh]` so search stays thumb-reachable.

## Status

This is a forward-looking design guide for the v1.0.0 product direction, not a complete implementation audit. Some details are aspirational and should be reconciled with shipped UI as that UI is revised. Known review areas include small dense labels, mobile hit areas and input sizes, APCA measurement, and legacy animation loops. Fonts are self-hosted; online features and third-party requests are documented in the Privacy Policy and `THIRD-PARTY-NOTICES.md`.
