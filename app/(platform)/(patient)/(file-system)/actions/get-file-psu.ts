"use server";

import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { FileStatus } from "@prisma/client";
import { File } from "@prisma/client";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getPresignedUrl = async (fileId: string, forDownload = false) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const file = await prismadb.file.findUnique({
    where: {
      id: fileId,
    },
  });
  if (!file) {
    return { error: "File not found" };
  }

  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${file.patientProfileId}/${fileId}`,
    ResponseContentDisposition: forDownload ? `attachment; filename="${file.name}"` : `filename="${file.name}"`, // Sets the filename for the download
  });
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Expires in 1 hour

  return { success: "Settings Updated!", presignedUrl: presignedUrl, type: file.type };
};
