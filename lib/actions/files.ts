"use server";

import { Folder, File, FileStatus, Prisma, Plan } from "@prisma/client";
import prismadb from "../prismadb";
import { allotedStoragesInGb, rootFolderCategories } from "../constants";
import { S3Client, DeleteObjectsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { isValidNodeName, extractRootFolderIds, removeTrailingComma, isNodeAccessible } from "../utils";
import { ExtendedUser } from "@/next-auth";
import { currentUserPermissionsType } from "@/app/types";
import { createPatientNotification } from "./notifications";
import { currentUser } from "@/auth/lib/auth";
import { getPatientMember } from "@/auth/actions/patient-member";
import { pl } from "date-fns/locale";

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

export async function validateUserAndGetAccessibleRootFolders(
  requiredPermissions: "canEdit" | "canAdd" | "canDelete" | "canRead",
  userParam: {
    user: ExtendedUser | null;
    currentUserPermissions: currentUserPermissionsType;
    patientMemberId?: string | null;
  } | null = null,
) {
  let user: ExtendedUser | null = userParam && userParam.user;
  let currentUserPermissions = userParam && userParam.currentUserPermissions;
  if (!userParam) {
    user = await currentUser();
    currentUserPermissions = extractCurrentUserPermissions(user);
  }
  if (!user || !currentUserPermissions) {
    return null;
  }
  if (!currentUserPermissions.isProvider) {
    if (!currentUserPermissions[requiredPermissions]) {
      return null;
    } else {
      const accessibleRootFolderIds = extractRootFolderIds(user.accessibleRootFolders);
      return { accessibleRootFolderIds, patientUserId: user.id, patientProfileId: null };
    }
  } else if (currentUserPermissions.isProvider) {
    if (!userParam || !userParam.patientMemberId) {
      return null;
    }
    const patientMember = await getPatientMember(userParam.patientMemberId, "canRead", {
      user,
      currentUserPermissions,
    });
    if (!patientMember) {
      return null;
    }
    const accessibleRootFolderIds = extractRootFolderIds(patientMember.accessibleRootFolders);

    return {
      accessibleRootFolderIds,
      patientUserId: patientMember.patientUserId,
      patientProfileId: patientMember.patientProfileId,
    };
  }
  return null;
}

export async function renameNode(
  isFile: boolean,
  nodeId: string,
  newName: string,
  userIds: { patient: string; provider: string | null },
  accessibleRootFolderIds: string[] | "ALL_EXTERNAL" | "ALL",
) {
  // const user = await currentUser();
  // if (!user) return { error: "Unauthorized", status: 400 };
  // const currentUserPermissions = extractCurrentUserPermissions(user);
  // const accessibleRootFolderIdsResult = await validateUserAndGetAccessibleRootFolders("canEdit", {
  //   user,
  //   currentUserPermissions,
  // });

  // if (!accessibleRootFolderIdsResult) {
  //   return { error: "Unauthorized", status: 400 };
  // }

  // const { accessibleRootFolderIds } = accessibleRootFolderIdsResult;

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

  if (!isValidNodeName(newName)) {
    console.log("IN HERE");
    return { error: "Invalid new name", status: 500 };
  }
  let oldName = null;
  if (isFile === true) {
    const currentFile = await prismadb.file.findUnique({
      where: { id: nodeId, userId: userIds.patient },
    });

    let isValidFile = !!currentFile
      ? isNodeAccessible(accessibleRootFolderIds, {
          id: currentFile.id,
          isRoot: false,
          path: currentFile.path,
        })
      : false;

    if (!currentFile || !isValidFile) {
      return { error: "File not found", status: 400 };
    }
    oldName = currentFile.name;
    const oldPath = currentFile.namePath;
    const newNamePath = oldPath.replace(/[^/]*$/, newName);
    await prismadb.file.update({
      where: {
        id: nodeId,
      },
      data: { name: newName, namePath: newNamePath },
    });

    await updateRecordViewActivity(userIds.patient, nodeId, isFile);
    if (!!userIds.provider) {
      await updateRecordViewActivity(userIds.provider, nodeId, isFile);
    }
    // if (!currentUserPermissions.hasAccount) {
    //   await createPatientNotification({
    //     notificationType: "ACCESS_CODE_NODE_RENAMED",
    //     dynamicData: {
    //       isFile: true,
    //       role: user?.role,
    //       oldName: currentFile.name,
    //       newName: newName,
    //     },
    //   });
    // }
  } else if (isFile === false) {
    const currentFolder = await prismadb.folder.findUnique({
      where: { id: nodeId, userId: userIds.patient, isRoot: false },
    });

    let isValidFolder = !!currentFolder
      ? isNodeAccessible(accessibleRootFolderIds, {
          id: currentFolder.id,
          isRoot: false,
          path: currentFolder.path,
        })
      : false;

    if (!currentFolder || !isValidFolder) {
      return { error: "Folder not found", status: 400 };
    }
    oldName = currentFolder.name;
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

    await updateRecordViewActivity(userIds.patient, nodeId, isFile);
    if (!!userIds.provider) {
      await updateRecordViewActivity(userIds.provider, nodeId, isFile);
    }
    // if (userIds.provider) {
    //   await updateRecordViewActivity(userIds.patient, nodeId, isFile);
    //   await updateRecordViewActivity(userIds.provider, nodeId, isFile);
    // } else {
    //   await updateRecordViewActivityThatExists([userIds.patient], nodeId, isFile);
    // }

    // if (!currentUserPermissions.hasAccount) {
    //   await createPatientNotification({
    //     notificationType: "ACCESS_CODE_NODE_RENAMED",
    //     dynamicData: {
    //       isFile: false,
    //       role: user?.role,
    //       oldName: currentFolder.name,
    //       newName: newName,
    //     },
    //   });
    // }
  }
  return { success: true, oldName };
}

export async function updateRecordViewActivity(userId: string, nodeId: string, isFile: boolean) {
  // console.log(userId);
  const whereClause = isFile ? { userId: userId, fileId: nodeId } : { userId: userId, folderId: nodeId };

  const existingActivity = await prismadb.recordViewActivity.findFirst({
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

export async function updateRecordViewActivityThatExists(userIds: string[], nodeId: string, isFile: boolean) {
  // console.log(userId);
  const whereClause = isFile
    ? { userId: { in: userIds }, fileId: nodeId }
    : { userId: { in: userIds }, folderId: nodeId };

  // Update the existing RecordViewActivity
  await prismadb.recordViewActivity.updateMany({
    where: whereClause,
    data: { lastViewedAt: new Date() },
  });
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
    await batchUpdateDescendants(prisma, node!.id, node!.path, node!.namePath, newPath, newNamePath);
  });
  await updateRecordViewActivityThatExists([userId], nodeId, isFile);
}

export async function moveNodes(
  selectedIds: string[],
  targetNodeId: string,
  isTrash: boolean = false,
  userIds: { patient: string; provider: string | null },
  accessibleRootFolderIds: string[] | "ALL_EXTERNAL" | "ALL",
) {
  const targetNode = await prismadb.folder.findUnique({ where: { id: targetNodeId } });
  if (!targetNode) throw Error("Target node not found");
  if (!isTrash && targetNode.namePath.startsWith("/Trash")) throw Error("Unauthorized");

  let fileIds = []; // Array to hold file IDs for batch update

  for (const nodeId of selectedIds) {
    let isFile = false;
    let node: File | Folder = (await prismadb.folder.findUnique({
      where: { id: nodeId, userId: userIds.patient },
    })) as Folder;
    if (!node) {
      node = (await prismadb.file.findUnique({ where: { id: nodeId, userId: userIds.patient } })) as File;
      if (!node) continue; // Skip if node is not found
      isFile = true;
    }
    let isValidNode = !!node
      ? isNodeAccessible(accessibleRootFolderIds, {
          id: node.id,
          isRoot: false,
          path: node.path,
        })
      : false;
    if (!isValidNode) {
      return { error: "Unauthorized", status: 401 };
      //safe even for moving to trash because accessibleRootFolderIds will equal ALL for moving to trash because only
      //the patient can move to trash
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
        await batchUpdateDescendants(prisma, node.id, node.path, node.namePath, newPath, newNamePath);
      });
      await updateRecordViewActivity(userIds.patient, nodeId, isFile);
      if (!!userIds.provider) {
        await updateRecordViewActivity(userIds.provider, nodeId, isFile);
      }
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

    await updateRecordViewActivitiesForFiles(userIds.patient, fileIds);
  }
  return { success: true };
}

async function batchUpdateDescendants(
  prisma: any,
  originalNodeId: string,
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
  WHERE \`path\` LIKE ${`${originalPath}${originalNodeId}/` + "%"}
`;

  // Use tagged template literals for the raw SQL query for updating file descendants
  await prisma.$executeRaw`
  UPDATE \`File\`
  SET \`namePath\` = REPLACE(\`namePath\`, ${originalNamePath}, ${newParentNamePath}),
      \`path\` = REPLACE(\`path\`, ${originalPath}, ${newParentPath})
  WHERE \`path\` LIKE ${`${originalPath}${originalNodeId}/` + "%"}
`;
}

export async function deleteFiles(selectedFileIds: string[]) {
  await prismadb.file.deleteMany({
    where: {
      id: { in: selectedFileIds },
    },
  });
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
  sumOfUnrestrictedSuccessFilesSizes: bigint,
  allotedStorageInBytes: number,
) => {
  const remainingStorage = BigInt(allotedStorageInBytes) - sumOfUnrestrictedSuccessFilesSizes;
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

  await prismadb.file.updateMany({
    where: {
      id: { in: restrictedFilesIds },
    },
    data: {
      restricted: false,
    },
  });

  return restrictedFilesIds;
};

export const unrestrictFiles = async (patient: {
  id: string;
  sumOfAllSuccessFilesSizes: bigint;
  sumOfUnrestrictedSuccessFilesSizes: bigint;
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
    const allotedStorageInBytes = allotedStoragesInGb[patient.plan] * 1_000_000_000;
    //first conditional if the sumOfAllSuccessFilesSizes (total used storage) is less than the allotedStorageInBytes then any restricted files should change to restricted:false
    if (patient.sumOfAllSuccessFilesSizes < allotedStorageInBytes) {
      filesToUnrestrict = restrictedFiles;
      // restrictedFilesIds = await unrestrictFilesTransaction(restrictedFiles, patientProfileId);
    }
    //otherwise and if the  sumOfUnrestrictedSuccessFilesSizes is less than the allotedStorageInBytes loop through the files and unrestrict one if its size + sumOfUnrestrictedSuccessFilesSizes will be less than the allotedStorageInBytes
    //the first file to not exceed will break the loop since the files are sorted by ascending size.
    else if (patient.sumOfUnrestrictedSuccessFilesSizes < allotedStorageInBytes) {
      filesToUnrestrict = getMaxRestrictedFiles(
        restrictedFiles,
        patient.sumOfUnrestrictedSuccessFilesSizes,
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

  await prismadb.file.updateMany({
    where: {
      id: { in: filesToRestrictIds },
    },
    data: {
      restricted: true,
    },
  });

  return filesToRestrictIds;
};

export const restrictFiles = async (patient: { id: string; sumOfAllSuccessFilesSizes: bigint; plan: Plan }) => {
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

// folderObj: { name: string; parentId: string },
// patient: { profileId: string; userId: string },
// addedBy: { id: string | null; name: string },
// accessibleRootFolderIds: string[] | "ALL_EXTERNAL" | "ALL",

export const addRootNode = async (
  folderName: string,
  addedBy: { id: string | null; name: string },
  patientObj: { profileId: string; userId: string },
  updateAccessibleRootIdsObj: {
    userType: "provider" | "accessCode";
    providerUserId: string;
    id: string;
    accessibleRootFolders: string;
  } | null,
) => {
  if (!rootFolderCategories.some((item) => item.value === folderName)) {
    throw new Error("Root folder does not exist in rootFolderCategories!");
  }
  const existingRoot = await prismadb.folder.findFirst({
    where: {
      isRoot: true,
      name: folderName,
      namePath: `/${folderName}`,
      path: "/",
      userId: patientObj.userId,
      patientProfileId: patientObj.profileId,
    },
  });

  if (!!existingRoot) {
    throw new Error("Root folder with same name already exists!");
  }

  let folder: Folder | undefined;

  const recordViewActivitiesToCreate = [
    {
      userId: patientObj.userId,
    },
  ];
  if (!!updateAccessibleRootIdsObj && updateAccessibleRootIdsObj.userType === "provider") {
    recordViewActivitiesToCreate.push({
      userId: updateAccessibleRootIdsObj.providerUserId,
    });
  }

  await prismadb.$transaction(
    async (prisma) => {
      folder = await prisma.folder.create({
        data: {
          name: folderName,
          namePath: `/${folderName}`,
          path: "/",
          addedByUserId: addedBy.id,
          addedByName: addedBy.name,
          isRoot: true,
          userId: patientObj.userId,
          patientProfileId: patientObj.profileId,

          recordViewActivity: {
            create: recordViewActivitiesToCreate,
          },
        },
      });

      const accessibleRootFolders = !!updateAccessibleRootIdsObj
        ? updateAccessibleRootIdsObj.accessibleRootFolders
        : null;
      if (
        !!updateAccessibleRootIdsObj &&
        !!accessibleRootFolders &&
        accessibleRootFolders !== "ALL" &&
        accessibleRootFolders !== "ALL_EXTERNAL"
      ) {
        const newAccessibleRootFolders = `${removeTrailingComma(accessibleRootFolders)},${folder.id},`;
        if (updateAccessibleRootIdsObj.userType === "accessCode") {
          await prisma.patientProfileAccessCode.update({
            where: { id: updateAccessibleRootIdsObj.id },
            data: {
              accessibleRootFolders: newAccessibleRootFolders,
            },
          });
        } else if (updateAccessibleRootIdsObj.userType === "provider") {
          await prisma.patientMember.update({
            where: { id: updateAccessibleRootIdsObj.id },
            data: {
              accessibleRootFolders: newAccessibleRootFolders,
            },
          });
        }
      }
    },
    { timeout: 20000 },
  );

  if (folder) {
    return folder.id;
  } else {
    // Handle the case where the folder creation failed or the transaction was rolled back
    throw new Error("Failed to create folder 0");
  }
};

export const addSubFolder = async (
  folderObj: { name: string; parentId: string },
  addedBy: { id: string | null; name: string },
  patientObj: { profileId: string; userId: string },
  providerUserId: string | null,
  accessibleRootFolderIds: string[] | "ALL_EXTERNAL" | "ALL",
) => {
  // const user = await currentUser();
  // if (!user) return { error: "Unauthorized", status: 400 };
  // const currentUserPermissions = extractCurrentUserPermissions(user);
  // const accessibleRootFolderIdsResult = await validateUserAndGetAccessibleRootFolders("canAdd", {
  //   user,
  //   currentUserPermissions,
  // });

  // if (!accessibleRootFolderIdsResult) {
  //   return { error: "Unauthorized", status: 400 };
  // }
  // const { accessibleRootFolderIds } = accessibleRootFolderIdsResult;

  // const addedByUserId = !currentUserPermissions.hasAccount ? null : user.id;
  // const addedByName = currentUserPermissions.isProvider
  //   ? user.name || "N/A"
  //   : !currentUserPermissions.hasAccount
  //   ? `Temporary Access User`
  //   : `Me`;

  let folder: Folder | undefined;

  const recordViewActivitiesToCreate = [
    {
      userId: patientObj.userId,
    },
  ];
  if (!!providerUserId) {
    recordViewActivitiesToCreate.push({
      userId: providerUserId,
    });
  }

  const parentFolder = await prismadb.folder.findUnique({
    where: {
      id: folderObj.parentId,
    },
  });
  let isValidFolder = !!parentFolder
    ? isNodeAccessible(accessibleRootFolderIds, {
        id: parentFolder.id,
        isRoot: parentFolder.isRoot,
        path: parentFolder.path,
      })
    : false;

  if (!parentFolder || parentFolder.namePath.startsWith("/Trash") || !isValidFolder) {
    throw new Error("Failed to create folder 111");
  }

  await prismadb.$transaction(
    async (prisma) => {
      folder = await prisma.folder.create({
        data: {
          name: folderObj.name,
          parentId: folderObj.parentId,
          namePath: `${parentFolder.namePath}/${folderObj.name}`,
          path: `${parentFolder.path}${parentFolder.id}/`,
          addedByUserId: addedBy.id,
          addedByName: addedBy.name,
          userId: patientObj.userId,
          patientProfileId: patientObj.profileId,

          recordViewActivity: {
            create: recordViewActivitiesToCreate,
          },
        },
      });
    },
    { timeout: 20000 }, // Set your desired timeout in milliseconds
  );

  if (folder) {
    return {
      id: folder.id,
      name: folder.name,
      parentFolderName: parentFolder.name,
      parentId: folder.parentId,
      path: folder.path,
      namePath: folder.namePath,
    };
  } else {
    // Handle the case where the folder creation failed or the transaction was rolled back
    throw new Error("Failed to create folder 22");
  }
};

export async function fetchAllFoldersForPatient(
  parentId: string | null,
  patientUserId: string,
  accessibleRootFolderIdsParam: string[] | "ALL" | "ALL_EXTERNAL" | null = null,
  userParam: { user: ExtendedUser | null; currentUserPermissions: currentUserPermissionsType } | null = null,
) {
  let user: ExtendedUser | null = userParam && userParam.user;
  let currentUserPermissions = userParam && userParam.currentUserPermissions;
  if (!userParam) {
    user = await currentUser();
    currentUserPermissions = extractCurrentUserPermissions(user);
  }
  if (!user || !currentUserPermissions) {
    return "Unauthorized";
  }
  // Fetch folders and their files
  let whereCondition: any = {
    AND: [{ userId: patientUserId }, { parentId: parentId }],
  };

  if (!parentId) {
    let accessibleRootFolderIds = accessibleRootFolderIdsParam ? accessibleRootFolderIdsParam : "";
    if (!accessibleRootFolderIdsParam) {
      const accessibleRootFolderIdsResult = await validateUserAndGetAccessibleRootFolders("canRead", {
        user,
        currentUserPermissions,
      });
      if (!accessibleRootFolderIdsResult) {
        return "Unauthorized";
      }
      accessibleRootFolderIds = accessibleRootFolderIdsResult.accessibleRootFolderIds;
    }

    if (accessibleRootFolderIds !== "ALL" && accessibleRootFolderIds !== "ALL_EXTERNAL") {
      // Adjust whereCondition to check if the folder id is within the accessibleRootFolderIds

      // whereCondition = {
      //   OR: [
      //     {
      //       AND: [{ userId: patientUserId }, { parentId: parentId }, { id: { in: accessibleRootFolderIds } }],
      //     },
      //     {
      //       addedByUserId: user.id,
      //     },
      //   ],
      // };

      whereCondition = {
        AND: [{ userId: patientUserId }, { parentId: parentId }, { id: { in: accessibleRootFolderIds } }],
      };
    } else if (accessibleRootFolderIds === "ALL_EXTERNAL") {
      whereCondition = {
        AND: [
          { userId: patientUserId },
          { parentId: parentId },
          {
            namePath: {
              not: {
                startsWith: "/Trash",
              },
            },
          },
        ],
      };
    }
  }

  const folders = (await prismadb.folder.findMany({
    where: whereCondition,
    include: {
      files: {
        where: {
          status: FileStatus.SUCCESS,
        },
        include: {
          recordViewActivity: {
            where: {
              userId: user.id,
            },
            select: {
              lastViewedAt: true,
            },
          },
        },
      },
      recordViewActivity: {
        where: {
          userId: user.id,
        },
        select: {
          lastViewedAt: true,
        },
      },
    },
  })) as any[];
  for (const folder of folders) {
    // Recursively fetch subfolders
    const subFolders = await fetchAllFoldersForPatient(folder.id, patientUserId, null, {
      user,
      currentUserPermissions,
    });

    if (subFolders === "Unauthorized") {
      return "Unauthorized";
    }

    // Combine files and subfolders into the children array
    folder.children = [...folder.files, ...subFolders];

    // Optionally, remove the original files array if you want all children in one array
    delete folder.files;
  }

  return folders;
}

export async function fetchAllRootFolders(patientUserId: string | null = null) {
  // Fetch folders and their files
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };
  // const currentUserPermissions = extractCurrentUserPermissions(user);
  // if (!currentUserPermissions.isPatient && !currentUserPermissions.canAdd) {
  //   console.log("933");
  //   return { error: "Unauthorized" };
  // }
  const userId = patientUserId ? patientUserId : user.id;

  const rootFolders = await prismadb.folder.findMany({
    where: {
      userId,
      isRoot: true,
      namePath: {
        not: {
          startsWith: "/Trash",
        },
      },
    },
  });
  return { rootFolders };
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

export const deleteS3ProfilePicture = async (key: string) => {
  const client = new S3Client({ region: process.env.AWS_REGION });
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_PROFILE_PICS_BUCKET_NAME as string,
    Key: key,
  });
  await client.send(command);
};
