"use server";

import { v4 as uuidv4 } from "uuid";

import prismadb from "@/lib/prismadb";
import { getRequestRecordsTokenByEmail } from "@/auth/data";
import { sendRequestRecordsEmail } from "@/auth/lib/mail/mail";
import { RequestRecordsSchema } from "../schemas";
import { z } from "zod";
import { currentUser } from "@/auth/lib/auth";
import { decryptKey, decryptMultiplePatientFields } from "@/lib/utils";
import { allotedStoragesInGb } from "@/lib/constants";
import { getSumOfFilesSizes } from "@/lib/data/files";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

const calculateStartAndEndDate = (patientCreatedAt: Date): { startDate: Date; endDate: Date } => {
  const currentDate = new Date();

  // Calculate the month difference
  const monthDifference =
    (currentDate.getFullYear() - patientCreatedAt.getFullYear()) * 12 +
    currentDate.getMonth() -
    patientCreatedAt.getMonth();

  let startDate, endDate;
  if (monthDifference === 0 && currentDate.getDate() <= patientCreatedAt.getDate() + 30) {
    // If within the first 30 days range from patient.createdAt
    startDate = patientCreatedAt;
    endDate = new Date(patientCreatedAt);
    endDate.setDate(patientCreatedAt.getDate() + 30);
  } else {
    // Adjust the range for the current month and year based on patient.createdAt
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), patientCreatedAt.getDate());
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 30);

    // If the calculated start date is in the future (can happen if current day < patient's createdAt day and it's the next month),
    // shift start and end dates to the previous month.
    if (startDate > currentDate) {
      startDate.setMonth(startDate.getMonth() - 1);
      endDate.setMonth(endDate.getMonth() - 1);
    }
  }
  return { startDate: startDate, endDate: endDate };
};

export const generateRequestRecordsToken = async (values: z.infer<typeof RequestRecordsSchema>) => {
  const user = await currentUser();
  const userId = user?.id;
  const userEmail = user?.email;
  const currentUserPermissions = !!user ? extractCurrentUserPermissions(user) : null;

  if (!user || !userId || !userEmail || !currentUserPermissions || !currentUserPermissions.isPatient || !user.plan) {
    return { error: "Unauthorized" };
  }

  const validatedFields = RequestRecordsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const patient = await prismadb.patientProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      symmetricKey: true,
      createdAt: true,
    },
  });
  if (!patient) {
    return { error: "Patient not found!" };
  }

  if (user.plan === "PATIENT_FREE") {
    const dates = calculateStartAndEndDate(patient.createdAt);
    const numRequestsThisMonth = await prismadb.requestRecordsCode.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: dates.startDate,
          lte: dates.endDate,
        },
      },
    });
    if (numRequestsThisMonth >= 2) {
      return {
        error: `Request submission for 'request records' is currently unavailable as you have reached your monthly limit of 2. The quota will reset after ${
          dates.endDate.toISOString().split("T")[0]
        }. Consider upgrading to our Pro or Pro+ plans for increased request capabilities.`,
      };
    }
  } else if (user.plan === "PATIENT_PREMIUM_1") {
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });
    if (!userSubscription || !userSubscription.stripeCurrentPeriodEnd) return { error: "Subscription not found!" };
    const numRequestsThisMonth = await prismadb.requestRecordsCode.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: userSubscription.updatedAt,
          lte: userSubscription.stripeCurrentPeriodEnd,
        },
      },
    });
    if (numRequestsThisMonth >= 10) {
      return {
        error: `Request submission for 'request records' is currently unavailable as you have reached your monthly limit of 10. The quota will reset after ${
          userSubscription.stripeCurrentPeriodEnd.toISOString().split("T")[0]
        }. Consider upgrading to our Pro or Pro+ plans for increased request capabilities.`,
      };
    }
  }

  const sumOfAllSuccessFilesSizes = await getSumOfFilesSizes(patient.id, "patientProfileId");
  if (typeof sumOfAllSuccessFilesSizes !== "bigint") {
    return { error: "Something went wrong" };
  }
  const allotedStorageInGb = allotedStoragesInGb[user.plan];
  if (BigInt(allotedStorageInGb * 1_000_000_000) - sumOfAllSuccessFilesSizes < 5_000_000) {
    return {
      error: "Cannot send a request for records, as it requires you to have 500 Mb of available storage.",
    };
  }
  let decryptedPatientFields;
  try {
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");
    decryptedPatientFields = decryptMultiplePatientFields(
      { firstName: patient.firstName, lastName: patient.lastName, dateOfBirth: patient.dateOfBirth },
      decryptedSymmetricKey,
    );
  } catch (e) {
    // console.log(e);
    return { error: "Something went wrong" };
  }

  if (!decryptedPatientFields.dateOfBirth) {
    return { error: "You must select your date of birth in the About page before requesting your records." };
  }
  const { providerEmail, signature, uploadToId } = validatedFields.data;

  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 2_592_000 * 1000);

  const existingToken = await getRequestRecordsTokenByEmail(providerEmail, userId);

  if (existingToken) {
    return { error: "You have already sent a request to this provider that has not yet expired." };
  }

  const dataForLetter = {
    signature,
    expires,
    email: userEmail,
    dateOfBirth: decryptedPatientFields.dateOfBirth,
    firstName: decryptedPatientFields.firstName,
    lastName: decryptedPatientFields.lastName,
  };

  const requestRecordsToken = await prismadb.requestRecordsCode.create({
    data: {
      userId,
      patientProfileId: patient.id,
      parentFolderId: uploadToId,
      providerEmail: providerEmail.toLowerCase(),
      token,
      expires,
    },
  });

  try {
    await sendRequestRecordsEmail(providerEmail, requestRecordsToken.token, dataForLetter);
    return { success: "Email sent!" };
  } catch (error) {
    // console.log(error);
    return { error: "Something went wrong" };
  }
};
