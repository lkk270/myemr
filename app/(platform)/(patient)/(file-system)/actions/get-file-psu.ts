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

  return { success: "Settings Updated!", presignedUrl: presignedUrl, type: file.type, fileName: file.name };
};

export const handleDownload = async (fileId: string) => {
  const data = await getPresignedUrl(fileId, true); // Your function to get the presigned URL
  if (!data.presignedUrl) {
    console.error("Failed to get the presigned URL");
    return;
  }

  // Create an anchor tag for the download
  const link = document.createElement("a");
  link.href = data.presignedUrl;
  link.setAttribute("download", data.fileName); // Set the desired filename here

  // Prevent the toploader from triggering
  link.addEventListener(
    "click",
    (e) => {
      e.preventDefault(); // Prevent default anchor tag behavior
      e.stopImmediatePropagation(); // Stop the event from propagating
      window.location.href = link.href; // Manually navigate to trigger the download
    },
    true,
  ); // Capture phase

  // Append to the document, trigger click, and remove
  document.body.appendChild(link);
  link.click(); // This should now prevent the toploader from activating
  document.body.removeChild(link);
};
