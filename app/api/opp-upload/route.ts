import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { profileImageUrlPrefix, maxSystemFileSize } from "@/lib/constants";
import { auth } from "@/auth";
import { getOrganizationMemberByUserId } from "@/app/(platform)/(provider)/(organization)/data/organization";

export async function POST(request: Request) {
  const body = await request.json();
  const { contentType, organizationId } = body;
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

    const organizationMember = await getOrganizationMemberByUserId(organizationId);
    if (!organizationMember || (organizationMember.role !== "OWNER" && organizationMember.role !== "ADMIN")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const key = `organization/${organizationId}`;

    const imageUrl = `${profileImageUrlPrefix}${key}?${new Date().getTime()}`;

    await prismadb.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        profileImageUrl: imageUrl,
      },
    });

    const client = new S3Client({ region: process.env.AWS_REGION });
    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_PROFILE_PICS_BUCKET_NAME as string,
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

    return Response.json({ url, fields, imageUrl });
  } catch (error: any) {
    const errorMessage = !!error && error.message ? error.message : "Something went wrong";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
