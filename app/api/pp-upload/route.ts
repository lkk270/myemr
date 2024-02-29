import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { patientUpdateVerification } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { profileImageUrlPrefix } from "@/lib/constants";
import { update } from "@/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { contentType } = body;
  try {
    const session = await auth();

    if (!session) {
      return redirect("/");
    }
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!userId || !user || !currentUserPermissions.hasAccount) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!patientUpdateVerification({ ...body, updateType: "ppUpload" }, currentUserPermissions)) {
      return NextResponse.json({ message: "Invalid body" }, { status: 400 });
    }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ message: "Patient not found" }, { status: 400 });
    }
    const imageUrl = `${profileImageUrlPrefix}${userId}`;
    if (!patient.imageUrl || !patient.imageUrl.startsWith(profileImageUrlPrefix))
      await prismadb.$transaction(
        async (prisma) => {
          await prisma.patientProfile.update({
            where: {
              userId: userId,
            },
            data: {
              imageUrl: imageUrl,
            },
          });
          await prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              image: imageUrl,
            },
          });
        },
        { timeout: 20000 },
      );

    const client = new S3Client({ region: process.env.AWS_REGION });
    const key = `${user.id}`;
    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_PROFILE_PICS_BUCKET_NAME as string,
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
    update({
      user: {
        image: `${imageUrl}?${new Date().getTime()}`,
      },
    });

    return Response.json({ url, fields, imageUrl });
  } catch (error: any) {
    const errorMessage = !!error && error.message ? error.message : "Something went wrong";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
