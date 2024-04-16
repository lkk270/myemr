"use server";

import prismadb from "@/lib/prismadb";
import { deleteS3ProfilePicture } from "../actions/files";
import { stripe } from "../stripe/stripe";
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { sendSuccessfullyDeletedAccountEmail } from "@/auth/lib/mail/mail";

export const deletePatients = async (authHeader: string) => {
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return { error: "unauthorized" };
  }

  async function deleteFolderAndSubfolders(folderId: string) {
    const subFolders = await prismadb.folder.findMany({
      where: { parentId: folderId },
    });

    // Recursively delete subfolders first
    for (const subFolder of subFolders) {
      await deleteFolderAndSubfolders(subFolder.id);
    }

    // Delete the current folder
    await prismadb.folder.delete({
      where: { id: folderId },
    });
  }

  async function deleteAllUserFolders(userId: string) {
    const rootFolders = await prismadb.folder.findMany({
      where: {
        userId: userId,
        parentId: null, // Assuming root folders have no parent ID
      },
    });

    // Use a transaction to ensure all deletions complete successfully
    await prismadb.$transaction(
      async () => {
        for (const folder of rootFolders) {
          await deleteFolderAndSubfolders(folder.id);
        }
      },
      { timeout: 20000 },
    );
  }

  async function deleteFolderContents(folderPrefix: string) {
    const client = new S3Client({ region: process.env.AWS_REGION });

    // List all objects in the folder
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Prefix: folderPrefix, // Ensure this ends with a slash ('/') to list contents of the folder
    });
    const listedObjects = await client.send(listCommand);

    if (listedObjects.Contents?.length === 0) return;

    // Prepare a list of objects to delete
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Delete: {
        Objects: listedObjects.Contents?.map(({ Key }) => ({ Key })),
        Quiet: true,
      },
    };

    // Delete the objects
    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await client.send(deleteCommand);

    // If the folder has more contents than returned in one ListObjects call, repeat the process
    if (listedObjects.IsTruncated) await deleteFolderContents(folderPrefix);
  }

  const patientUsersToDelete = await prismadb.user.findMany({
    where: { scheduledToDelete: true, type: "PATIENT" },
    select: {
      id: true,
      email: true,
      patientProfile: {
        select: {
          id: true,
        },
      },
    },
  });

  //   const allUserIdsToDelete = patientUsersToDelete.map((user) => user.id);
  let reason = "";
  for (const user of patientUsersToDelete) {
    if (!user || !user.email || !user.patientProfile) {
      continue;
    }
    const patientProfileId = user.patientProfile.id;
    try {
      const patientFile = await prismadb.file.findFirst({
        where: { patientProfileId: patientProfileId },
        select: {
          id: true,
        },
      });
      reason = "failed on: userSubscription get";
      const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!!userSubscription && !!userSubscription.stripeSubscriptionId) {
        reason = "failed on: stripe subscriptions cancel";
        await stripe.subscriptions.cancel(userSubscription.stripeSubscriptionId);
      }

      reason = "failed on: deleteS3ProfilePicture";
      await deleteS3ProfilePicture(user.id);

      if (!!patientFile) {
        reason = "failed on: deleteS3Objects";
        await deleteFolderContents(`${patientProfileId}/`);
      }

      reason = "failed on:  prismadb.file.delete";
      await prismadb.file.deleteMany({
        where: {
          userId: user.id,
        },
      });

      reason = "failed on:  prismadb.folder.delete";
      await deleteAllUserFolders(user.id);

      reason = "failed on:  prismadb.user.delete";
      await prismadb.user.delete({
        where: {
          id: user.id,
        },
      });

      reason = "failed on: prismadb.requestRecordsCode.deleteMany";
      await prismadb.requestRecordsCode.deleteMany({
        where: {
          userId: user.id,
        },
      });

      reason = "failed on: prismadb.patientProfileAccessCode.deleteMany";
      await prismadb.patientProfileAccessCode.deleteMany({
        where: {
          userId: user.id,
        },
      });
      reason = "failed on: sendSuccessfullyDeletedAccountEmail";
      await sendSuccessfullyDeletedAccountEmail(user.email, "Patient");
    } catch (error) {
      await prismadb.failedAccountDelete.create({
        data: {
          userId: user.id,
          patientProfileId: patientProfileId,
          reason: reason,
        },
      });
    }
  }
};
