// import { auth, currentUser } from "@clerk/nextjs";
"use server";

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

import { patientUpdateVerification, isValidNodeName } from "@/lib/utils";
import {
  moveNodes,
  deleteFiles,
  deleteFolders,
  addRootNode,
  addSubFolder,
  restoreRootFolder,
  getAllObjectsToDelete,
  deleteS3Objects,
  unrestrictFiles,
  renameNode,
} from "@/lib/actions/files";

import { createPatientNotification } from "@/lib/actions/notifications";

import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { getSumOfFilesSizes } from "@/lib/data/files";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updateType = body.updateType;

    // const { userId } = auth();
    // const user = await currentUser();

    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
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
        addresses: true,
      },
    });
    if (!patient) {
      return new NextResponse("Patient not found", { status: 401 });
    }
    if (updateType === "renameNode") {
      const isFile = body.isFile;
      const nodeId = body.nodeId;
      const newName = body.newName;
      const result = await renameNode(isFile, nodeId, newName);
      if (result.error) {
        console.log(result.error);
        console.log("IN HERE 81111 route");
        return new NextResponse(result.error, { status: result.status });
      }
    } else if (updateType === "moveNode") {
      const selectedIds = body.selectedIds;
      console.log(selectedIds);
      const targetId = body.targetId;
      console.log(targetId);
      await moveNodes(selectedIds, targetId, userId);
      if (!currentUserPermissions.hasAccount) {
        await createPatientNotification({
          notificationType: "ACCESS_CODE_NODE_MOVED",
          dynamicData: {
            numOfNodes: selectedIds.length,
            accessCodeType: user?.role,
            fromFolder: body.fromName,
            toFolder: body.toName,
          },
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
      // console.log("selectedIds");
      // console.log(selectedIds);
      const forEmptyTrash = body.forEmptyTrash;
      const { rawObjects, convertedObjects, totalSize } = await getAllObjectsToDelete(selectedIds, patient.id);
      const selectedFileIds: string[] = rawObjects.map((object) => object.id);
      const selectedFolderIds: string[] = selectedIds.filter((id: string) => !selectedFileIds.includes(id));

      await deleteFiles(selectedFileIds);
      await deleteFolders(selectedFolderIds, forEmptyTrash);
      await deleteS3Objects(convertedObjects, rawObjects, patient.id);
      const sumOfAllSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId");
      const sumOfUnrestrictedSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId", true);
      if (typeof sumOfAllSuccessFilesSizes !== "bigint" || typeof sumOfUnrestrictedSuccessFilesSizes !== "bigint") {
        return new NextResponse("Something went wrong", { status: 500 });
      }
      const newlyUnrestrictedFileIds = await unrestrictFiles({
        id: patient.id,
        sumOfAllSuccessFilesSizes: sumOfAllSuccessFilesSizes,
        sumOfUnrestrictedSuccessFilesSizes: sumOfUnrestrictedSuccessFilesSizes,
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
        await createPatientNotification({
          notificationType: "ACCESS_CODE_ADDED_ROOT_FOLDER",
          dynamicData: {
            accessCodeType: user?.role,
            rootFolderName: body.folderName,
          },
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
        await createPatientNotification({
          notificationType: "ACCESS_CODE_ADDED_SUB_FOLDER",
          dynamicData: {
            accessCodeType: user?.role,
            subFolderName: body.folderName,
          },
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
