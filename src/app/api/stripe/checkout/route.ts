import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe, getPriceId } from "@/lib/stripe";

/** Start a Stripe Checkout session to subscribe to Pro. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Billing isn't configured on this deployment. Add Stripe keys to enable subscriptions.",
        code: "BILLING_DISABLED",
      },
      { status: 503 },
    );
  }

  const { interval } = (await req.json().catch(() => ({}))) as {
    interval?: "monthly" | "yearly";
  };
  const priceId = getPriceId(interval === "yearly" ? "yearly" : "monthly");
  if (!priceId) {
    return NextResponse.json(
      { error: "No Stripe price configured for that interval." },
      { status: 503 },
    );
  }

  // Ensure the user has a Stripe customer.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?status=success`,
    cancel_url: `${appUrl}/pricing?status=cancelled`,
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkout.url });
}
