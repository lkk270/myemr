"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  deletePasswordResetTokens,
  deletePatientProfileAccessCodes,
  deletePatients,
  deleteRequestRecordsCodes,
  deleteTwoFactorTokens,
  deleteVerificationTokens,
  restrictFilesCron,
} from "@/lib/cron";

export async function GET(request: NextRequest) {
  try {
    console.log("CRON ROUTE HIT");
    const authHeader = request.headers.get("authorization");
    console.log(`Bearer ${process.env.CRON_SECRET}`);
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log("IN HERE");
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    await restrictFilesCron(authHeader);

    await deletePatients(authHeader);

    await deletePasswordResetTokens(authHeader);
    await deletePatientProfileAccessCodes(authHeader);
    await deleteRequestRecordsCodes(authHeader);
    await deleteTwoFactorTokens(authHeader);
    await deleteVerificationTokens(authHeader);

    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
