import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { patientUpdateVerification } from "@/lib/utils";
import { redirect } from "next/navigation";
import { File } from "@prisma/client";
import { allotedStoragesInGb, maxFileUploadSize } from "@/lib/constants";
import { getSubscriptionRigorous } from "@/lib/stripe/subscription";

export async function POST(request: Request) {
  const body = await request.json();
  const { fileName, contentType, size } = body;
  try {
    const accessToken = body.accessToken;
    if (
      !patientUpdateVerification(
        { ...body, updateType: "rrUploadFiles" },
        {
          canAdd: false,
          canEdit: false,
          canDelete: false,
          canUploadFiles: true,
          showActions: false,
          isPatient: false,
        },
      )
    ) {
      return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }
    const accessCode = await prismadb.requestRecordsCode.findUnique({
      where: {
        token: accessToken,
        isValid: true,
        expires: { gt: new Date() },
      },
      select: {
        id: true,
        patientProfileId: true,
        token: true,
        hasUploaded: true,
        expires: true,
        isValid: true,
        providerEmail: true,
        createdAt: true,
        parentFolderId: true,
      },
    });

    if (!accessCode) {
      return redirect("/");
    }

    if (!accessCode.parentFolderId) {
      return NextResponse.json({ message: "Parent folder not found" }, { status: 400 });
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        id: accessCode?.patientProfileId as string,
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        usedFileStorage: true,
        unrestrictedUsedFileStorage: true,
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

    const subscription = await getSubscriptionRigorous(patient.userId);
    const plan = subscription ? subscription.plan : "PATIENT_FREE";
    let restricted = false;
    const usedFileStorageInBytes = patient.usedFileStorage;
    const allotedStorageInBytes = allotedStoragesInGb[plan] * 1_000_000_000;
    if (usedFileStorageInBytes + BigInt(size) > allotedStorageInBytes) {
      restricted = true;
    }
    let file: File | undefined;
    await prismadb.$transaction(
      async (prisma) => {
        await prisma.patientProfile.update({
          where: {
            userId: patient.userId,
          },
          data: {
            usedFileStorage: { increment: size },
            unrestrictedUsedFileStorage: { increment: restricted ? 0 : size },
          },
        });

        file = await prisma.file.create({
          data: {
            name: fileName,
            parentId: parentFolder.id,
            namePath: `${parentFolder.namePath}/${fileName}`,
            path: `${parentFolder.path}${parentFolder.id}/`,
            uploadedByUserId: patient.userId,
            uploadedByName: `${patient.firstName} ${patient.lastName}`,
            type: contentType,
            size: size,
            userId: patient.userId,
            patientProfileId: patient.id,
            restricted: restricted,
            requestRecordsCodeToken: accessToken,
            recordViewActivity: {
              create: [
                {
                  userId: patient.userId,
                },
              ],
            },
          },
        });
      },
      { timeout: 20000 },
    );

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
      return Response.json({ url, fields, fileIdResponse: file.id });
    } else {
      return Response.json({ error: "No file made" }, { status: 500 });
    }
  } catch (error: any) {
    console.log(error);
    const errorMessage = !!error && error.message ? error.message : "Something went wrong";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
