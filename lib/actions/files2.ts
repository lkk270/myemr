"use server";

import prismadb from "@/lib/prismadb";
import { RenameNodeSchema } from "../schemas/files";
import { z } from "zod";
import { getAccessPatientCodeByToken } from "@/auth/data";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { auth } from "@/auth";
import { createPatientNotification } from "./notifications";

export const renameNode = async (values: z.infer<typeof RenameNodeSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!session || !userId || !user || !currentUserPermissions.canEdit) {
      return { error: "Unauthorized" };
    }
    if (!currentUserPermissions.isPatient) {
      const code = await getAccessPatientCodeByToken(session.tempToken);
      if (!code || code.accessType === "READ_ONLY" || code.accessType === "UPLOAD_FILES_ONLY") {
        return { error: "Unauthorized" };
      }
    }

    async function updateDescendantsForRename(
      prisma: any,
      parentId: string,
      oldParentNamePath: string,
      newParentNamePath: string,
    ) {
      // Update subfolders
      const subFolders = await prisma.folder.findMany({
        where: { parentId: parentId },
      });

      for (const subFolder of subFolders) {
        const newSubFolderPath = subFolder.namePath.replace(oldParentNamePath, newParentNamePath);

        await prisma.folder.update({
          where: { id: subFolder.id },
          data: { namePath: newSubFolderPath },
        });

        // Recursively update each subfolder's descendants
        await updateDescendantsForRename(prisma, subFolder.id, subFolder.namePath, newSubFolderPath);
      }

      // Update files in this folder
      const files = await prisma.file.findMany({
        where: { parentId: parentId },
      });

      for (const file of files) {
        const newFilePath = file.namePath.replace(oldParentNamePath, newParentNamePath);

        await prisma.file.update({
          where: { id: file.id },
          data: { namePath: newFilePath },
        });
      }
    }

    async function updateRecordViewActivity(userId: string, nodeId: string, isFile: boolean) {
      const whereClause = isFile ? { userId: userId, fileId: nodeId } : { userId: userId, folderId: nodeId };

      const existingActivity = await prismadb.recordViewActivity.findUnique({
        where: whereClause,
      });

      if (existingActivity) {
        // Update the existing RecordViewActivity
        await prismadb.recordViewActivity.update({
          where: { id: existingActivity.id },
          data: { lastViewedAt: new Date() },
        });
      } else {
        // Create a new RecordViewActivity
        await prismadb.recordViewActivity.create({
          data: {
            userId: userId,
            ...(isFile ? { fileId: nodeId } : { folderId: nodeId }),
          },
        });
      }
    }

    const validatedFields = RenameNodeSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { nodeId, isFile, newName } = validatedFields.data;
    if (isFile === true) {
      const currentFile = await prismadb.file.findUnique({
        where: { id: nodeId },
      });
      if (!currentFile) {
        return { error: "File not found" };
      }
      const oldPath = currentFile.namePath;
      const newNamePath = oldPath.replace(/[^/]*$/, newName);
      await prismadb.file.update({
        where: {
          id: nodeId,
        },
        data: { name: newName, namePath: newNamePath },
      });
      await updateRecordViewActivity(userId, nodeId, true);
      if (!currentUserPermissions.hasAccount) {
        await createPatientNotification({
          notificationType: "ACCESS_CODE_NODE_RENAMED",
          dynamicData: {
            isFile: true,
            accessCodeType: user?.role,
            oldName: currentFile.name,
            newName: newName,
          },
        });
      }
    } else if (isFile === false) {
      const currentFolder = await prismadb.folder.findUnique({
        where: { id: nodeId },
      });

      if (!currentFolder) {
        return { error: "Folder not found" };
      }

      const oldNamePath = currentFolder.namePath;
      const newNamePath = oldNamePath.substring(0, oldNamePath.lastIndexOf("/") + 1) + newName;

      await prismadb.$transaction(
        async (prisma) => {
          // Update the folder
          await prisma.folder.update({
            where: { id: nodeId },
            data: {
              name: newName,
              namePath: newNamePath,
            },
          });

          // Retrieve and update descendants
          // Pass the transactional Prisma client to the function
          await updateDescendantsForRename(prisma, nodeId, oldNamePath, newNamePath);
        },
        { timeout: 20000 },
      );
      await updateRecordViewActivity(userId, nodeId, false);

      if (!currentUserPermissions.hasAccount) {
        await createPatientNotification({
          notificationType: "ACCESS_CODE_NODE_RENAMED",
          dynamicData: {
            isFile: false,
            accessCodeType: user?.role,
            oldName: currentFolder.name,
            newName: newName,
          },
        });
      }
    }

    return { success: "Node renamed!" };
  } catch {
    return { error: "something went wrong" };
  }
};
