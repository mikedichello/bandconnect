import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Stripe needs the raw body to verify the signature, so disable body parsing.
export const dynamic = "force-dynamic";

/**
 * Stripe webhook. Keeps each user's `plan` / subscription fields in sync with
 * Stripe so feature-gating always reflects real billing state.
 */
export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Billing disabled" }, { status: 503 });
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // One-time event "boost" payment → feature the event for N days.
        if (session.metadata?.kind === "boost" && session.metadata.eventId) {
          const days = Number(session.metadata.days) || 30;
          await prisma.event
            .update({
              where: { id: session.metadata.eventId },
              data: { featured: true, featuredUntil: new Date(Date.now() + days * 86_400_000) },
            })
            .catch((e) => console.error("Boost activation failed", e));
          break;
        }

        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;
        if (userId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "PRO",
              planStatus: sub.status,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId ?? undefined,
              planRenewsAt: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const active = sub.status === "active" || sub.status === "trialing";
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            plan: active ? "PRO" : "FREE",
            planStatus: sub.status,
            stripeSubscriptionId: sub.id,
            planRenewsAt: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            plan: "FREE",
            planStatus: "canceled",
            stripeSubscriptionId: null,
            planRenewsAt: null,
          },
        });
        break;
      }

      default:
        // Unhandled event types are fine to ignore.
        break;
    }
  } catch (err) {
    console.error("Error handling webhook", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
