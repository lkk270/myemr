"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { generateAsymmetricKeyPairs, generateSymmetricKey, encryptKey, encryptPatientRecord } from "@/lib/encryption";
import prismadb from "@/lib/prismadb";
import { RegisterSchema } from "@/auth/schemas";
import { getUserByEmail } from "@/auth/data/user";
import { sendVerificationEmail } from "@/auth/lib/mail/mail";
import { generateVerificationToken } from "@/auth/lib/tokens";
import { AccountType, UserType } from "@prisma/client";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, firstName, lastName, userType } = validatedFields.data;
  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    (userType !== UserType.PATIENT && userType !== UserType.PROVIDER)
  ) {
    return { error: "Invalid body" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email, userType);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  if (userType === UserType.PATIENT) {
    const { publicKey, privateKey } = generateAsymmetricKeyPairs();
    const symmetricKey = generateSymmetricKey();
    await prismadb.$transaction(
      async (prisma) => {
        await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            type: "PATIENT",
            role: "ADMIN",
            accountType: AccountType.CREDENTIALS,
            patientProfile: {
              create: {
                firstName: encryptPatientRecord(firstName, symmetricKey),
                lastName: encryptPatientRecord(lastName, symmetricKey),
                email: encryptPatientRecord(email, symmetricKey),
                publicKey: encryptKey(publicKey, "patientPublicKey"),
                privateKey: encryptKey(privateKey, "patientPrivateKey"),
                symmetricKey: encryptKey(symmetricKey, "patientSymmetricKey"),
              },
            },
          },
        });
      },
      { timeout: 20000 },
    );
  }
  // if (userType === UserType.PATIENT) {
  //   const { publicKey, privateKey } = generateAsymmetricKeyPairs();
  //   const symmetricKey = generateSymmetricKey();
  //   const user = await prismadb.user.create({
  //     data: {
  //       firstName,
  //       lastName,
  //       email,
  //       password: hashedPassword,
  //       type: "PATIENT",
  //       role: "ADMIN",
  //     },
  //   });
  //   await prismadb.patientProfile.create({
  //     data: {
  //       userId: user.id,
  //       publicKey: encryptKey(publicKey, "patientPublicKey"),
  //       privateKey: encryptKey(privateKey, "patientPrivateKey"),
  //       symmetricKey: encryptKey(symmetricKey, "patientSymmetricKey"),
  //     },
  //   });
  // }
  if (userType === UserType.PROVIDER) {
    // const { publicKey, privateKey } = generateAsymmetricKeyPairs();
    await prismadb.$transaction(
      async (prisma) => {
        await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            password: hashedPassword,
            type: "PROVIDER",
            accountType: AccountType.CREDENTIALS,
            name: `${firstName} ${lastName}`,
            // providerProfile: {
            //   create: {
            //     firstName,
            //     lastName,
            //     email,
            //     publicKey: encryptKey(publicKey, "providerPublicKey"),
            //     privateKey: encryptKey(privateKey, "providerPrivateKey"),
            //   },
            // },
          },
        });
        // Include any additional operations if needed
      },
      { timeout: 20000 }, // Set your desired timeout in milliseconds
    );
  }

  const verificationToken = await generateVerificationToken(email, userType);
  await sendVerificationEmail(verificationToken.email, verificationToken.token, userType);

  return { success: "Confirmation email sent!" };
};
