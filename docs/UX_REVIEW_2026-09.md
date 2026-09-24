# BandConnect — Product/UX review (Sept 2026)

A product-owner walkthrough of the running app (seeded demo data, all four roles,
desktop + 390px mobile, dark + light). It builds on `UX_AUDIT.md`, most of which
has shipped. **Shipped in this pass** marks what this review changed in code.

---

## 1. Can users do the core jobs?

| Job | Verdict | Notes |
| --- | --- | --- |
| **Make an account** | ✅ Good | `/signup` has a 4-way role picker (Fan / Venue / Musician / Band), a short form, and CT town/ZIP. The onboarding checklist appears on first dashboard load. |
| **Find a band** | ⚠️ → ✅ | `/artists` had text, type, genre and open-date filters but **no location**, and the filter card had no padding (inputs sat flush against the border). **Shipped:** "Near (CT town/ZIP) within N miles" with a town autocomplete, results sorted by distance, "X mi" on cards, and a result count. |
| **Find a venue** | ⚠️ → ✅ | Town filter was an exact-match dropdown. **Shipped:** same town/ZIP + radius search as artists. The old `?city=` links still work. |
| **Search events within X miles** | ✅ | Home calendar: town/ZIP or "use my location", 5–100 mi radius, plus Tonight / This weekend / This week. |
| **Act as a fan** | ✅ | RSVP, follow, friends, "Following" feed, saved-search alerts, reminders, personal calendar. |
| **Manage a band** | ⚠️ Partial | A band profile can post shows, set availability, set its rate and flag "needs musicians". But **only one login can manage it**: the other band members can't co-manage the page (see §3). |
| **Manage a venue** | ⚠️ Partial | Same as bands: posting events, boosts and inbox all work, but there's **no multi-staff access** (a talent buyer and an owner can't share the page). |
| **Act as an artist** | ✅ | Musician profile: instruments, rate, availability, "seeking a band / fill-ins", media. |
| **Hold several roles** | ❌ **Gap** | `Profile.userId @unique` → **one account = one role.** A guitarist who plays in a band, books a bar and goes to shows needs three emails. This is the biggest structural gap. |

## 2. Free vs Pro: what was wrong

The pricing page promised three Pro features that **didn't exist**:

- "Profile & event analytics" had no UI.
- "Priority in search results" and "Featured placement" were tied to
  `Profile.featured`, which **only the seed script sets**. A real Stripe upgrade
  never flipped it, so paying users got nothing.
- "Remove BandConnect branding": there was no branding to remove.

**Shipped:**
- **Featured is now plan-derived** (`src/lib/discovery.ts`): Pro or an admin-set
  `featured` value → ★ Featured badge + top ranking in `/artists` and `/venues`.
  It applies the moment the webhook sets `plan = PRO`.
- **Insights card** on host dashboards (`InsightsCard.tsx`):
  - Free plans see new followers over 30 days, with the change vs the prior 30 days.
  - Pro plans also see RSVP demand on upcoming shows, the top show, and the top
    follower towns.
  - Free plans get a locked teaser pitched at the real job: *"proof you can fill a
    room when you pitch a venue."*
- The **feature list in `plans.ts`** now lists only what ships. Fans are
  explicitly "free, always".

### More premium value (ranked by pull ÷ effort)

1. **Booking tools for artists** (Bandsintown for Artists / GigSalad model):
   - an EPK page (press photos, stage plot, tech rider PDF)
   - a "Request to book" form on venue pages, with a tracked pipeline
     (sent → viewed → replied)
   - The Free plan already has an unused `maxSubmissionsPerMonth: 5` limit ready
     for gating this.
2. **Venue booking inbox**:
   - filter applicants by genre, draw (follower towns) and availability on a date
   - one-click "offer a date" to an artist's open slot
3. **Monthly boost credit**: 1 free event boost per month on Pro (the boost
   infrastructure already exists). It makes the $12 feel like it pays for itself.
4. **Deeper insights**: profile views and event page views (needs a lightweight
   `PageView` table), RSVP → attendance funnel, and a CSV export of followers
   who opted in.
5. **Smart announcements**: "notify my followers within 25 mi" when a show is
   posted, via email and in-app. Pro gets higher send caps.
6. **Fan Plus (optional, $3/mo)**: presale/guest-list access from venues that
   opt in, and unlimited alerts. Only once there's venue supply. Keep core fan
   use free.

## 3. Structural recommendation: multi-role accounts + team access

**Model:**
- `User 1 → N Profile`, via a `ProfileMember { userId, profileId, role: OWNER|ADMIN|MEMBER }`
  join table.
- Drop `@unique` on `Profile.userId`, or keep it as "creator" only.
- Every user gets an implicit fan identity.

**UX:**
- An **"Acting as ▾" switcher** in the navbar, like Facebook Pages or Eventbrite
  organizer profiles.
- Dashboard scope follows the active profile, stored in the JWT session.
- "Create another profile" from the dashboard.
- Band and venue settings get a **Members** tab: invite by email, set a role, and
  show members on the band page (links to their musician profiles).

**Why it matters:** bands are groups. The member who didn't sign up can't post
the gig, so the band page goes stale. This also fixes the "claim an ownerless
seeded page" item in `CLAUDE.md` (an invite becomes a claim).

It touches `auth`, `session`, and every `getCurrentProfile` caller, so it
belongs in its own PR. Spec it before building.

## 4. UI quality

### Icons
Lucide was installed, but **~90 emoji acted as icons across 30 files**, plus
two hand-drawn SVGs (the logo bolt and the hamburger menu). The emoji render
differently on each OS (on Linux, 👨‍👩‍👧 and 🆓 showed up as empty boxes). They
also ignore the theme color, and screen readers read them out as words.

**Shipped:**
- Every UI emoji and hand SVG is now a lucide icon.
- New `ProfileTypeIcon` takes a string key, so it's safe across the
  server→client boundary.
- Notification rows got icon tiles, and dashboard stats and actions got branded
  icon tiles.
- Emoji remain only inside message text and email subject lines, where they
  belong.

### Event cards
Every card without a photo showed the same purple gradient and 🎵 icon, so a
12-card grid looked like one tile repeated.

**Shipped:** `EventArt` generates art per genre family:
- punk/rock: red + bolt
- jazz/soul: amber + piano
- folk: green + guitar
- electronic: cyan + waveform
- hip-hop/pop: pink + mic

Each card also gets a per-event highlight offset, a hover lift and glow, and
titles now wrap to 2 lines instead of truncating.

### Other changes
- The token `bg-input` was used in 12 places but **never defined**, so those
  chips and fields had no fill. **Shipped:** added it to `tailwind.config.ts`.
- The hero always said "What's happening *tonight*", even while showing every
  upcoming show. **Shipped:** the headline follows the date filter.
- On `ProfileCard`, the ★ Featured badge overlapped the verified check.
  **Shipped:** moved it into the tag row.

## 5. Competitive inspiration → what we took

| Product | Pattern | Status |
| --- | --- | --- |
| **Eventbrite** | Category icon row under search | **Shipped:** genre shortcut row with gradient icon tiles (horizontal scroll on mobile) |
| Eventbrite | Sticky bottom "Get tickets" bar on mobile event pages | **Shipped:** sticky date + RSVP bar (`lg:hidden`). The sidebar RSVP control is desktop-only, so there's no duplicate state. |
| Eventbrite | Image-first cards, "Directions" on the event page | **Shipped:** generated art + a Google Maps directions link |
| **DICE** | Dark, bold, full-bleed artwork; the lineup is the hero | Keep the dark-first theme. Next: **multi-act lineup** on events (UX_AUDIT 3.4) and a full-bleed event hero. |
| **Resident Advisor** | "Popular this week" and venue-centric listings | Next: a "Trending in CT" strip ranked by RSVPs in the last 7 days |
| **Bandsintown / Songkick** | Track an artist → "they're playing near you" alerts | Partly there (follows + saved searches). Next: auto-alert when a followed artist posts a show within the fan's radius. |
| **Bandsintown for Artists** | Paid audience insights | **Shipped (v1):** Insights card |

## 6. Next up (prioritized)

1. **P0** Multi-role accounts + band/venue team members (§3).
2. **P1** Request-to-book flow + EPK (the main Pro value for artists).
3. **P1** Multi-act lineup on events (links other profiles; shows on their pages).
4. **P1** A hero search on the home page ("Find shows near [town]" as the first
   thing above the fold, Eventbrite-style). Today the filter card sits below the
   hero.
5. **P2** Page-view tracking to finish Insights, a "Trending in CT" strip, and
   `loading.tsx` skeletons.
