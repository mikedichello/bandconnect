# BandConnect — Wireframes

Low-fidelity wireframes for the key screens, mapped 1:1 to routes in `src/app`.

Legend: `[ Button ]` · `( input )` · `▣ media` · `★ Pro`

---

## 1. Home — event calendar — `/`  → `src/app/page.tsx`

```
┌───────────────────────────────────────────────────────────────────────┐
│ ⚡ BandConnect   Calendar  Venues  Artists  Pricing      Log in [Get started]│
├───────────────────────────────────────────────────────────────────────┤
│ 🎶 Connecticut live music                                              │
│ What's happening tonight in CT                  [Browse venues][artists]│
├───────────────────────────────────────────────────────────────────────┤
│ ┌ Filters ─────────────────────────────────────────────────────────┐  │
│ │ City or ZIP ( New Haven / 06511 )  Within [25 mi▾]  Genre [All▾] 🔍│  │
│ │ [👨‍👩‍👧 Family friendly]  [🆓 No cover]                    Clear filters│  │
│ └───────────────────────────────────────────────────────────────────┘  │
│ 12 events across Connecticut                          [ List | Calendar ]│
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                              │
│ │ ▣ cover   │ │ ▣ ▶ video │ │ ▣ cover   │   ← event cards              │
│ │ FRI JUN 26│ │ SAT JUN 27│ │ SUN JUN 28│                              │
│ │ Night Owls│ │ Jazz Jam  │ │ Mara Quinn│                              │
│ │ Space·Hmdn│ │ Cafe Nine │ │ Westville │                              │
│ │ Family·$  │ │ Free      │ │ Free      │                              │
│ │ 🎸 host   │ │ [Going|Mby]│ │ [Going|Mby]│                             │
│ └───────────┘ └───────────┘ └───────────┘                              │
└───────────────────────────────────────────────────────────────────────┘
```

**Calendar view** (`?view=calendar`): month grid, today highlighted, ≤3 events
per day cell with `+N more`, `← Prev / Today / Next →`.

## 2. Sign up — `/signup`  → 4-role picker

```
┌──────────── Join BandConnect ────────────┐
│ [🎟️ Fan] [🏛️ Venue] [🎸 Musician] [🥁 Band] │  ← pick one
│ "Showcase yourself, find gigs & bandmates" │
│ Name ( )  Email ( )  Town ( )  ZIP ( )     │
│ Password ( )           [ Create account ]  │
└────────────────────────────────────────────┘
```

## 3. Event page — `/event/[id]`

```
← Back to calendar
┌─────────────────────────────┐  ┌─ Are you going? ─────────┐
│  ▣ cover photo OR video      │  │ [ Going | Maybe ]        │
│  (video plays here)          │  │ 12 going · 3 interested  │
│                              │  │ [ 🔗 Share ]             │
├─────────────────────────────┤  ├─ Hosted by ──────────────┤
│ [Cover] [Indie] [Folk]       │  │ ▣ The Space  [Follow][✉] │
│ The Night Owls + Harbor Lights│ ├─ Who's going ────────────┤
│ 🗓 Fri Jun 26 · 8:00 PM       │  │ ◯ ◯ ◯ ◯ ◯ …             │
│ 📍 The Space · Hamden, CT     │  └──────────────────────────┘
│ About this event…            │
└─────────────────────────────┘
```

## 4. Discovery — `/venues` · `/artists`

```
Musicians & bands                                       (/artists)
┌ Search( ) Type[All▾] Genre[Any▾] Open on(date) 🔍                ┐
│ [✓ Available for gigs]  [Seeking: Musicians joining a band ▾]    │
└──────────────────────────────────────────────────────────────────┘
┌── card ──────────┐ ┌── card ──────────┐ ┌── card ──────────┐
│ ▣ Mara Quinn ★   │ │ ▣ The Night Owls │ │ ▣ Devon Park     │
│ Musician·New Hvn │ │ Band·New Haven   │ │ Musician·Hartford│
│ [Available][$150–│ │ [Available][$300–│ │ [Available]      │
│ 300] Folk Indie  │ │ 600] Indie Punk  │ │ Rock Funk        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## 5. Public profile — `/p/[slug]` (type-aware)

```
┌──────────── banner (theme-tinted) ───────────────────────────────┐
│ ▣      Mara Quinn          🎸 Musician      [Following ✓] [✉ Message]│
│ avatar Singer-songwriter & multi-instrumentalist                  │
│  📍 New Haven   [Available for gigs] [$150–$300] [42 followers]    │
├───────────────────────────────────────┬──────────────────────────┤
│ About …                               │ Genres  Folk Indie        │
│ Upcoming events  ▣ ▣                  │ Instruments  Vocals Guitar│
│ Media  ▣ video  ▣ image               │ ── Availability ──        │
│                                       │ ✓ Available · $150–$300   │
│ (Fan profile instead shows: Following,│ • Solo • Start a band     │
│  Friends, and RSVP'd shows)           │ • Open for fill-ins       │
│                                       │ Open dates: Mon Mon Mon   │
│                                       │ Links 🌐 📷 🎧            │
└───────────────────────────────────────┴──────────────────────────┘
```

## 6. Dashboard (type-aware sidebar)

```
┌ 🎸 Musician dashboard ─────────────── [★ Pro]  [Upgrade] ─┐
│ 🏠 Overview                                              │
│ 🎛 Edit profile        «  content area  »                │
│ 📅 My events  (venue/musician/band)                      │
│ 🗓 Calendar    (fan: RSVP'd · others: hosted)            │
│ ✅ Availability (musician/band)                          │
│ 👥 Network ²   (following / followers / friends)         │
│ ✉ Messages ³                                             │
│ 🔔 Notifications ⁵                                        │
│ 💳 Billing                                               │
│ [ View public profile ↗ ]                                │
└──────────────────────────────────────────────────────────┘
```

- **Overview:** stat tiles (followers · upcoming/RSVP'd · unread) + quick actions.
- **Edit profile:** type-aware form (basics, genres, instruments, gigs & rate,
  status flags, photos/links, ★ theme color) + **Media manager** (add/remove
  image & video URLs).
- **My events:** create/edit/delete — title, cover photo/video (+ thumbnail),
  description, start/optional-end, `👨‍👩‍👧 family-friendly`, `💵 cover charge`,
  genre tags, CT town/ZIP.
- **Calendar:** month grid of your shows + upcoming list.
- **Availability:** add/remove open dates (with notes).
- **Network:** friend requests (accept), friends, following, followers.
- **Notifications:** new follower / friend request / RSVP / message / new event,
  with unread dots and "mark all read."
- **Messages:** two-pane inbox; deep-linked via `?to=<userId>` from any profile.
- **Billing:** current plan, Stripe upgrade / manage (or demo-mode notice).

## 7. Pricing — `/pricing`

```
            ( Monthly | Yearly  save $24 )
┌─ Starter $0 ─────────┐   ┌─ Pro $12 ★ ──────────┐
│ ✓ Profile & discovery│   │ ✓ Everything in free │
│ ✓ Up to 3 events     │   │ ✓ Unlimited events   │
│ ✓ Follow/RSVP/message│   │ ✓ Featured placement │
│ [ Get started ]      │   │ ✓ Custom branding    │
└──────────────────────┘   │ [ Upgrade to Pro ]   │
                           └──────────────────────┘
```
