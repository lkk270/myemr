import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession, type Account } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  userType: UserType;
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