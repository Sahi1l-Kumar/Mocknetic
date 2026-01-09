import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { IAccountDoc } from "@/database/account.model";
import { IUserDoc } from "@/database/user.model";
import { api } from "@/lib/api";
import { SignInSchema } from "@/lib/validations";
import { ActionResponse } from "@/types/global";

declare module "next-auth" {
  interface User {
    role?: "student" | "teacher";
  }
  interface Session {
    user: User & {
      id: string;
      role?: "student" | "teacher";
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const { data: existingAccount } = (await api.accounts.getByProvider(
            email
          )) as ActionResponse<IAccountDoc>;

          if (!existingAccount) return null;

          const { data: existingUser } = (await api.users.getById(
            existingAccount.userId.toString()
          )) as ActionResponse<IUserDoc>;

          if (!existingUser) return null;

          const isValidPassword = await bcrypt.compare(
            password,
            existingAccount.password!
          );

          if (isValidPassword) {
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
              role: existingUser.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as "student" | "teacher";
      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        const { data: existingAccount, success } =
          (await api.accounts.getByProvider(
            account.type === "credentials"
              ? token.email!
              : account.providerAccountId
          )) as ActionResponse<IAccountDoc>;

        if (!success || !existingAccount) return token;

        const userId = existingAccount.userId;

        if (userId) {
          token.sub = userId.toString();

          const { data: existingUser } = (await api.users.getById(
            userId.toString()
          )) as ActionResponse<IUserDoc>;

          if (existingUser) {
            token.role = existingUser.role;
          }
        }
      }

      if (user && "role" in user && user.role) {
        token.role = user.role;
      }

      return token;
    },
    async signIn({ user, profile, account }) {
      if (account?.type === "credentials") return true;
      if (!account || !user) return false;

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image || "",
        username:
          account.provider === "github"
            ? (profile?.login as string)
            : user.email?.split("@")[0] || "user",
        role: "student" as const,
      };

      const { success } = (await api.auth.oAuthSignIn({
        user: userInfo,
        provider: account.provider as "google",
        providerAccountId: account.providerAccountId,
      })) as ActionResponse;

      if (!success) return false;

      return true;
    },
  },
});
