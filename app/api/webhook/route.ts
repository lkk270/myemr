import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPatient } from "@/lib/stripe/subscription";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe/stripe";
import { Plan } from "@prisma/client";
import { update } from "@/auth";
import { unrestrictFiles } from "@/lib/actions/files";
import { getSumOfFilesSizes } from "@/lib/data/files";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    if (!session?.metadata?.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }
    if (!session?.metadata?.planName) {
      return new NextResponse("planName is required", { status: 400 });
    }
    const patient = await getPatient(session?.metadata?.userId);
    if (!patient) {
      return new NextResponse("patient is required", { status: 400 });
    }
    await prismadb.userSubscription.create({
      data: {
        userId: session?.metadata?.userId,
        plan: session?.metadata?.planName as Plan,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    const sumOfAllSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId");
    const sumOfUnrestrictedSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId", true);
    if (typeof sumOfAllSuccessFilesSizes !== "bigint" || typeof sumOfUnrestrictedSuccessFilesSizes !== "bigint") {
      return new NextResponse("Something went wrong", { status: 500 });
    }
    await unrestrictFiles({
      ...patient,
      plan: session?.metadata?.planName as Plan,
      sumOfAllSuccessFilesSizes: sumOfAllSuccessFilesSizes,
      sumOfUnrestrictedSuccessFilesSizes: sumOfUnrestrictedSuccessFilesSizes,
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  //   if (event.type === "customer.subscription.updated" && session?.metadata?.forPlanChange) {
  //     console.log("IN 60 of webbook");
  //     const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  //     await prismadb.userSubscription.update({
  //       where: {
  //         stripeSubscriptionId: subscription.id,
  //       },
  //       data: {
  //         plan: session?.metadata?.planName as Plan,
  //         stripePriceId: subscription.items.data[0].price.id,
  //         stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
  //       },
  //     });
  //   }
  const planName = session?.metadata?.planName;
  if (!!planName) {
    update({
      user: {
        plan: planName as Plan,
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
