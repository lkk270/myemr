import { Folder, File } from "@prisma/client";
import prismadb from "./prismadb";
import { PrismaClient } from "@prisma/client";

export async function updateDescendantsForRename(
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

export async function updateRecordViewActivity(userId: string, nodeId: string, isFile: boolean) {
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

export async function moveNodes(selectedIds: string[], targetNodeId: string, userId: string) {
  const targetNode = await prismadb.folder.findUnique({ where: { id: targetNodeId } });
  if (!targetNode) throw Error("Target node not found");

  return await prismadb.$transaction(
    async (prisma) => {
      for (const nodeId of selectedIds) {
        // First, determine if the node is a file or a folder
        let isFile = false;
        let node: File | Folder = (await prisma.folder.findUnique({ where: { id: nodeId } })) as Folder;
        if (!node) {
          node = (await prisma.file.findUnique({ where: { id: nodeId } })) as File;
          if (!node) continue; // Skip if node is not found
          isFile = true;
        }

        const newPath = `${targetNode.path}${targetNode.id}/`;
        const newNamePath = `${targetNode.namePath}/${node.name}`;

        if (isFile) {
          // Update the file
          await prisma.file.update({
            where: { id: nodeId },
            data: { parentId: targetNodeId, path: newPath, namePath: newNamePath },
          });
        } else {
          // Update the folder
          await prisma.folder.update({
            where: { id: nodeId },
            data: { parentId: targetNodeId, path: newPath, namePath: newNamePath },
          });

          // If the node is a folder, recursively update its descendants
          await updateDescendantsForMove(prisma, nodeId, newPath, newNamePath);
        }
        await updateRecordViewActivity(userId, nodeId, isFile);
      }
    },
    { timeout: 60000 },
  );
}

// Modified to accept a Prisma client
async function updateDescendantsForMove(prisma: any, parentId: string, parentPath: string, parentNamePath: string) {
  const children = await prisma.folder.findMany({
    where: { parentId: parentId },
  });

  for (const child of children) {
    const newPath = `${parentPath}${parentId}/`;
    const newNamePath = `${parentNamePath}/${child.name}`;

    await prisma.folder.update({
      where: { id: child.id },
      data: { path: newPath, namePath: newNamePath },
    });

    if (!child.isFile) {
      await updateDescendantsForMove(prisma, child.id, newPath, newNamePath);
    }
  }

  const files = await prisma.file.findMany({
    where: { parentId: parentId },
  });

  for (const file of files) {
    const newFilePath = `${parentPath}${parentId}/`;
    const newFileNamePath = `${parentNamePath}/${file.name}`;

    await prisma.file.update({
      where: { id: file.id },
      data: { path: newFilePath, namePath: newFileNamePath },
    });
  }
}

export async function deleteNode(nodeId: string, isFile: boolean) {
  return await prismadb.$transaction(
    async (prisma) => {
      if (isFile) {
        // Delete the file and its associated RecordViewActivity
        await prisma.recordViewActivity.deleteMany({ where: { fileId: nodeId } });
        await prisma.file.delete({ where: { id: nodeId } });
      } else {
        // Depth-first recursive deletion of subfolders
        await deleteSubFolders(prisma, nodeId);

        // Delete all files in the current folder
        await prisma.file.deleteMany({ where: { parentId: nodeId } });

        // Delete the folder's associated RecordViewActivity
        await prisma.recordViewActivity.deleteMany({ where: { folderId: nodeId } });

        // Finally, delete the folder itself
        await prisma.folder.delete({ where: { id: nodeId } });
      }
    },
    { timeout: 60000 },
  );
}

async function deleteSubFolders(prisma: any, parentId: string) {
  const subFolders = await prisma.folder.findMany({
    where: { parentId: parentId },
  });

  for (const subFolder of subFolders) {
    // Recursively delete deeper subfolders first
    await deleteSubFolders(prisma, subFolder.id);

    // Then delete the subfolder itself
    await prisma.folder.delete({ where: { id: subFolder.id } });
  }
}

export const addRootNode = async (
  folderName: string,
  addedByUserId: string,
  patientUserId: string,
  patientProfileId: string,
  addedByName: string,
) => {
  let folder: Folder | undefined;

  await prismadb.$transaction(
    async (prisma) => {
      folder = await prisma.folder.create({
        data: {
          name: folderName,
          namePath: `/${folderName}`,
          path: "/",
          addedByUserId: addedByUserId,
          addedByName: addedByName,
          isRoot: true,
          userId: patientUserId,
          patientProfileId: patientProfileId,
          ...(addedByUserId && {
            recordViewActivity: {
              create: [
                {
                  userId: addedByUserId,
                },
              ],
            },
          }),
        },
      });
    },
    { timeout: 20000 }, // Set your desired timeout in milliseconds
  );

  if (folder) {
    return folder.id;
  } else {
    // Handle the case where the folder creation failed or the transaction was rolled back
    throw new Error("Failed to create folder");
  }
};
