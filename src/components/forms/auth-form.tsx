"use client";

import Image from "next/image";
import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Stethoscope } from "lucide-react";

import { loginAction, registerOwnerAction, type AuthActionState } from "@/server/actions/auth";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClinicProfile } from "@/constants/site";
import { useActionToast } from "@/hooks/use-action-toast";

type AuthFormProps = {
  mode: "login" | "register";
  clinicProfile: ClinicProfile;
};

const initialState: AuthActionState = {};

export function AuthForm({ mode, clinicProfile }: AuthFormProps) {
  const action = mode === "login" ? loginAction : registerOwnerAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: mode === "login" ? "Вхід успішний" : "Кабінет створено",
    errorTitle: mode === "login" ? "Не вдалося увійти" : "Не вдалося створити кабінет",
  });

  return (
    <Card className="overflow-hidden border-[#d7e0f5] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(247,249,253,0.97)_100%)] shadow-[0_32px_90px_-56px_rgba(15,23,42,0.3)]">
      <CardHeader className="gap-3 border-b border-[#e7edf9] px-4 py-4 md:px-6 md:py-5">
        <div className="grid gap-4">
          <div className="grid justify-items-center gap-3 text-center">
            <Image
              src="/brand/logo.svg"
              alt={`${clinicProfile.name} logo`}
              width={70}
              height={70}
              className="h-14 w-auto object-contain md:h-[4.4rem]"
            />
            <div>
              <div className="text-[2.15rem] font-semibold leading-[0.9] tracking-[-0.07em] text-[#0f2a4f] md:text-[3.4rem]">
                Ultra<span className="text-[#1f57f2]">Vet</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{clinicProfile.city}</p>
            </div>
          </div>

          <div className="text-center">
            <CardTitle className="text-xl tracking-[-0.03em] text-[#0f2a4f] md:text-2xl">
              {mode === "login" ? "Вхід у кабінет" : "Створення кабінету"}
            </CardTitle>
            <CardDescription className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-600">
              {mode === "login"
                ? "Увійдіть, щоб переглядати записи, документи та історію візитів."
                : "Після реєстрації Ви зможете записувати тварин онлайн і бачити всю історію в одному місці."}
            </CardDescription>
          </div>
        </div>

        <div className="grid gap-2 pt-1 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-[0.95rem] border border-[#d8e1f5] bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(255,255,255,1)_100%)] px-3 py-2 text-[0.78rem] font-medium text-[#0f2a4f] shadow-[0_14px_24px_-24px_rgba(15,23,42,0.22)]">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e9f0ff] text-[#1f57f2]">
              <ShieldCheck className="size-3.5" />
            </div>
            <span>Захищений доступ</span>
          </div>
          <div className="flex items-center gap-2 rounded-[0.95rem] border border-[#d8e1f5] bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(255,255,255,1)_100%)] px-3 py-2 text-[0.78rem] font-medium text-[#0f2a4f] shadow-[0_14px_24px_-24px_rgba(15,23,42,0.22)]">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e9f0ff] text-[#1f57f2]">
              <Stethoscope className="size-3.5" />
            </div>
            <span>Візити й призначення</span>
          </div>
          <div className="flex items-center gap-2 rounded-[0.95rem] border border-[#d8e1f5] bg-[linear-gradient(180deg,rgba(246,249,255,0.96)_0%,rgba(255,255,255,1)_100%)] px-3 py-2 text-[0.78rem] font-medium text-[#0f2a4f] shadow-[0_14px_24px_-24px_rgba(15,23,42,0.22)]">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e9f0ff] text-[#1f57f2]">
              <CheckCircle2 className="size-3.5" />
            </div>
            <span>Зручно з телефона</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-4 md:px-6 md:py-5">
        <form action={formAction} className="flex flex-col gap-4">
          {mode === "register" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#0f2a4f]">Ім&rsquo;я та прізвище</Label>
              <Input id="fullName" name="fullName" placeholder="Олена Бойко" className="h-11 rounded-[1rem] border-[#d7e2fb]" />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-[#0f2a4f]">Email</Label>
            <Input id="email" name="email" type="email" placeholder="owner@example.com" className="h-11 rounded-[1rem] border-[#d7e2fb]" />
          </div>
          {mode === "register" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone" className="text-sm font-medium text-[#0f2a4f]">Телефон</Label>
              <Input id="phone" name="phone" placeholder="+380..." className="h-11 rounded-[1rem] border-[#d7e2fb]" />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-medium text-[#0f2a4f]">Пароль</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" className="h-11 rounded-[1rem] border-[#d7e2fb]" />
          </div>
          <ActionFeedback
            error={state.error}
            success={state.success}
            errorTitle={mode === "login" ? "Помилка входу" : "Помилка реєстрації"}
            successTitle={mode === "login" ? "Вхід успішний" : "Реєстрація успішна"}
          />
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-[1rem] bg-[linear-gradient(135deg,#1f57f2_0%,#184de2_100%)] text-sm shadow-[0_20px_38px_-22px_rgba(31,87,242,0.45)] hover:opacity-95"
          >
            {mode === "login" ? "Увійти" : "Створити акаунт"}
          </Button>

          <p className="text-center text-sm leading-6 text-slate-500">
            {mode === "login" ? "Ще немає кабінету?" : "Вже маєте кабінет?"}{" "}
            <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-[#0f2a4f] underline-offset-4 hover:underline">
              {mode === "login" ? "Зареєструватися" : "Увійти"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
