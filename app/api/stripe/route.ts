import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getPatient } from "@/lib/stripe/subscription";
import { stripe } from "@/lib/stripe/stripe";
import { absoluteUrl } from "@/lib/utils";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { planNames } from "@/lib/constants";
import { StipePostSchema } from "@/lib/schemas/stripe";

import { unrestrictFiles, restrictFiles } from "@/lib/actions/files";
import { getSumOfFilesSizes } from "@/lib/data/files";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const validatedFields = StipePostSchema.safeParse(body);
    if (!validatedFields.success) {
      return new NextResponse("Invalid body", { status: 500 });
    }

    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const userEmail = user?.email;
    const planName = validatedFields.data.plan;

    const planObj = planNames[planName];
    const productName = planObj.stripe.name;
    const validatedRedirectUrlField = validatedFields.data.redirectUrl;

    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!session || !user || !userId || !currentUserPermissions.isPatient || !userEmail) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const redirectUrl = `${absoluteUrl(validatedRedirectUrlField)}?manage-account-billing-plan=refresh`;

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });
    if (
      !!userSubscription &&
      !!userSubscription.stripeSubscriptionId &&
      !!userSubscription.stripePriceId &&
      !!userSubscription.stripeCustomerId &&
      userSubscription?.plan !== validatedFields.data.plan
    ) {
      const tierIsUpgrade = planObj.stripe.price > planNames[user.plan].stripe.price;
      const subscriptions = await stripe.subscriptions.list({
        customer: userSubscription.stripeCustomerId,
      });
      await stripe.subscriptions.update(userSubscription.stripeSubscriptionId, {
        items: [
          {
            id: subscriptions.data[0].items.data[0].id,
            price: planObj.stripe.id,
          },
        ],
      });
      const patient = await getPatient(userId);
      let newlyUnrestrictedFileIds: string[] = [];
      let newlyRestrictedFileIds: string[] = [];
      if (!patient) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const sumOfAllSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId");
      const sumOfUnrestrictedSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId", true);
      if (typeof sumOfAllSuccessFilesSizes !== "bigint" || typeof sumOfUnrestrictedSuccessFilesSizes !== "bigint") {
        return new NextResponse("Something went wrong", { status: 500 });
      }
      if (tierIsUpgrade) {
        newlyUnrestrictedFileIds = await unrestrictFiles({
          ...patient,
          plan: planName,
          sumOfAllSuccessFilesSizes: sumOfAllSuccessFilesSizes,
          sumOfUnrestrictedSuccessFilesSizes: sumOfUnrestrictedSuccessFilesSizes,
        });
      } else {
        newlyRestrictedFileIds = await restrictFiles({
          ...patient,
          plan: planName,
          sumOfAllSuccessFilesSizes: sumOfAllSuccessFilesSizes,
        });
      }
      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: userSubscription.stripeSubscriptionId,
        },
        data: {
          plan: planName,
          stripePriceId: planObj.stripe.id,
        },
      });
      if (tierIsUpgrade && validatedRedirectUrlField.startsWith("/file")) {
        return new NextResponse(JSON.stringify({ newlyUnrestrictedFileIds: newlyUnrestrictedFileIds }));
      }
      if (!tierIsUpgrade && validatedRedirectUrlField.startsWith("/file")) {
        return new NextResponse(JSON.stringify({ newlyRestrictedFileIds: newlyRestrictedFileIds }));
      }
      return new NextResponse("Success", { status: 200 });
    } else if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: redirectUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    } else {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: redirectUrl,
        cancel_url: redirectUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: productName,
                description: productName,
              },
              unit_amount: planObj.stripe.price,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          planName,
          userId,
        },
      });
      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
