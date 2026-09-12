import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email or Login ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const identifier = credentials.email.trim();

        const admin = await prisma.adminUser.findFirst({
          where: {
            active: true,
            OR: [{ email: identifier }, { loginId: identifier }],
          },
        });

        if (!admin) return null;

        const valid = await verifyPassword(
          credentials.password,
          admin.password,
        );
        if (!valid) return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          // customRole overrides the enum role for permission checks
          customRole: admin.customRole ?? null,
          userType: "admin" as const,
        };
      },
    }),
    CredentialsProvider({
      id: "user-credentials",
      name: "User Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.active || user.deletedAt) return null;

        // Check lockout
        if (user.loginLockedUntil && user.loginLockedUntil > new Date()) return null;

        const valid = await verifyPassword(credentials.password, user.password);

        if (!valid) {
          const fails = (user.loginFailCount ?? 0) + 1;
          const locked = fails >= 5;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginFailCount: fails,
              loginLockedUntil: locked ? new Date(Date.now() + 15 * 60 * 1000) : null,
            },
          });
          return null;
        }

        // Reset fail count on success
        await prisma.user.update({
          where: { id: user.id },
          data: { loginFailCount: 0, loginLockedUntil: null, lastLoginAt: new Date() },
        });

        if (!user.emailVerified) {
          return { id: user.id, email: user.email, name: user.fullName, userType: "user" as const, emailVerified: false };
        }
        return { id: user.id, email: user.email, name: user.fullName, userType: "user" as const, emailVerified: true };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.customRole = (user as any).customRole ?? null;
        token.userType = user.userType;
        token.emailVerified =
          typeof user.emailVerified === "boolean"
            ? user.emailVerified
            : !!user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.customRole = (token.customRole as string | null) ?? null;
        session.user.userType = (token.userType as string) || "admin";
        session.user.emailVerified = token.emailVerified as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
};
