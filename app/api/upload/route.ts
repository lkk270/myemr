import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { patientUpdateVerification } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { v4 as uuidv4 } from "uuid";

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
        firstName: true,
        lastName: true,
      },
    });
    if (!patient) {
      return new NextResponse("Patient not found", { status: 401 });
    }

    const file = await prismadb.file.create({
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
      },
    });

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
  } catch (error) {
    console.log(error);
    return Response.json({ error: error });
  }
}
