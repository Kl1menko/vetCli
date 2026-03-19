import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthForm } from "@/components/forms/auth-form";
import { createPageMetadata } from "@/lib/metadata";
import { roleHomePath } from "@/lib/permissions";

export const metadata: Metadata = createPageMetadata({
  title: "Вхід",
  description:
    "Увійдіть у кабінет власника тварини, панель лікаря або внутрішню систему клініки UltraVet.",
  path: "/login",
});

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.role) {
    redirect(roleHomePath(session.user.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7fbfb_0%,#ffffff_100%)] px-6 py-12">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">UltraVet</p>
          <h1 className="text-5xl leading-none tracking-tight">
            Вхід для клієнта, лікаря та команди клініки.
          </h1>
          <p className="max-w-lg text-lg leading-8 text-muted-foreground">
            Увійдіть, щоб керувати записами, переглядати історію візитів, аналізи, призначення та документи вашої тварини або робочі задачі клініки.
          </p>
          <p className="text-sm text-muted-foreground">
            Немає акаунта? <Link href="/register" className="font-semibold text-foreground">Створи кабінет</Link>
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
