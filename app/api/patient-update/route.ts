import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

import {
  decryptKey,
  encryptPatientRecord,
  checkForInvalidDemographicsData,
  decryptMultiplePatientFields,
} from "@/lib/utils";

const discreteTables = ["addresses", "member"];
const exemptFields = ["unit", "patientProfileId", "userId", "id", "createdAt", "updatedAt"];
function buildUpdatePayload(data: any, symmetricKey: string) {
  const payload: any = {};
  for (const key in data) {
    if (
      data[key] !== undefined &&
      data[key] !== null &&
      !discreteTables.includes(key) &&
      !exemptFields.includes(key) &&
      !key.includes("Key")
    ) {
      payload[key] = encryptPatientRecord(data[key], symmetricKey);
    }
  }
  return payload;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updateType = body.updateType;
    const data = body.fieldsObj;
    const bodyLength = Object.keys(body).length;

    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (bodyLength === 0 || !data) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        symmetricKey: true,
        addresses: true,
      },
    });
    if (!patient || !patient.symmetricKey) {
      return new NextResponse("Decryption key not found", { status: 401 });
    }

    if (updateType === "demographics") {
      if (checkForInvalidDemographicsData(data, { addresses: patient?.addresses }) !== "") {
        return new NextResponse("Invalid body", { status: 400 });
      }

      const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");
      const updatePayload = buildUpdatePayload(data, decryptedSymmetricKey);
      if (Object.keys(updatePayload).length > 0) {
        await prismadb.patientProfile.update({
          where: { userId },
          data: updatePayload,
        });
      }

      if (patient.addresses.length === 0 && data.addresses) {
        const encryptedAddress = buildUpdatePayload(data.addresses[0], decryptedSymmetricKey);
        await prismadb.address.create({
          data: { ...encryptedAddress, patientProfileId: patient.id, userId },
        });
      } else if (patient.addresses.length === 1 && data.addresses) {
        const encryptedAddress = buildUpdatePayload(data.addresses[0], decryptedSymmetricKey);
        await prismadb.address.update({
          where: {
            userId: userId,
            patientProfileId: patient.id,
            id: patient.addresses[0].id,
          },
          data: { ...encryptedAddress },
        });
      }
    } else if (updateType === "newMedication") {
      console.log("IN 88");
      const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");
      const encryptedMedication = buildUpdatePayload(data, decryptedSymmetricKey);
      const newMedication = await prismadb.medication.create({
        data: { ...encryptedMedication, ...{ userId: userId, patientProfileId: patient.id } },
      });
      return new NextResponse(JSON.stringify({ newMedicationId: newMedication.id }));
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
