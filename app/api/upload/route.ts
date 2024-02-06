import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { patientUpdateVerification } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { File } from "@prisma/client";
import { allotedPatientStorage } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json();
  const { fileName, contentType, size, parentId, parentNamePath, parentPath } = body;
  try {
    const session = await auth();

    if (!session) {
      return redirect("/");
    }
    const user = session?.user;
    const userId = user?.id;

    if (!userId || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!patientUpdateVerification(body)) {
      return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: userId,
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

    const usedFileStorageInBytes = patient.usedFileStorage;
    const allotedStorageInBytes = allotedPatientStorage[patient.plan] * 1000000000;
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
            parentId: parentId,
            namePath: `${parentNamePath}/${fileName}`,
            path: `${parentPath}${parentId}/`,
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
        return Response.json({ url, fields });
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
  } catch (error) {
    console.log(error);

    return Response.json({ error: error });
  }
}
