import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession, type Account } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  firstName: string;
  lastName: string;
  role: UserRole;
  type: UserType;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  createdAt: Date;
};

export type ExtendedAccount = Account & {
  userType: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
