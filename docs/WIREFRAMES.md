# BandConnect — Wireframes

Low-fidelity wireframes for every key screen. These map 1:1 to the implemented
routes so you can cross-reference the code in `src/app`.

Legend: `[ Button ]` · `( input )` · `▣ image/avatar` · `★ Pro feature`

---

## 1. Landing — `/`  → `src/app/page.tsx`

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚡ BandConnect    Find Bands  Find Venues  Shows  Pricing   Log in [Get started] │
├──────────────────────────────────────────────────────────────────┤
│                      🎸 For the local music scene                  │
│            Where local bands and venues actually connect           │
│        Bands find rooms. Venues find acts. Calendars, booking,     │
│                       and messaging in one place.                  │
│                  [ I'm a band → ]   [ I'm a venue → ]              │
│                   Free to start. No credit card.                   │
│                                                                    │
│            ┌────────┐   ┌────────┐   ┌────────────┐               │
│            │  6     │   │  5     │   │  9         │   ← live counts │
│            │ Bands  │   │ Venues │   │ Shows      │               │
│            └────────┘   └────────┘   └────────────┘               │
├──────────────────────────────────────────────────────────────────┤
│  ┌── For Bands ──────────────┐   ┌── For Venues ─────────────┐    │
│  │ Get booked, not buried    │   │ Fill your calendar        │    │
│  │ ✓ One-page band site      │   │ ✓ Publish what you book   │    │
│  │ ✓ Browse venues           │   │ ✓ Discover local bands    │    │
│  │ ✓ One-click submissions   │   │ ✓ Manage submissions      │    │
│  │ [ Create your band page ] │   │ [ List your venue ]       │    │
│  └───────────────────────────┘   └───────────────────────────┘    │
│                                                                    │
│   How it works:  ① Create page  → ② Discover & connect → ③ Book    │
│   Features grid:  🌐 📅 ✉️ 📨 🔎 🎨   |   Pricing teaser  | CTA     │
└──────────────────────────────────────────────────────────────────┘
```

## 2. Sign up — `/signup`  → `src/app/signup/page.tsx`

```
┌────────────────────────────────────────┐
│           Create your account          │
│   ┌──────────────┐  ┌──────────────┐   │
│   │ 🎸 I'm a band │  │ 🏛️ I'm a venue│   │  ← role toggle (?role= preselects)
│   │ Find venues  │  │ Find bands   │   │
│   └──────────────┘  └──────────────┘   │
│   Band/Venue name ( ___________ )      │
│   Email           ( ___________ )      │
│   City (optional) ( ___________ )      │
│   Password        ( ___________ )      │   min 8 chars
│            [ Create account ]          │
│      Already have an account? Log in    │
└────────────────────────────────────────┘
```
On submit → `POST /api/auth/signup` (bcrypt hash, auto-creates profile + slug)
→ auto sign-in → `/dashboard`.

## 3. Dashboard shell — `/dashboard/*`  → `src/app/dashboard/layout.tsx`

```
┌──────────────────────────────────────────────────────────────────┐
│ Band dashboard                         [Free plan] [Upgrade] ★    │
│ The Night Owls                                                    │
├──────────────┬───────────────────────────────────────────────────┤
│ 🏠 Overview   │                                                   │
│ 🎛️ Edit profile│            « page content renders here »          │
│ 📅 My shows    │                                                   │
│ 📨 Submissions⁴│   (badges show unread messages / pending reqs)   │
│ ✉️ Messages  ²  │                                                   │
│ 💳 Billing     │                                                   │
│ [View page ↗] │                                                   │
└──────────────┴───────────────────────────────────────────────────┘
```

## 4. Dashboard overview — `/dashboard`

```
┌── Upcoming shows ──┐ ┌── Submissions ──┐ ┌── Unread msgs ──┐
│        2/3         │ │        4        │ │       1        │
└────────────────────┘ └─────────────────┘ └────────────────┘
┌─ Your public page ───────────────────────────────────────────┐
│ /bands/the-night-owls            [ Edit profile ] [ View ↗ ]  │
└───────────────────────────────────────────────────────────────┘
Quick actions:  [➕ Add a show] [🔎 Find venues] [✉️ Open inbox]
Next up:  • Fri Night Live — Jun 29 · The Underground
Upgrade nudge (free users only) ─────────────────────── [See Pro]
```

## 5. Profile editor — `/dashboard/profile`  → `ProfileForm.tsx`

```
┌─ Basics ───────────────────────────────────────────┐
│ Name ( ____ )  Tagline ( ____ )                     │
│ City ( ____ )  Members/Capacity ( __ )              │
│ Bio / About ( ________________________________ )    │
├─ Genres ───────────────────────────────────────────┤
│ [Rock][Indie•][Punk][Metal][Jazz•]… (tap to toggle) │
├─ Links & media ────────────────────────────────────┤
│ Profile img URL ( __ )  Banner URL ( __ )           │
│ Website ( __ ) Instagram ( __ ) Spotify ( __ ) …    │
├─ Availability ─────────────────────────────────────┤
│ [✓] Actively looking for gigs / accepting subs      │
├─ Branding ─────────────────────────────────────────┤
│ ★ Theme color [▣] (Pro only — locked for free)      │
└────────────────────────────────────────────────────┘
   sticky:  ✓ Saved                       [ Save changes ]
```

## 6. My shows — `/dashboard/shows`  → `ShowsManager.tsx`

```
My shows  (2 of 3 upcoming used)                 [ + Add show ]
┌─ add form (toggles) ───────────────────────────────────────┐
│ Title( ) Date&time( ) City( ) Venue( ) Lineup( ) Tickets( )│
│                                  [Cancel] [Add show]        │
└────────────────────────────────────────────────────────────┘
UPCOMING
┌────┬───────────────────────────────────────────────┐
│ JUN│ Friday Night Live                              │
│ 29 │ Sat Jun 29 · 8:00 PM · The Underground   Tickets↗ Delete │
└────┴───────────────────────────────────────────────┘
PAST  (dimmed)
```
At limit → amber banner + "Upgrade to Pro for unlimited shows".

## 7. Submissions

**Band view** (`sent`) — `/dashboard/submissions`
```
My submissions                                   [ Find venues ]
┌──────────────────────────────────────────────────────────────┐
│ The Underground          [Pending]               [ Message ]  │
│ "Austin folk trio touring through NYC…"                       │
│ Sent 2d ago · Proposed Aug 6                                  │
└──────────────────────────────────────────────────────────────┘
```
**Venue view** (`received`)
```
Booking requests
┌──────────────────────────────────────────────────────────────┐
│ Wild Honey  (Austin, TX)                                      │
│ "Austin folk trio…"                          [Accept][Decline]│
│ 2d ago · Proposed Aug 6                       Message band →   │
└──────────────────────────────────────────────────────────────┘
```

## 8. Messages — `/dashboard/messages`  → `MessagesInbox.tsx`

```
┌─ Conversations ─┬─ Thread: The Underground ───── [View page ↗] ─┐
│ ▣ The Underground│                                              │
│   "Load-in at 5…"│        Loved your set! Want the Friday slot?  │
│ ▣ Wild Honey   ¹ │   We're in — the 7th works. Load-in?  ▏(me)   │
│   "Thanks!"      │        Load-in at 5, doors at 8.              │
│                  │                                              │
│                  │ ( Message The Underground…        ) [ Send ] │
└──────────────────┴──────────────────────────────────────────────┘
```
Opening a thread marks it read (`PATCH /api/messages`). `?to=<userId>` deep-links
a new conversation (used by "Message" buttons across the app).

## 9. Discovery — `/discover/bands` · `/discover/venues`

```
Find venues
┌─ filters ─────────────────────────────────────────────────────┐
│ Search( city / keyword )  Genre[▼ All]  [✓]Accepting  [Filter] │
└────────────────────────────────────────────────────────────────┘
┌── card ──────────┐ ┌── card ──────────┐ ┌── card ──────────┐
│ ▣ The Underground │ │ ▣ Echo Lounge    │ │ ▣ Warehouse 9    │
│ Brooklyn·Cap.200  │ │ Austin·Cap.120   │ │ Chicago·Cap.500  │
│ ★Featured         │ │                  │ │                  │
│ [Booking now]     │ │ [Booking now]    │ │ [Booking now]    │
│ Indie Punk Rock   │ │ Jazz Soul Folk   │ │ Electronic House │
└───────────────────┘ └──────────────────┘ └──────────────────┘
```
Featured (★ Pro) profiles sort first.

## 10. Public profile — `/bands/[slug]` · `/venues/[slug]`

```
┌──────────── banner (theme-tinted ▣) ─────────────────────────────┐
│                                                                  │
│  ▣      The Night Owls                          [✉️ Message]      │
│ avatar  Loud, fast & from Brooklyn              [🎤 Submit]*      │
│         📍 Brooklyn, NY                                           │
│  [Looking for gigs] [4-piece] [★ Featured]                       │
├───────────────────────────────────┬──────────────────────────────┤
│ About                             │ Details                      │
│ Four-piece indie outfit forged…   │ Based in   Brooklyn, NY      │
│                                   │ Members    4                 │
│ Upcoming shows                    │ Status     Available         │
│ ┌──┬────────────────────────┐     │ ──────────────────────────   │
│ │29│ Friday Night Live  Tix↗│     │ Genres  Indie Post-Punk      │
│ └──┴────────────────────────┘     │ Links   🌐 📷 🎧             │
└───────────────────────────────────┴──────────────────────────────┘
* "Submit to play" appears for signed-in bands on venue pages →
  opens a modal (subject, pitch, proposed date) → POST /api/submissions.
```

## 11. Pricing — `/pricing`  → `PricingTable.tsx`

```
                  ( Monthly | Yearly  save $24 )    ← toggle
┌── Starter ───────────────┐   ┌── Pro  ★ Most popular ──┐
│ $0 /mo                   │   │ $12 /mo                 │
│ ✓ Public profile         │   │ ✓ Everything in Starter │
│ ✓ Up to 3 shows          │   │ ✓ Unlimited shows       │
│ ✓ 5 submissions/mo       │   │ ✓ Unlimited submissions │
│ ✓ Messaging              │   │ ✓ Custom branding       │
│ [ Get started free ]     │   │ ✓ Featured placement    │
│                          │   │ [ Upgrade to Pro ]      │
└──────────────────────────┘   └─────────────────────────┘
                         FAQ ↓
```
Logged-in free users → Stripe Checkout. Pro users → "Manage your plan".
Demo billing mode → button disabled with an explanatory note.

## 12. Billing — `/dashboard/billing`

```
Current plan
┌──────────────────────────────────────────────────────────────┐
│ Pro  ★              Renews Jul 22, 2026      [ Manage billing ]│
└──────────────────────────────────────────────────────────────┘
[ Starter ✓Current ]   [ Pro — feature list — Upgrade ]
(success banner after returning from Stripe Checkout)
```
