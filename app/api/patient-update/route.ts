"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";

import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

import { extractRootFolderIds, patientUpdateVerification } from "@/lib/utils";
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
import { getAccessPatientCodeByToken } from "@/auth/data";
import { PatientMember } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const headersList = headers();
    // const domain = headersList.get("host") || "";
    const fullUrl = headersList.get("referer") || "";

    const body = await req.json();
    const updateType = body.updateType;

    // const { userId } = auth();
    // const user = await currentUser();

    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let accessibleRootFolderIds: string[] | "ALL_EXTERNAL" | "ALL" | null = null;
    const user = session?.user;
    let patientUserId = user?.id;
    let currentUserPermissions = extractCurrentUserPermissions(user);
    const patientMemberId = currentUserPermissions.isProvider ? fullUrl.split("/patient/")[1].split("/")[0] : null;
    let codeId = null;
    let accessibleRootFolderIdsString = null;
    if (!currentUserPermissions.hasAccount) {
      accessibleRootFolderIdsString = user.accessibleRootFolders;
      accessibleRootFolderIds = extractRootFolderIds(accessibleRootFolderIdsString);
      const code = await getAccessPatientCodeByToken(session.tempToken);
      if (!code) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      codeId = code.id;
    }

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!patientUpdateVerification(body, currentUserPermissions) && !currentUserPermissions.isProvider) {
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
    if (currentUserPermissions.isPatient) {
      accessibleRootFolderIdsString = "ALL";
      accessibleRootFolderIds = "ALL";
    }
    let patient: { id: string } | null = null;
    let patientMember: (PatientMember & { patientProfile: { id: string } }) | null = null;
    if (currentUserPermissions.isProvider && !!patientMemberId) {
      patientMember = await prismadb.patientMember.findUnique({
        where: {
          id: patientMemberId,
        },
        include: {
          patientProfile: {
            select: {
              id: true,
            },
          },
        },
      });

      patient = patientMember?.patientProfile || null;
      if (!patient || !patientMember) {
        return new NextResponse("Patient not found", { status: 401 });
      }
      patientUserId = patientMember.patientUserId;
      user.role = patientMember?.role;
      currentUserPermissions = extractCurrentUserPermissions(user);
      if (!patientUpdateVerification(body, currentUserPermissions)) {
        return new NextResponse("Invalid body", { status: 400 });
      }
      accessibleRootFolderIdsString = patientMember.accessibleRootFolders;
      accessibleRootFolderIds = extractRootFolderIds(patientMember.accessibleRootFolders);
    } else if (!currentUserPermissions.isProvider) {
      patient = await prismadb.patientProfile.findUnique({
        where: {
          userId: patientUserId,
        },
        select: {
          id: true,
        },
      });
    }

    if (!patient) {
      return new NextResponse("Patient not found", { status: 401 });
    }
    if (!accessibleRootFolderIds || !accessibleRootFolderIdsString) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userIds = { patient: patientUserId, provider: currentUserPermissions.isProvider ? user.id : null };

    if (updateType === "renameNode") {
      const isFile = body.isFile;
      const nodeId = body.nodeId;
      const newName = body.newName;
      const result = await renameNode(isFile, nodeId, newName, userIds, accessibleRootFolderIds);
      if (result.error) {
        return new NextResponse(result.error, { status: result.status });
      }

      if (!currentUserPermissions.isPatient) {
        await createPatientNotification({
          notificationType: currentUserPermissions.isProvider ? "PROVIDER_NODE_RENAMED" : "ACCESS_CODE_NODE_RENAMED",
          patientUserId: patientUserId,
          dynamicData: {
            organizationName: patientMember?.organizationName,
            isFile: isFile,
            role: user?.role,
            oldName: result.oldName || "N/A",
            newName: newName,
          },
        });
      }
    } else if (updateType === "moveNode") {
      const selectedIds = body.selectedIds;
      const targetId = body.targetId;
      const result = await moveNodes(selectedIds, targetId, false, userIds, accessibleRootFolderIds);
      if (result.error) {
        return new NextResponse(result.error, { status: result.status });
      }

      if (!currentUserPermissions.isPatient) {
        await createPatientNotification({
          notificationType: currentUserPermissions.isProvider ? "PROVIDER_NODE_MOVED" : "ACCESS_CODE_NODE_MOVED",
          patientUserId: patientUserId,
          dynamicData: {
            organizationName: patientMember?.organizationName,
            numOfNodes: selectedIds.length,
            role: user?.role,
            fromFolder: body.fromName,
            toFolder: body.toName,
          },
        });
      }
    } else if (updateType === "trashNode") {
      const selectedIds = body.selectedIds;
      const targetId = body.targetId;
      const result = await moveNodes(selectedIds, targetId, true, userIds, accessibleRootFolderIds);
      if (result.error) {
        return new NextResponse(result.error, { status: result.status });
      }
    } else if (updateType === "restoreRootFolder") {
      const selectedId = body.selectedId;
      await restoreRootFolder(selectedId, patientUserId);
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
      const addedByUserId = !currentUserPermissions.hasAccount ? null : user.id;
      const addedByName = currentUserPermissions.isProvider
        ? user.name || "N/A"
        : !currentUserPermissions.hasAccount
        ? `Temporary Access User`
        : `Me`;
      const addedBy = { id: addedByUserId, name: addedByName };
      const patientObj = { profileId: patient.id, userId: patientUserId };
      const userType: "provider" | "accessCode" | null = currentUserPermissions.isProvider
        ? "provider"
        : !currentUserPermissions.hasAccount
        ? "accessCode"
        : null;
      const idToUse = userType == "accessCode" ? codeId : patientMemberId;
      const providerUserId = currentUserPermissions.isProvider ? user.id : "";
      const updateAccessibleRootIdsObj =
        !!userType && !!idToUse
          ? { userType: userType, providerUserId, id: idToUse, accessibleRootFolders: accessibleRootFolderIdsString }
          : null;
      const folderId = await addRootNode(body.folderName, addedBy, patientObj, updateAccessibleRootIdsObj);

      if (!currentUserPermissions.isPatient) {
        await createPatientNotification({
          notificationType: currentUserPermissions.isProvider
            ? "PROVIDER_ADDED_ROOT_FOLDER"
            : "ACCESS_CODE_ADDED_ROOT_FOLDER",
          patientUserId: patientUserId,
          dynamicData: {
            organizationName: patientMember?.organizationName,
            role: user?.role,
            rootFolderName: body.folderName,
          },
        });
      }

      return NextResponse.json({ folderId: folderId }, { status: 200 });
    } else if (updateType === "addSubFolder") {
      const addedByUserId = !currentUserPermissions.hasAccount ? null : user.id;
      const addedByName = currentUserPermissions.isProvider
        ? user.name || "N/A"
        : !currentUserPermissions.hasAccount
        ? `Temporary Access User`
        : `Me`;

      const addedBy = { id: addedByUserId, name: addedByName };
      const folderObj = { name: body.folderName, parentId: body.parentId };
      const patientObj = { profileId: patient.id, userId: patientUserId };
      const providerUserId = currentUserPermissions.isProvider ? user.id : null;
      const folder = await addSubFolder(folderObj, addedBy, patientObj, providerUserId, accessibleRootFolderIds);

      if (!currentUserPermissions.isPatient) {
        await createPatientNotification({
          notificationType: currentUserPermissions.isProvider
            ? "PROVIDER_ADDED_SUB_FOLDER"
            : "ACCESS_CODE_ADDED_SUB_FOLDER",
          patientUserId: patientUserId,
          dynamicData: {
            organizationName: patientMember?.organizationName,
            role: user?.role,
            parentFolderName: folder.parentFolderName,
            subFolderName: body.folderName,
          },
        });
      }

      return NextResponse.json({ folder: folder }, { status: 200 });
    }
    return new NextResponse("Success", { status: 200 });
  } catch (error: any) {
    const errorString = error.toString().toLowerCase();
    if (errorString.includes("prisma") && errorString.includes("unique constraint failed")) {
      return new NextResponse("Folder already exists in this path!", { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
