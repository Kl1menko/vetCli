import type { UserRole } from "@/types/domain";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      phone?: string | null;
    } & NonNullable<DefaultSession["user"]>;
  }

  interface User {
    role: UserRole;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    phone?: string | null;
  }
}
