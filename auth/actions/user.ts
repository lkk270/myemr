"use server";

import { currentUser } from "@/auth/lib/auth";
import { UserRole } from "@prisma/client";

export const serverUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }
  return user;
};
