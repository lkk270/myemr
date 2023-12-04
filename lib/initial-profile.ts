import { currentUser, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

import { generateAsymmetricKeyPairs, generateSymmetricKey, encryptKey, encryptPatientRecord } from "./encryption";

export const initialPatientProfile = async () => {
  const user = await currentUser();

  if (!user || !user.firstName || !user.lastName) {
    return redirectToSignIn();
  }

  if (Date.now() - new Date(user.createdAt).getTime() > 5 * 60 * 1000) {
    return;
  }

  const profile = await prismadb.patientProfile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (profile) {
    return;
  }

  const { publicKey, privateKey } = generateAsymmetricKeyPairs();
  const symmetricKey = generateSymmetricKey();

  await prismadb.patientProfile.create({
    data: {
      userId: user.id,
      firstName: encryptPatientRecord(user.firstName, symmetricKey),
      lastName: encryptPatientRecord(user.lastName, symmetricKey),
      imageUrl: encryptPatientRecord(user.imageUrl, symmetricKey),
      email: encryptPatientRecord(user.emailAddresses[0].emailAddress, symmetricKey),
      publicKey: encryptKey(publicKey, "patientPublicKey"),
      privateKey: encryptKey(privateKey, "patientPrivateKey"),
      symmetricKey: encryptKey(symmetricKey, "patientSymmetricKey"),
    },
  });

  return;
};

export const initialProviderProfile = async () => {
  const user = await currentUser();

  if (!user || !user.firstName || !user.lastName) {
    return redirectToSignIn();
  }

  const profile = await prismadb.providerProfile.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (profile) {
    return;
  }

  const { publicKey, privateKey } = generateAsymmetricKeyPairs();

  await prismadb.providerProfile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      publicKey: encryptKey(publicKey, "providerPublicKey"),
      privateKey: encryptKey(privateKey, "providerPrivateKey"),
    },
  });
  return;
};
