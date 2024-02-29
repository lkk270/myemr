"use server";

import prismadb from "@/lib/prismadb";
import { update } from "@/auth";
import { currentUser } from "@/auth/lib/auth";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const deleteProfilePicture = async () => {
  const user = await currentUser();
  const userId = user?.id;
  const isPatient = user?.role === "ADMIN" && user?.userType === "PATIENT";

  if (!user || !userId || !isPatient) {
    return { error: "Unauthorized" };
  }

  const client = new S3Client({ region: process.env.AWS_REGION });
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_PROFILE_PICS_BUCKET_NAME as string,
    Key: userId,
  });

  try {
    await client.send(command);
  } catch (err) {
    return { error: "something went wrong" };
  }
  await prismadb.$transaction(
    async (prisma) => {
      await prisma.patientProfile.update({
        where: {
          userId: userId,
        },
        data: {
          imageUrl: null,
        },
      });
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          image: null,
        },
      });
    },
    { timeout: 20000 },
  );
  update({
    user: {
      image: null,
    },
  });

  return { success: "Profile picture deleted!" };
};
