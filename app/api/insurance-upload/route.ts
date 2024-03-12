import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { patientUpdateVerification } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { InsuranceFile } from "@prisma/client";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { maxSystemFileSize } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json();
  const { side, contentType, size } = body;

  try {
    const session = await auth();

    if (!session) {
      return redirect("/");
    }
    const user = session?.user;
    const userId = user?.id;

    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!userId || !user || !currentUserPermissions.isPatient) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!patientUpdateVerification({ ...body, updateType: "insuranceUpload" }, currentUserPermissions)) {
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
        insuranceImagesSet: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 400 });
    }
    // let file = await prismadb.insuranceFile.findFirst({
    //   where: {
    //     userId: userId,
    //     side: side,
    //   },
    // });

    let updateStatusRequired = false;
    let file: InsuranceFile | null = null;
    if (!patient.insuranceImagesSet) {
      updateStatusRequired = true;
      file = await prismadb.insuranceFile.create({
        data: {
          side: side,
          uploadedByUserId: userId,
          uploadedByName: `${patient.firstName} ${patient.lastName}`,
          type: contentType,
          size: size,
          userId: userId,
          patientProfileId: patient.id,
        },
      });
    }
    if (file || patient.insuranceImagesSet) {
      const client = new S3Client({ region: process.env.AWS_REGION });
      const key = `${patient.id}/insurance/${side}`;
      const { url, fields } = await createPresignedPost(client, {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: key,
        Conditions: [
          ["content-length-range", 0, maxSystemFileSize], // up to 10 MB
          ["starts-with", "$Content-Type", contentType],
        ],
        Fields: {
          "Content-Type": contentType,
        },
        Expires: 600, // Seconds before the presigned post expires. 3600 by default.
      });
      return Response.json({
        url,
        fields,
        fileIdResponse: !!file ? file.id : "",
        updateStatusRequired: updateStatusRequired,
      });
    } else {
      return NextResponse.json({ message: "No file made" }, { status: 500 });
    }
  } catch (error: any) {
    const errorMessage = !!error && error.message ? error.message : "Something went wrong";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
