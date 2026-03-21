"use client";

import { useActionState } from "react";

import { createClientFormAction, type AdminActionState } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

export function AdminClientCreateForm() {
  const [state, formAction, isPending] = useActionState(createClientFormAction, initialState);

  useActionToast(state, {
    successTitle: "Клієнта створено",
    errorTitle: "Не вдалося створити клієнта",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-1.5">
        <input name="fullName" placeholder="ПІБ" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Повне ім&apos;я власника тварини.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="email" placeholder="Email" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">На цей email клієнт зможе входити в систему.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="phone" placeholder="Телефон" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Основний номер для підтверджень і нагадувань.</p>
      </div>
      <div className="grid gap-1.5">
        <input
          name="password"
          type="password"
          minLength={8}
          required
          placeholder="Тимчасовий пароль, мінімум 8 символів"
          className="h-10 rounded-lg border border-input px-3"
        />
        <p className="text-xs text-muted-foreground">Початковий пароль для першого входу клієнта.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="address" placeholder="Адреса" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Місто, вулиця, будинок або інша зручна адреса.</p>
      </div>
      <div className="grid gap-1.5">
        <textarea name="notes" placeholder="Нотатки" className="min-h-24 rounded-lg border border-input px-3 py-2" />
        <p className="text-xs text-muted-foreground">Внутрішні примітки для адміністраторів клініки.</p>
      </div>

      <ActionFeedback
        error={state.error}
        success={state.success}
        errorTitle="Не вдалося створити клієнта"
        successTitle="Клієнта створено"
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Створюю клієнта…" : "Створити клієнта"}
      </Button>
    </form>
  );
}
