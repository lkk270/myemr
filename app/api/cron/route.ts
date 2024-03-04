"use server";

import { NextRequest, NextResponse } from "next/server";
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

    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
