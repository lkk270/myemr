import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { AccessPatientWithCodeSchema, LoginSchema } from "@/auth/schemas";
import { getUserFromAccessPatientCode, getUserByEmail } from "./auth/data";
import GoogleProvider from "@auth/core/providers/google";

export default {
  providers: [
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // async profile(profile) {
      //   return {
      //     userId: profile.id,
      //     email: profile.email,
      //   };
      // },
    }),

    Credentials({
      async authorize(credentials: any) {
        if (!!credentials.code && !credentials.email) {
          const validatedFields = AccessPatientWithCodeSchema.safeParse(credentials);
          if (validatedFields.success) {
            const { code } = validatedFields.data;
            const user = await getUserFromAccessPatientCode(code);
            if (!!user) return user;
            else {
              return null;
            }
          }

          return null;
        } else {
          const validatedFields = LoginSchema.safeParse(credentials);
          if (validatedFields.success) {
            const { email, password, userType } = validatedFields.data;
            const user = await getUserByEmail(email, userType);

            if (!user || !user.password) return null;

            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (passwordsMatch) return user;
          }

          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
