import { currentUser, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

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

  await prismadb.patientProfile.create({
    data: {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
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

  await prismadb.providerProfile.create({
    data: {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    },
  });
  return;
};
