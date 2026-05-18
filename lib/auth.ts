import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { env, isAuthConfigured } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  secret: env.nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  providers: isAuthConfigured()
    ? [
        GitHubProvider({
          clientId: env.githubId as string,
          clientSecret: env.githubSecret as string,
        }),
      ]
    : [],
  callbacks: {
    async signIn({ profile, user }) {
      if (!isAuthConfigured()) {
        return false;
      }

      const githubProfile = profile as { login?: string } | undefined;
      const login =
        typeof githubProfile?.login === "string"
          ? githubProfile.login.toLowerCase()
          : typeof user?.name === "string"
            ? user.name.toLowerCase()
            : "";

      return env.adminGithubLogins.includes(login);
    },
    async session({ session, token }) {
      if (session.user && typeof token.name === "string") {
        session.user.name = token.name;
      }

      return session;
    },
  },
};
