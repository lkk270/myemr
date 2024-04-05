import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { patientUpdateVerification } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { allotedStoragesInGb, maxFileUploadSize } from "@/lib/constants";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { getSumOfFilesSizes } from "@/lib/data/files";
import { getAccessPatientCodeByToken } from "@/auth/data";

export async function POST(request: Request) {
  const body = await request.json();
  const { fileName, contentType, size } = body;
  try {
    const session = await auth();

    if (!session) {
      return redirect("/");
    }
    const user = session.user;
    const userId = user.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);
    const accessToken = session.tempToken;
    if (!userId || !user || !accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!patientUpdateVerification({ ...body, updateType: "tpaUploadFiles" }, currentUserPermissions)) {
      return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }

    const accessCode = await getAccessPatientCodeByToken(accessToken);
    // const accessCode = await prismadb.patientProfileAccessCode.findUnique({
    //   where: {
    //     token: accessToken,
    //     isValid: true,
    //   },
    // });
    if (!accessCode) {
      return redirect("/");
    }
    if (!accessCode.parentFolderId) {
      return NextResponse.json({ message: "Parent folder not found" }, { status: 400 });
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        id: accessCode?.patientProfileId,
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 400 });
    }

    const parentFolder = await prismadb.folder.findUnique({
      where: {
        id: accessCode.parentFolderId,
      },
      select: {
        id: true,
        name: true,
        path: true,
        namePath: true,
      },
    });

    if (!parentFolder || parentFolder.namePath.startsWith("/Trash")) {
      return NextResponse.json({ message: "parentFolder not found" }, { status: 400 });
    }

    const sumOfAllSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId");
    if (typeof sumOfAllSuccessFilesSizes !== "bigint") {
      return new NextResponse("Something went wrong", { status: 500 });
    }
    let restricted = false;
    const allotedStorageInBytes = allotedStoragesInGb[user.plan] * 1_000_000_000;
    if (sumOfAllSuccessFilesSizes + BigInt(size) > allotedStorageInBytes) {
      restricted = true;
    }
    const file = await prismadb.file.create({
      data: {
        name: fileName,
        parentId: parentFolder.id,
        namePath: `${parentFolder.namePath}/${fileName}`,
        path: `${parentFolder.path}${parentFolder.id}/`,
        uploadedByUserId: null,
        uploadedByName: `Temporary Access User`,
        type: contentType,
        size: size,
        userId: patient.userId,
        patientProfileId: patient.id,
        restricted: restricted,
        patientProfileAccessCodeToken: accessToken,
        recordViewActivity: {
          create: [
            {
              userId: userId,
            },
          ],
        },
      },
    });

    if (file) {
      const client = new S3Client({ region: process.env.AWS_REGION });
      const key = `${patient.id}/${file.id}`;
      const { url, fields } = await createPresignedPost(client, {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: key,
        Conditions: [
          ["content-length-range", 0, maxFileUploadSize], // up to 10 MB
          ["starts-with", "$Content-Type", contentType],
        ],
        Fields: {
          "Content-Type": contentType,
        },
        Expires: 600, // Seconds before the presigned post expires. 3600 by default.
      });
      return Response.json({ url, fields, fileIdResponse: file.id, parentFolderNameResponse: parentFolder.name });
    } else {
      return Response.json({ error: "No file made" }, { status: 500 });
    }
  } catch (error: any) {
    const errorMessage = !!error && error.message ? error.message : "Something went wrong";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
