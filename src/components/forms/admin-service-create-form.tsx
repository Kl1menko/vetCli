"use client";

import { useActionState } from "react";

import { createServiceFormAction, type AdminActionState } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

export function AdminServiceCreateForm() {
  const [state, formAction, isPending] = useActionState(createServiceFormAction, initialState);

  useActionToast(state, {
    successTitle: "Послугу створено",
    errorTitle: "Не вдалося створити послугу",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-1.5">
        <input name="name" placeholder="Назва" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Назва, яку бачитимуть адміністратори та клієнти.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="slug" placeholder="Системна назва для URL" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Латиницею, без пробілів. Наприклад: annual-checkup.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="category" placeholder="Категорія українською або slug напряму" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Група послуги для каталогу й фільтрів.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="durationMinutes" placeholder="Тривалість (хв)" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Скільки хвилин має тривати один прийом.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="price" placeholder="Ціна" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Вартість у гривнях без тексту валюти.</p>
      </div>
      <div className="grid gap-1.5">
        <textarea name="description" placeholder="Опис послуги" className="min-h-24 rounded-lg border border-input px-3 py-2" />
        <p className="text-xs text-muted-foreground">Коротко поясніть, що входить у послугу і коли вона потрібна.</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked />
        Активна послуга
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isOnlineBookable" defaultChecked />
        Доступна для онлайн-запису
      </label>

      <ActionFeedback
        error={state.error}
        success={state.success}
        errorTitle="Не вдалося створити послугу"
        successTitle="Послугу створено"
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Створюю послугу…" : "Створити послугу"}
      </Button>
    </form>
  );
}
