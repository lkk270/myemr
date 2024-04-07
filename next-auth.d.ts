import { Plan, UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession, type Account } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  userType: UserType;
  plan: Plan;
  isTwoFactorEnabled: boolean;
  accessibleRootFolders: string;
  isOAuth: boolean;
  createdAt: Date;
};

export type ExtendedAccount = Account & {
  userType: string;
};

// export type CodeUser = {
//   accessType: AccessCodeType;
//   patientProfileId: String;
//   userId: String;
//   validFor: AccessCodeValidTime;
//   accessType: AccessCodeType;
//   token: String;
//   expires: DateTime;
// };

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
    tempToken?: string;
  }
}
