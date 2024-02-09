"use server";

import prismadb from "@/lib/prismadb";
import { currentUser } from "@/auth/lib/auth";
import { FileStatus, InsuranceSide } from "@prisma/client";
import { File } from "@prisma/client";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isViewableFile } from "@/lib/utils";

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
    ResponseContentDisposition:
      forDownload || !isViewableFile(file.type || "")
        ? `attachment; filename="${file.name}"`
        : `filename="${file.name}"`, // Sets the filename for the download
  });
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // Expires in 1 hour

  return { success: "Settings Updated!", presignedUrl: presignedUrl, type: file.type, fileName: file.name };
};

export const getPresignedInsuranceUrl = async (side: InsuranceSide, forDownload = false) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const file = await prismadb.insuranceFile.findFirst({
    where: {
      userId: user.id,
      side: side,
    },
  });
  if (!file) {
    return { error: "File not found" };
  }

  const fileName = `${file.side}.${file.type.split("image/")[1]}`;

  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${file.patientProfileId}/insurance/${side}`,
    ResponseContentDisposition:
      forDownload || !isViewableFile(file.type || "") ? `attachment; filename="${fileName}"` : `filename="${fileName}"`, // Sets the filename for the download
  });
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // Expires in 1 hour

  return {
    success: "Settings Updated!",
    presignedUrl: presignedUrl,
    type: file.type,
    fileName: fileName,
  };
};

export const getPresignedUrls = async (fileIds: string[], parentNamePath: string) => {
  const user = await currentUser();
  console.log(fileIds);
  if (!user) {
    return { error: "Unauthorized" };
  }

  const files = await prismadb.file.findMany({
    where: {
      id: {
        in: fileIds,
      },
    },
  });

  if (!files || files.length === 0) {
    return { error: "Files not found" };
  }

  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const urls = await Promise.all(
    files.map(async (file) => {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${file.patientProfileId}/${file.id}`,
        ResponseContentDisposition: `attachment; filename="${file.name}"`,
      });

      try {
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Expires in 1 hour
        return {
          presignedUrl,
          fileName: file.name,
          type: file.type,
          path: `${file.namePath.split(parentNamePath)[1]}`, // Adjust the path as needed for your zip structure
        };
      } catch (error) {
        console.error("Error generating presigned URL for file:", file.id, error);
        return null; // Handle errors as appropriate for your application
      }
    }),
  );

  return urls.filter((url) => url !== null); // Filter out any failed URL generations
};
