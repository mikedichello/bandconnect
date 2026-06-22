import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

// Render dynamically so the community stats reflect live data rather than being
// baked in at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Light social proof from real data (falls back gracefully when empty).
  const [bandCount, venueCount, showCount] = await Promise.all([
    prisma.bandProfile.count().catch(() => 0),
    prisma.venueProfile.count().catch(() => 0),
    prisma.event.count().catch(() => 0),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="aurora absolute inset-0 -z-10" />
        <div className="container-page py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge-brand mb-5">🎸 For the local music scene</span>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
              Where local bands and venues
              <span className="bg-gradient-to-r from-brand-300 to-accent bg-clip-text text-transparent"> actually connect</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300">
              Bands find rooms to play. Venues find acts to book. Build a
              gorgeous one-page profile, share your show calendar, send booking
              requests, and message directly — all in one place.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup?role=BAND" className="btn-primary w-full sm:w-auto">
                I&apos;m a band →
              </Link>
              <Link href="/signup?role=VENUE" className="btn-accent w-full sm:w-auto">
                I&apos;m a venue →
              </Link>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Free to start. No credit card required.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4 text-center">
            <Stat value={bandCount} label="Bands" />
            <Stat value={venueCount} label="Venues" />
            <Stat value={showCount} label="Shows booked" />
          </div>
        </div>
      </section>

      {/* Two-sided value props */}
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <AudienceCard
            tag="For Bands"
            tone="brand"
            title="Get booked, not buried"
            points={[
              "Build a single-page band site in minutes",
              "Browse venues by city, capacity & genre",
              "Send booking submissions with one click",
              "Promote every show on your public calendar",
            ]}
            cta={{ href: "/signup?role=BAND", label: "Create your band page" }}
          />
          <AudienceCard
            tag="For Venues"
            tone="accent"
            title="Fill your calendar with the right acts"
            points={[
              "Publish what you book and who you want",
              "Discover local bands actively seeking gigs",
              "Receive & manage booking submissions",
              "Message bands and lock in dates directly",
            ]}
            cta={{ href: "/signup?role=VENUE", label: "List your venue" }}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold">How BandConnect works</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Three steps from sign-up to a booked show.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Step n={1} title="Create your page" body="Sign up as a band or venue and publish a clean, shareable profile with your links, photos, and genres." />
          <Step n={2} title="Discover & connect" body="Search the directory, follow show calendars, and reach out with booking submissions or direct messages." />
          <Step n={3} title="Book the show" body="Agree on a date, mark it accepted, and promote it on both calendars. Your scene, fully booked." />
        </div>
      </section>

      {/* Features grid */}
      <section className="container-page py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon="🌐" title="One-page profiles" body="A polished public site at /bands/your-name or /venues/your-room. No web design needed." />
          <Feature icon="📅" title="Show calendars" body="List upcoming shows with dates, tickets, and lineups. Public and embeddable." />
          <Feature icon="✉️" title="Direct messaging" body="Talk to bands and venues in a clean inbox. Keep all your booking chats in one thread." />
          <Feature icon="📨" title="Booking submissions" body="Bands pitch venues with a proposed date and a note. Venues accept or pass in a click." />
          <Feature icon="🔎" title="Smart discovery" body="Filter by city, genre, and capacity to find exactly the right match for your night." />
          <Feature icon="🎨" title="Custom branding (Pro)" body="Make your page yours with custom theme colors and featured placement in discovery." />
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="container-page py-16">
        <div className="card overflow-hidden">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12">
            <div>
              <h2 className="text-3xl font-bold">Start free. Upgrade when you&apos;re ready.</h2>
              <p className="mt-3 text-zinc-400">
                Everything you need to get discovered is free forever. Go Pro for
                unlimited shows, unlimited submissions, custom branding, and
                featured placement.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/pricing" className="btn-primary">See pricing</Link>
                <Link href="/signup" className="btn-ghost">Get started free</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <PlanMini plan="FREE" />
              <PlanMini plan="PRO" highlight />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 p-10 text-center sm:p-16">
          <div className="aurora absolute inset-0 -z-10 opacity-80" />
          <h2 className="text-3xl font-bold sm:text-4xl">Your next show starts here.</h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-300">
            Join the bands and venues building the local scene on BandConnect.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/signup" className="btn-primary">Create your free profile</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="card px-4 py-5">
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}

function AudienceCard({
  tag,
  tone,
  title,
  points,
  cta,
}: {
  tag: string;
  tone: "brand" | "accent";
  title: string;
  points: string[];
  cta: { href: string; label: string };
}) {
  return (
    <div className="card p-8">
      <span className={tone === "brand" ? "badge-brand" : "badge-accent"}>{tag}</span>
      <h3 className="mt-4 text-2xl font-bold">{title}</h3>
      <ul className="mt-5 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-sm text-zinc-300">
            <CheckIcon tone={tone} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Link
        href={cta.href}
        className={tone === "brand" ? "btn-primary mt-7" : "btn-accent mt-7"}
      >
        {cta.label}
      </Link>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="card p-7">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/15 font-display text-lg font-bold text-brand-300">
        {n}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{body}</p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-3 font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-zinc-400">{body}</p>
    </div>
  );
}

function PlanMini({ plan, highlight }: { plan: "FREE" | "PRO"; highlight?: boolean }) {
  const p = PLANS[plan];
  return (
    <div
      className={
        "rounded-2xl border p-5 " +
        (highlight
          ? "border-brand-400/40 bg-brand-500/10"
          : "border-white/10 bg-black/20")
      }
    >
      <div className="text-sm font-semibold text-zinc-300">{p.name}</div>
      <div className="mt-1 font-display text-2xl font-bold text-white">
        ${p.priceMonthly}
        <span className="text-sm font-normal text-zinc-500">/mo</span>
      </div>
      <p className="mt-2 text-xs text-zinc-400">{p.tagline}</p>
    </div>
  );
}

function CheckIcon({ tone }: { tone: "brand" | "accent" }) {
  return (
    <svg
      className={"mt-0.5 h-4 w-4 flex-shrink-0 " + (tone === "brand" ? "text-brand-400" : "text-accent")}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
