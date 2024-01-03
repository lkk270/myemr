import prismadb from "@/lib/prismadb";
import { UserType } from "@prisma/client";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await prismadb.passwordResetToken.findUnique({
      where: { token },
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string, userType: UserType) => {
  try {
    const passwordResetToken = await prismadb.passwordResetToken.findFirst({
      where: { email, userType },
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};
