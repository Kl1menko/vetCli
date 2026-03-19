import type { Metadata } from "next";
import Link from "next/link";
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
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fbfe_0%,#ffffff_100%)] px-6 py-12">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Реєстрація</p>
          <h1 className="text-5xl leading-none tracking-tight">
            Особистий кабінет власника тварини.
          </h1>
          <p className="max-w-lg text-lg leading-8 text-muted-foreground">
            Після реєстрації ви зможете додати профілі тварин, записуватися на прийом онлайн, переглядати призначення, аналізи та рахунки після візиту.
          </p>
          <p className="text-sm text-muted-foreground">
            Уже є акаунт? <Link href="/login" className="font-semibold text-foreground">Увійти</Link>
          </p>
        </div>
        <AuthForm mode="register" />
      </div>
    </main>
  );
}
