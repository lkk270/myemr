import prismadb from "@/lib/prismadb";
import { UserType } from "@prisma/client";

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await prismadb.twoFactorToken.findUnique({
      where: { token },
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string, userType: UserType) => {
  try {
    const twoFactorToken = await prismadb.twoFactorToken.findFirst({
      where: { email, userType },
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};
