import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { EVENT_BOOST } from "@/lib/plans";

/**
 * Start a one-time Stripe Checkout to "boost" an event you host — promoted
 * placement in the calendar for EVENT_BOOST.days. Pay-per-use, any plan. The
 * webhook (checkout.session.completed, kind=boost) flips the event to featured.
 */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event || event.hostProfileId !== user.profile.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (event.startAt < new Date()) {
    return NextResponse.json({ error: "That show has already passed." }, { status: 400 });
  }
  if (event.featured && event.featuredUntil && event.featuredUntil > new Date()) {
    return NextResponse.json({ error: "This show is already featured." }, { status: 409 });
  }

  if (!stripe) {
    return NextResponse.json(
      {
        error: "Boosting requires billing to be configured on this deployment.",
        code: "BILLING_DISABLED",
      },
      { status: 503 },
    );
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: EVENT_BOOST.priceUsd * 100,
          product_data: {
            name: `Featured boost — ${event.title}`,
            description: `Promoted in the BandConnect calendar for ${EVENT_BOOST.days} days.`,
          },
        },
      },
    ],
    success_url: `${appUrl}/dashboard/events?boosted=1`,
    cancel_url: `${appUrl}/dashboard/events`,
    metadata: { userId: user.id, kind: "boost", eventId: event.id, days: String(EVENT_BOOST.days) },
  });

  return NextResponse.json({ url: checkout.url });
}
