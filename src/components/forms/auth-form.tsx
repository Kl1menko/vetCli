"use client";

import { useActionState } from "react";

import { loginAction, registerOwnerAction, type AuthActionState } from "@/server/actions/auth";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";

type AuthFormProps = {
  mode: "login" | "register";
};

const initialState: AuthActionState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? loginAction : registerOwnerAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: mode === "login" ? "Вхід успішний" : "Кабінет створено",
    errorTitle: mode === "login" ? "Не вдалося увійти" : "Не вдалося створити кабінет",
  });

  return (
    <Card className="border-border/60 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.35)]">
      <CardHeader className="gap-3">
        <CardTitle>{mode === "login" ? "Вхід у систему" : "Створення кабінету"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Увійди, щоб керувати записами, тваринами й документами."
            : "Після реєстрації створюється профіль клієнта та доступ до кабінету."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-5">
          {mode === "register" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Ім&rsquo;я та прізвище</Label>
              <Input id="fullName" name="fullName" placeholder="Олена Бойко" />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="owner@example.com" />
          </div>
          {mode === "register" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" name="phone" placeholder="+380..." />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" />
          </div>
          <ActionFeedback
            error={state.error}
            success={state.success}
            errorTitle={mode === "login" ? "Помилка входу" : "Помилка реєстрації"}
            successTitle={mode === "login" ? "Вхід успішний" : "Реєстрація успішна"}
          />
          <Button type="submit" disabled={isPending}>
            {mode === "login" ? "Увійти" : "Створити акаунт"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
