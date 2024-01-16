import { Folder, File } from "@prisma/client";
import prismadb from "./prismadb";

export async function updateDescendantsForRename(
  parentId: string,
  oldParentNamePath: string,
  newParentNamePath: string,
) {
  // Update subfolders
  const subFolders = await prismadb.folder.findMany({
    where: { parentId: parentId },
  });
  for (const subFolder of subFolders) {
    const newSubFolderPath = subFolder.namePath.replace(oldParentNamePath, newParentNamePath);
    await prismadb.folder.update({
      where: { id: subFolder.id },
      data: { namePath: newSubFolderPath },
    });

    // Recursively update each subfolder's descendants
    await updateDescendantsForRename(subFolder.id, subFolder.namePath, newSubFolderPath);
  }

  // Update files in this folder
  const files = await prismadb.file.findMany({
    where: { parentId: parentId },
  });
  for (const file of files) {
    const newFilePath = file.namePath.replace(oldParentNamePath, newParentNamePath);
    await prismadb.file.update({
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

export async function moveNodes(selectedIds: string[], targetNodeId: string) {
  const targetNode = await prismadb.folder.findUnique({ where: { id: targetNodeId } });
  if (!targetNode) throw Error("Target node not found");

  return await prismadb.$transaction(async (prisma) => {
    for (const nodeId of selectedIds) {
      // First, determine if the node is a file or a folder
      let isFile = false;
      let node: File | Folder = (await prismadb.folder.findUnique({ where: { id: nodeId } })) as Folder;
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
        await updateDescendantsForMove(nodeId, newPath, newNamePath);
      }
    }
  });
}

async function updateDescendantsForMove(parentId: string, parentPath: string, parentNamePath: string) {
  const children = await prismadb.folder.findMany({
    where: { parentId: parentId },
  });

  for (const child of children) {
    const newPath = `${parentPath}${parentId}/`;
    const newNamePath = `${parentNamePath}/${child.name}`;

    // Update each child
    await prismadb.folder.update({
      where: { id: child.id },
      data: { path: newPath, namePath: newNamePath },
    });

    // Recursively update if the child is a folder
    if (!child.isFile) {
      await updateDescendantsForMove(child.id, newPath, newNamePath);
    }
  }

  // Also update files in the current folder
  const files = await prismadb.file.findMany({
    where: { parentId: parentId },
  });

  for (const file of files) {
    const newFilePath = `${parentPath}${parentId}/`;
    const newFileNamePath = `${parentNamePath}/${file.name}`;

    await prismadb.file.update({
      where: { id: file.id },
      data: { path: newFilePath, namePath: newFileNamePath },
    });
  }
}
