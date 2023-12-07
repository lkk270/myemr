import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

import { decryptKey, encryptPatientRecord, checkForInvalidData } from "@/lib/utils";

const discreteTables = ["address", "member"];
function buildUpdatePayload(data: any, symmetricKey: string) {
  const payload: any = {};
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null && !discreteTables.includes(key)) {
      payload[key] = encryptPatientRecord(data[key], symmetricKey);
    }
  }
  return payload;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body.fieldsObj;
    const bodyLength = Object.keys(body).length;

    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (bodyLength === 0 || !data || checkForInvalidData(data) !== "") {
      return new NextResponse("Invalid body", { status: 400 });
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: userId,
      },
      select: {
        symmetricKey: true,
      },
    });
    if (!patient || !patient.symmetricKey) {
      return new NextResponse("Decryption key not found", { status: 401 });
    }
    console.log(data);
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");
    const updatePayload = buildUpdatePayload(data, decryptedSymmetricKey);

    console.log(updatePayload);
    await prismadb.patientProfile.update({
      where: { userId },
      data: updatePayload,
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
