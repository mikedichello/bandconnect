# BandConnect — ADA / WCAG 2.1 AA Accessibility Audit

**Standard:** WCAG 2.1 Level **AA** — the conformance target U.S. courts and the
DOJ treat as the practical benchmark for ADA Title III web accessibility.
**Scope:** the full BandConnect web app — public calendar, discovery, profiles,
auth, and the four-role dashboard — in **both light and dark themes**.
**Last reviewed:** 2026-06 · **Result:** conformant to WCAG 2.1 AA, with the
gaps found in this pass remediated (see [§3](#3-what-was-fixed-in-this-pass)).

---

## 1. Method

- **Static review** of every interactive surface: forms, buttons, links,
  dialogs, the calendar grid, and navigation.
- **Contrast math** on every foreground/background token pair in *both* palettes
  (sRGB relative luminance, WCAG formula) — not just the dark theme the app
  ships in by default.
- **Keyboard-only** pass: tab order, focus visibility, skip link, no traps.
- **Semantics/AT** pass: landmarks, headings, names/roles/values, live regions.

The earlier "accessibility pass" (icons + `aria-hidden`, skip link,
`:focus-visible`, reduced-motion, calendar ARIA grid, contrast bump on muted
text) is folded into the criterion table below; **§3** lists only what this
audit added.

---

## 2. Conformance summary

| Principle | Criteria reviewed | Status |
| --- | --- | --- |
| **Perceivable** | 1.1.1, 1.3.1, 1.3.2, 1.3.3, 1.3.5, 1.4.1, 1.4.3, 1.4.4, 1.4.5, 1.4.10, 1.4.11, 1.4.12, 1.4.13 | ✅ Conformant |
| **Operable** | 2.1.1, 2.1.2, 2.1.4, 2.4.1–2.4.7, 2.5.1–2.5.4 | ✅ Conformant |
| **Understandable** | 3.1.1, 3.2.1–3.2.4, 3.3.1–3.3.4 | ✅ Conformant |
| **Robust** | 4.1.2, 4.1.3 | ✅ Conformant |

Time-based-media criteria (1.2.x) are **N/A**: BandConnect hosts no first-party
audio/video. Event/profile media are user-supplied **embeds** (YouTube/Vimeo) or
linked files; caption responsibility lives with the source platform. The embed
`<iframe>`s carry a `title`.

---

## 3. What was fixed in this pass

All five issues below were real WCAG 2.1 AA failures, concentrated in **light
mode** (the app's default is dark, so light-mode regressions had gone unseen).

1. **1.4.3 Contrast (text) — light-mode links & status text.** ~36 link and
   status strings used `-300/-200` color shades (e.g. `text-brand-300`,
   `text-emerald-300`) that look right on dark surfaces but render at **1.5–2.1∶1**
   on white cards — a hard fail. Introduced a theme-aware **`.link`** component
   class (deep violet `brand-600/700` on light, lavender `brand-300/200` on dark
   — both ≥ 4.5∶1) and swept every link to it. Decorative/status text (initials
   bubbles, date labels, "✓ Saved", error and warning messages, calendar event
   chips) now uses the codebase's existing `text-X-700 dark:text-X-300` pattern,
   which passes in both themes. The pink `badge-accent` ("Free") label moved to
   `pink-700` in light.

2. **1.3.1 / 3.3.2 / 4.1.2 — unlabeled form controls.** 24 inputs across the
   event editor, media/availability managers, the profile editor, and the
   artists/venues search forms had a styled `.label` with **no programmatic
   association**. Fixed by (a) wiring `htmlFor`/`id` on every inline field,
   (b) refactoring the profile editor's shared `Field` to wrap its control in
   the `<label>` (implicit association, no id bookkeeping), and (c) adding
   `aria-label` to the three genuinely labelless inputs (message composer,
   media caption, availability filter). Tag-toggle button groups got
   `role="group"` + `aria-labelledby`.

3. **1.3.5 — Identify input purpose.** Added `autocomplete` to every auth field
   (`email`, `current-password`, `new-password`, `name`/`organization`,
   `address-level2`, `postal-code`) so password managers and assistive tech can
   prefill correctly.

4. **4.1.3 — Status messages.** Async confirmations and errors were rendered as
   plain text a screen reader never announced. Added `role="status"` (polite) to
   success confirmations (profile saved, alert saved, share sent, reset-link
   sent) and `role="alert"` (assertive) to every form error, plus
   `aria-live="polite"` on the profile editor's persistent status line.

5. **1.4.11 — Non-text contrast (form borders).** Input/select/textarea borders
   used `--c-line` (#e2e4ea), **~1.2∶1** on a white card — below the 3∶1 floor
   for control boundaries. Added a dedicated **`--c-field`** border token
   (#7c808b light / #6a6586 dark) used by `.input`; both clear 3∶1 against the
   field fill *and* the surrounding card.

Net diff: `globals.css` + `tailwind.config.ts` (tokens & `.link`), ~30
components/pages (labels, autocomplete, roles, theme-aware colors). Production
build, `tsc --noEmit`, and `next lint` are all green.

---

## 4. Criterion-by-criterion

Legend: ✅ Pass · 🔧 Pass (fixed in this audit) · — N/A

### Perceivable

| SC | Level | Status | Notes |
| --- | --- | --- | --- |
| 1.1.1 Non-text content | A | ✅ | `ImageWithFallback` makes `alt` a **required** prop; informative images get real alt text, the decorative profile banner uses `alt=""`. All icons are `lucide-react` with `aria-hidden="true"`; icon-only controls (theme toggle, menu, "use my location", notifications, thread back) have `aria-label`. |
| 1.2.x Time-based media | A/AA | — | No first-party media; user embeds carry an iframe `title` (see §2). |
| 1.3.1 Info & relationships | A | 🔧 | Semantic landmarks (`header`/`nav`/`main#main`/`footer`), heading hierarchy, `<dl>` detail lists, ARIA grid for the calendar. **Fixed:** all form labels now programmatically associated; toggle groups use `role="group"`. |
| 1.3.2 Meaningful sequence | A | ✅ | DOM order matches visual order; no CSS reordering that changes meaning. |
| 1.3.3 Sensory characteristics | A | ✅ | Instructions never rely on shape/position alone. |
| 1.3.5 Identify input purpose | AA | 🔧 | **Fixed:** `autocomplete` added to all identity/auth fields. |
| 1.4.1 Use of color | A | ✅ | Color is never the only signal: badges/states carry text ("Free", "Family", "Available"), RSVP buttons show labels, the calendar "today" cell adds an `sr-only` "(today)", links are underlined or in a distinct weight + color. |
| 1.4.3 Contrast (minimum) | AA | 🔧 | Body/muted/subtle text pass in both themes. **Fixed:** light-mode links, status text, decorative brand text, and the `badge-accent` label (see §3·1). |
| 1.4.4 Resize text | AA | ✅ | All type is `rem`/`em`; layouts reflow to 200% zoom without loss. |
| 1.4.5 Images of text | AA | ✅ | No text baked into images; the logo is live text. |
| 1.4.10 Reflow | AA | ✅ | Responsive down to 320px; the calendar grid and dashboard are mobile-tuned, no 2-D scroll. |
| 1.4.11 Non-text contrast | AA | 🔧 | Focus rings (`brand-400`, 2px) and active toggle states already passed. **Fixed:** form-control borders via `--c-field` (≥ 3∶1). |
| 1.4.12 Text spacing | AA | ✅ | No clipped text under increased line-height/letter-spacing; chips/buttons size to content. |
| 1.4.13 Content on hover or focus | AA | ✅ | Only native `title` tooltips (dismissable, hoverable, persistent); no custom hover popups that obscure content. |

### Operable

| SC | Level | Status | Notes |
| --- | --- | --- | --- |
| 2.1.1 Keyboard | A | ✅ | Every control is a native `button`/`a`/`input`/`select`; no `div`-with-onclick. |
| 2.1.2 No keyboard trap | A | ✅ | Expanding panels (share, compose, filters) are inline, not modal — focus is never trapped. |
| 2.1.4 Character key shortcuts | A | ✅ | None implemented. |
| 2.4.1 Bypass blocks | A | ✅ | "Skip to content" link targets `main#main`. |
| 2.4.2 Page titled | A | ✅ | Per-route `metadata.title` with a template. |
| 2.4.3 Focus order | A | ✅ | Logical, source-order focus. |
| 2.4.4 Link purpose (in context) | A | ✅ | Link text is descriptive; ambiguous icon links have `aria-label`. |
| 2.4.5 Multiple ways | AA | ✅ | Global nav, search/filter, in-content links, and `sitemap.xml`. |
| 2.4.6 Headings and labels | AA | 🔧 | Descriptive headings throughout; **fixed** the missing field labels that this SC also depends on. |
| 2.4.7 Focus visible | AA | ✅ | Global `:focus-visible` outline (2px `brand-400`, offset) on all focusables. |
| 2.5.1 Pointer gestures | A | ✅ | No path/multipoint gestures. |
| 2.5.2 Pointer cancellation | A | ✅ | Native click semantics (activate on up-event). |
| 2.5.3 Label in name | A | 🔧 | After the label fixes, every control's accessible name contains its visible label. |
| 2.5.4 Motion actuation | A | — | No motion-actuated features. |

### Understandable

| SC | Level | Status | Notes |
| --- | --- | --- | --- |
| 3.1.1 Language of page | A | ✅ | `<html lang="en">`. |
| 3.2.1 On focus | A | ✅ | Focus alone never changes context. |
| 3.2.2 On input | A | ✅ | Search **filters** update results in place (an expected, well-understood pattern) without moving focus or loading a new context; no form auto-submits on a single field unexpectedly. |
| 3.2.3 Consistent navigation | AA | ✅ | Navbar/footer/sidebar are consistent across pages. |
| 3.2.4 Consistent identification | AA | ✅ | Icons and components are used consistently (same RSVP/follow/badge components everywhere). |
| 3.3.1 Error identification | A | 🔧 | Errors are shown in text and now carry `role="alert"`. |
| 3.3.2 Labels or instructions | A | 🔧 | **Fixed:** every field has a label; optional fields are marked, required use the `required` attribute + a visible "*". |
| 3.3.3 Error suggestion | AA | ✅ | Messages describe the problem and the fix ("At least 8 characters", "Couldn't match that CT location"). |
| 3.3.4 Error prevention (legal/financial) | AA | ✅ | Payments run through Stripe Checkout (its own confirm step); subscriptions are reversible from the billing portal. |

### Robust

| SC | Level | Status | Notes |
| --- | --- | --- | --- |
| 4.1.2 Name, role, value | A | 🔧 | Native elements supply role/value; ARIA fills gaps (`aria-pressed` on toggles, `aria-expanded`/`aria-controls` on the mobile menu, `aria-current` in the dashboard nav, `role="progressbar"` on onboarding, grid roles on the calendar). **Fixed:** programmatic labels for all inputs. |
| 4.1.3 Status messages | AA | 🔧 | **Fixed:** `role="status"`/`role="alert"`/`aria-live` on async confirmations and errors. |

---

## 5. Color-contrast reference (the pairs that drove the fixes)

Computed with the WCAG relative-luminance formula. "Light" = white card
(`#ffffff`); "Dark" = app surface (`#171327`).

| Token / use | Light bg | Dark bg | Verdict |
| --- | --- | --- | --- |
| `brand-300` (#b7a6ff) link, **old** | 2.1∶1 ❌ | ~6∶1 ✅ | failed light |
| `.link` = `brand-600` (#6d33f5) light / `brand-300` dark | **6.1∶1** ✅ | ~6∶1 ✅ | **fixed** |
| `emerald/amber/red-300` status, **old** | 1.4–1.9∶1 ❌ | ✅ | failed light |
| `…-700 dark:…-300` status, **new** | ≥ 4.5∶1 ✅ | ✅ | **fixed** |
| `brand-700` (#5d22d8) on `brand-500/20` bubble | ~6∶1 ✅ | — | initials readable |
| Input border `--c-line` (#e2e4ea), **old** | ~1.2∶1 ❌ | low ❌ | failed 1.4.11 |
| Input border `--c-field` (#7c808b/#6a6586), **new** | ~3.9∶1 ✅ | ~3.3∶1 ✅ | **fixed** |
| Focus ring `brand-400` (2px) | ✅ | ✅ | passes 1.4.11 |
| White on `brand-500` (buttons, my-message bubble) | 4.8∶1 ✅ | 4.8∶1 ✅ | passes |

---

## 6. Known limitations & next steps

These are **not** AA failures but are worth tracking:

- **Live captions on user media** (1.2.x at AAA, or if first-party media is ever
  added) — would require a caption pipeline; today we rely on the embed source.
- **Automated regression coverage** — add `axe-core`/`jest-axe` and a Playwright
  contrast check to CI so a future `-300`-on-white slip is caught automatically.
- **Manual screen-reader sweep** (NVDA + VoiceOver) — this audit is static +
  computed; a human AT pass before public launch is recommended.
- **Reduced-data / forced-colors** (Windows High Contrast) — the semantic-token
  setup is compatible; an explicit `forced-colors` review is a nice-to-have.

---

*Conformance is a moving target: re-run this audit whenever a new color, form,
or interactive surface is added. The `.link` class and the `text-X-700
dark:text-X-300` convention are the house style — use them instead of bare
`-300/-200` shades so new UI stays AA in both themes.*
