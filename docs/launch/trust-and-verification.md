# Trust & verification — "is this really them?"

**The problem.** Anyone can sign up as "Toad's Place" or as someone else's band.
On a booking + social platform that's corrosive: fake venues post fake shows,
squatters grab a band's name, and fans can't tell who's real. It matters *more*
for us because the [launch plan](../GTM.md) deliberately **seeds placeholder
venue pages** for real owners to claim later — claiming has to be gated.

**The principle:** don't block signups, **gate trust**. Anyone can make an
account; a **Verified badge** and access to high-trust actions are *earned* with
the cheapest proof that clears the bar.

---

## The verification ladder (cheap → strong — use the lowest rung that works)

| Rung | Method | Proves | Best for |
| --- | --- | --- | --- |
| 1 | **Email-domain match** — one-time code to an address at the venue's own website domain (e.g. `booking@toadsplace.com`). Auto-verify when the claim email domain == the venue's known website domain. | Controls the official domain | **Venues** with a website |
| 2 | **Social link-back** — post a one-time code to the established IG/FB story or bio, DM it from the account, **or** add a link to the BandConnect page from the official site/socials. | Controls the public channel fans already know | **Bands** & venues without business email |
| 3 | **Claim-a-page flow** — seeded placeholder pages are `unclaimed / unverified`; claiming requires passing rung 1 or 2, else manual review. | Right to manage a seeded page | Converting seeded supply |
| 4 | **Manual review** — at launch volume (dozens–hundreds), a human cross-checks site/socials in minutes. A review queue + admin "verified" toggle is plenty. | Human judgment | The long tail, edge cases |
| 5 | **Web-of-trust** — a *verified* venue confirming "this band played here" (and vice-versa) vouches for the other; RSVPs and past-show recaps become signals. | Real-world relationship | Organic, two-sided scaling |

**Baseline anti-spam (separate from identity):** email verification on signup +
optional **SMS OTP** deters bulk fake accounts (raises cost; doesn't prove *who*).
A Stripe subscriber has a valid card — a weak extra signal. **Skip government-ID
(Stripe Identity)** — overkill for a local music app; revisit only if abuse appears.

---

## What users see

- A **Verified badge** on profiles, profile cards, and event "Hosted by".
- Unverified accounts still exist and are usable, but are **gated from
  high-trust actions** until verified — pick a policy:
  - can't appear in the **"available for booking"** artist search, and/or
  - can't be the **official** page for a known venue/band (only "fan-made"), and/or
  - a soft "Unverified" tag so the other side knows.
  This makes verification worth doing **without** blocking onboarding.
- **Impersonation / name disputes:** a Report button; takedowns resolve in favor
  of the party that can verify (domain/socials). First-come does **not** beat
  verifiable.

---

## Recommended first slice to build (small, high-leverage)

Ties straight into the seeding strategy — *seed unclaimed venue pages → owner
claims + verifies → trustworthy supply*:

1. **Schema:** `Profile.verified` (Boolean) + `verificationStatus`
   (`none|pending|verified`) + `verificationMethod` + `claimedByUserId`.
2. **"Claim / verify this page"** action capturing website + socials.
3. **Auto-verify path:** email-domain match for venues (rung 1).
4. **Admin review queue** + a "verified" toggle (you, at launch — rung 4).
5. **Verified badge** on `ProfileCard`, the profile header, and event host.

> **One product decision needed before building:** how strict is *unverified*?
> Recommended default — **let unverified accounts do everything *except* appear
> in booking search and claim a "known" venue/band name.** That keeps friction
> low while protecting the booking layer. Adjust to taste.

Everything past the first slice (SMS OTP, web-of-trust vouching, automated social
link-back checks) is incremental and can wait until there's real volume.
