"use server";

import prismadb from "@/lib/prismadb";
import { InsuranceSide } from "@prisma/client";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isViewableFile } from "@/lib/utils";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { getAccessPatientCodeByToken } from "@/auth/data";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { validateUserAndGetAccessibleRootFolders } from "@/lib/actions/files";
import { getFileName } from "@/lib/utils";

export const getPresignedUrl = async (fileId: string, forDownload = false, patientMemberId?: string | null) => {
  const session = await auth();
  if (!session) {
    return redirect("/");
  }
  const user = session.user;
  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!user || user.role === "UPLOAD_FILES_ONLY") {
    return redirect("/");
  }

  if (!currentUserPermissions.isPatient && !currentUserPermissions.isProvider) {
    const code = await getAccessPatientCodeByToken(session.tempToken);
    if (!code) {
      return redirect("/");
    }
  }

  const accessibleRootFolderIdsResult = await validateUserAndGetAccessibleRootFolders("canRead", {
    user,
    currentUserPermissions,
    patientMemberId,
  });

  if (!accessibleRootFolderIdsResult) {
    // return { error: "AN issuE OCCUREd" };
    return redirect("/");
  }
  const { accessibleRootFolderIds } = accessibleRootFolderIdsResult;

  let whereClause: any = {
    id: fileId,
    status: "SUCCESS",
    restricted: false,
  };

  if (accessibleRootFolderIds !== "ALL") {
    whereClause.namePath = {
      not: {
        startsWith: "/Trash",
      },
    };
  }

  const file = await prismadb.file.findUnique({
    where: whereClause,
  });

  const isAccessible =
    typeof accessibleRootFolderIds === "object"
      ? accessibleRootFolderIds.some((folderId) => file?.path.startsWith(`/${folderId}/`))
      : true;

  //http://localhost:3000/patient/05874842-e031-4124-8845-3197d716a5bb/file/cluigbr550001kk7pfy508uom

  if (!file || !isAccessible || accessibleRootFolderIds === "Unauthorized") {
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

  return { success: "PSU retrieved!", presignedUrl: presignedUrl, type: file.type, fileName: file.name };
};

export const getPresignedInsuranceUrl = async (
  side: InsuranceSide,
  forDownload = false,
  patientProfileId?: string | null,
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

export const getPresignedUrls = async (fileIds: string[], parentNamePath: string, patientMemberId?: string | null) => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session.user;
  const currentUserPermissions = extractCurrentUserPermissions(user);

  if (!user || user.role === "UPLOAD_FILES_ONLY") {
    return redirect("/");
  }

  if (!currentUserPermissions.isPatient && !currentUserPermissions.isProvider) {
    const code = await getAccessPatientCodeByToken(session.tempToken);
    if (!code) {
      return redirect("/");
    }
  }

  const accessibleRootFolderIdsResult = await validateUserAndGetAccessibleRootFolders("canRead", {
    user,
    currentUserPermissions,
    patientMemberId,
  });

  if (!accessibleRootFolderIdsResult) {
    // return { error: "AN issuE OCCUREd" };
    return redirect("/");
  }

  const { accessibleRootFolderIds } = accessibleRootFolderIdsResult;

  let whereClause: any = {
    id: {
      in: fileIds,
    },
    status: "SUCCESS",
    restricted: false,
  };

  if (accessibleRootFolderIds !== "ALL") {
    whereClause.namePath = {
      not: {
        startsWith: "/Trash",
      },
    };
  }

  const files = await prismadb.file.findMany({
    where: whereClause,
  });

  let isAccessible = files.length > 0;
  if (isAccessible) {
    isAccessible =
      typeof accessibleRootFolderIds === "object"
        ? accessibleRootFolderIds.some((folderId) => files[1].path.startsWith(`/${folderId}/`))
        : true;
  }

  if (!files || !isAccessible || accessibleRootFolderIds === "Unauthorized") {
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
        // console.error("Error generating presigned URL for file:", file.id, error);
        return null; // Handle errors as appropriate for your application
      }
    }),
  );

  return urls.filter((url) => url !== null); // Filter out any failed URL generations
};
