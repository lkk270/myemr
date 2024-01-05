import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { generateAsymmetricKeyPairs, generateSymmetricKey, encryptKey, encryptPatientRecord } from "@/lib/encryption";
import prismadb from "@/lib/prismadb";
import authConfig from "./auth.config";
import { getUserById } from "@/auth/data/user";
import { getTwoFactorConfirmationByUserId } from "@/auth/data/two-factor-confirmation";
import { getAccountByUserId } from "@/auth/data/account";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  update,
} = NextAuth({
  pages: {
    signIn: "/auth/base-login", //something goes wrong it redirects to this page
    error: "/auth/error", //if something else goes wrong it redirects to this page
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
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider === "google") {
        const existingUser = await getUserById(user.id);
        if (!existingUser) {
          const { publicKey, privateKey } = generateAsymmetricKeyPairs();
          const symmetricKey = generateSymmetricKey();
          const safeName = (user.name + " ").split(" ");
          const email = user.email;
          if (!email) return false;
          await prismadb.$transaction([
            prismadb.user.create({
              data: {
                email: user.email?.toLowerCase(),
                emailVerified: new Date(),
                type: "PATIENT",
                role: "ADMIN",
                image: user.image,
                patientProfile: {
                  create: {
                    firstName: encryptPatientRecord(safeName[0], symmetricKey),
                    lastName: encryptPatientRecord(safeName[1], symmetricKey),
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
            }),
          ]);
        }
      }
      // if (account?.provider !== "credentials") return true;
      else {
        const existingUser = await getUserById(user.id);

        // Prevent sign in without email verification
        if (!existingUser?.emailVerified) return false;

        if (existingUser.isTwoFactorEnabled) {
          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

          if (!twoFactorConfirmation) return false;

          // Delete two factor confirmation for next sign in
          await prismadb.twoFactorConfirmation.delete({
            where: { id: twoFactorConfirmation.id },
          });
        }
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.email = token.email;
        session.user.userType = token.userType;
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.email = existingUser.email;
      token.userType = existingUser.type;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },
    // async signOut() {},
  },
  adapter: PrismaAdapter(prismadb),
  session: { strategy: "jwt", maxAge: 2 * 24 * 60 * 60 },
  ...authConfig,
});

export const auth2 = auth;