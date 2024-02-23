"use server";

import { v4 as uuidv4 } from "uuid";

import prismadb from "@/lib/prismadb";
import { getRequestRecordsTokenByEmail } from "@/auth/data";
import { sendRequestRecordsEmail } from "@/auth/lib/mail";
import { RequestRecordsSchema } from "../schemas";
import { z } from "zod";
import { currentUser } from "@/auth/lib/auth";

export const generateRequestRecordsToken = async (values: z.infer<typeof RequestRecordsSchema>) => {
  console.log("hell");
  const user = await currentUser();
  const userId = user?.id;
  const isPatient = user?.role === "ADMIN" && user?.userType === "PATIENT";

  if (!user || !userId || !isPatient) {
    return { error: "Unauthorized" };
  }

  const validatedFields = RequestRecordsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { providerEmail, signature, uploadToId } = validatedFields.data;

  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 2_592_000 * 1000);

  const existingToken = await getRequestRecordsTokenByEmail(providerEmail, userId);

  if (existingToken) {
    return { error: "You have already sent a request to this provider that has not yet expired." };
  }

  const requestRecordsToken = await prismadb.requestRecordsToken.create({
    data: {
      userId,
      parentFolderId: uploadToId,
      providerEmail: providerEmail.toLowerCase(),
      token,
      expires,
    },
  });

  await sendRequestRecordsEmail(requestRecordsToken.providerEmail, requestRecordsToken.token);
  return { success: "Email sent!" };
};
