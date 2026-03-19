import NextAuth from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      const userRole = session?.user?.role;

      if (pathname.startsWith("/admin")) {
        return userRole === "ADMIN" || userRole === "SUPERADMIN";
      }

      if (pathname.startsWith("/doctor")) {
        return userRole === "DOCTOR" || userRole === "SUPERADMIN";
      }

      if (pathname.startsWith("/cabinet")) {
        return userRole === "CLIENT" || userRole === "SUPERADMIN";
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as typeof session.user.role | undefined) ?? "CLIENT";
        session.user.phone = (token.phone as string | null | undefined) ?? null;
      }

      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});
