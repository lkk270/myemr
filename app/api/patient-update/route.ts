// import { auth, currentUser } from "@clerk/nextjs";
"use server";
import { signOut, auth } from "@/auth";
import { redirect } from "next/navigation";

import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

import {
  decryptKey,
  encryptPatientRecord,
  checkForInvalidDemographicsData,
  patientUpdateVerification,
  isValidNodeName,
} from "@/lib/utils";
import {
  updateDescendantsForRename,
  updateRecordViewActivity,
  moveNodes,
  deleteFiles,
  deleteFolders,
  addRootNode,
  addSubFolder,
  restoreRootFolder,
  getAllObjectsToDelete,
  deleteS3Objects,
  unrestrictFiles,
} from "@/lib/actions/files";

import { createNotification } from "@/lib/actions/notifications";

import { getAccessPatientCodeByToken } from "@/auth/data";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

const validUpdateTypes = ["demographics", "newMedication", "editMedication", "deleteMedication"];

const discreteTables = ["addresses", "member"];
const exemptFields = ["unit", "patientProfileId", "userId", "id", "createdAt", "updatedAt", "usedFileStorage"];
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

    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!userId || !user || !currentUserPermissions.canEdit) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!patientUpdateVerification(body, currentUserPermissions)) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    // if (!currentUserPermissions.isPatient) {
    //   console.log("IN 8777888799");
    //   const code = await getAccessPatientCodeByToken(session.tempToken);
    //   console.log(code);
    //   if (!code) {
    //     console.log("AATtePMPTING REDIRECT");
    //     return redirect("/");
    //     // return new NextResponse("Unauthorized", { status: 400 });
    //   }
    // }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        symmetricKey: true,
        addresses: true,
        usedFileStorage: true,
        unrestrictedUsedFileStorage: true,
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
      if (!currentUserPermissions.hasAccount) {
        await createNotification({
          text: `An external user, whom you granted a temporary access code with "${user?.role}" permissions has edited the medication: "${body.medicationName}"`,
          type: "ACCESS_CODE",
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
      if (!isValidNodeName(newName)) {
        return new NextResponse("Invalid new name", { status: 400 });
      }
      if (isFile === true) {
        const currentFile = await prismadb.file.findUnique({
          where: { id: nodeId },
        });
        if (!currentFile) {
          return new NextResponse("File not found", { status: 400 });
        }
        const oldPath = currentFile.namePath;
        const newNamePath = oldPath.replace(/[^/]*$/, newName);
        await prismadb.file.update({
          where: {
            id: nodeId,
          },
          data: { name: newName, namePath: newNamePath },
        });
        await updateRecordViewActivity(userId, nodeId, true);
        if (!currentUserPermissions.hasAccount) {
          await createNotification({
            text: `An external user, whom you granted a temporary access code with "${user?.role}" permissions has renamed the file: "${currentFile.name}" to "${newName}"`,
            type: "ACCESS_CODE",
          });
        }
      } else if (isFile === false) {
        const currentFolder = await prismadb.folder.findUnique({
          where: { id: nodeId },
        });

        if (!currentFolder) {
          return new NextResponse("Folder not found", { status: 400 });
        }

        const oldNamePath = currentFolder.namePath;
        const newNamePath = oldNamePath.substring(0, oldNamePath.lastIndexOf("/") + 1) + newName;

        await prismadb.$transaction(
          async (prisma) => {
            // Update the folder
            await prisma.folder.update({
              where: { id: nodeId },
              data: {
                name: newName,
                namePath: newNamePath,
              },
            });

            // Retrieve and update descendants
            // Pass the transactional Prisma client to the function
            await updateDescendantsForRename(prisma, nodeId, oldNamePath, newNamePath);
          },
          { timeout: 20000 },
        );
        await updateRecordViewActivity(userId, nodeId, false);

        if (!currentUserPermissions.hasAccount) {
          await createNotification({
            text: `An external user, whom you granted a temporary access code with "${user?.role}" permissions has renamed the folder: "${currentFolder.name}" to "${newName}"`,
            type: "ACCESS_CODE",
          });
        }
      }
    } else if (updateType === "moveNode") {
      const selectedIds = body.selectedIds;
      const targetId = body.targetId;
      await moveNodes(selectedIds, targetId, userId);
      if (!currentUserPermissions.hasAccount) {
        await createNotification({
          text: `An external user, whom you granted a temporary access code with "${user?.role}" permissions has moved nodes from "${body.fromName}" to "${body.toName}"`,
          type: "ACCESS_CODE",
        });
      }
    } else if (updateType === "trashNode") {
      const selectedIds = body.selectedIds;
      const targetId = body.targetId;
      await moveNodes(selectedIds, targetId, userId, true);
    } else if (updateType === "restoreRootFolder") {
      const selectedId = body.selectedId;
      await restoreRootFolder(selectedId, userId);
    } else if (updateType === "deleteNode") {
      const selectedIds = body.selectedIds;
      const forEmptyTrash = body.forEmptyTrash;
      const { rawObjects, convertedObjects, totalSize } = await getAllObjectsToDelete(selectedIds, patient.id);
      const selectedFileIds: string[] = rawObjects.map((object) => object.id);
      const selectedFolderIds: string[] = selectedIds.filter((id: string) => !selectedFileIds.includes(id));
      const totalSizeOfUnrestrictedFiles = rawObjects.reduce((accumulator, currentValue) => {
        return BigInt(accumulator) + (!currentValue.restricted ? BigInt(currentValue.size) : 0n);
      }, 0n); // Initialize with a bigint literal

      await deleteFiles(selectedFileIds, totalSizeOfUnrestrictedFiles, totalSize, patient.id);
      await deleteFolders(selectedFolderIds, forEmptyTrash);
      await deleteS3Objects(convertedObjects, rawObjects, patient.id);
      const newlyUnrestrictedFileIds = await unrestrictFiles({
        id: patient.id,
        usedFileStorage: patient.usedFileStorage,
        unrestrictedUsedFileStorage: patient.unrestrictedUsedFileStorage,
        plan: user.plan,
      });
      return new NextResponse(
        JSON.stringify({ totalSize: totalSize, newlyUnrestrictedFileIds: newlyUnrestrictedFileIds }),
      );
    } else if (updateType === "addRootNode") {
      const folderId = await addRootNode(
        body.folderName,
        body.addedByUserId,
        body.patientUserId,
        patient.id,
        body.addedByName,
      );
      if (!currentUserPermissions.hasAccount) {
        await createNotification({
          text: `An external user, whom you granted a temporary access code with "${user?.role}" permissions has added the root folder: "${body.folderName}"`,
          type: "ACCESS_CODE",
        });
      }
      return NextResponse.json({ folderId: folderId }, { status: 200 });
    } else if (updateType === "addSubFolder") {
      const folder = await addSubFolder(
        body.folderName,
        body.parentId,
        body.addedByUserId,
        body.patientUserId,
        patient.id,
        body.addedByName,
      );
      if (!currentUserPermissions.hasAccount) {
        await createNotification({
          text: `An external user, whom you granted a temporary access code with "${user?.role}" permissions has added a sub folder: "${body.folderName}"`,
          type: "ACCESS_CODE",
        });
      }
      return NextResponse.json({ folder: folder }, { status: 200 });
    }
    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    console.log(error);
    const errorString = error.toString().toLowerCase();
    if (errorString.includes("prisma") && errorString.includes("unique constraint failed")) {
      return new NextResponse("Folder already exists in this path!", { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
