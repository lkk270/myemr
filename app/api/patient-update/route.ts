// import { auth, currentUser } from "@clerk/nextjs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

import {
  decryptKey,
  encryptPatientRecord,
  checkForInvalidDemographicsData,
  checkForInvalidEditedMedication,
  checkForInvalidNewMedication,
  decryptMultiplePatientFields,
  patientUpdateVerification,
} from "@/lib/utils";

const validUpdateTypes = ["demographics", "newMedication", "editMedication", "deleteMedication"];

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

    // const { userId } = auth();
    // const user = await currentUser();

    const session = await auth();

    if (!session) {
      return redirect("/");
    }

    const user = session?.user;
    const userId = user?.id;

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!patientUpdateVerification(body)) {
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
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

    if (updateType === "demographics") {
      if (checkForInvalidDemographicsData(data, { addresses: patient?.addresses }) !== "") {
        return new NextResponse("Invalid body", { status: 400 });
      }

      const updatePayload = buildUpdatePayload(data, decryptedSymmetricKey);
      if (Object.keys(updatePayload).length > 0) {
        await prismadb.patientProfile.update({
          where: { userId },
          data: updatePayload,
        });
      }

      if (patient.addresses.length === 0 && data.addresses) {
        const encryptedAddress = buildUpdatePayload(data.addresses[0], decryptedSymmetricKey);
        console.log(encryptedAddress);
        await prismadb.patientAddress.create({
          data: { ...encryptedAddress, patientProfileId: patient.id },
        });
      } else if (patient.addresses.length === 1 && data.addresses) {
        const encryptedAddress = buildUpdatePayload(data.addresses[0], decryptedSymmetricKey);
        await prismadb.patientAddress.update({
          where: {
            patientProfileId: patient.id,
            id: patient.addresses[0].id,
          },
          data: { ...encryptedAddress },
        });
      }
    } else if (updateType === "newMedication") {
      if (checkForInvalidNewMedication(data) !== "") {
        return new NextResponse("Invalid body", { status: 400 });
      }
      const currentMedicationNames = await prismadb.medication.findMany({
        where: {
          patientProfileId: patient.id,
        },
        select: {
          name: true,
        },
      });
      const decryptedCurrentMedicationNames = decryptMultiplePatientFields(
        currentMedicationNames,
        decryptedSymmetricKey,
      );

      if (decryptedCurrentMedicationNames.some((medication: { name: string }) => medication.name === data.name)) {
        return new NextResponse("Medication already exists", { status: 400 });
      }
      const encryptedMedication = buildUpdatePayload(data, decryptedSymmetricKey);

      const newMedication = await prismadb.medication.create({
        data: { ...encryptedMedication, ...{ patientProfileId: patient.id } },
      });
      return new NextResponse(JSON.stringify({ newMedicationId: newMedication.id }));
    } else if (updateType === "editMedication") {
      const updatePayload = buildUpdatePayload(data, decryptedSymmetricKey);
      await prismadb.medication.update({
        where: { id: body.medicationId },
        data: updatePayload,
      });
      if (body.dosageHistoryInitialFields) {
        //add dosageHistory
        const dosageHistoryEntry = buildUpdatePayload(body.dosageHistoryInitialFields, decryptedSymmetricKey);
        await prismadb.dosageHistory.create({
          data: { ...dosageHistoryEntry, ...{ medicationId: body.medicationId } },
        });
      }
    } else if (updateType === "deleteMedication") {
      await prismadb.medication.delete({
        where: { id: body.medicationId },
      });
    } else if (updateType === "renameNode") {
      const isFile = body.isFile;
      const nodeId = body.nodeId;
      const newName = body.newName;
      if (isFile === true) {
        await prismadb.file.update({
          where: {
            id: nodeId,
          },
          data: { name: newName },
        });
      } else if (isFile === false) {
        await prismadb.folder.update({
          where: {
            id: nodeId,
          },
          data: { name: newName },
        });
      }
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
