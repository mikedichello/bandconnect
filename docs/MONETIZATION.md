# BandConnect — Monetization strategy

How BandConnect makes money beyond the flat **Pro subscription** ($12/mo ·
$120/yr). This doc plans additional levers, **benchmarks them against comparable
platforms**, picks the best, and records what shipped.

---

## TL;DR — what we shipped

**Paid event "boosts" — promoted placement in the calendar.** The #1
benchmarked lever (the Bandsintown Promote / Eventbrite Ads model), adapted to a
calendar-first product that takes **no booking cut**: a venue/band/musician pays
a flat **$10 to feature one show for 30 days** — it pins to the top of the
calendar with a **★ Featured** tag. Pay-per-use, available on **any plan**, so it
earns even from free accounts and *complements* (doesn't cannibalize) Pro.

**And a deliberate non-decision:** **keep the Verified badge free.** Selling
trust backfires — see §4 (the X Premium cautionary tale).

> Tune price/duration in `src/lib/plans.ts` → `EVENT_BOOST`.

---

## 1. The levers, ranked

| # | Lever | Closest analog | Fit | Status |
| --- | --- | --- | --- | --- |
| 1 | **Boosted/promoted event listings** | Bandsintown Promote · Eventbrite Ads | **Best** — monetizes the discovery surface we own | ✅ **Shipped** |
| 2 | **Paid opportunity submissions / booking directory** | Sonicbids · ReverbNation Opportunities | Medium — new transaction, still no booking cut | Planned |
| 3 | **Fan-club / superfan subscriptions** (artist→fan) | Patreon | Longer-term — needs fan density | Planned |
| — | **Charge for the Verified badge** | X Premium · Meta Verified | ❌ **Rejected** — erodes trust | Won't do |

**Why boosts first:** they monetize the **high-intent moment** we already own
(someone browsing the CT calendar for a show this weekend) without touching the
booking relationship; the low minimum lets small venues/bands play; CT's
geographic concentration makes even small reach efficient; and a one-time boost
*complements* Pro (Pro = a featured **profile** year-round; a boost = a featured
**event** this weekend). No ticketing/payments infra needed beyond the Stripe
Checkout we already run.

---

## 2. How comparable platforms monetize (benchmark)

Prices are approximate — verify against each platform's current pricing.

| Platform | Primary model | Pricing (approx) | Takeaway for us |
| --- | --- | --- | --- |
| **Bandsintown Promote** | Pay-per-campaign promoted email to intent-qualified fans | ~$50 (artist) / $150 (promoter) min; $0.05/email premium | **Our lead analog** — promote to people who opted in to show alerts |
| **Eventbrite Ads / Boost** | Self-serve promoted listings + ads sub | Ads $2–5+/day; Boost sub from ~$15/mo | Promoted listings are now an Eventbrite *primary* revenue driver |
| **Sonicbids** | Sub + **per-gig submission fee** | ~$13/mo; $2–$35/submission | Submission fees monetize even non-subscribers (→ lever 2) |
| **ReverbNation** | Sub + Opportunities submission fees | ~$20–$30/mo | Dual revenue: subscription + per-opportunity |
| **GigSalad / The Bash** | Membership + **5% booking fee** | 2.5–5%; membership for priority placement | We take **no** cut — only the *priority-placement* idea transfers |
| **Eventbrite (ticketing)** | Per-ticket fee | 3.7% + $1.79/ticket | Out of scope (no native ticketing yet; affiliate is a maybe) |
| **Bandcamp** | Revenue share on direct sales | 15% digital / 10% physical | "Bandcamp Friday" promo-event mechanic is a marketing idea |
| **Patreon** | % of fan subscriptions | ~10% + processing | The fan-club model → lever 3 |
| **X Premium** | **Paid verification** | $8–$40/mo | Cautionary — killed the badge's trust value (§4) |
| **Meta Verified** | Paid verification (ID-checked) | ~$12–$15/mo | More defensible (ID + support bundled), still erodes scarcity |

*Full sourced write-up of each platform lives in the research notes (sources at
the end).*

---

## 3. Boosted listings — mechanics we modeled on

**Bandsintown Promote:** an artist/venue buys a *Promoted Email* to fans
segmented by **location (up to 50)** and **taste affinity**, who *opted in* to
concert alerts — so conversion beats cold social ads. CPM-style ($/email), low
entry, scales up.

**Eventbrite Ads:** self-serve promoted listings in search/home/category/app,
labeled "Promoted," geo-targeted, $2–5+/day. Eventbrite claims ~9× visibility /
4× tickets (their number — directional).

**BandConnect adaptation (shipped):** we already own the statewide calendar —
every visit is high intent. A boost pins the event to the top of relevant
calendar views with a **★ Featured** tag. Pricing anchored well below
Bandsintown's $50 min (flat **$10/30 days**) to fit a local market; CT-only
audience means little wasted reach. Natural next step: a **"Shows this week in
[region]"** fan email digest as a second boosted surface.

---

## 4. Monetizing verification? No — keep it free

- **X Premium** opened the blue check to anyone paying $8/mo → the badge stopped
  meaning "authentic," impersonators bought it, and the EU's DSA found it
  *misled users*. Trust signal destroyed.
- **Meta Verified** is more defensible (government-ID + support bundled) but still
  erodes badge scarcity.
- **LinkedIn** never sells the badge alone — it's bundled into a useful suite.
- **Spotify** (2026) made human-artist verification **free**, as an authenticity
  signal.

BandConnect's badge is a **trust & safety** feature, and our scene is
relationship-dense (CT is small; fans often know the bands). Charging would turn
"this is really them" into "this act paid," and make unpaid-but-legit acts look
sketchier than paying ones. **Verdict:** verification stays free and
community-earned. If we want it to *drive* Pro, do it the LinkedIn way — gate Pro
*features* on being verified (e.g., "must be verified to run boosts / appear in
the booking directory"), never sell the checkmark itself.

---

## 5. What shipped (implementation)

- **Schema:** `Event.featured` + `Event.featuredUntil`.
- **Purchase:** `POST /api/events/[id]/boost` → one-time Stripe Checkout
  (`mode: payment`, inline `price_data`, no pre-made price ID), owner-only,
  blocks past/already-featured shows. Degrades gracefully with no Stripe keys
  (`BILLING_DISABLED` notice), matching the subscription flow.
- **Activation:** the `checkout.session.completed` webhook handles
  `metadata.kind === "boost"` → sets `featured` + `featuredUntil = now + 30d`.
- **Surfacing:** the home calendar floats currently-boosted events to the top
  (`featuredUntil > now`) with a **★ Featured** badge on `EventCard`; the
  dashboard event list shows a **★ Boost** button (→ Checkout) and a **★ Featured**
  tag once active, plus a success banner on return.
- **Demo:** one seeded event is featured so the placement is visible without
  Stripe configured.
- **Config:** `src/lib/plans.ts` → `EVENT_BOOST = { priceUsd: 10, days: 30 }`.

---

## 6. Next levers (planned)

- **Booking directory + paid submissions (lever 2):** verified venues post open
  slots; bands submit (free for Pro, ~$3–5 for free tier). Keeps us neutral on
  the booking while monetizing the match. Watch the "pay-to-play" optics.
- **Fan-club subscriptions (lever 3):** artist→fan recurring tiers, ~5–8%
  platform fee — revisit once there's real fan density (~10k+ fans).
- **Pro × boosts:** give Pro a free monthly boost / discounted boosts to raise
  Pro's value; consider requiring *verified* to run boosts.

---

## Sources

Bandsintown for Artists & Venues (promoted emails, venue pricing); Eventbrite
Ads/Boost + fee analyses; Sonicbids & ReverbNation pricing/Opportunities;
GigSalad & The Bash fee docs; DICE & Bandcamp & Patreon fee pages; ToneDen;
X Premium (incl. EU DSA finding), Meta Verified, LinkedIn Premium, Spotify
Verified (2026). URLs collected during the June 2026 research pass — confirm
current pricing before quoting.
