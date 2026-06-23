# BandConnect — Go-To-Market & Launch Plan

**Goal:** get **venues, bands/musicians, and fans** onto BandConnect as fast as
possible once it's live.

**The hard part (be honest about it):** BandConnect is a *three-sided* network
(fans · venues · artists). Each side is more valuable when the others show up —
the classic **cold-start problem**. Fans won't open an empty calendar; bands
won't build a profile with no audience; venues won't post to no one. A launch
plan that just says "tell people about it" will fail. This plan is built around
**breaking the cold start**, not around a megaphone.

> **TL;DR strategy:** *Come for the tool, stay for the network.* Be the single
> best **calendar of CT shows** first — a thing that's useful to a fan even with
> **zero** social features — by **seeding real events ourselves**. Win **one
> dense scene (New Haven) before the whole state.** Then let the growth loops we
> already built (SEO rich results, share-to-friend, saved-search alerts, RSVP
> reminders) compound.

Companion docs (in [`docs/launch/`](launch/)):
- **[ct-venues-and-supply.md](launch/ct-venues-and-supply.md)** — researched venue / open-mic / record-store target list.
- **[distribution-and-communities.md](launch/distribution-and-communities.md)** — calendars, press, subreddits, colleges, partnerships.
- **[outreach-templates.md](launch/outreach-templates.md)** — copy-paste venue email, band DM, press pitch, Reddit/IG posts.
- **[outreach-tracker.csv](launch/outreach-tracker.csv)** — a lightweight CRM to run the outreach.

---

## 1. Principles (why this works)

1. **Seed the supply, then the demand.** A calendar with 60 real upcoming shows
   is useful on day one. A calendar with 0 is a ghost town. We do the unscalable
   work of entering shows ourselves before we ask anyone to sign up.
2. **Single-player value for every role.** No one should *need* the network to
   get value:
   - **Fan** → a genuinely good, filterable CT show calendar + reminders.
   - **Venue** → a free, **Google-rich-result** event page (we already emit
     `MusicEvent` JSON-LD + a sitemap) that beats an Instagram post.
   - **Band** → a free one-page promo site + shows on a public calendar.
3. **Density over breadth.** Win **New Haven** (dense scene, Yale + SCSU fans,
   Toad's / College Street / Cafe Nine / The State House / Space Ballroom in
   Hamden) before spreading thin across all 169 towns. Then repeat per scene.
4. **Lean on loops we already shipped** (see §5) instead of paid ads.
5. **Be of the scene, not at it.** Launch as a local musician/fan who built a
   free tool for the community — not as a startup running ads.

---

## 2. Beachhead: New Haven first

| Why New Haven | Detail |
| --- | --- |
| **Dense, walkable scene** | A dozen rooms within ~15 min, lots of original/local bookings. |
| **Built-in fan base** | Yale, Southern CT State, Albertus, Quinnipiac nearby → students = fans + musicians. |
| **Press exists** | New Haven Independent, Daily Nutmeg, CT Insider cover local culture. |
| **Liquidity is achievable** | We only need ~20 venues + ~50 events to make the calendar feel *full* in one metro — impossible statewide, easy in one city. |

**Expansion order after New Haven:** Hartford → Fairfield County
(Bridgeport/Norwalk/Fairfield) → New London/Mystic → Waterbury/shoreline. Each
new scene is a mini-launch repeating this playbook.

---

## 3. Phased timeline

### Phase 0 — Pre-launch (T–2 weeks) · *fill the calendar before anyone arrives*
- [ ] **Concierge-seed the New Haven calendar:** manually enter **4–8 weeks** of
  real upcoming shows from venue Instagrams / Bandsintown / venue sites. Target
  **≥50 events across ≥20 venues**. Create **placeholder venue profiles** we can
  hand off later ("claim your page").
- [ ] **Recruit the founding cohort** (warm, hand-picked): **10 venues + 25
  bands/musicians** who will have *real* profiles live at launch. Use the
  [target list](launch/ct-venues-and-supply.md) + [templates](launch/outreach-templates.md).
- [ ] **Get listed where fans already look:** submit the calendar/events to local
  listing sites (see [distribution doc](launch/distribution-and-communities.md)) so
  we surface in search before launch day.
- [ ] **Stand up channels:** Instagram **@bandconnectct**, a link-in-bio, a
  feedback inbox, and analytics (page views, signups by role, RSVPs).
- [ ] **Recruit 3–5 "scene connectors"** (a promoter, a record-store owner, an
  active gigging musician) as evangelists/advisors — they unlock trust + reach.
- [ ] **Prep launch assets:** Reddit post, press pitch, IG carousel, QR flyer.

**Exit criteria:** calendar looks *full* for New Haven; 35+ founding profiles
committed; press + Reddit drafts ready.

### Phase 1 — Launch week · *announce to a non-empty product*
- [ ] **Founding cohort goes live & shares their own pages.** Each band sharing
  their `/p/slug` page to their own followers is our cheapest distribution.
- [ ] **Reddit:** post in **r/NewHaven** then **r/Connecticut** — framed as *"I
  built a free calendar of every CT show, looking for feedback,"* not an ad.
  (Respect each sub's self-promo rules — see distribution doc.)
- [ ] **Local press pitch:** New Haven Independent, Daily Nutmeg, CT Insider —
  "local musician builds free tool for the scene" angle.
- [ ] **Instagram launch** + partner cross-posts (record stores, the founding venues).
- [ ] **QR flyers at that week's shows** (hand to the founding venues).

### Phase 2 — Weeks 1–4 · *activation + liquidity*
- [ ] **Venue conversion sprint:** turn placeholder venues into claimed accounts
  — *"You already have 6 shows listed on BandConnect; claim your free page."*
- [ ] **Open-mic offensive:** open mics are the **highest-density place to find
  gigging musicians.** Table/QR at weekly open mics (list in supply doc).
- [ ] **Turn on the loops:** push saved-search alerts ("get notified when punk
  shows are booked near you"), share-to-friend, follow.
- [ ] **Weekly "This Week in CT Live Music"** post (IG + email digest), generated
  straight from the calendar — a recurring content engine.
- [ ] **Ship SEO town pages** ("Live music in New Haven, CT") to compound organic.

### Phase 3 — Months 2–3 · *expand + retain*
- [ ] **Open Hartford**, then Fairfield County — repeat the beachhead playbook.
- [ ] **Retention:** RSVP email reminders (built), following feed, post-show recaps.
- [ ] **Partnerships:** college activities boards (esp. **The Hartt School** at
  U Hartford), breweries that host music, CT festivals (e.g., Sound on Sound).
- [ ] **Soft Pro upsell** to active venues/bands (featured placement, analytics).

---

## 4. Per-side acquisition playbook

| Side | The pitch (what's in it for them) | Where to reach them | CTA |
| --- | --- | --- | --- |
| **Venues** | "List your shows **free**. They rank on **Google** (rich results) and reach local fans who follow you and get auto-reminders. We've already added your upcoming shows — **claim your page**." | Direct (booking pages), in person at shows, record-store/promoter intros | *Claim your venue* |
| **Bands / Musicians** | "Free **one-page band site** + your shows on the CT calendar + get **discovered by venues** searching for acts available on your open dates. Set your availability." | **Open mics**, local-musician FB groups (follow rules), **college music programs**, IG DMs to active acts, the founding venues' rosters | *Build your free page* |
| **Fans** | "**Every CT show in one place** — filter by town, genre, family-friendly, no-cover. RSVP, get reminders, follow your favorite venues & bands." | Subreddits, IG, local press, **SEO**, QR at shows, friend invites, campuses | *Find shows near you* |

**Sequencing inside the funnel:** Venues + seeded events first (supply) →
fans (demand follows shows) → bands (follow the fans + venues). Don't spend
band-recruiting energy before there are fans and rooms to play to.

---

## 5. Growth loops we already built — *use them deliberately*

These are in the product **today**. The launch tactics above are designed to
ignite them:

1. **SEO loop.** Event posted → `MusicEvent` JSON-LD + `sitemap.xml` → Google
   event rich results → fan discovers → RSVPs → venue sees value → posts more.
   *Tactic:* seed events early so Google indexes a full calendar before launch.
2. **Self-promotion loop.** Every band/venue has a public `/p/slug` page and
   share-to-friend. Acts marketing *their own* page to *their own* audience does
   our distribution for free. *Tactic:* make "share your page" step 1 of onboarding.
3. **Re-engagement loop.** RSVP → email reminder (built) → attend → follow →
   **Following feed** → return next week. *Tactic:* push RSVP hard; reminders do the rest.
4. **Saved-search alert loop.** "Tell me when ska shows are booked near Hartford"
   → notification pulls them back. *Tactic:* prompt an alert after any search.

---

## 6. Growth-product backlog (highest-leverage builds)

Small features that materially boost acquisition/retention, roughly in priority
order. (These are *new* work — the loops in §5 already exist.)

| # | Feature | Why it moves the needle | Size |
| --- | --- | --- | --- |
| 1 | **"Claim your page"** for seeded placeholder venues/bands | Converts our concierge-seeded supply into real accounts — the linchpin of the seeding strategy. | M |
| 2 | **Per-event OG share images** (auto-generated) | Higher CTR when shows are shared to IG/iMessage/Reddit → more inbound. | S–M |
| 3 | **Pre-launch email capture** ("notify me when shows are added in my town") | Builds a launch-day audience during Phase 0; feeds saved-search alerts. | S |
| 4 | **Invite-a-friend / referral link** (fans) | Turns the share loop into measurable, incentivized growth. | S–M |
| 5 | **Embeddable calendar widget** for venue sites | Distribution: our calendar on every venue's homepage. | M |
| 6 | **Bulk event import** (paste a list / Bandsintown) | Makes concierge seeding + venue onboarding 10× faster. | M |

---

## 7. Metrics

**North Star:** **weekly RSVPs** — it only goes up when supply is rich *and*
fans are engaged, so it captures both sides of the network.

| Layer | Metric | Beachhead target (New Haven, by week 4) |
| --- | --- | --- |
| **Supply** | Events live in next 30 days | ≥ 75 |
| **Supply** | Active venues (posted ≥1 upcoming) | ≥ 20 |
| **Supply** | Artists with availability set | ≥ 40 |
| **Liquidity** | % of town/genre searches returning ≥5 upcoming events | ≥ 80% within 30 mi of New Haven |
| **Acquisition** | New signups / week (by role) | ramp to 100+/wk |
| **Activation** | % new users completing onboarding (photo + first action) | ≥ 50% |
| **Retention** | Week-2 return rate | ≥ 30% |
| **North Star** | Weekly RSVPs | ≥ 150 |

Instrument the funnel: **visit → signup (by role) → activated → W2 retained**,
plus the liquidity ratio (it's the truest health signal for a marketplace).

---

## 8. Budget

This is an indie, community launch — assume **~$0** and run on sweat equity:
- **Free:** concierge seeding, Reddit/IG/press, partnerships, content, QR flyers
  you print yourself, the growth loops in §5.
- **Optional small spend (only if needed):** $50–150 of geo-targeted IG/Reddit
  ads to CT during launch week; QR sticker printing; a Product Hunt launch (free
  but time-boxed). Don't pay for ads until the calendar is full and converting.

---

## 9. Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| **Empty-calendar cold start** | Concierge-seed real events; beachhead density; single-player value (§1). |
| **Subreddit / FB self-promo bans** | Contribute value first; frame as a free community tool; follow each community's rules; have *members* (founding cohort) post, not just us. |
| **Venue apathy / "another platform"** | Do the work *for* them (pre-seed their shows); lead with the Google-ranking + reminders benefit; "claim" not "sign up." |
| **Spam / fake profiles at scale** | Email verification + moderation (on the hardening roadmap) before we open the floodgates. |
| **We spread too thin** | Hold the line on one scene at a time; don't open Hartford until New Haven hits the liquidity target. |

---

## 10. First two weeks — concrete checklist

1. Pick the beachhead (New Haven) and a launch date.
2. Seed ≥50 real upcoming New Haven-area events + ≥20 placeholder venue profiles.
3. Build the target list & tracker (see `launch/` docs) → start warm outreach to
   10 venues + 25 artists using the templates.
4. Stand up IG + link-in-bio + analytics; submit the calendar to local listing sites.
5. Line up 3–5 scene connectors; draft the Reddit post + press pitch.
6. Launch week: cohort shares pages → Reddit → press → IG → QR at shows.
7. Measure the liquidity ratio + weekly RSVPs; iterate; then open Hartford.

---

*This plan deliberately exploits what's already shipped (SEO/JSON-LD, sitemap,
share-to-friend, saved-search alerts, RSVP email reminders, the 4-role graph).
The fastest path to a full site isn't a bigger megaphone — it's seeding real
supply in one scene and letting those loops compound.*
