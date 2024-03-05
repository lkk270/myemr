"use server";

import { Folder, File, FileStatus, Prisma, Plan } from "@prisma/client";
import prismadb from "../prismadb";
import { allotedStoragesInGb } from "../constants";
import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";

type PrismaDeleteFileObject = {
  id: string;
  size: bigint;
  restricted: boolean;
  userId: string;
};

type FileToUnrestrict = {
  id: string;
  size: bigint;
};

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

async function updateRecordViewActivitiesForFiles(userId: string, fileIds: string[]) {
  // Fetch existing activities to determine which fileIds already have an activity
  const existingActivities = await prismadb.recordViewActivity.findMany({
    where: {
      userId: userId,
      fileId: { in: fileIds },
    },
    select: { fileId: true },
  });

  const existingFileIds = new Set(existingActivities.map((activity) => activity.fileId));

  // Separate fileIds into those that need updates and those that need creates
  const fileIdsToUpdate = fileIds.filter((id) => existingFileIds.has(id));
  const fileIdsToCreate = fileIds.filter((id) => !existingFileIds.has(id));

  // Perform batch update for existing activities
  if (fileIdsToUpdate.length > 0) {
    await prismadb.recordViewActivity.updateMany({
      where: {
        userId: userId,
        fileId: { in: fileIdsToUpdate },
      },
      data: {
        lastViewedAt: new Date(),
      },
    });
  }

  // Perform individual creates for new activities
  // Note: As of my last update, Prisma does not support batch creation with different data for each record in a single query
  for (const fileId of fileIdsToCreate) {
    await prismadb.recordViewActivity.create({
      data: {
        userId: userId,
        fileId: fileId,
        lastViewedAt: new Date(), // Assuming you want to set this for new records as well
      },
    });
  }
}

export async function restoreRootFolder(nodeId: string, userId: string) {
  // First, determine if the node is a file or a folder
  let isFile = false;
  let node = await prismadb.folder.findUnique({ where: { id: nodeId } });
  if (!node) {
    throw new Error("Node not found");
  }

  const newPath = `/`;
  const newNamePath = `/${node.name}`;

  await prismadb.$transaction(async (prisma) => {
    await prisma.folder.update({
      where: { id: nodeId },
      data: { parentId: null, path: newPath, namePath: newNamePath },
    });
    await batchUpdateDescendants(prisma, node!.path, node!.namePath, newPath, newNamePath);
  });
  await updateRecordViewActivity(userId, nodeId, isFile);
}

export async function moveNodes(selectedIds: string[], targetNodeId: string, userId: string, isTrash: boolean = false) {
  const targetNode = await prismadb.folder.findUnique({ where: { id: targetNodeId } });
  if (!targetNode) throw Error("Target node not found");
  if (!isTrash && targetNode.namePath.startsWith("/Trash")) throw Error("Unauthorized");

  let fileIds = []; // Array to hold file IDs for batch update

  for (const nodeId of selectedIds) {
    let isFile = false;
    let node: File | Folder = (await prismadb.folder.findUnique({ where: { id: nodeId } })) as Folder;
    if (!node) {
      node = (await prismadb.file.findUnique({ where: { id: nodeId } })) as File;
      if (!node) continue; // Skip if node is not found
      isFile = true;
    }

    const newPath = `${targetNode.path}${targetNode.id}/`;
    const newNamePath = `${targetNode.namePath}/${node.name}`;

    if (isFile) {
      // Collect file IDs for batch update
      fileIds.push(nodeId);
    } else {
      // Process folders individually
      await prismadb.$transaction(async (prisma) => {
        await prisma.folder.update({
          where: { id: nodeId },
          data: { parentId: targetNodeId, path: newPath, namePath: newNamePath },
        });
        await batchUpdateDescendants(prisma, node.path, node.namePath, newPath, newNamePath);
      });
      await updateRecordViewActivity(userId, nodeId, isFile);
    }
  }

  // Perform a batch update for all files at once using dynamic raw SQL
  if (fileIds.length > 0) {
    const newPath = `${targetNode.path}${targetNode.id}/`;
    const newNamePath = `${targetNode.namePath}/`; // Adjust based on your naming convention
    // console.log("newPath", newPath);
    // console.log("newNamePath", newNamePath);
    await prismadb.$executeRaw`UPDATE \`File\`
    SET \`parentId\` = ${targetNodeId}, 
        \`path\` = ${newPath}, 
        // Update the CONCAT function to correctly handle the new namePath
        \`namePath\` = CONCAT(${newNamePath}, SUBSTRING(\`namePath\`, CHAR_LENGTH(\`namePath\`) - LOCATE('/', REVERSE(\`namePath\`)) + 2))
    WHERE \`id\` IN (${Prisma.join(fileIds)})`;

    await updateRecordViewActivitiesForFiles(userId, fileIds);
  }
}

async function batchUpdateDescendants(
  prisma: any,
  originalPath: string,
  originalNamePath: string,
  newParentPath: string,
  newParentNamePath: string,
) {
  // console.log("originalPath", originalPath);
  // console.log("originalNamePath", originalNamePath);

  // console.log("newParentPath", newParentPath);

  // console.log("newParentNamePath", newParentNamePath);

  // Use tagged template literals for the raw SQL query for updating folder descendants
  await prisma.$executeRaw`
  UPDATE \`Folder\`
  SET \`namePath\` = REPLACE(\`namePath\`, ${originalNamePath}, ${newParentNamePath}),
      \`path\` = REPLACE(\`path\`, ${originalPath}, ${newParentPath})
  WHERE \`path\` LIKE ${originalPath + "%"}
`;

  // Use tagged template literals for the raw SQL query for updating file descendants
  await prisma.$executeRaw`
  UPDATE \`File\`
  SET \`namePath\` = REPLACE(\`namePath\`, ${originalNamePath}, ${newParentNamePath}),
      \`path\` = REPLACE(\`path\`, ${originalPath}, ${newParentPath})
  WHERE \`path\` LIKE ${originalPath + "%"}
`;
}

export async function deleteFiles(
  selectedFileIds: string[],
  totalSizeOfUnrestrictedFiles: bigint,
  totalSize: bigint,
  patientProfileId: string,
) {
  return await prismadb.$transaction(
    async (prisma) => {
      await prisma.file.deleteMany({
        where: {
          id: { in: selectedFileIds },
        },
      });
      // await prisma.recordViewActivity.deleteMany({ where: { fileId: { in: selectedFileIds } } });

      await prisma.patientProfile.update({
        where: {
          id: patientProfileId,
        },
        data: {
          usedFileStorage: { decrement: totalSize },
          unrestrictedUsedFileStorage: { decrement: totalSizeOfUnrestrictedFiles },
        },
      });
    },
    { timeout: 20000 },
  );
}

export async function deleteFolders(selectedFolderIds: string[], forEmptyTrash: boolean) {
  for (const folderId of selectedFolderIds) {
    await deleteSubFolders(prisma, folderId);
    if (!forEmptyTrash) {
      // Delete the folder's associated RecordViewActivity

      // await prismadb.recordViewActivity.deleteMany({ where: { folderId: { in: selectedFolderIds } } });

      // Finally, delete the folder itself
      await prismadb.folder.delete({ where: { id: folderId } });
    }
  }
}

// Depth-first recursive deletion of subfolders
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

export async function getAllFilesToDeleteForDeleteAccount(patientProfileId: string) {
  const allFilesToDelete = await prismadb.file.findMany({
    where: {
      patientProfileId: patientProfileId,
      status: FileStatus.SUCCESS,
    },
    select: {
      id: true,
      size: true,
      userId: true,
      restricted: true,
    },
  });

  const convertedObjects = allFilesToDelete.map((obj) => ({ Key: `${patientProfileId}/${obj.id}` }));
  const totalSize = allFilesToDelete.reduce((sum, file) => sum + file.size, 0n);
  return { rawObjects: allFilesToDelete, convertedObjects: convertedObjects, totalSize: totalSize };
}

export async function getAllObjectsToDelete(selectedIds: string[], patientProfileId: string) {
  let allFilesToDelete: PrismaDeleteFileObject[] = [];
  const allFilesToDeleteForFileIds = await prismadb.file.findMany({
    where: {
      id: {
        in: selectedIds,
      },
      status: FileStatus.SUCCESS,
      namePath: { startsWith: "/Trash" },
    },
    select: {
      id: true,
      size: true,
      userId: true,
      restricted: true,
    },
  });

  const allFilesToDeleteForFolderIds = await prismadb.file.findMany({
    where: {
      OR: selectedIds.map((selectedId) => ({
        path: {
          contains: `/${selectedId}`,
        },
        namePath: { startsWith: "/Trash" },
      })),
      status: FileStatus.SUCCESS,
    },
    select: {
      id: true,
      size: true,
      userId: true,
      restricted: true,
    },
  });

  allFilesToDelete = allFilesToDeleteForFileIds.concat(allFilesToDeleteForFolderIds);
  const convertedObjects = allFilesToDelete.map((obj) => ({ Key: `${patientProfileId}/${obj.id}` }));
  const totalSize = allFilesToDelete.reduce((sum, file) => sum + file.size, 0n);
  return { rawObjects: allFilesToDelete, convertedObjects: convertedObjects, totalSize: totalSize };
}

export async function deleteS3Objects(
  objects: { Key: string }[],
  prismaFileObjects: PrismaDeleteFileObject[],
  patientProfileId: string,
) {
  const client = new S3Client({ region: process.env.AWS_REGION });
  const command = new DeleteObjectsCommand({
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Delete: {
      Objects: objects,
    },
  });

  try {
    const { Deleted } = await client.send(command);
    if (!Deleted) {
      await createDeadFiles(prismaFileObjects, patientProfileId);
    }
  } catch (err) {
    await createDeadFiles(prismaFileObjects, patientProfileId);
  }
}

const createDeadFiles = async (prismaFileObjects: PrismaDeleteFileObject[], patientProfileId: string) => {
  try {
    const updatedArray = prismaFileObjects.map((file) => ({
      awsKey: `${patientProfileId}/${file.id}`,
      userId: file.userId,
      patientProfileId: patientProfileId,
      size: file.size,
    }));
    await prismadb.deadFile.createMany({ data: updatedArray });
  } catch (err) {
    console.log("OH NO");
  }
};

const getMaxRestrictedFiles = (
  restrictedFiles: FileToUnrestrict[],
  unrestrictedUsedFileStorage: bigint,
  allotedStorageInBytes: number,
) => {
  const remainingStorage = BigInt(allotedStorageInBytes) - unrestrictedUsedFileStorage;
  let subset: FileToUnrestrict[] = [];
  let totalSize = 0n;
  for (const file of restrictedFiles) {
    if (totalSize + file.size <= remainingStorage) {
      subset.push(file);
      totalSize += file.size;
    } else {
      break;
    }
  }

  return subset;
};

const unrestrictFilesTransaction = async (restrictedFiles: FileToUnrestrict[], patientProfileId: string) => {
  const totalSizeOfRestrictedFiles = restrictedFiles.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.size;
  }, 0n);

  const restrictedFilesIds = restrictedFiles.map((file) => file.id);

  await prismadb.$transaction(
    async (prisma) => {
      await prisma.file.updateMany({
        where: {
          id: { in: restrictedFilesIds },
        },
        data: {
          restricted: false,
        },
      });
      await prisma.patientProfile.update({
        where: {
          id: patientProfileId,
        },
        data: {
          unrestrictedUsedFileStorage: { increment: totalSizeOfRestrictedFiles },
        },
      });
    },
    { timeout: 20000 },
  );
  return restrictedFilesIds;
};

export const unrestrictFiles = async (patient: {
  id: string;
  usedFileStorage: bigint;
  unrestrictedUsedFileStorage: bigint;
  plan: Plan;
}) => {
  let filesToUnrestrict: FileToUnrestrict[] = [];
  const restrictedFiles = await prismadb.file.findMany({
    where: {
      patientProfileId: patient.id,
      status: "SUCCESS",
      restricted: true,
    },
    select: {
      id: true,
      size: true,
    },
    orderBy: { size: "asc" },
  });
  let restrictedFilesIds: string[] = [];
  if (restrictedFiles.length > 0) {
    // const totalSizeOfRestrictedFiles = restrictedFiles.reduce((accumulator, currentValue) => {
    //   return accumulator + currentValue.size;
    // }, 0);

    // const patient = await prismadb.patientProfile.findUnique({
    //   where: {
    //     id: patientProfileId,
    //   },
    //   select: {
    //     usedFileStorage: true,
    //     unrestrictedUsedFileStorage: true,
    //   },
    // });
    //only patient can delete so this is safe to use session to get the patient's plan
    // const session = await auth();

    // if (!session || !session.user) {
    //   return;
    // }

    const unrestrictedUsedFileStorage = patient.unrestrictedUsedFileStorage;
    const allotedStorageInBytes = allotedStoragesInGb[patient.plan] * 1_000_000_000;
    //first conditional if the usedFileStorage (total used storage) is less than the allotedStorageInBytes then any restricted files should change to restricted:false
    if (patient.usedFileStorage < allotedStorageInBytes) {
      filesToUnrestrict = restrictedFiles;
      // restrictedFilesIds = await unrestrictFilesTransaction(restrictedFiles, patientProfileId);
    }
    //otherwise and if the  unrestrictedUsedFileStorage is less than the allotedStorageInBytes loop through the files and unrestrict one if its size + unrestrictedUsedFileStorage will be less than the allotedStorageInBytes
    //the first file to not exceed will break the loop since the files are sorted by ascending size.
    else if (unrestrictedUsedFileStorage < allotedStorageInBytes) {
      filesToUnrestrict = getMaxRestrictedFiles(
        restrictedFiles,
        patient.unrestrictedUsedFileStorage,
        allotedStorageInBytes,
      );
    }
    restrictedFilesIds = await unrestrictFilesTransaction(filesToUnrestrict, patient.id);
  }
  return restrictedFilesIds;
};

const restrictFilesTransaction = async (filesToRestrict: FileToUnrestrict[], patientProfileId: string) => {
  const totalSizeOfFilesToRestrict = filesToRestrict.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.size;
  }, 0n);

  const filesToRestrictIds = filesToRestrict.map((file) => file.id);

  await prismadb.$transaction(
    async (prisma) => {
      await prisma.file.updateMany({
        where: {
          id: { in: filesToRestrictIds },
        },
        data: {
          restricted: true,
        },
      });
      await prisma.patientProfile.update({
        where: {
          id: patientProfileId,
        },
        data: {
          unrestrictedUsedFileStorage: { decrement: totalSizeOfFilesToRestrict },
        },
      });
    },
    { timeout: 20000 },
  );
  return filesToRestrictIds;
};

export const restrictFiles = async (patient: {
  id: string;
  usedFileStorage: bigint;
  unrestrictedUsedFileStorage: bigint;
  plan: Plan;
}) => {
  let filesToRestrict = [];
  const unrestrictedFiles = await prismadb.file.findMany({
    where: {
      patientProfileId: patient.id,
      status: "SUCCESS",
      restricted: false,
    },
    select: {
      id: true,
      size: true,
    },
    orderBy: { size: "asc" },
  });

  if (unrestrictedFiles.length > 0) {
    const unrestrictedUsedFileStorage = patient.unrestrictedUsedFileStorage;
    const allotedStorageInBytes = allotedStoragesInGb[patient.plan] * 1_000_000_000;
    let cumulativeSize = 0n;

    for (const file of unrestrictedFiles) {
      if (cumulativeSize + file.size > allotedStorageInBytes) {
        // Once adding the next file's size exceeds allotted storage, start restricting files.
        filesToRestrict.push(file);
      } else {
        cumulativeSize += file.size;
      }
    }

    if (filesToRestrict.length > 0) {
      return await restrictFilesTransaction(filesToRestrict, patient.id);
    }
  }
  return []; // If no files need to be restricted, return an empty array.
};

export const addRootNode = async (
  folderName: string,
  addedByUserId: string,
  patientUserId: string,
  patientProfileId: string,
  addedByName: string,
) => {
  const existingRoot = await prismadb.folder.findFirst({
    where: {
      isRoot: true,
      name: folderName,
      namePath: `/${folderName}`,
      path: "/",
      userId: patientUserId,
      patientProfileId: patientProfileId,
    },
  });

  if (existingRoot) {
    throw new Error("Root folder with same name already exists!");
  }

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
    { timeout: 20000 },
  );

  if (folder) {
    return folder.id;
  } else {
    // Handle the case where the folder creation failed or the transaction was rolled back
    throw new Error("Failed to create folder");
  }
};

export const addSubFolder = async (
  folderName: string,
  parentId: string,
  addedByUserId: string,
  patientUserId: string,
  patientProfileId: string,
  addedByName: string,
) => {
  let folder: Folder | undefined;

  const parentFolder = await prismadb.folder.findUnique({
    where: {
      id: parentId,
    },
  });

  if (!parentFolder) {
    throw new Error("Failed to create folder");
  }

  await prismadb.$transaction(
    async (prisma) => {
      folder = await prisma.folder.create({
        data: {
          name: folderName,
          parentId: parentId,
          namePath: `${parentFolder.namePath}/${folderName}`,
          path: `${parentFolder.path}${parentFolder.id}/`,
          addedByUserId: addedByUserId,
          addedByName: addedByName,
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
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      path: folder.path,
      namePath: folder.namePath,
    };
  } else {
    // Handle the case where the folder creation failed or the transaction was rolled back
    throw new Error("Failed to create folder");
  }
};

export async function fetchAllFoldersForPatient(parentId: string | null = null, userId: string) {
  // Fetch folders and their files
  const folders = (await prismadb.folder.findMany({
    where: {
      AND: [{ userId: userId }, { parentId: parentId }],
    },
    include: {
      files: {
        where: {
          status: FileStatus.SUCCESS,
        },
        include: {
          recordViewActivity: {
            where: {
              userId: userId,
            },
            select: {
              lastViewedAt: true,
            },
          },
        },
      },
      recordViewActivity: {
        where: {
          userId: userId,
        },
        select: {
          lastViewedAt: true,
        },
      },
    },
  })) as any[];
  for (const folder of folders) {
    // Recursively fetch subfolders
    const subFolders = await fetchAllFoldersForPatient(folder.id, userId);

    // Combine files and subfolders into the children array
    folder.children = [...folder.files, ...subFolders];

    // Optionally, remove the original files array if you want all children in one array
    delete folder.files;
  }

  return folders;
}

// const singleLayerFolders = await prismadb.folder.findMany({
//   where: {
//     userId: user.id,
//   },
//   select: {
//     id: true,
//     name: true,
//     path: true,
//     parentId: true,
//     namePath: true,
//     isFile: true,
//     recordViewActivity: {
//       where: {
//         userId: user.id,
//       },
//       select: {
//         lastViewedAt: true,
//       },
//     },
//   },
// });

// const singleLayerFiles = await prismadb.file.findMany({
//   where: {
//     userId: user.id,
//   },
//   select: {
//     id: true,
//     name: true,
//     parentId: true,
//     path: true,
//     namePath: true,
//     isFile: true,
//     recordViewActivity: {
//       where: {
//         userId: user.id,
//       },
//       select: {
//         lastViewedAt: true,
//       },
//     },
//   },
// });
