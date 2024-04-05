import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { patientUpdateVerification } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { allotedStoragesInGb, maxFileUploadSizes, maxFileUploadSize } from "@/lib/constants";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { getSumOfFilesSizes } from "@/lib/data/files";
import { getAccessPatientCodeByToken } from "@/auth/data";
import { getPatientMember } from "@/auth/actions/patient-member";
import { validateUserAndGetAccessibleRootFolders } from "@/lib/actions/files";

export async function POST(request: Request) {
  const body = await request.json();
  const { fileName, contentType, size, parentId, parentNamePath, parentPath, patientMemberId } = body;
  try {
    const session = await auth();

    if (!session) {
      return redirect("/");
    }
    const user = session?.user;
    const userId = user?.id;
    let currentUserPermissions = extractCurrentUserPermissions(user);

    if (!userId || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!currentUserPermissions.hasAccount) {
      const accessToken = session.tempToken;
      const accessCode = await getAccessPatientCodeByToken(accessToken);
      if (!accessCode) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }
    // if (currentUserPermissions.isProvider) {
    //   if (!patientMemberId) {
    //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    //   }
    //   const patientMember = await getPatientMember("canddsdfAdd", "canAdd", { user, currentUserPermissions });
    //   if (!patientMember) {
    //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    //   }
    //   currentUserPermissions.canAdd = patientMember?.role === "FULL_ACCESS" || patientMember?.role === "READ_AND_ADD";
    // }
    if (
      !patientUpdateVerification(
        { ...body, updateType: currentUserPermissions.isProvider ? "uploadFilesByProvider" : "uploadFiles" },
        currentUserPermissions,
      )
    ) {
      return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }

    //handles patientMember lookup if needed
    const accessibleRootFolderIdsResult = await validateUserAndGetAccessibleRootFolders("canAdd", {
      user,
      currentUserPermissions,
      patientMemberId,
    });

    if (!accessibleRootFolderIdsResult) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { accessibleRootFolderIds, patientUserId } = accessibleRootFolderIdsResult;

    const parentFolder = await prismadb.folder.findUnique({
      where: {
        id: parentId,
      },
      select: {
        id: true,
        namePath: true,
        path: true,
      },
    });

    const isAccessible =
      typeof accessibleRootFolderIds === "object"
        ? accessibleRootFolderIds.some(
            (folderId) => parentFolder?.path.startsWith(`/${folderId}/`) || folderId === parentFolder?.id,
          )
        : true;

    if (
      !parentFolder ||
      parentFolder.namePath.startsWith("/Trash") ||
      !isAccessible ||
      accessibleRootFolderIds === "Unauthorized"
    ) {
      return NextResponse.json({ message: "Parent folder not found" }, { status: 400 });
    }
    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: patientUserId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 400 });
    }

    const sumOfAllSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId");
    if (typeof sumOfAllSuccessFilesSizes !== "bigint") {
      return new NextResponse("Something went wrong", { status: 500 });
    }
    let restricted = false;
    const allotedStorageInBytes = allotedStoragesInGb[user.plan] * 1000000000;
    if (sumOfAllSuccessFilesSizes + BigInt(size) > allotedStorageInBytes) {
      if (currentUserPermissions.isPatient) {
        return NextResponse.json({ message: "Out of storage! Please upgrade your plan" }, { status: 400 });
      } else {
        restricted = true;
      }
    }

    const recordViewActivitiesToCreate = [
      {
        userId: userId,
      },
    ];
    if (currentUserPermissions.isProvider) {
      recordViewActivitiesToCreate.push({
        userId: patientUserId,
      });
    }

    const file = await prismadb.file.create({
      data: {
        name: fileName,
        parentId: parentId,
        namePath: `${parentNamePath}/${fileName}`,
        path: `${parentPath}${parentId}/`,
        uploadedByUserId: !currentUserPermissions.hasAccount ? null : user.id,
        uploadedByName: currentUserPermissions.isProvider
          ? user.name
          : !currentUserPermissions.hasAccount
          ? `Temporary Access User`
          : `Me`,
        type: contentType,
        size: size,
        userId: userId,
        restricted,
        patientProfileId: patient.id,
        recordViewActivity: {
          create: recordViewActivitiesToCreate,
        },
      },
    });
    if (file) {
      const maxFilesUploadSizeToUse = currentUserPermissions.isPatient
        ? maxFileUploadSizes[user.plan]
        : maxFileUploadSize;
      const client = new S3Client({ region: process.env.AWS_REGION });
      const key = `${patient.id}/${file.id}`;
      const { url, fields } = await createPresignedPost(client, {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: key,
        Conditions: [
          ["content-length-range", 0, maxFilesUploadSizeToUse], // up to 10 MB
          ["starts-with", "$Content-Type", contentType],
        ],
        Fields: {
          "Content-Type": contentType,
        },
        Expires: 600, // Seconds before the presigned post expires. 3600 by default.
      });
      return Response.json({ url, fields, fileIdResponse: file.id });
    } else {
      return Response.json({ error: "No file made" }, { status: 500 });
    }
  } catch (error: any) {
    const errorMessage = !!error && error.message ? error.message : "Something went wrong";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
