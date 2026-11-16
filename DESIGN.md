# ArtLedger — Design System

Normative reference for every screen under `app/**`. Values come from the brand kit (colour slides 10–12,
typography slide 14). When code and this document disagree, this document is the contract: fix both in the
same change.

Scope: presentation only. Architecture, layering, API and Web3 rules live in `AGENTS.md`.

---

## 0. At a glance

| Concern          | Value                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| Primary blue     | `#0144DB` — the only action colour                                     |
| Primary green    | `#33D387` fill / `#067A4B` text — verified, confirmed, completed       |
| Canvas / surface | `#FAFAFA` / `#FFFFFF`                                                  |
| Support colours  | `#FED200` pending · `#FF8647` failure · `#0FFDC1` detail               |
| Headlines        | **Inter** 400 with `tracking-tight` — never bold                       |
| Body             | **Inter** 400 / 500 / 600 / 700                                        |
| Technical        | **Geist Mono** 400 / 500 — ids, addresses, hashes, CIDs                |
| Shape            | pill buttons, 10px fields, 16px cards, 24px panels, one soft shadow    |

---

## 1. Principles

1. **Trust before decoration.** This is a verification tool. A reader must be able to tell _verified_,
   _pending_ and _rejected_ apart in under a second, without reading a paragraph.
2. **Two brand colours, three state colours, no more.** Blue and green are the identity; yellow, orange and
   neon exist only to describe state. A new hue is a design decision, not a styling decision.
3. **One family, two roles.** Inter carries every heading, label and paragraph; Geist Mono is reserved for
   values a reader might copy (ids, addresses, hashes, CIDs). There is no third family.
4. **Separation by hairline, then one soft shadow.** Depth comes from a 1px border and a surface change; one
   low-contrast shadow marks resting cards, a second marks anything that floats. Two shadows exist in total
   (§5), and they never stack.
5. **Every value is verifiable.** Token IDs, wallet addresses, SHA-256 fingerprints and CIDs are always
   monospace, `tabular-nums`, copyable, and shown in full on demand — never an ellipsis without a copy
   affordance.

---

## 2. Colour

### 2.1 Primary

| Token            | Hex       | RGB            | CMYK      | Use                                                           |
| ---------------- | --------- | -------------- | --------- | ------------------------------------------------------------- |
| `--color-brand`      | `#0144DB` | 1 · 68 · 219   | 88-74-0-0 | the only action colour: CTA, links, focus ring, active rows |
| `--color-accent`     | `#33D387` | 51 · 211 · 135 | 66-0-67-0 | fills only: verified badge, stamp, timeline dots, ribbons   |
| `--color-accent-ink` | `#067A4B` | 6 · 122 · 75   | 95-0-39-52 | green **text** on white (5.39:1) - never the fill itself    |
| `--color-accent-wash`| `#EDFBF4` | 237 · 251 · 244 | 6-0-3-2  | band behind a proof section, verified panel tint           |

Blue and green together are the logo, so they never compete: green appears **only** where something _is_
verified or already confirmed. Green is never a second call-to-action; the one exception is the connect button
on the blue shell (§2.5). The lockup itself is
blue + green (§6.1), so the brand green is present in the shell on every screen.

**Green budget.** Every route shows at least one green signal per viewport, always attached to verification or
on-chain state: the network chip in the header, the ringed Ethereum badge that marks Sepolia in the chain ticker under the
header, the sample-certificate edge, the stats
rule, the three verification modules, the proof band, the artwork ribbon, completed stepper markers, the
"chủ hiện tại" marker in a timeline and the footer dot. A screen with no verification state shows none - that
is the point of the colour.

**The shell.** The header and footer are the one large blue surface in the product: `bg-brand` with white text
(7.37:1, §2.5), muted shell text at `text-ink-inverse/80` (5.24:1), and `border-brand-strong` where the bar
meets the page. They are the frame, not a call to action, so no Primary button lives permanently in them.
Inside that blue, green keeps its meaning: the Sepolia dot, and the **solid `bg-accent` pill behind the current
nav label**, whose label is white and semibold — the one recorded contrast exception in §2.5 (1.94:1; blue on
green would be 3.79:1, so neither colour is "free" there). The shell also carries one *required* action, so the
wallet cluster's `Kết nối ví` is the only filled **`accent`** pill there (§7.1) and `Ngắt` stays an `inverse`
outline: filled connect, outlined disconnect, never two filled pills side by side. Body content stays on `canvas`/`surface`; the shell
never bleeds into a card.

The logo mark is blue **and** green on transparency (§6.1), so on the blue shell it sits on a `bg-surface` tile
(32px in the header, 28px in the footer) with the mark at 20px / 16px inside it. Without the tile the blue half
of the mark disappears into the bar.

### 2.2 Support — state only

| Token            | Hex       | RGB            | CMYK       | Use                                             |
| ---------------- | --------- | -------------- | ---------- | ----------------------------------------------- |
| `--color-warn`   | `#FED200` | 254 · 210 · 0  | 1-15-100-0 | pending, awaiting signature, testnet notice     |
| `--color-danger` | `#FF8647` | 255 · 134 · 71 | 0-58-76-0  | revert, rejection, hash mismatch                |
| `--color-neon`   | `#0FFDC1` | 15 · 253 · 193 | 56-0-42-0  | 1px detail or halo, ≤5% of a screen, never text |

The kit contains no red, so `#FF8647` carries destructive and error states. It is always a _tinted
background with ink text and an icon_ — never orange text on white (see §2.5).

### 2.3 Neutrals

| Token                     | Value     | Use                                                    |
| ------------------------- | --------- | ------------------------------------------------------ |
| `--color-canvas`          | `#FAFAFA` | page background                                        |
| `--color-surface`         | `#FFFFFF` | cards, sheets, menus, modals                           |
| `--color-surface-muted`   | `#F5F5F5` | insets, table heads, step cards, window chrome         |
| `--color-hairline`        | `#E5E5E5` | decorative 1px borders and dividers                    |
| `--color-hairline-strong` | `#8A8A8A` | form-control borders only (3.45:1, WCAG 1.4.11)        |
| `--color-ink`             | `#0A0A0A` | primary text                                           |
| `--color-ink-muted`       | `#737373` | secondary text (4.74:1 on white)                       |
| `--color-ink-inverse`     | `#FFFFFF` | text on blue only                                      |

`canvas`, `surface` and `ink-*` are the brand neutrals; `surface-muted`, `hairline`, `hairline-strong` and
`ink-muted` are _steps_ between them, added because WCAG cannot be met with four values alone. They are
neutral greys, not new hues.

### 2.4 Tint ladders

The guideline defines colour strength from 20% to 100% (slide 10). Each step is the brand colour mixed
over white at that strength, so tints never introduce a second hue.

| Blue           | Hex       | Green           | Hex       |
| -------------- | --------- | --------------- | --------- |
| brand-soft 20% | `#CCDAF8` | accent-soft 20% | `#D6F6E7` |
| brand-tint 40% | `#99B4F1` | accent-tint 40% | `#ADEDCF` |
| brand-mid 60%  | `#678FE9` | accent-mid 60%  | `#85E5B7` |
| brand-deep 80% | `#3469E2` | accent-deep 80% | `#5CDC9F` |
| brand 100%     | `#0144DB` | accent 100%     | `#33D387` |

Three derived shades complete the system:

| Token                  | Value     | Derivation                          |
| ---------------------- | --------- | ----------------------------------- |
| `--color-brand-strong` | `#003ABA` | brand + 15% black — hover / pressed |
| `--color-warn-soft`    | `#FFF6CC` | yellow at 20% — pending surface     |
| `--color-danger-soft`  | `#FFE7DA` | orange at 20% — failure surface     |

### 2.5 Contrast (measured, WCAG 2.1)

| Foreground | Background | Ratio  | Verdict                                     |
| ---------- | ---------- | ------ | ------------------------------------------- |
| `#0144DB`  | `#FFFFFF`  | 7.1:1  | AA text, AAA large — body and links allowed |
| `#FFFFFF`  | `#0144DB`  | 7.1:1  | white text on blue is allowed               |
| `#0A0A0A`  | `#33D387`  | 10.2:1 | the only text colour on green               |
| `#067A4B`  | `#FFFFFF`  | 5.39:1 | green text is allowed at this shade only    |
| `#33D387`  | `#FFFFFF`  | 1.94:1 | **fail** — fill only, never text            |
| `#0A0A0A`  | `#FED200`  | 13.6:1 | the only text colour on yellow              |
| `#FED200`  | `#FFFFFF`  | 1.45:1 | **fail** — fill only                        |
| `#0A0A0A`  | `#FF8647`  | 8.2:1  | the only text colour on orange              |
| `#FF8647`  | `#FFFFFF`  | 2.4:1  | **fail** — fill only                        |
| `#0A0A0A`  | `#0FFDC1`  | 14.9:1 | decorative only                             |
| `#0FFDC1`  | `#FFFFFF`  | 1.33:1 | **fail** — never text                       |
| `#737373`  | `#FFFFFF`  | 4.74:1 | secondary text                              |
| `#8A8A8A`  | `#FFFFFF`  | 3.45:1 | form borders (non-text 3:1)                 |
| `#0144DB`  | `#D6F6E7`  | 6.38:1 | blue label on an accent-soft wash (cards, banners) |
| `#0A0A0A`  | `#33D387`  | 10.19:1 | ink label on a green fill — the default   |
| `#FFFFFF`  | `#33D387`  | 1.94:1 | **fail** — accepted for the current nav segment and the connect button (see below) |
| `#0144DB`  | `#33D387`  | 3.79:1 | **fail** — never blue text on solid green   |
| `#D6F6E7`  | `#0144DB`  | 6.38:1 | accent-soft pill / current tab on the shell |
| `#FFFFFF`  | `#0144DB`  | 7.37:1 | white text and icons on the blue shell      |
| 80% white  | `#0144DB`  | 5.24:1 | muted shell text (`text-ink-inverse/80`)    |
| 70% white  | `#0144DB`  | 4.35:1 | **fail** — never `text-ink-inverse/70`      |
| `#737373`  | `#0144DB`  | 1.55:1 | **fail** — no `ink-muted` on the shell      |
| `#33D387`  | `#0144DB`  | 3.79:1 | dot and border only (3:1 non-text), no text |

**Hard rules**

- White text is allowed on **blue only**.
- Green, yellow, orange and neon always carry `text-ink`, plus an icon or a label.
- Colour is never the only signal: every state also has words.

**Recorded exception.** The current nav segment and the shell's `Kết nối ví` button are the only two elements
allowed to break the rule above: a solid `bg-accent` `#33D387` fill whose label is `text-ink-inverse`. White on
that green measures **1.94:1**, so it is a deliberate product decision, not an oversight. What keeps it usable:
the label is `font-semibold`, the segment is redundant with `aria-current="page"`, the button always carries a
verb and a disabled state, `hover` steps to `accent-deep` (`#5CDCA0`) and the focus ring is re-pointed to
`outline-ink-inverse`. The connect button dims to `opacity-90` while focused, which takes the pair to roughly
**1.8:1** — the dim is the product owner's requested feedback, and it is the reason the ring, not the fill, has
to carry focus. Neither element ever stands alone as the only carrier of meaning. If readability ever wins, the
fix is one class — `bg-accent-ink` (`#067A4B`) puts the same white label at **5.39:1** with no other change.
- Never render a state colour as text on a light surface.

### 2.6 Token → utility map

| Intent            | Classes                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------- |
| Primary action    | `bg-brand text-ink-inverse hover:bg-brand-strong`                          |
| Secondary action  | `border border-hairline bg-surface text-ink hover:bg-ink/5`                |
| Verified          | `bg-accent-soft text-ink` + `bg-accent` dot; stamps use `bg-accent`        |
| Verified text     | `text-accent-ink` (never `text-accent`)                                    |
| Pending           | `bg-warn-soft text-ink`                                                    |
| Failed            | `bg-danger-soft text-ink`                                                  |
| Selected / active | lists, tabs, menu rows: `bg-ink/[0.06] text-ink`; header segment, tab bar and `Công cụ` current: `bg-accent text-ink-inverse font-semibold` (§2.5 exception, §7.11) |
| Shell             | header and footer: `bg-brand text-ink-inverse`; muted shell text `text-ink-inverse/80` |
| Divider           | `border-hairline`                                                          |
| Focus             | `outline-brand` (2px, 2px offset)                                          |
| Card              | `rounded-card border border-hairline bg-surface shadow-card`               |
| Panel             | `rounded-panel border border-hairline bg-surface shadow-overlay`           |
| Eyebrow           | `eyebrow` (Geist Mono, uppercase, `text-ink-muted`)                        |

### 2.7 Retirement and prohibitions

- `#0068FF`, `#00CF6A`, `#003380` were earlier approximations and are **retired**. Do not reintroduce them.
- No gradients, no glassmorphism, no `backdrop-blur` above 8px, no `shadow-lg`/`shadow-xl`.
- No dark theme and no `prefers-color-scheme` override — the brand kit defines a light system only.
- No colour-only states, no coloured text for status, no new hues.

## 3. Typography

### 3.1 Families

| Role         | Family             | Weights          | Source                                     | Applied to                                   |
| ------------ | ------------------ | ---------------- | ------------------------------------------ | -------------------------------------------- |
| UI + display | **Inter**          | variable 400–700 | `next/font/google`, `latin` + `vietnamese` | H1–H4, paragraphs, labels, buttons, tables  |
| Technical    | **Geist Mono**     | variable 400–500 | `next/font/google`, `latin` + `vietnamese` | token IDs, addresses, hashes, CIDs, code     |
| Fallback     | system sans / mono | —                | —                                          | first paint before the webfont lands         |

### 3.2 Wiring

```ts
// app/fonts/index.ts
export const inter = Inter({ subsets: ['latin', 'vietnamese'], variable: '--font-inter' });
export const geistMono = Geist_Mono({ subsets: ['latin', 'vietnamese'], variable: '--font-geist-mono' });
```

- Loaded once on `<html>` in `app/layout.tsx`; `next/font` self-hosts both files, so the browser never calls
  Google and there is no layout shift on first paint.
- Exposed as `--font-display`, `--font-sans` and `--font-mono` in `app/globals.css` (`@theme inline`).
- Utilities: `font-sans` (default on `body`), `font-mono`, and the `eyebrow` utility for mono micro-labels.
- Both families ship a Vietnamese subset, so diacritics never fall back mid-sentence.
- The SVN kit in `app/fonts/*.otf` is kept as brand source art but is no longer wired into the bundle.

### 3.3 Non-negotiable rules

1. **Headings are normal weight.** Inter 400 with `tracking-tight` (`-0.025em`) is the display voice; bold at
   large sizes reads as shouting. `@layer base` pins `h1–h4` to 400.
2. Four body weights only: **400** body, **500** UI labels, **600** emphasis and buttons, **700** wordmark.
3. Vietnamese diacritics need vertical air: body `leading-6`/`leading-7`, display `leading-[1.05]`.
4. Never letterspace body text. Mono micro-labels use the `eyebrow` utility (`tracking-[0.08em]`, uppercase).
5. Measure 60–75 characters (`max-w-2xl`; hero `max-w-xl`); the landing hero is the only centred block.
6. `text-wrap: balance` is applied to headings only — never to table cells or hash values.

### 3.4 Scale

| Token      | Classes                                            | Family / weight | Use                                        |
| ---------- | -------------------------------------------------- | --------------- | ------------------------------------------ |
| Display XL | `text-4xl sm:text-5xl lg:text-6xl tracking-tighter` | Inter 400       | landing hero H1                            |
| Display L  | `text-3xl sm:text-4xl tracking-tight`              | Inter 400       | section H2, closing CTA                    |
| Page title | `text-2xl sm:text-3xl tracking-tight`              | Inter 400       | `PageHeader` H1 on every non-landing route |
| Heading    | `text-base font-semibold tracking-tight`           | Inter 600       | card and module titles                     |
| Body L     | `text-base leading-7 sm:text-lg`                   | Inter 400       | lead paragraph                             |
| Body       | `text-sm leading-6`                                | Inter 400       | default UI text                            |
| Label      | `text-sm font-medium`                              | Inter 500       | buttons, table heads, chips                |
| Eyebrow    | `eyebrow` utility                                  | Geist Mono 500  | section labels, field captions             |
| Numeric    | `tabular-nums` (+ `font-mono` for ids)             | Inter / mono    | counts, balances, token IDs                |
| Code       | `font-mono text-xs tabular-nums`                   | Geist Mono 400  | hashes, addresses, CIDs                    |

---

## 4. Layout & spacing

### 4.1 Frame

- Container: `mx-auto w-full max-w-6xl px-4 sm:px-6` — 1152px content, 16→24px gutters. The landing hero is
  the one narrower column (`max-w-3xl`), because it is centred.
- Header: `h-14`, `sticky top-0 z-10`, `border-b border-brand-strong`, `bg-brand text-ink-inverse` (opaque, so
  no blur). Contents (nav, wallet cluster) and the mobile tab bar are specified in §7.11.
- Footer: `border-t border-brand-strong`, `bg-brand text-ink-inverse`, `py-10`, three zones (brand + chain chip,
  route links, contract link).
- Section rhythm — two scales, chosen per screen (§4.4):
  - **Marketing** (`/` only): `py-16 sm:py-24`, with `py-20 sm:py-28` for the framed panel band.
  - **App** (every other route): `py-8 sm:py-12`, so the first control is visible without scrolling.
  - Two adjacent sections always differ by a hairline or a surface.
- Page root: `flex flex-1 flex-col`; sections own their vertical padding (no wrapper margins). Below `md`
  the root adds `pb-[calc(3.5rem+env(safe-area-inset-bottom))]` so the tab bar never covers content.

### 4.2 Spacing

4px base scale — 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (`gap-1 … gap-16`). Card interior `p-6`, toolbar
`p-4`, table cell `px-4 py-3`.

### 4.3 Grid

| Purpose                    | Classes                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Module / feature cards     | `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` — six modules lay out 3 × 2, never 4 + 2 |
| Artwork cards (`/library`) | `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`                                          |
| Two-up panels              | `grid gap-4 sm:grid-cols-2`                                                         |
| Form fields                | `grid gap-4 sm:grid-cols-2`                                                         |
| Reading column             | `max-w-2xl`                                                                         |
| Form column                | left track of the task layout (§4.4); a standalone single-column form is `max-w-md` |

Below `sm` everything is one column. Only hash chips and data tables may scroll horizontally.

### 4.4 Page patterns

Every route is built from one of four patterns. The pattern is chosen in design, not in code review; the
per-screen detail is in §10.1.

| Pattern | Routes                             | Skeleton                                           | Rhythm    |
| ------- | ---------------------------------- | -------------------------------------------------- | --------- |
| Landing | `/`                                | full-bleed chain ticker → centered hero (badge → H1 → lead → CTAs → mono line) → framed panel → stats → market preview → module grid → proof band → CTA | marketing |
| Task    | `/register`, `/transfer`, `/check` | `PageHeader` → two tracks: form + sticky aside     | app       |
| Browse  | `/library`, `/profile`             | `PageHeader` → sticky toolbar → card grid or table | app       |
| Proof   | `/verify`, `/lab`                  | `PageHeader` → verdict or log → evidence tracks    | app       |

**PageHeader** — the one header block for every non-landing route. It sits on `bg-surface` with a hairline
below, so the page body starts on the canvas.

```html
<header class="border-b border-hairline bg-surface">
  <div
    class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-10"
  >
    <div class="max-w-2xl">
      <p
        class="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-muted"
      >
        Đăng ký
      </p>
      <h1 class="mt-2 font-display text-2xl leading-tight sm:text-3xl">
        Đăng ký tác phẩm
      </h1>
      <p class="mt-2 text-sm leading-6 text-ink-muted">
        Tải ảnh lên, lưu IPFS và đúc NFT (mint) trong bốn bước.
      </p>
    </div>
    <div class="flex gap-3"><!-- optional actions; at most one Primary --></div>
  </div>
</header>
```

**Task layout** — form on the left, context on the right. The aside is the only sticky element below the
header (`top-24` = 64px header + 32px air).

```html
<div
  class="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12"
>
  <div class="space-y-6">
    <!-- compact StepProgress (lg:hidden), then the form -->
  </div>
  <aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
    <!-- StepProgress vertical (hidden lg:block), NFT preview inset, summary -->
  </aside>
</div>
```

- `StepProgress` is rendered twice and swapped with `lg:hidden` / `hidden lg:block`; `display: none` removes
  the hidden copy from the accessibility tree, so screen readers hear it once.
- The preview is a `bg-surface-muted` inset inside the aside card, never a second card.

**Layers** — one scale, no ad-hoc `z-*`.

| Layer                             | z       | Notes                                          |
| --------------------------------- | ------- | ---------------------------------------------- |
| Sticky toolbar                    | `z-[5]` | `top-16`, sits under the header                |
| Header, tab bar                   | `z-10`  |                                                |
| Modal (`sm+`), tray (`<sm`), menu | `z-30`  | scrim `bg-ink/40`, no blur                     |
| Toast, tooltip                    | `z-40`  | above modals so a confirmation is never hidden |

---

## 5. Radii & elevation

| Token              | Value | Use                                         |
| ------------------ | ----- | ------------------------------------------- |
| `rounded-full`     | —     | buttons, nav links, tabs, pills, chips      |
| `--radius-control` | 10px  | inputs, menu items, icon chips, hash chips  |
| `--radius-card`    | 16px  | cards, modals, artwork tiles, step cards    |
| `--radius-panel`   | 24px  | hero frames, verdict banner, empty states   |
| `rounded-md`       | 6px   | inline code                                 |

- `--shadow-card` = `0 1px 2px rgb(10 10 10 / 0.04), 0 1px 3px rgb(10 10 10 / 0.06)` — resting cards and fields.
- `--shadow-overlay` = `0 12px 32px -8px rgb(10 10 10 / 0.14), 0 4px 12px rgb(10 10 10 / 0.06)` — modals,
  trays, menus, toasts, tooltips and the framed hero panel.
- Never stack two shadows, never tint a shadow, never blur beyond 32px.

---

## 6. Iconography

- Icons come from `lucide-react`, named imports, `size` 16 inline / 18 inside buttons / 24 in empty states, the tab bar and the verdict banner,
  `strokeWidth={2}`.
- **Third-party chain badges are the one exception**, and they get their own subsection (§6.2): they are brand
  art, so their palette belongs to the brand, not to a design token.
- Icon chip: 40×40, `rounded-control bg-brand-soft text-brand`; the verified variant is
  `bg-accent-soft text-ink` (green text on a green tint fails contrast — §2.5).
- Icons are decorative by default (`aria-hidden`). An icon-only control needs `aria-label`.
- No emoji in product UI, and never an icon as the only carrier of a state.

### 6.1 Brand assets

| Asset | File | Intrinsic size | Where it is used |
| --- | --- | --- | --- |
| Logo lockup (mark + wordmark) | public/brand/art-ledger-logo.png | 520 × 615 | **retired from the product** — the hero no longer renders it (the chain ticker took that slot under the header); kept in `public/brand/` for off-site use. It is a stacked lockup, so it never goes into the 56px header |
| Mark | public/brand/art-ledger-mark.png | 256 × 222 | header (20px on a 32px `bg-surface` tile) and footer (16px on a 28px tile), beside the typographic wordmark — the mark is blue + green, so it needs the light tile on the blue shell |
| Favicon | app/icon.png | 256 × 256 | Next file convention, with app/apple-icon.png at 180 × 180 |
| Chain badges | public/brand/chains/*.png — twenty files, listed in §6.2 | 96 × 96 each | the landing chain ticker only (§6.2, §7.27) — the marks the product owner supplied, normalised onto a 96px canvas, ~83 KB for all twenty |

- All brand PNGs are cropped to their alpha bounds; never re-add padding around them. The chain badges are
  normalised onto a 96px canvas and never upscaled.
- The lockup is blue + green, which is what keeps the brand green on screen even when no state is shown.
- Do not recolour, stretch or place the lockup on a tinted surface; it is drawn for bg-surface.
- The favicon is the mark only: at 16–32px the wordmark is illegible.

### 6.2 Third-party chain badges

`public/brand/chains/` holds the **twenty** marks the product owner supplied — btc, eth, usdt, bnb, xrp, sol,
sei, link, ada, xmr, uni, avax, ltc, sui, dot, pol, arb, plus three the artwork alone could not name
(`mark-bars`, `mark-arcs`, `mark-e`) — each normalised onto a 96px canvas and rendered at 44px. They are the
**only** place in the repo where a colour outside §2 is allowed to exist, because the colour is not ours:

- **Never retint, recolour or tokenise a badge.** The palette in the file is the brand's. The previous rule
  forced every mark to `fill='currentColor'`; that was right for hand-drawn paths and wrong for real logos,
  which is why it was replaced instead of amended (§7.27).
- **44px, always inside the band's `bg-surface`.** A pale mark (Ethereum, and the three white discs) takes
  `ring-1 ring-hairline` so its edge does not dissolve into the white; the live chain's badge takes
  `ring-2 ring-accent`.
- **Every mark is a disc** — `rounded-full` + `overflow-hidden`, so a mark drawn on an opaque white square clips
  to its own ring instead of showing corners. This set has no square exception.
- **Decorative by contract.** Every badge is `alt=''` inside an `aria-hidden` strip. The only meaning in the
  marquee is the word `Sepolia` beside the ringed badge plus one `sr-only` sentence — never a silent claim of
  multi-chain support. That is also why an unidentified mark may keep a neutral `mark-*` slug: no name is ever
  rendered, so a wrong guess would be a code-comment problem, not a false claim on screen.
- **Vendored, never fetched.** No runtime CDN, no package dependency and no `remotePatterns` entry — the bytes
  ship with the repo, and each mark stays its rightsholder's trademark, used here for identification only.

---

## 7. Component recipes

Copy these classes; do not invent variants. Every state change in a component also needs words.

Each recipe is **Stable** unless marked **Alpha** (API may change) or **Deprecated** (kept for one release,
with a pointer to its replacement). Composite recipes (card, modal, tray, stepper, table) are built from
slots — see §15 — so a variant is a different composition, not another boolean prop.

### 7.1 Button

Base: `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50`

| Size           | Classes                                  |
| -------------- | ---------------------------------------- |
| `sm`           | `h-8 px-3 text-xs pointer-coarse:h-11`   |
| `md` (default) | `h-10 px-4 text-sm pointer-coarse:h-11`  |
| `lg`           | `h-11 px-5 text-sm sm:h-12 sm:text-base` |

| Variant     | Classes                                                           |
| ----------- | ----------------------------------------------------------------- |
| Primary     | `bg-brand text-ink-inverse hover:bg-brand-strong`                 |
| Secondary   | `border border-hairline bg-surface text-ink hover:bg-ink/5`       |
| Inverse     | `border border-ink-inverse/25 text-ink-inverse hover:bg-surface/15` |
| Accent      | `bg-accent text-ink-inverse hover:bg-accent-deep focus-visible:opacity-90 focus-visible:outline-ink-inverse` |
| Ghost       | `text-ink-muted hover:bg-ink/5 hover:text-ink`                    |
| Destructive | `border border-danger/40 bg-danger-soft text-ink hover:bg-danger` |
| Link        | `px-0 text-brand underline-offset-4 hover:underline`              |

Rules: one primary button per view; a loading button keeps its width and swaps the label for
`Đang xử lý…` plus a 16px spinner; never white text on orange. `sm` grows to 44px on coarse pointers; the header
wallet button is always **Accent** — a green fill with a white label — so it reads as the shell's one action and
never competes with the page's single primary, while `Ngắt` beside it stays **Inverse** (filled connect, outlined
disconnect, never two filled pills). **Inverse** is the only variant built for the blue shell (§4.1): it takes a
white focus ring, because the global one is brand blue (§9). **Accent** exists for the connect action alone
(§2.1, §2.5) — it is not a general green variant, so it never appears inside page content, where green still
means "verified".

**Icon button** — for copy, close, overflow and similar single-glyph actions.

```html
<button
  aria-label="Đóng"
  class="inline-flex h-9 w-9 items-center justify-center rounded-control text-ink-muted
        hover:bg-canvas hover:text-ink pointer-coarse:h-11 pointer-coarse:w-11"
>
  <!-- lucide X, size 18 -->
</button>
```

`aria-label` is required (§9). Navigation is a link (`<a>`), an action is a button — the look never decides the
element (§15).

### 7.2 Card

```html
<article
  class="rounded-card border border-hairline bg-surface p-6 shadow-card"
></article>
```

- Hover elevation only when the whole card is a link (`hover:border-brand`).
- Never nest two cards — use a `bg-surface-muted` inset instead.
- Title (`text-lg`) sits 16px below the top padding (`mt-4` when a number or icon precedes it).
- Anatomy, all optional and composed rather than switched on by props:
  - `CardHeader` — title (`text-lg`) with an optional trailing action or pill, `mb-4`.
  - `CardBody` — the content.
  - `CardFooter` — `mt-6 flex flex-wrap justify-end gap-3 border-t border-hairline pt-4`, holds the actions;
    at most one Primary.

### 7.3 Status pill

Pill base: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium`

| State          | Classes                                                   | Label              |
| -------------- | --------------------------------------------------------- | ------------------ |
| Verified       | `bg-accent-soft text-ink` + `bg-accent` dot               | Đã xác thực        |
| Pending        | `bg-warn-soft text-ink`                                   | Đang chờ xác nhận  |
| Failed         | `bg-danger-soft text-ink`                                 | Giao dịch thất bại |
| Not registered | `border border-hairline bg-surface text-ink-muted`        | Chưa đăng ký       |

Colour is never the only signal: every pill carries text.

### 7.4 Field

```html
<label class="block">
  <span class="text-sm font-medium text-ink">Tên tác phẩm</span>
  <input
    class="mt-1 h-10 w-full rounded-control border border-hairline-strong bg-surface px-3 text-sm shadow-card
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
  />
  <span class="mt-1 block text-xs text-ink-muted">Tối đa 100 ký tự.</span>
</label>
```

- Labels are always visible; placeholders never replace them.
- Focus uses the standard 2px outline (§9); a border colour change alone is not a focus indicator.
- Invalid: `border-danger` on the control plus a `bg-danger-soft text-ink` message with an alert icon.
- Native validation messages are replaced by Vietnamese copy (§11).

### 7.5 Hash chip

```html
<span
  class="inline-flex max-w-full items-center gap-2 rounded-lg bg-canvas px-2 py-1 font-mono text-xs"
>
  <span class="truncate">0x7a3F…9cE1</span>
  <button
    aria-label="Sao chép địa chỉ ví"
    class="relative inline-flex h-6 w-6 items-center justify-center rounded text-brand before:absolute before:-inset-2.5 before:content-['']"
  >
    <!-- lucide Copy, size 16 -->
  </button>
</span>
```

- The full value lives in `title` and in the clipboard payload.
- Token IDs are never truncated (`#128`).
- Hashes never wrap (`whitespace-nowrap`); the chip scrolls instead.
- The copy button is 24px visually but its `before:` pseudo-element extends the hit area to 44×44.
- After copying, the label changes to `Đã sao chép` for 2 seconds inside a `role=status` region.
- One tone variant exists, `tone="brand"`, used only inside the blue shell (§7.11): `bg-surface/15
  text-ink-inverse` with a white copy icon and a `text-ink-inverse/80` label. Everything else keeps the default
  `bg-ink/[0.04] text-ink` chip on a light surface; the brand tone is never used in page content.

### 7.6 Transfer timeline

- Rail 2px `bg-hairline`; 12px dots — mint `bg-brand`, transfer `bg-accent`, current owner
  `ring-2 ring-accent`.
- Row: action (`text-sm font-bold`), address (`font-mono text-xs`), timestamp
  (`font-mono text-xs tabular-nums`), Etherscan link (`text-brand text-xs`).
- Empty state: `Chưa có giao dịch chuyển nhượng.`

### 7.7 StepProgress (mint flow)

| Stage | Dot         | Label            |
| ----- | ----------- | ---------------- |
| 1     | `bg-brand`  | Đã chọn ảnh      |
| 2     | `bg-brand`  | Đã lưu lên IPFS  |
| 3     | `bg-warn`   | Chờ ký giao dịch |
| 4     | `bg-accent` | Hoàn tất         |

Failed stage keeps its position and turns `bg-danger` with a retry button — the flow never resets itself.

**Anatomy** — each step is a marker, a connector and a label; the three are separate slots (§15), so the
failed state replaces the marker and label for one step instead of creating a second stepper.

- Marker: 24px circle (`h-6 w-6 rounded-full`) holding a 16px icon, so state never rests on colour alone —
  done `Check`, waiting `Loader` (spinner), upcoming the step number (`tabular-nums`), failed `X`. Icon colour
  follows §2.5 (`text-ink-inverse` on `bg-brand`, `text-ink` on the other fills).
- Connector: 2px `bg-hairline`; the completed span is `bg-brand`.
- Label: `text-sm`; the active step is `font-bold`. The failed step adds a visually hidden `Thất bại` and an
  inline Secondary `sm` button `Thử lại`; the stages after it stay inactive.

**Orientation** — `horizontal` from `sm` to `lg` (above the form), `vertical` below `sm` and in the `lg+` aside.

**Behaviour** — steps are defined once outside the component with stable ids (`pick`, `pin`, `sign`, `done`).
The controller exposes `goToStep`, `goNext`, `goPrevious` and `reset`; `reset` runs only on an explicit user
action (`Đăng ký tác phẩm khác`). A `complete` flag marks the end after on-chain confirmation. Sub-steps are not
used in the mint flow; where another flow needs them, nest one level at most.

**Hooks for styling and tests** — every step carries `data-step-active`, `data-step-visited`,
`data-step-complete` and `data-step-error` (`"true"` / `"false"`), styled with `data-[step-active=true]:`
variants rather than extra class props.

**Accessibility** — the container is `role="status"` with `aria-label="Tiến trình đăng ký"`, and the active step
carries `aria-current="step"`.

### 7.8 Network banner

```html
<div
  role="status"
  class="border-b border-hairline bg-warn-soft px-4 py-3 text-sm text-ink"
>
  Ví đang ở mạng khác. Chuyển sang Sepolia để tiếp tục.
  <button
    class="ml-3 inline-flex h-9 items-center rounded-control bg-brand px-3 text-xs font-bold
                 text-ink-inverse"
  >
    Chuyển sang Sepolia
  </button>
</div>
```

Full-width directly under the header — never a toast, because the action is required and blocking. It sits
in the flow (not sticky). Every write control it disables carries `aria-describedby` pointing at the banner text. It is the blocking specialisation of the generic Banner (§7.17).

### 7.9 Async states

| State   | Recipe                                                                                                           |
| ------- | ---------------------------------------------------------------------------------------------------------------- |
| Loading | Skeletons in the final shape (`bg-surface-muted animate-pulse`), at most three blocks, never a full-page spinner |
| Empty   | Title + one sentence + the primary action that fills it                                                          |
| Error   | What happened → why → next step, plus a retry button                                                             |
| Success | Result, then Etherscan and IPFS links; no confetti, no sound                                                     |

### 7.10 Table

- Head `bg-surface-muted text-xs font-bold text-ink-muted`; rows 56px with `border-t border-hairline`,
  hover `bg-canvas`.
- Numbers right-aligned with `tabular-nums`; addresses and hashes monospace.
- Below `sm` rows become `ListCell` rows (§7.21); only hash-heavy tables may scroll horizontally.
- Every table has a caption: visible when it names the data, otherwise `<caption class="sr-only">`.

### 7.11 Navigation & wallet cluster

Seven routes are too many for one flat bar, so they are grouped by job.

| Group   | Items                                        | Placement                                    |
| ------- | -------------------------------------------- | -------------------------------------------- |
| Primary | Thư viện · Đăng ký · Chuyển nhượng · Tra cứu | header nav (`md+`), tab bar (`<md`)          |
| Tools   | Kiểm tra ảnh · Phòng thí nghiệm              | `Công cụ` menu (`md+`), `Thêm` sheet (`<md`) |

```html
<header
  class="sticky top-0 z-10 h-14 border-b border-brand-strong bg-brand text-ink-inverse"
>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-ink focus:outline-ink"
    >Bỏ qua điều hướng</a
  >
  <div class="mx-auto flex h-full max-w-6xl items-center gap-6 px-4 sm:px-6">
    <a href="/" class="flex items-center gap-2 text-[17px] font-semibold tracking-tight text-ink-inverse">
      <span class="inline-flex h-8 w-8 items-center justify-center rounded-control bg-surface">
        <!-- mark 20px: blue + green, so it needs the light tile on the blue bar -->
      </span>
    </a>
    <nav aria-label="Chính" class="hidden flex-1 items-center gap-1 md:flex">
      <a
        href="/library"
        aria-current="page"
        class="inline-flex h-8 items-center rounded-full px-3 text-sm font-medium text-ink-inverse/80 transition-colors hover:bg-surface/15 hover:text-ink-inverse focus-visible:text-ink-inverse focus-visible:outline-ink-inverse aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-ink-inverse"
        >Thư viện</a
      >
      <!-- … Đăng ký · Chuyển nhượng · Tra cứu · Công cụ (disclosure button, aria-expanded) -->
    </nav>
    <div class="ml-auto flex items-center gap-2"><!-- chain chip + wallet cluster --></div>
  </div>
</header>
```

- The bar is **opaque blue**, so it carries no `backdrop-blur` (§2.7). Muted shell text is
  `text-ink-inverse/80` (5.24:1); `text-ink-muted` on blue is 1.55:1 and never appears here (§2.5).
- The **current segment** is the brand green used at full strength: a solid `bg-accent` (#33D387) pill with a
  **white semibold label**. White on green is 1.94:1 — the single recorded exception in §2.5, chosen by the
  product owner; the pill is redundant with `aria-current="page"` and never carries meaning alone, and
  `bg-accent-ink` restores 5.39:1 if that trade is ever reversed. There is no ring: it would sit at 1:1–1.2:1
  against the fill and the bar. `Công cụ` takes the same pill while one of its routes is current, and its menu
  rows match so the state reads the same in both places. Keyboard focus on the bar is the white outline (§9).
- **Focus on the bar lifts the label to full white** — a muted `text-ink-inverse/80` item becomes
  `focus-visible:text-ink-inverse` (7.37:1) under a white ring, so the focused item is the brightest thing in
  the bar. On the current pill focus adds the ring only, since its label is already white.
- The `Công cụ` menu is `rounded-card border border-hairline bg-surface p-2 shadow-overlay` — white, because it
  floats over the page, not over the bar. Esc closes it and returns focus to its button.
- **Mobile tab bar** (`<md`): five slots, never more, on the same `bg-brand` with a `border-brand-strong` top
  edge. Muted items are `text-ink-inverse/80`; the current slot becomes a `bg-accent` tile with a white semibold
  label (rounded 10px, inset by `m-1.5`, 44px tall so the tap target holds) — same exception as the header pill.
  The header keeps only the wordmark and the wallet cluster.

```html
<nav
  aria-label="Chính"
  class="fixed inset-x-0 bottom-0 z-10 border-t border-brand-strong bg-brand pb-[env(safe-area-inset-bottom)] md:hidden"
>
  <ul class="grid grid-cols-5">
    <li>
      <a
        href="/library"
        aria-current="page"
        class="flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink-inverse/80 transition-colors focus-visible:text-ink-inverse focus-visible:outline-ink-inverse aria-[current=page]:m-1.5 aria-[current=page]:h-11 aria-[current=page]:rounded-control aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-ink-inverse"
      >
        <!-- lucide icon, size 24 -->
        Thư viện</a
      >
    </li>
    <!-- … Đăng ký · Chuyển nhượng · Tra cứu · Thêm (opens the sheet) -->
  </ul>
</nav>
```

- The `Thêm` sheet is `rounded-t-card bg-surface shadow-overlay` over a `bg-ink/40` scrim, traps focus, and
  closes on Esc or scrim tap.
- **Wallet cluster** follows the state matrix (§8) and is built for the blue bar: Secondary stays the white pill
  (`Kết nối ví`, `Cài MetaMask`), `Ngắt` is the `inverse` variant (§7.1), the chrome icon link is
  `text-ink-inverse/80 hover:bg-surface/15`, and the address chip passes `tone="brand"` (`bg-surface/15
  text-ink-inverse`). The connected network dot is `bg-accent`: it is the green signal the bar carries on every
  route (§2.1), and a `bg-brand` dot would be invisible on `bg-brand`.

| State            | Cluster                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| MetaMask missing | Secondary `sm` link `Cài MetaMask` (white pill on blue)                                  |
| Disconnected     | Secondary `sm` button `Kết nối ví` (white pill on blue)                                  |
| Wrong chain      | `bg-warn-soft text-ink` pill `Sai mạng` + address chip; the action lives in the banner (§7.8) |
| Connected, idle  | pill `sepolia` (`border-ink-inverse/25 text-ink-inverse/80`, `bg-accent` dot) + address chip |
| Mining           | pill swaps to Pending `Đang chờ xác nhận`                                                |

On mobile the pill keeps its word; the address chip shortens to `0x7a…9cE1` with the copy button kept.

### 7.12 Verdict banner

The first thing on `/verify` and the result strip on `/check`: the answer before the evidence.

| State             | Surface            | Icon chip                   | Pill label        |
| ----------------- | ------------------ | --------------------------- | ----------------- |
| Verified          | `bg-accent-soft`   | `bg-accent text-ink`        | Đã xác thực       |
| Pending           | `bg-warn-soft`     | `bg-warn text-ink`          | Đang chờ xác nhận |
| Failed / mismatch | `bg-danger-soft`   | `bg-danger text-ink`        | Không khớp        |
| Not registered    | `bg-surface-muted` | `bg-surface text-ink-muted` | Chưa đăng ký      |

```html
<section
  role="status"
  class="flex flex-col gap-4 rounded-card border border-hairline bg-accent-soft p-6 shadow-card sm:flex-row sm:items-center"
>
  <span
    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accent text-ink"
    ><!-- icon 24 --></span
  >
  <div class="min-w-0 flex-1">
    <span
      class="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink"
    >
      <span class="h-2 w-2 rounded-full bg-accent"></span>Đã xác thực</span
    >
    <p class="mt-2 text-sm leading-6 text-ink">
      Token <span class="font-bold tabular-nums">#128</span> thuộc về ví bên
      dưới.
    </p>
  </div>
</section>
```

The failed variant uses `role="alert"` and the copy from §11. Text is always `text-ink`.

### 7.13 Hash comparison

Used on `/check`. The registered fingerprint and the file's fingerprint sit side by side, split into eight
groups of eight hex characters so a difference can be found by eye.

```html
<div class="grid gap-4 sm:grid-cols-2">
  <section class="rounded-card border border-hairline bg-surface p-6">
    <h2 class="font-display text-lg">Bản đã đăng ký</h2>
    <p
      class="mt-4 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs tabular-nums sm:grid-cols-4"
    >
      <span>7a3f09c1</span>
      <!-- … 8 groups -->
    </p>
  </section>
  <section class="rounded-card border border-hairline bg-surface p-6">
    <!-- same grid for the uploaded file -->
  </section>
</div>
```

- A differing group gets `bg-danger-soft font-bold` and a visually hidden `lệch`; the heading of the panel
  states the count (`2/8 nhóm lệch`), so colour is never the only signal.
- The verdict banner (§7.12) sits above the two panels. Both fingerprints keep a copy button (§7.5).
- Below `sm` the panels stack: registered first, uploaded second.

### 7.14 Artwork card & library toolbar

```html
<a
  href="/verify?token=128"
  class="block overflow-hidden rounded-card border border-hairline bg-surface shadow-card hover:border-brand"
>
  <div class="relative aspect-[4/3] bg-surface-muted">
    <img src="…" alt="Tên tác phẩm" class="h-full w-full object-cover" />
    <span
      class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink"
    >
      <span class="h-2 w-2 rounded-full bg-accent"></span>Đã xác thực</span
    >
  </div>
  <div class="p-4">
    <h3 class="font-display text-lg leading-tight">Tên tác phẩm</h3>
    <p class="mt-2 flex items-center justify-between text-xs">
      <span class="font-bold tabular-nums">#128</span>
      <span class="font-mono text-ink-muted">0x7a3F…9cE1</span>
    </p>
  </div>
</a>
```

- The whole card is the link, so the hash text inside is not a second control; its full value is in `title`.
- Toolbar: `sticky top-16 z-[5] border-b border-hairline bg-surface p-4`, with a result count
  (`128 tác phẩm`, `tabular-nums`), search, filter and a two-button view toggle. The toggle uses
  `aria-pressed`; the active button is `bg-brand-soft text-brand-strong border-brand`.
- The table view reuses §7.10; the choice persists for the session only.
- **Pagination** — 24 works per page. Below the grid: `nav aria-label="Phân trang"` with Secondary `sm` buttons
  `Trước` / `Sau`, page numbers as links (current: `aria-current="page"`, `bg-brand-soft text-brand-strong
border-brand`), and `Hiển thị 1–24 / 128` in `text-xs text-ink-muted tabular-nums`. The page number lives in
  the URL (`?page=2`) so a result can be shared.

### 7.15 Tabs

- A segmented pill control: `role="tablist"` on `inline-flex gap-1 rounded-full bg-ink/[0.04] p-1`; each tab
  `h-9 px-4 text-sm font-medium text-ink-muted`, selected `bg-surface text-ink shadow-card`. Arrow keys move
  between tabs.
- Panels are addressable by hash (`#metadata`, `#lich-su`) so a link can open the right panel.

### 7.16 Revert log

- `role="log"`, `aria-live="polite"`, on a `bg-surface-muted` inset inside the card: `font-mono text-xs`.
- Row: time (`tabular-nums`), scenario, contract reason, and a Failed pill with the label `Bị từ chối`.
- Newest first; capped at 50 rows with a `Xóa nhật ký` ghost button.

### 7.17 Banner

The page-level notice. In flow, full width, never sticky and never floating.

| Variant  | Surface            | Role     | Example                      |
| -------- | ------------------ | -------- | ---------------------------- |
| Neutral  | `bg-surface-muted` | `status` | `Đang xem ở chế độ chỉ đọc.` |
| Pending  | `bg-warn-soft`     | `status` | no MetaMask, testnet notice  |
| Failed   | `bg-danger-soft`   | `alert`  | IPFS or contract failure     |
| Verified | `bg-accent-soft`   | `status` | `Đã ghi lên chuỗi.`          |

```html
<div
  role="status"
  class="border-b border-hairline bg-warn-soft px-4 py-3 text-sm text-ink"
>
  <div class="mx-auto flex max-w-6xl items-start gap-3">
    <!-- lucide icon, size 18 -->
    <p class="flex-1 leading-6">
      <span class="font-bold">Chưa tìm thấy MetaMask.</span> Cài tiện ích để kết
      nối ví.
    </p>
    <a
      class="shrink-0 font-bold text-brand underline-offset-4 hover:underline"
      href="…"
      >Cài MetaMask</a
    >
    <!-- optional dismiss: icon button (§7.1), only when the banner is not blocking -->
  </div>
</div>
```

- One banner at a time. Priority: wrong network → no wallet → everything else.
- A banner that blocks an action (wrong network) is not dismissible. Others may be, for the session.
- Text is always `text-ink`; the link is `text-brand` on a tinted surface (7.1:1 holds on `warn-soft` and
  `accent-soft`; check `danger-soft` with the pairing in §2.5 before using a link there — use a button instead).

### 7.18 Toast

Non-blocking confirmation only.

- Allowed: `Đã sao chép`, `Đã lưu bộ lọc`. Not allowed: errors, anything with a decision, anything the user
  must read to continue (those are banners or inline messages, §7.9).
- `role="status"`, `rounded-control border border-hairline bg-surface px-4 py-3 text-sm shadow-overlay`.
  Bottom-left on `md+`; on `<md` it sits above the tab bar (`bottom-[calc(4.5rem+env(safe-area-inset-bottom))]`).
- One at a time (new replaces old). Auto-dismiss after 5s; the timer pauses on hover and focus. A toast with an
  action does not auto-dismiss. Under `prefers-reduced-motion` it fades only.

### 7.19 Modal and tray

One overlay concept, two presentations: **modal** from `sm` up, **tray** below.

- Modal: centred, `max-w-md`, `rounded-card bg-surface p-6 shadow-overlay`, scrim `bg-ink/40`.
- Tray: `fixed inset-x-0 bottom-0 z-30 max-h-[85dvh] overflow-y-auto rounded-t-card bg-surface shadow-overlay
pb-[env(safe-area-inset-bottom)]`, with a decorative grabber (`mx-auto mt-3 h-1 w-10 rounded-full
bg-hairline-strong`).
- Anatomy (slots): `Header` (title + close icon button), `Body`, `Footer` (actions, at most one Primary; on
  the tray the actions stack full width).
- Used for: the `Thêm` menu, the mobile filter on `/library`, and the transfer confirmation on `<sm`.
- Both set `aria-modal="true"`, trap focus, close on Esc and on scrim tap, and return focus to the trigger.
  A destructive confirmation does not close on scrim tap.

### 7.20 Tooltip

- Explains a term or reveals a full value on hover **and** focus; on touch it opens on tap. It never holds the
  only copy of anything: the jargon gloss on first use stays in the text (§11), and a truncated hash keeps its
  copy button.
- `role="tooltip"` linked with `aria-describedby`; surface `rounded-control border border-hairline-strong
bg-surface px-3 py-2 text-xs text-ink shadow-overlay`, `max-w-xs`. No white-on-ink tooltips (§2.5).
- The trigger must be focusable; Esc dismisses it.

### 7.21 ListCell

The row used for compact lists and for tables below `sm`.

```html
<a
  href="/verify?token=128"
  class="flex min-h-14 items-center gap-3 border-t border-hairline px-4 py-3 hover:bg-canvas"
>
  <span
    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand"
    ><!-- icon / thumbnail --></span
  >
  <span class="min-w-0 flex-1">
    <span class="block truncate text-sm font-bold">Tên tác phẩm</span>
    <span class="block truncate text-xs text-ink-muted"
      >Chuyển nhượng · 12/11/2026</span
    >
  </span>
  <span class="shrink-0 text-right">
    <span class="block text-sm font-bold tabular-nums">#128</span>
    <span class="block font-mono text-xs text-ink-muted">0x7a3F…9cE1</span>
  </span>
</a>
```

- Slots: media, title, description, detail, subdetail. Omit any; the row keeps its height.
- A navigable row is one link; a trailing `ChevronRight` (16) is optional and `aria-hidden`.
- Used for: table rows `<sm`, transfer history, token-lookup results, the revert log on mobile.

### 7.22 SectionHeader

`PageHeader` (§4.4) appears once per page and holds the `h1`. `SectionHeader` introduces each block inside it.

```html
<div class="flex items-end justify-between gap-4">
  <div class="max-w-2xl">
    <h2 class="font-display text-2xl leading-tight">Tác phẩm mới đăng ký</h2>
    <p class="mt-1 text-sm leading-6 text-ink-muted">
      Cập nhật theo thời gian thực từ Sepolia.
    </p>
  </div>
  <a
    class="shrink-0 text-sm font-bold text-brand underline-offset-4 hover:underline"
    href="/library"
    >Xem tất cả</a
  >
</div>
```

The description and the trailing link are optional. Heading levels never skip (`h1` → `h2` → `h3`).

### 7.23 DataCard

One figure with its label, for the landing stat strip and library summaries.

```html
<article class="rounded-card border border-hairline bg-surface p-6 shadow-card">
  <p class="text-xs font-bold text-ink-muted">Tác phẩm đã đăng ký</p>
  <p class="mt-2 font-display text-3xl leading-tight tabular-nums">128</p>
  <p class="mt-1 text-xs text-ink-muted">+4 trong 7 ngày qua</p>
</article>
```

- Grid: `grid gap-4 sm:grid-cols-3`. The figure is `text-ink`; it is never coloured by trend.
- Loading: a skeleton of the final shape (§7.9). Empty: `—`, not `0`, when the value is unknown.
- A counter may count up once on first view (≤600ms); under reduced motion it appears at its final value.
  Token IDs, hashes and addresses never animate.

### 7.24 First-run hint

A lightweight coachmark, not a tour.

- Anchored popover (`rounded-card border border-hairline bg-surface p-4 shadow-overlay`, `max-w-xs`) with one
  sentence, one `Đã hiểu` Ghost button and a close icon button.
- At most one per screen, shown once per browser session, never over a blocking banner, and never before the
  page is usable. It does not trap focus and never auto-opens a modal.
- Reserved for the two moments that need it: connecting a wallet and the first mint.

---

### 7.25 Profile card & wallet aside

```html
<article class="rounded-card border border-hairline bg-surface p-6 shadow-card sm:p-7">
  <div class="flex flex-wrap items-start gap-4">
    <span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-xl font-semibold text-brand">MA</span>
    <div class="min-w-0 flex-1">
      <h2 class="text-xl font-semibold leading-tight tracking-tight text-ink">Nguyễn Minh Anh</h2>
      <div class="mt-2 flex flex-wrap items-center gap-2"><!-- HashChip + StatusPill --></div>
    </div>
    <div class="flex flex-wrap gap-2"><!-- at most one Primary: Sửa hồ sơ --></div>
  </div>
  <p class="mt-5 text-sm leading-6 text-ink-muted">Giới thiệu…</p>
</article>
```

- The avatar is an IPFS image or two initials on `bg-brand-soft text-brand`; never a letter on the accent green.
- Status is one pill: `Bản nháp trên thiết bị` (neutral) or `Đã công bố` (verified tone). "Đã công bố" means a CID
  exists, not that the wallet signed the document — one muted sentence in the card footer says so.
- The aside is `Card` + `CardHeader` with `lg:sticky lg:top-20 lg:self-start`: balance in
  `text-3xl font-normal tabular-nums`, the address chip, then one secondary action (`Cập nhật`) and one text link
  (`Nhận ETH thử`).
- Owned artworks reuse the library card (§7.14) in the Browse grid, so `/profile` adds no new artwork variant.
- `/profile?uri=ipfs://…` reuses the same card read-only; the claim that reading it does not prove authorship
  belongs in the footer, not in a tooltip.
- `/profile` closes with the wallet's own transactions (§7.26), mined from the contract's `Transfer` logs.

### 7.26 Transactions table & gas column

| Piece     | Recipe                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| Table     | §7.10 columns *Giao dịch · Đối tác · Thời điểm · Phí (ETH) · Mã tx*, inside `rounded-card border border-hairline bg-surface shadow-card` |
| Kind      | Lucide icon + word: `Đăng ký` (mint, `Plus`), `Nhận` (`ArrowDownLeft`), `Chuyển đi` (`ArrowUpRight`), `Tự chuyển` (`ArrowRight`); the token id follows in Geist Mono, linking to `/verify?tokenId=n` |
| Fee       | `gasUsed × effectiveGasPrice` from the receipt, six decimals (`0.000723`), `tabular-nums`, right-aligned — never an estimate |
| Payer     | A row the wallet did not send shows its fee plus `người gửi trả` in 11px muted; only rows it sent feed the total        |
| Missing   | No receipt → `—` with `Không đọc được biên lai.`, never `0`                                                             |
| Mobile    | Stacked rows: kind + token, fee on the right, then `thời điểm · đối tác` and one `Xem trên Etherscan` link              |
| Summary   | `N giao dịch · tổng phí đã trả 0.00xxxx ETH`, or `ví chưa tự trả phí giao dịch nào`                                     |

States follow §7.9. The section says the history is the contract's `Transfer` logs, because without an indexer
plain ETH transfers cannot be enumerated; a total that only covers the newest 25 receipts must say so.

### 7.27 Chain ticker (full-bleed, under the header)

`components/brand/ChainMarquee.tsx`, a full-bleed band pinned directly under the sticky header. It replaces the
static chain rail: same idea, but the strip moves.

**Deprecated and removed in the same change:** the *Chain rail* recipe and `components/brand/ChainRail.tsx`. Its
monochrome `fill='currentColor'` marks and its `Đang chạy` / `Chưa hỗ trợ` groups were exactly the behaviour being
replaced, so nothing is kept alongside — the successor is this marquee with the §6.2 badges, which carry each
chain's real palette. Any older reference to a "chain rail" in a branch or a PR means this recipe.

| Piece      | Recipe                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Placement  | Directly under the 56px sticky header, above the hero, and **full bleed**: `w-full overflow-hidden border-b border-hairline bg-surface py-4`. It is not sticky — the header stays the only fixed chrome — so the band scrolls away with the page                                      |
| Frame      | Edge to edge: no pill, no `max-w`. The band is clipped by `overflow-hidden` on its own full-width box, so there is no `mask-image` and no new gradient (the §12 gradient rule still holds) |
| Track      | `chain-marquee` — plain CSS in `app/globals.css` (`display:flex; width:max-content; animation: chain-marquee 30s linear infinite`) plus a top-level `@keyframes`. Deliberately **not** an `--animate-*` theme token: the keyframes and the rule ship as ordinary CSS, so no theme rebuild or utility-ordering accident can leave the strip frozen |
| Copies     | Two identical lists, `flex min-w-[100vw] shrink-0 items-center justify-around gap-8 pr-8`; the track shifts exactly `-50%` (one whole list). `min-w-[100vw]` makes a list at least a viewport wide and `pr-8` equals `gap-8`, so the seam between the lists is the same width as the gaps inside them at every viewport |
| Items      | Twenty **44px** brand badges (§6.2) — larger than a normal mark because this band is the landing page's title treatment; `shrink-0`, pale marks take `ring-1 ring-hairline`, every one clipped to `rounded-full`                                      |
| Live chain | The Ethereum badge carries `ring-2 ring-accent` plus the word `Sepolia` in `font-mono text-sm text-ink` — the only ringed and the only labelled item                        |
| Motion     | The product's only looping animation: 30s linear, infinite. **No hover pause** — a strip that freezes under a resting pointer reads as broken, and this band sits where the cursor already is. `prefers-reduced-motion: reduce` drops the animation, hides the duplicate list (`[data-duplicate='true']`) and lets the remaining one wrap centred |
| Mobile     | Same band at every width: `min-w-[100vw]` keeps the loop correct from 360px up, the badges never shrink, and nothing is hidden for space; the frame never widens the page                                                                                      |

**The strip is ornament, so it makes no claim.** Twenty brand marks would otherwise read as twenty supported
chains, so the whole track is `aria-hidden` and the only thing assistive tech receives is one sentence:
*ArtLedger hiện chỉ đọc và ghi trên Sepolia. Các huy hiệu chuỗi còn lại chỉ để tham chiếu hệ sinh thái, không phải
chuỗi được hỗ trợ.* The visible truth is the ringed Ethereum badge and the word `Sepolia` beside it. A chain that
is genuinely added to the product gets its ring, its label and its own entry in `CHAINS` before it appears here —
the marquee never grows a `Đã hỗ trợ`-style label the contract cannot back, and it is never the only place a
reader learns which chain this runs on.

## 8. State matrix

| Wallet        | Network     | Transaction          | UI                                                                                                               |
| ------------- | ----------- | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| not installed | —           | —                    | read-only screens still work; a `bg-warn-soft` note links to the MetaMask site; write buttons disabled           |
| disconnected  | —           | —                    | read-only surfaces plus one primary `Kết nối ví` in the page's action area; the header copy is Secondary (§7.11) |
| connected     | wrong chain | —                    | network banner (§7.8); every write control disabled                                                              |
| connected     | Sepolia     | idle                 | primary actions enabled                                                                                          |
| connected     | Sepolia     | awaiting signature   | stepper stage 3, buttons disabled, `role=status`                                                                 |
| connected     | Sepolia     | mining               | stage 3 spinner + pending pill                                                                                   |
| connected     | Sepolia     | confirmed            | success pill, token ID, Etherscan link                                                                           |
| connected     | Sepolia     | rejected by the user | neutral copy, **no danger styling**, retry allowed                                                               |
| connected     | Sepolia     | reverted             | danger block with the contract reason and a link to the existing token                                           |
| any           | any         | IPFS failure         | danger block on the pin stage only; retry re-pins without re-reading the file                                    |

---

## 9. Accessibility

- Contrast follows §2.5: body text ≥ 4.5:1, large text and control borders ≥ 3:1.
- Focus is always visible: 2px `--color-brand` outline, 2px offset. Never `outline: none` without a
  replacement. On the blue shell (§2.1) that ring is 1:1, so every shell control — nav segments, the `Công cụ`
  trigger, the tab bar, footer links, the wallet cluster and the `inverse` button — re-points it with
  `focus-visible:outline-ink-inverse`; the skip link, whose white card sits on blue, uses `focus:outline-ink`.
Focusing a muted shell item also lifts its label to full `text-ink-inverse`. The current segment is the one
documented contrast exception (§2.5): white on `#33D387` is 1.94:1, kept because the product owner chose white
on the green pill; `bg-accent-ink` is the 5.39:1 swap if that is ever revisited.
- Pointer targets are at least 44×44 on touch — the `md` button is 44px tall, `sm` grows with
  `pointer-coarse:h-11`, and small controls such as the hash-chip copy button extend their hit area (§7.5).
- Async changes are announced: `role=status` (polite) for progress, `role=alert` for failures. A state never
  changes silently.
- Icon-only buttons need `aria-label` (for example `Sao chép địa chỉ ví`).
- Links that leave the app say so in words: `Xem trên Etherscan`.
- `prefers-reduced-motion: reduce` replaces pulses and spinners with an opacity change, disables transitions and
  stops the chain ticker under the header: `app/globals.css` drops its `animation`, hides the duplicate list and
  lets the remaining one wrap centred, so the band becomes a static row of badges.
- The document language is Vietnamese (`<html lang='vi'>`), so screen readers pronounce diacritics correctly.
- Every page starts with a skip link to `#main`; both navs are `aria-label="Chính"` (only one is visible at a
  time) and the current page carries `aria-current="page"`.
- Tabs follow the WAI-ARIA tab pattern (arrow keys); view toggles use `aria-pressed`; trays and modals trap
  focus and close on Esc.
- Composite components take an accessible name (`aria-label` / a visible heading): stepper, tabs, pagination,
  both navs, tables (caption). Toasts and tooltips never carry the only copy of an error or an instruction.

---

## 10. Screen inventory

| Route       | Screen             | Primary job                              | Key components                                                |
| ----------- | ------------------ | ---------------------------------------- | ------------------------------------------------------------- |
| `/`         | Tổng quan          | explain the product and route into it    | hero, market preview (real tokens), stats, module cards      |
| `/library`  | Thư viện           | browse every registered work             | card grid, filter, empty state                                |
| `/profile`  | Hồ sơ              | edit a display profile, read balance, owned NFTs and gas spent | identity card, wallet aside, owned grid, transactions table (§7.26), edit modal |
| `/register` | Đăng ký tác phẩm   | upload → pin → simulate → mint           | dropzone, metadata form, step progress                        |
| `/transfer` | Chuyển nhượng      | hand a token to another wallet           | token lookup, owner check, recipient field, confirm modal     |
| `/verify`   | Tra cứu & xác thực | prove ownership without a wallet         | owner card, metadata panel, transfer timeline, explorer links |
| `/lab`      | Phòng thí nghiệm   | show the contract refusing bad actions   | scenario cards, revert log                                    |
| `/check`    | Kiểm tra ảnh       | compare an image against its fingerprint | dropzone, hash comparison, result pill                        |

Every screen keeps the same frame: header, container, section rhythm, footer. The footer is `bg-brand` with a
`border-brand-strong` top edge and `py-8`: the product name and `Sepolia testnet` on the left, README and
contract links on the right, stacked below `sm`. Its text is white, with `text-ink-inverse/80` for the secondary
lines and the route links (§2.1).

### 10.1 Screen layouts

| Screen      | Pattern | Desktop (`lg+`)                                                                                                                                                                                                        | Mobile                                                                                                                                      |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`         | Landing | A full-bleed chain ticker (§7.27) flush under the header, then the centered hero: `sepolia` badge, H1, lead, `Đăng ký tác phẩm` (Primary) + `Tra cứu không cần ví` (Secondary), mono line. Then a stat strip of DataCards (§7.23), the market preview (4 real artwork cards), the module grid (3 × 2), the proof band. | Hero stays centered and stacks; the ticker keeps scrolling edge to edge; market preview becomes 1 column, then 2 from `sm`; module cards one column. |
| `/library`  | Browse  | Sticky toolbar, then 4-column artwork cards or the table view, with pagination (§7.14) below.                                                                                                                          | Toolbar wraps to two rows (search above filters), filters open in a tray; 1 column, then 2 from `sm`; the table view becomes ListCell rows. |
| `/profile`  | Browse  | Identity card (avatar, display name, address chip, status pill, edit/publish) on the left with the wallet aside (360px, sticky) on the right: balance, address, refresh, faucet. Then the owned-NFT grid with its own refresh, then the transactions table (§7.26). Editing opens the shared modal. | Everything stacks: identity card, wallet card, owned grid 1 → 2 columns, transactions as stacked rows; the edit form becomes the bottom tray. |
| `/register` | Task    | Form left; right aside holds the vertical StepProgress, the NFT preview and a summary.                                                                                                                                 | Compact horizontal stepper above the form; preview below it.                                                                                |
| `/transfer` | Task    | Left: token lookup → owner check → recipient field. Right: token preview and a plain-language summary of the change. The confirm modal uses `shadow-overlay`.                                                          | Same order, one column.                                                                                                                     |
| `/verify`   | Proof   | Verdict banner, then a 360px sticky track (artwork + owner card) and a fluid track with tabs `Siêu dữ liệu` / `Lịch sử chuyển nhượng`, ending in the explorer links.                                                   | Banner, owner card, artwork, then tabs.                                                                                                     |
| `/check`    | Task    | Dropzone left; result right: verdict banner above the hash comparison (§7.13).                                                                                                                                         | Dropzone, verdict, registered fingerprint, uploaded fingerprint.                                                                            |
| `/lab`      | Proof   | Scenario cards (2 columns) left; the revert log (§7.16) in a sticky right track.                                                                                                                                       | Scenarios first, log below.                                                                                                                 |

The sample certificate on `/` is labelled `Mẫu minh hoạ` (a muted pill) and uses obviously fictional values
(`Token #1`, `0x0000…0000`), so it can never be mistaken for a real verification.

---

## 11. Voice & copy

| Situation      | Copy                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| Empty library  | `Thư viện chưa có tác phẩm nào. Đăng ký tác phẩm đầu tiên để bắt đầu.`      |
| No wallet      | `Chưa tìm thấy MetaMask. Cài tiện ích để kết nối ví và đăng ký tác phẩm.`   |
| Wrong network  | `Ví đang ở mạng khác. Chuyển sang Sepolia để tiếp tục.`                     |
| User rejected  | `Bạn đã hủy giao dịch. Không có thay đổi nào được ghi lên chuỗi.`           |
| Duplicate file | `Ảnh này đã được đăng ký ở Token #128. Mỗi tệp chỉ tương ứng một tác phẩm.` |
| Not the owner  | `Ví hiện tại không phải chủ sở hữu Token #128.`                             |
| Hash mismatch  | `Mã băm không khớp với bản đã đăng ký — tệp có thể đã bị chỉnh sửa.`        |
| IPFS failure   | `Không tải được tệp lên IPFS. Kiểm tra kết nối và thử lại.`                 |

Rules: Vietnamese, sentence case, a verb on every button, no blame, and always the next step. Jargon gets a
plain-Vietnamese gloss the first time it appears (`mint (đúc NFT)`).

---

## 12. Do and do not

**Do**

- Use `bg-brand` for the single primary action and `bg-accent-soft text-ink` for a verified state.
- Keep the page rhythm: header → container → sections separated by a hairline or a surface change.
- Pair every colour with a word and, where space allows, an icon.
- Use `tabular-nums` for counts, balances and token IDs.
- Keep headings at Inter 400 with `tracking-tight`; use `font-semibold` for card titles only.
- Use `text-accent-ink` when green has to be text, `bg-accent` when it is a fill, and remember the green budget (§2.1).
- Keep the hero marquee decorative: `aria-hidden` track, one `sr-only` sentence, hover pause and a reduced-motion
  stop (§7.27).
- Add every new screen to §10 before building it.

**Do not**

- Introduce a hue outside §2, or revive `#0068FF` / `#00CF6A` / `#003380`.
- Put white text on green, yellow or orange, or coloured text on white.
- Bold a heading, add a third typeface, or load a font outside `app/fonts/index.ts`.
- Use `text-accent` on a light surface — at 1.94:1 it is unreadable; that is what `text-accent-ink` is for.
- Add gradients (other than the hero's `from-accent-wash` fade), glassmorphism, or shadows beyond the two tokens in §5.
- Encode a state in colour alone, or hide a failure behind a generic message.
- Truncate a hash without giving the reader a copy button.
- Use the `accent` button variant inside page content — it is the shell's connect action — or let a strip of
  chain logos imply support the contract does not have.

---

## 13. Checklist for a new screen

1. Route lives under `app/<segment>/page.tsx`; no new shell, header or footer.
2. Frame and spacing follow §4 (container, section rhythm, one column below `sm`); the layout comes from a §4.4 pattern.
3. Zero literal colours — every value comes from a token in `app/globals.css`.
4. Inter on `h1–h4` at weight 400; body 400/500/600; hashes and ids in `font-mono` (Geist Mono).
5. All four async states are implemented (§7.9).
6. Status uses a pill from §7.3, with text.
7. Contrast checked against §2.5 — nothing coloured is used as text.
8. Copy reviewed against §11, including the failure paths.
9. Keyboard path works end to end; async results are announced.
10. `npx tsc --noEmit` and `npm run lint` are clean before review.
11. The screen declares its pattern (§4.4) and rhythm (marketing or app), and uses `PageHeader`.
12. Touch targets are 44×44, tablet and phone widths are checked, and the tab bar does not cover content.
13. Composite UI is built from slots (§15); overlays are a modal from `sm` and a tray below; confirmations are
    toasts only when nothing depends on them.
14. Every table has a caption, every composite has an accessible name, and state hooks use `data-*` attributes.

---

## 14. Tóm tắt tiếng Việt

- Bộ nhận diện dùng bốn màu gốc: xanh dương `#0144DB`, xanh lá `#33D387`, nền `#FAFAFA`, bề mặt
  `#FFFFFF`; ba màu phụ `#FED200` (chờ), `#FF8647` (lỗi), `#0FFDC1` (chi tiết) chỉ dùng cho trạng thái. Thêm
  `#067A4B` (`accent-ink`) cho chữ xanh lá và `#EDFBF4` (`accent-wash`) cho dải nền xác thực.
- Chữ: **Inter** cho tiêu đề và nội dung (tiêu đề để 400 + `tracking-tight`, tuyệt đối không in đậm);
  **Geist Mono** cho Token ID, địa chỉ ví, mã băm, CID. Cả hai nạp qua `next/font/google` với subset
  `vietnamese` trong `app/fonts/index.ts`; `next/font` tự host nên trình duyệt không gọi Google.
- Quy tắc tương phản: chỉ nền xanh dương mới được dùng chữ trắng; xanh lá, vàng, cam luôn đi với chữ màu
  `#0A0A0A` và kèm biểu tượng hoặc nhãn — không dùng màu làm tín hiệu duy nhất.
- Bo góc: nút, tab và chip dạng pill (`rounded-full`), ô nhập 10px, thẻ 16px, khung lớn (hero, verdict, empty)
  24px; viền 1px `#E5E5E5`, riêng viền ô nhập giữ `#8A8A8A` để đạt 3:1; chỉ hai mức đổ bóng, không gradient
  (ngoại lệ duy nhất là dải mờ `from-accent-wash` ở hero).
- Xanh lá hiện diện trên mọi màn hình — header, hero, thẻ xác thực, bước đã xong, timeline, footer — và luôn gắn
  với trạng thái đã xác thực. Ngoại lệ duy nhất là nút **`Kết nối ví`** trên thanh xanh: biến thể `accent`
  (`bg-accent`, chữ trắng, hover `accent-deep`, focus giảm còn 90% độ đậm) — đã ghi ở §2.5; cạnh nó, `Ngắt` vẫn
  là `inverse` viền trắng, không bao giờ có hai nút đặc đứng cạnh nhau.
- Hero landing không còn khung highlight xanh lá quanh một cụm từ trong H1 (nhãn `× đã xác thực` cũ đã bỏ), và
  **logo ArtLedger đã bỏ khỏi hero** — header và footer vẫn dùng mark. Sát ngay dưới header là **dải huy hiệu
  chuỗi chạy ngang, tràn hết chiều rộng màn hình** (§7.27): đủ **20 huy hiệu 44px** do chủ sản phẩm cung cấp
  (btc, eth, usdt, bnb, xrp, sol, sei, link, ada, xmr, uni, avax, ltc, sui, dot, pol, arb và 3 mark chưa đặt
  tên) lấy từ `public/brand/chains/`, lặp hai lần để cuộn liền mạch 30
  giây/vòng, không dừng khi rê chuột, bật giảm chuyển động thì đứng yên thành một hàng gói. Huy hiệu Ethereum có
  viền xanh lá và chữ `Sepolia` — chuỗi duy nhất đang chạy; cả dải là `aria-hidden`, chỉ còn một câu `sr-only`
  nói rõ các huy hiệu còn lại chỉ để tham chiếu. Huy hiệu giữ màu thương hiệu của chính nó (§6.2), không nhuộm
  lại theo token.
- Mọi giá trị màu nằm trong `app/globals.css` (`@theme`), không viết mã màu trực tiếp trong component.
- Mục 13 là checklist dựng màn hình mới; mục 8 là ma trận trạng thái ví/giao dịch cần phủ đủ.
- Bố cục: mỗi màn hình dùng một trong bốn mẫu ở §4.4 (Landing, Task, Browse, Proof); trang công cụ dùng nhịp
  `py-8 sm:py-12`, chỉ landing mới dùng `py-16 sm:py-24`.
- Điều hướng: header cao 56px nền xanh dương `bg-brand` chữ trắng, gom 4 mục chính (pill `rounded-full h-8`)
  + menu `Công cụ`; mục đang mở là pill **xanh lá đặc `bg-accent` (#33D387)** với **chữ trắng in đậm**. Chữ
  trắng trên nền xanh lá chỉ 1.94:1 — một trong hai ngoại lệ tương phản đã ghi nhận ở §2.5 (cùng nút
  `Kết nối ví`; chủ sản phẩm chọn,
  pill vẫn có `aria-current` nên không dựa vào màu); đổi sang `bg-accent-ink` là được 5.39:1 nếu cần đọc rõ hơn.
  Trên mobile là thanh tab dưới đáy cùng nền xanh, tối đa 5 ô, ô hiện tại là một ô `bg-accent` chữ trắng. Cụm ví luôn
  hiển thị mạng bằng chữ monospace kèm chấm xanh lá khi đang ở Sepolia; sai mạng thì đổi sang nền vàng kèm chữ
  `Sai mạng`. Footer cũng nền `bg-brand`, chữ trắng và chữ trắng 80% cho dòng phụ; logo là hình xanh dương +
  xanh lá nên đặt trên ô nền `bg-surface` (32px ở header, 28px ở footer) để không chìm vào nền xanh.
- Màn hình kết quả (`/verify`, `/check`) đặt kết luận lên đầu bằng Verdict banner, bằng chứng nằm bên dưới;
  mã băm so sánh theo 8 nhóm × 8 ký tự, nhóm lệch được tô nền và ghi bằng chữ.
- Vùng bấm tối thiểu 44×44 trên cảm ứng (`pointer-coarse:h-11`, hoặc utility `hit-area-44` cho nút icon nhỏ);
  viền control dùng `hairline-strong`.
- Ngôn ngữ thị giác theo primereact.dev: Inter + Geist Mono, nền gần trắng, viền hairline, bo góc lớn, eyebrow
  monospace, hero canh giữa. Component dùng lại: Banner, Toast, Modal/Tray, Tooltip, ListCell, SectionHeader,
  DataCard, Icon button và Phân trang (§7.17–7.24).
- Stepper có marker kèm icon (✓ / loading / ✕), hướng ngang hoặc dọc theo màn hình, và các thuộc tính
  `data-step-*` để style và kiểm thử.
- Toast chỉ dành cho xác nhận không chặn luồng; lỗi và việc cần quyết định dùng Banner hoặc thông báo trong
  trang. Modal dùng từ `sm` trở lên, dưới `sm` chuyển thành Tray.
- Quy ước kỹ thuật ở mục 15: ghép component từ các "slot", dùng CSS layer, `as` cho phần tử đa hình, trạng
  thái qua `data-*`.

---

## 15. Implementation conventions

Presentation-level rules that keep components consistent; architecture and Web3 rules stay in `AGENTS.md`.

1. **Compose from slots.** A composite component exposes named parts (`CardHeader / Body / Footer`, modal
   `Header / Body / Footer`, stepper `Icon / Label / Progress`, `ListCell` media / title / detail). A variant is
   a different composition or a per-slot override, never a new boolean prop on the parent. A slot set to `null`
   hides that part.
2. **Right element, any look.** Components accept `as` (for example `Button as={Link}`). Navigation renders an
   `<a>`, an action renders a `<button>`; styling never decides the element.
3. **CSS layers.** Tokens live in `@layer theme`, resets in `@layer base`, recipes reused three or more times in
   `@layer components`, one-off adjustments as utilities. Utilities therefore always win over a recipe, and
   `!important` is never needed.
4. **State through `data-*`.** Interactive components expose state as attributes (`data-state`,
   `data-step-active`, `data-selected`) and are styled with `data-[…]:` variants. The same attributes are what
   tests and analytics read.
5. **Responsive first in CSS, JavaScript second.** Use responsive utilities by default. A media-query hook is
   allowed only when the DOM must differ (modal vs tray, duplicated stepper) and is guarded by a mounted check
   so server and client render the same first paint.
6. **Accessible name is part of the API.** Composite components take a label prop and fail type-checking
   without it; icon buttons require `aria-label`.
7. **Agent-friendly docs.** Every new recipe ships a copyable snippet, its states, and its slots in this file,
   so a contributor or an agent can build it without opening a second source.
8. **Lifecycle.** A recipe that is replaced is marked Deprecated here for one release with a link to its
   successor, then removed together with its code (§ "When code and this document disagree").

---

## Related documents

| File                 | Content                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| `AGENTS.md`          | Architecture, layering, API and Web3 rules for contributors and agents |
| `README.md`          | What the app does, environment variables, how to run it                |
| `app/globals.css`    | The tokens themselves (`@theme` + `@theme inline` + `@layer base`)     |
| `app/fonts/index.ts` | `next/font/google` wiring for Inter and Geist Mono (Vietnamese subset) |
