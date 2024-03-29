"use server";

import prismadb from "@/lib/prismadb";
import { InsuranceSide } from "@prisma/client";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isViewableFile } from "@/lib/utils";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import * as mime from "mime-types";
import { getAccessPatientCodeByToken } from "@/auth/data";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const getFileName = (fileNameTemp: string, fileType: string) => {
  const currentMimeType = mime.lookup(fileNameTemp);

  const newExtension = mime.extension(fileType);

  if (!newExtension) {
    console.error("Unsupported file type", fileNameTemp, fileType);
    return fileNameTemp; // Or handle this case as needed
  }
  if (currentMimeType === fileType) {
    return fileNameTemp;
  }
  return `${fileNameTemp}.${newExtension}`;
};

export const getPresignedUrl = async (fileId: string, forDownload = false) => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session.user;
  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!user || user.role === "UPLOAD_FILES_ONLY") {
    return redirect("/");
  }

  if (!currentUserPermissions.isPatient) {
    const code = await getAccessPatientCodeByToken(session.tempToken);
    if (!code) {
      return redirect("/");
    }
  }

  const file = await prismadb.file.findUnique({
    where: {
      id: fileId,
      status: "SUCCESS",
      restricted: false,
    },
  });
  if (!file) {
    return { error: "File not found" };
  }

  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const fileName = getFileName(file.name, file.type as string);
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${file.patientProfileId}/${fileId}`,
    ResponseContentDisposition:
      forDownload || !isViewableFile(file.type || "") ? `attachment; filename="${fileName}"` : `filename="${fileName}"`, // Sets the filename for the download
  });
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // Expires in 1 hour

  return { success: "Settings Updated!", presignedUrl: presignedUrl, type: file.type, fileName: file.name };
};

export const getPresignedInsuranceUrl = async (
  side: InsuranceSide,
  forDownload = false,
  patientProfileId: string | null,
) => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session.user;
  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!user) {
    return redirect("/");
  }

  if (!currentUserPermissions.isPatient && !currentUserPermissions.hasAccount) {
    const code = await getAccessPatientCodeByToken(session.tempToken);
    if (!code || code.accessType === "UPLOAD_FILES_ONLY") {
      return redirect("/");
    }
  }

  const whereClause = !patientProfileId ? { side, userId: user.id } : { side, patientProfileId: patientProfileId };

  const file = await prismadb.insuranceFile.findFirst({
    where: whereClause,
  });
  
  if (!file) {
    return { error: "File not found" };
  }

  const fileName = getFileName(file.side, file.type);

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
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session.user;
  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!user || user.role === "UPLOAD_FILES_ONLY") {
    return redirect("/");
  }

  if (!currentUserPermissions.isPatient) {
    const code = await getAccessPatientCodeByToken(session.tempToken);
    if (!code) {
      return redirect("/");
    }
  }

  const files = await prismadb.file.findMany({
    where: {
      id: {
        in: fileIds,
      },
      status: "SUCCESS",
      restricted: false,
    },
  });

  if (!files || files.length === 0) {
    return { error: "Files not found" };
  }

  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const urls = await Promise.all(
    files.map(async (file) => {
      const fileName = getFileName(file.name, file.type as string);
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${file.patientProfileId}/${file.id}`,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
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
