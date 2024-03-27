import NextAuth, { Account, User } from "next-auth";
import { PatientProfileAccessCode, Plan, UserRole, UserType } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { generateAsymmetricKeyPairs, generateSymmetricKey, encryptKey, encryptPatientRecord } from "@/lib/encryption";
import prismadb from "@/lib/prismadb";
import authConfig from "./auth.config";

import {
  getAccessPatientCodeById,
  getUserFromAccessPatientCode,
  getUserById,
  getUserByEmail,
  getTwoFactorConfirmationByUserId,
  getAccountByUserId,
} from "@/auth/data";
import { ExtendedUser } from "./next-auth";
import { setScheduledToDelete } from "./auth/actions/set-scheduled-to-delete";
import { getSubscription, getSubscriptionRigorous } from "./lib/stripe/subscription";
import { extractCurrentUserPermissions } from "./auth/hooks/use-current-user-permissions";

const DAY_IN_MS = 86_400_000;

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  pages: {
    signIn: "/auth/base-login", //something goes wrong it redirects to this page
    error: "/auth/base-login", //if something else goes wrong it redirects to this page
  },
  events: {
    async linkAccount({ user }) {
      await prismadb.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }: { user: User | ExtendedUser | any; account: Account | null }) {
      // Allow OAuth without email verification
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;
        const existingUser = await getUserByEmail(email, UserType.PATIENT);
        if (!existingUser) {
          const { publicKey, privateKey } = generateAsymmetricKeyPairs();
          const symmetricKey = generateSymmetricKey();
          const safeName = (user.name + " ").split(" ");
          await prismadb.$transaction(
            async (prisma) => {
              await prisma.user.create({
                data: {
                  email: email.toLowerCase(),
                  emailVerified: new Date(),
                  type: "PATIENT",
                  role: "ADMIN",
                  image: user.image,
                  patientProfile: {
                    create: {
                      firstName: encryptPatientRecord(safeName[0], symmetricKey),
                      lastName: encryptPatientRecord(safeName[1], symmetricKey),
                      imageUrl: user.image,
                      email: encryptPatientRecord(email, symmetricKey),
                      publicKey: encryptKey(publicKey, "patientPublicKey"),
                      privateKey: encryptKey(privateKey, "patientPrivateKey"),
                      symmetricKey: encryptKey(symmetricKey, "patientSymmetricKey"),
                    },
                  },
                  accounts: {
                    createMany: {
                      data: [
                        {
                          type: account.type,
                          provider: account.provider,
                          providerAccountId: account.providerAccountId,
                          refresh_token: account.refresh_token,
                          access_token: account.access_token,
                          expires_at: account.expires_at,
                          token_type: account.token_type,
                          scope: account.scope,
                          id_token: account.id_token,
                        },
                      ],
                    },
                  },
                },
              });
            },
            { timeout: 20000 },
          );
        } else if (existingUser.accountType === "CREDENTIALS") {
          throw new Error("Email is already being used through email & password sign in!");
        } else if (existingUser.scheduledToDelete) {
          await setScheduledToDelete("PATIENT", false, existingUser.id);
        }
      }
      // else if (user.forCode) {
      //   console.log("IN HERE");
      //   const existingCode = await getAccessPatientCode(user.code);
      //   if (!existingCode) return false;
      //   return true;
      // }
      // if (account?.provider !== "credentials") return true;
      else {
        const userPermissions = extractCurrentUserPermissions(user);
        let userId = user.id;
        if (userId.includes("_")) userId = userId.split("_")[0];
        const existingUser = await getUserById(userId);
        // Prevent sign in without email verification
        if (!existingUser?.emailVerified) {
          return false;
        }
        if (existingUser.isTwoFactorEnabled && userPermissions.hasAccount) {
          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

          if (!twoFactorConfirmation) {
            return false;
          }

          // Delete two factor confirmation for next sign in
          await prismadb.twoFactorConfirmation.delete({
            where: { id: twoFactorConfirmation.id },
          });
        }
      }

      return true;
    },
    async session({ token, session }) {
      // console.log(session);
      // console.log(token);
      if (token.sub && session.user) {
        session.user.id = token.sub.split("_")[0];
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.image = token.image as string;
        session.user.name = token.name;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.email = token.email;
        session.user.userType = token.userType;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.plan = token.plan as Plan;
      }

      if (token.customExpiresAt) {
        // console.log(token.customExpiresAt);
        session.expires = token.customExpiresAt as string;
      }
      if (token.tempToken) {
        session.tempToken = token.tempToken as string;
      }

      return session;
    },
    async jwt({ token }) {
      // console.log(token);
      if (!token.sub) return token;
      // console.log(token);
      let tokenSub = token.sub;
      let userId = tokenSub;
      let code: PatientProfileAccessCode | undefined | null = undefined;
      if (tokenSub.includes("_")) {
        userId = userId.split("_")[0];
        code = await getAccessPatientCodeById(tokenSub.split("_")[1]);
      }

      const existingUser = await getUserById(userId);

      if (!existingUser || code === null) return token;
      if (!!code && !!code.expires) {
        const expiresTime = new Date(code.expires).getTime();
        token.customExpiresAt = code.expires.toISOString();
        token.customExp = Math.round(expiresTime / 1000);
      }

      const existingAccount = await getAccountByUserId(existingUser.id);
      const existingSubscription = await getSubscriptionRigorous(userId);
      // console.log(existingSubscription);
      let plan = existingUser.type === "PATIENT" ? "PATIENT_FREE" : "PROVIDER_FREE";

      if (!!existingSubscription) {
        plan = existingSubscription.plan;
      }

      token.isOAuth = !!existingAccount;
      token.email = existingUser.email;
      token.name = existingUser.name;
      token.plan = plan;
      token.userType = existingUser.type;
      token.tempToken = code ? code.token : undefined;
      token.role = code ? code.accessType : existingUser.role;
      token.isTwoFactorEnabled = code ? false : existingUser.isTwoFactorEnabled;
      token.image = existingUser.image;
      return token;
    },
  },
  adapter: PrismaAdapter(prismadb),
  session: { strategy: "jwt", maxAge: 2 * 24 * 60 * 60 },
  ...authConfig,
});

export const auth2 = auth;
