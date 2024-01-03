import prismadb from "@/lib/prismadb";
import { UserType } from "@prisma/client";

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await prismadb.verificationToken.findUnique({
      where: { token },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

export const getVerificationTokenByEmail = async (email: string, userType: UserType) => {
  try {
    const verificationToken = await prismadb.verificationToken.findFirst({
      where: { email, userType },
    });

    return verificationToken;
  } catch {
    return null;
  }
};
