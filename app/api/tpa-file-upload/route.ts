import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { patientUpdateVerification } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { File } from "@prisma/client";
import { allotedPatientStoragesInGb } from "@/lib/constants";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

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

    const accessCode = await prismadb.patientProfileAccessCode.findUnique({
      where: {
        token: accessToken,
      },
    });

    if (!accessCode || !accessCode.parentFolderId) {
      return NextResponse.json({ message: "Parent folder not found" }, { status: 400 });
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        id: accessCode?.patientProfileId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        usedFileStorage: true,
        plan: true,
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
        path: true,
        namePath: true,
      },
    });

    if (!parentFolder) {
      return NextResponse.json({ message: "parentFolder not found" }, { status: 400 });
    }
    const usedFileStorageInBytes = patient.usedFileStorage;
    const allotedStorageInBytes = allotedPatientStoragesInGb[patient.plan] * 1000000000;
    if (usedFileStorageInBytes + BigInt(size) > allotedStorageInBytes) {
      return NextResponse.json({ message: "Out of storage! Please upgrade your plan" }, { status: 400 });
    }
    let file: File | undefined;
    await prismadb.$transaction(
      async (prisma) => {
        await prisma.patientProfile.update({
          where: {
            userId: userId,
          },
          data: {
            usedFileStorage: { increment: size },
          },
        });

        file = await prisma.file.create({
          data: {
            name: fileName,
            parentId: parentFolder.id,
            namePath: `${parentFolder.namePath}/${fileName}`,
            path: `${parentFolder.path}${parentFolder.id}/`,
            uploadedByUserId: userId,
            uploadedByName: `${patient.firstName} ${patient.lastName}`,
            type: contentType,
            size: size,
            userId: userId,
            patientProfileId: patient.id,
            recordViewActivity: {
              create: [
                {
                  userId: userId,
                },
              ],
            },
          },
        });
      },
      { timeout: 20000 },
    );

    try {
      if (file) {
        const client = new S3Client({ region: process.env.AWS_REGION });
        const key = `${patient.id}/${file.id}`;
        const { url, fields } = await createPresignedPost(client, {
          Bucket: process.env.AWS_BUCKET_NAME as string,
          Key: key,
          Conditions: [
            ["content-length-range", 0, 10485760], // up to 10 MB
            ["starts-with", "$Content-Type", contentType],
          ],
          Fields: {
            "Content-Type": contentType,
          },
          Expires: 600, // Seconds before the presigned post expires. 3600 by default.
        });
        return Response.json({ url, fields, fileIdResponse: file.id });
      } else {
        return Response.json({ error: "No file made" });
      }
    } catch (error) {
      await prismadb.patientProfile
        .update({
          where: { userId: userId },
          data: { usedFileStorage: { decrement: size } },
        })
        .catch((decrementError) => console.error("Failed to decrement storage", decrementError));
      throw error;
    }
  } catch (error: any) {
    const errorMessage = !!error && error.message ? error.message : "Something went wrong";
    return Response.json({ error: errorMessage });
  }
}
