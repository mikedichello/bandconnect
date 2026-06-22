# BandConnect — UI/UX Audit

A grounded review of the app as built (calendar-first, four profile types).
Findings are tied to real screens/components and tagged by severity:

- **P0** — breaks a core flow or is a launch/a11y blocker
- **P1** — notable friction or missing table-stakes
- **P2** — polish / nice-to-have

Each finding has a concrete fix. The **[Top 10 highest-leverage fixes](#top-10-highest-leverage-fixes)**
section is the TL;DR.

---

## 1. Navigation & information architecture

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 1.1 | **P1** | When signed in, the navbar only offers *Dashboard / Sign out*. Unread **notifications** (we already count them) and a fast **"Post event"** action aren't surfaced globally — every action routes through the dashboard. | Add a notification **bell with unread badge** and a context CTA ("Post event" for hosts, "Find shows" for fans) to `Navbar`. |
| 1.2 | **P1** | No **global search**. You can only search *within* `/artists` and `/venues`, and locations on the home calendar. | Add a unified search (events + profiles) in the navbar. |
| 1.3 | **P2** | The two browse surfaces are "Venues" and "Artists," but artists bundle musicians **and** bands; a first-timer may not realize bands live under "Artists." | Keep the grouping, but add a type chip row at the top of `/artists` and cross-link from `/venues`. |

## 2. Home / calendar (the core surface)

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 2.1 | **P1** | **No date quick-filters.** An events app's #1 query is "what's on **tonight / this weekend / this week**" — today you only get an open-ended list or a month grid. | Add `Tonight · This weekend · This week · All` pills above the calendar; they set the date window server-side. |
| 2.2 | **P1** | **Inconsistent filter interaction.** In `EventFilters`, the Family / No-cover chips apply **instantly**, but location/radius/genre require clicking **Search**. Mixed mental model. | Make genre + chips instant; debounce or auto-apply location. One consistent model. |
| 2.3 | **P1** | **No "near me."** Radius filtering exists but requires typing a town/ZIP. | Add a "📍 Use my location" button (browser geolocation → nearest CT town → radius). |
| 2.4 | **P2** | RSVP state isn't reflected on calendar **cards** beyond the button — you can't scan "which of these am I going to." | Add a small "Going/Maybe" ribbon on cards the viewer has RSVP'd. |
| 2.5 | **P2** | Cover-less events all render the same 🎵 on the same gradient → visually repetitive in a dense calendar. | Hash host/genre → a deterministic gradient/emoji so cards differ. |
| 2.6 | **P2** | Server-rendered navigation has **no loading state**; clicking a filter feels like a hard reload. | Add `loading.tsx` skeletons for `/`, `/artists`, `/venues`. |

## 3. Event pages

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 3.1 | **P1** | **No "Add to calendar."** For an events product this is table stakes. | Add `.ics` download + "Add to Google Calendar" link on `event/[id]`. |
| 3.2 | **P1** | **No structured data.** `event/[id]` has `generateMetadata` but no schema.org **`Event` JSON-LD**, so Google can't show event rich results — a major organic-discovery lever for an events site. | Emit `Event` JSON-LD (name, startDate, location, offers) + a sitemap. |
| 3.3 | **P2** | **Share is copy-link only.** Spec calls for "share to other fans"; today there's no in-app share to a friend. | Add "Send to a friend" (DM with the event link + a `SHARE` notification). |
| 3.4 | **P2** | Single host per event — no **multi-act lineup**, and no map/directions despite storing an address. | Add optional lineup (link other profiles) + an embedded map/Directions link. |
| 3.5 | **P2** | No "**more from this host**" or "similar events." | Add a related-events strip. |

## 4. Profiles

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 4.1 | **P1** | **Fan profile privacy.** A fan's public page exposes who they follow and their friends with no control. | Add visibility settings (public / friends / private) for follows, friends, and RSVPs. |
| 4.2 | **P2** | Rich profiles are **one long scroll** (about → events → media → sidebar). | Tabs (About / Events / Media) on artist & venue profiles. |
| 4.3 | **P2** | Follower/following **counts aren't clickable** on public profiles (they are in the dashboard). | Link counts to a followers/following list. |
| 4.4 | **P2** | Fan profiles are thin — no public "upcoming shows I'm going to" (subject to 4.1 privacy). | Optionally surface upcoming RSVPs on the fan profile. |

## 5. Auth & onboarding

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 5.1 | **P1** | **No password reset.** `LoginForm` is email+password only — a forgotten password locks the user out permanently. | Add forgot-password (email token via Resend). |
| 5.2 | **P1** | **No onboarding.** New users land on an empty dashboard with no guidance → weak activation. | Add a dismissible checklist: add a photo · complete profile · post first event / follow 3 venues. |
| 5.3 | **P2** | **No OAuth / email verification.** Friction at signup; fake-account risk. | Add Google sign-in and email verification. |

## 6. Dashboard

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 6.1 | **P2** | On mobile the sidebar nav becomes a tall vertical block pushing content down. | Make it a horizontal scrollable tab strip on small screens. |
| 6.2 | **P2** | For artists, **events** and **availability** are separate calendars; mentally they're one schedule. | A combined "Schedule" view overlaying gigs + open dates. |
| 6.3 | **P2** | No **analytics** anywhere (profile views, RSVP conversion) despite Pro promising it. | Build a basic analytics card (views, follows over time, RSVP funnel). |

## 7. Messaging & notifications

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 7.1 | **P1** | **Not real-time.** Sending refreshes, but **incoming** messages need a manual reload. | Add polling or SSE/WebSocket; show unread without reload. |
| 7.2 | **P1** | **Notifications are in-app only** — no email/push, so the "auto reminder for upcoming events" requirement isn't truly met. | Email digests + event reminders (Resend + scheduled job). |
| 7.3 | **P2** | Can't **start a new message** without visiting a profile; no message search; no grouping ("3 people RSVP'd"). | Add compose-new, search, and notification grouping. |

## 8. Visual design & design system

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 8.1 | **P1/P2** | **Emoji used as UI icons** (`🏠 🎛️ 🔔 ✉️` in Sidebar/badges/buttons). Renders inconsistently across OSes, isn't crisp, and several lack accessible labels. | Adopt an icon set (Lucide) with `aria-label`/`aria-hidden`. |
| 8.2 | **P2** | No **light mode**; some users/venues will want it. | Add a theme toggle (the palette is already tokenized in Tailwind). |
| 8.3 | **P2** | Spacing/typography are consistent but undocumented. | A short design-tokens reference so future work stays consistent. |

## 9. Accessibility (cross-cutting, mostly P1)

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 9.1 | **P1** | **Modals** (`ProfileActions` submit dialog, event/show forms) have no **focus trap, Escape-to-close, or scroll lock**, and don't return focus on close. | Use a proper dialog primitive (Radix) or add focus management + `Esc`. |
| 9.2 | **P1** | **Low-contrast text:** `text-zinc-500` on `bg-ink` for metadata/labels likely fails WCAG AA (4.5:1). | Bump secondary text to `zinc-400`/`zinc-300`; audit with a contrast checker. |
| 9.3 | **P1** | The **calendar grid** is a `<div>` grid with no table/ARIA semantics — screen readers won't announce it as a date grid. | Add `role="grid"`/`gridcell`, `aria-label` dates, and keyboard navigation. |
| 9.4 | **P2** | **Color-only status** (unread dot, going/maybe colors) lacks a text alternative. | Add visually-hidden text / `aria-label`. |
| 9.5 | **P2** | Keyboard-only flows untested end-to-end (filters, RSVP toggle, inbox). | Manual keyboard + screen-reader pass. |

## 10. Performance & scale

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 10.1 | **P2 → P0 at scale** | Home **geo-filters in app code**: it fetches up to 120/400 events then runs haversine in JS, and the `take` cap can silently drop events in a dense window. | Move to a bounding-box SQL pre-filter, then haversine; PostGIS/`earthdistance` at scale. |
| 10.2 | **P2** | Everything public is `force-dynamic` (no caching). | Use `revalidate` (ISR) for public calendar/profile/browse pages; keep auth pages dynamic. |
| 10.3 | **P2** | Images are raw `<img>` (external URLs) — no optimization/lazy sizing. | Once uploads exist, route through `next/image` or an image CDN. |

## 11. SEO & growth

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 11.1 | **P1** | No **sitemap**, no **JSON-LD** (see 3.2), no OG images. For a local-events site, event rich results + indexable profile pages are the cheapest growth channel. | Add `sitemap.ts`, `Event`/`MusicGroup` JSON-LD, and dynamic OG images. |

## 12. Trust & safety (pre-launch)

| # | Sev | Finding | Fix |
| --- | --- | --- | --- |
| 12.1 | **P1** | No **reporting/blocking**, no message **rate-limiting**, no email verification → spam/abuse risk on a public, message-anyone platform. | Add report/block, per-user message throttling, and verification before launch. |

---

## Top 10 highest-leverage fixes

Ordered by impact ÷ effort. These are where I'd start.

1. **Date quick-filters** (Tonight / This weekend / This week) on the calendar — *S, huge*. (2.1)
2. **Add-to-calendar** (.ics + Google) on events — *S, high*. (3.1)
3. **Event JSON-LD + sitemap** for Google rich results — *S, high (organic growth)*. (3.2, 11.1)
4. **Notification bell + "Post event" in the navbar** — *S, high*. (1.1)
5. **Email reminders/notifications** (Resend) — finishes the spec's "auto reminders" — *M, high*. (7.2)
6. **Onboarding checklist** — *S/M, high activation*. (5.2)
7. **Password reset** — *S, prevents lockouts*. (5.1)
8. **Accessibility quick wins**: contrast bump, modal focus/Esc, icon labels — *M, P1*. (9.1, 9.2, 8.1)
9. **"Near me" geolocation** on the calendar — *S, high*. (2.3)
10. **Real-time-ish messaging** (polling) + compose-new — *M, medium*. (7.1, 7.3)

See **[ROADMAP.md](ROADMAP.md)** for these grouped into shippable phases.
