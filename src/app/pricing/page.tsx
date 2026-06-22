import { getSession } from "@/lib/session";
import { isBillingEnabled } from "@/lib/plans";
import { PricingTable } from "@/components/PricingTable";

export const metadata = { title: "Pricing" };

const faqs = [
  {
    q: "Is BandConnect really free?",
    a: "Yes. The Starter plan is free forever — build a profile, get discovered, post shows, and message. Upgrade to Pro only when you want more.",
  },
  {
    q: "What's the difference between bands and venues?",
    a: "Both get the same plans. Bands use BandConnect to find rooms and send booking submissions; venues use it to find acts and manage incoming requests.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Manage or cancel your subscription from your billing page at any time — you keep Pro until the end of your billing period.",
  },
  {
    q: "Do you take a cut of my bookings?",
    a: "Never. BandConnect is a flat subscription. What you book is yours — we don't touch ticket or guarantee money.",
  },
];

export default async function PricingPage() {
  const session = await getSession();
  const loggedIn = Boolean(session?.user);
  const isPro = session?.user?.plan === "PRO";

  return (
    <div className="relative">
      <div className="aurora absolute inset-x-0 top-0 -z-10 h-96 opacity-50" />
      <div className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge-brand mb-4">Simple, honest pricing</span>
          <h1 className="text-4xl font-bold sm:text-5xl">Pricing that fits the gig</h1>
          <p className="mt-4 text-lg text-subtle">
            Start free. Upgrade to Pro when you&apos;re ready to stand out and book more.
          </p>
        </div>

        <div className="mt-12">
          <PricingTable loggedIn={loggedIn} isPro={isPro} billingEnabled={isBillingEnabled()} />
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="card p-6">
                <h3 className="font-semibold text-fg">{f.q}</h3>
                <p className="mt-2 text-sm text-subtle">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
