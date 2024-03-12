"use server";

import { NextRequest, NextResponse } from "next/server";
import { deletePasswordResetTokens } from "@/lib/cron/delete-password-reset-tokens";

import { deletePatientProfileAccessCodes } from "@/lib/cron/delete-patient-profile-access-codes";
import { deletePatients } from "@/lib/cron/delete-patients";
import { deleteRequestRecordsCodes } from "@/lib/cron/delete-request-records-codes";
import { deleteTwoFactorTokens } from "@/lib/cron/delete-two-factor-tokens";
import { deleteVerificationTokens } from "@/lib/cron/delete-verification-tokens";
import { restrictFilesCron } from "@/lib/cron/restrict-files";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
