import prismadb from "@/lib/prismadb";
import { UserType } from "@prisma/client";

export const getUserByEmail = async (email: string, type: UserType) => {
  try {
    const user = await prismadb.user.findFirst({ where: { email: email.toLowerCase(), type } });
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prismadb.user.findFirst({ where: { id } });
    return user;
  } catch (error) {
    return null;
  }
};
