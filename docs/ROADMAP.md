# BandConnect — Feature Roadmap

Grounded in the [UX audit](UX_AUDIT.md) and the product thesis: **a
calendar-first, two-sided network for Connecticut's live-music scene**. The
growth loop is *discovery (SEO + calendar) → RSVP/follow → notifications bring
people back → bands/venues post more → more to discover.* The roadmap is
sequenced to strengthen that loop first, then deepen the marketplace, then
harden the platform.

Effort: **S** ≈ ½–1 day · **M** ≈ 2–4 days · **L** ≈ 1–2 weeks.

> **Status:** ✅ **Phase 1 shipped** (date filters, near-me, add-to-calendar,
> Event JSON-LD + sitemap, navbar bell + Post-event, onboarding, email
> reminders, password reset). ✅ **Phase 2 shipped** (Following feed, real-time-ish
> messaging, share-to-friend, saved-search alerts) — plus a light/dark theme and
> a **WCAG 2.1 AA accessibility** pass ([ADA_AUDIT.md](ADA_AUDIT.md)) and
> **profile verification** (Verified badge + self-serve claim/verify with
> email-domain auto-verify + admin queue — [trust doc](launch/trust-and-verification.md)).
> **Remaining in Phase 2:** past-show recaps, profile tabs. Phases 3–4
> (marketplace/monetization, hardening) are still ahead.

---

## Phase 1 — Close the growth loop (activation + organic discovery)

The cheapest wins; mostly small. Ship these first.

| Feature | Why | Effort |
| --- | --- | --- |
| **Date quick-filters** (Tonight / Weekend / Week) | The #1 query for an events app; today it's missing. | S |
| **"Near me"** geolocation on the calendar | Removes the "type your town" friction. | S |
| **Add-to-calendar** (.ics + Google) on events | Table stakes; drives real-world attendance. | S |
| **Event JSON-LD + `sitemap.ts` + OG images** | Google event rich results = free, durable traffic. | S–M |
| **Notification bell + "Post event" CTA in navbar** | Surfaces the re-engagement signal we already track. | S |
| **Onboarding checklist** (profile photo, first event, follow 3) | Turns empty dashboards into active accounts. | M |
| **Email notifications & reminders** (Resend + scheduled job) | Finishes the spec's "auto reminders"; the biggest retention lever. | M |
| **Password reset** | Prevents permanent lockouts. | S |

**Outcome:** new users activate, shows get discovered on Google, and email
brings people back for the events they RSVP'd.

## Phase 2 — Engagement & social depth

Make the network worth returning to daily.

| Feature | Why | Effort |
| --- | --- | --- |
| **"Following" feed** on home (events from who you follow) | Personalized reason to open the app. | M |
| **Real-time-ish messaging** (polling/SSE) + **compose-new** + search | Current inbox needs a manual reload for incoming. | M |
| **Share-to-friend in-app** (DM + `SHARE` notification) | Completes the spec's "share to other fans." | S |
| **Saved searches / follow-a-town / follow-a-genre alerts** | "Tell me when punk shows are booked near Hartford." | M |
| **Past-show recaps** (photos/notes after an event) | Content flywheel + social proof. | M |
| **Profile tabs** (About/Events/Media) + clickable follower lists | Tames long profiles; improves discovery. | S–M |
| **Fan privacy controls** (follows/friends/RSVPs visibility) | Trust; unblocks surfacing fan activity. | S |

## Phase 3 — Marketplace depth & monetization

Turn activity into revenue and real bookings.

| Feature | Why | Effort |
| --- | --- | --- |
| **Structured booking offers** on availability dates (request → hold → confirm) | Moves booking from DMs into the product; ties to the availability calendar already built. | L |
| **Reviews after a played show** (venue↔artist) | Trust + a reason to transact on-platform. | M |
| **Featured event boosts** (paid promotion in the calendar) | Direct revenue beyond subscriptions; we already have a `featured` concept. | M |
| **Pro analytics** (profile/event views, RSVP funnel, follower growth) | Delivers on the Pro promise; justifies the price. | M |
| **Verification badges** (venues/known artists) | Trust + an upsell. | S |
| **Ticketing integration** (affiliate links → native) | Natural extension of "Tickets" on events. | L |

## Phase 4 — Platform hardening

Required before a real public launch.

| Feature | Why | Effort |
| --- | --- | --- |
| **Auth:** Google OAuth + email verification | Lower friction, fewer fake accounts. | M |
| **Image/video uploads** (S3 / UploadThing) | Replaces URL-only media; route through `next/image`. | M |
| **Moderation:** report/block + message rate-limiting | Safety on a message-anyone platform. | M |
| **Accessibility pass:** icon set (Lucide) + labels, contrast, modal focus traps, calendar a11y | WCAG AA; removes P1 a11y debt. | M |
| **Geo at scale:** bounding-box SQL pre-filter → PostGIS; ISR caching for public pages | Current JS haversine won't scale. | M |
| **Light mode** (palette already tokenized) | Broader appeal. | S |

---

## Cross-cutting bets (worth scoping anytime)

- **Mobile app** (React Native on the same API) once web retention is proven.
- **Multi-region** — the data model isn't CT-specific except the geocode table;
  generalize `ct-geo.ts` to a regions table to expand to other states/cities.
- **Embeddable calendar widget** for venue/band websites — distribution.
- **Spotify/Bandcamp embeds** on artist profiles for instant "listen."

## Suggested first sprint

A coherent, shippable slice from Phase 1 that visibly improves the product and
moves metrics:

1. Date quick-filters + "Near me" on the calendar (2.1, 2.3)
2. Add-to-calendar + Event JSON-LD + sitemap (3.1, 3.2, 11.1)
3. Navbar notification bell + "Post event" (1.1)
4. Onboarding checklist (5.2)

All small-to-medium, no new infra, and they hit discovery, activation, and
retention in one pass.
