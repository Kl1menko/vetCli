import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthForm } from "@/components/forms/auth-form";
import { createPageMetadata } from "@/lib/metadata";
import { roleHomePath } from "@/lib/permissions";

export const metadata: Metadata = createPageMetadata({
  title: "Реєстрація",
  description:
    "Створіть кабінет власника тварини в UltraVet, щоб бронювати прийоми онлайн і зберігати історію візитів та документи в одному місці.",
  path: "/register",
});

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user?.role) {
    redirect(roleHomePath(session.user.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#edf3ff_0%,#f5f7fb_52%,#ffffff_100%)] px-4 py-6 md:px-6 md:py-10">
      <div className="w-full max-w-[38rem]">
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
