import prismadb from "./prismadb";

export async function updateDescendants(parentId: string, oldParentNamePath: string, newParentNamePath: string) {
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
    await updateDescendants(subFolder.id, subFolder.namePath, newSubFolderPath);
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
