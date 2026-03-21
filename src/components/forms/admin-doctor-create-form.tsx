"use client";

import { useActionState } from "react";

import { createDoctorFormAction, type AdminActionState } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

export function AdminDoctorCreateForm() {
  const [state, formAction, isPending] = useActionState(createDoctorFormAction, initialState);

  useActionToast(state, {
    successTitle: "Лікаря створено",
    errorTitle: "Не вдалося створити лікаря",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-1.5">
        <input name="fullName" placeholder="ПІБ" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Повне ім&apos;я лікаря для профілю, розкладу і записів.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="email" placeholder="Email" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Робочий email для входу в кабінет лікаря.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="password" placeholder="Тимчасовий пароль" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Мінімум 8 символів. Це стартовий пароль для першого входу.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="specialization" placeholder="Спеціалізація" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Наприклад: терапевт, хірург, дерматолог.</p>
      </div>
      <div className="grid gap-1.5">
        <textarea name="bio" placeholder="Коротке біо" className="min-h-24 rounded-lg border border-input px-3 py-2" />
        <p className="text-xs text-muted-foreground">Короткий опис досвіду або професійного профілю лікаря.</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked />
        Активний лікар
      </label>

      <ActionFeedback
        error={state.error}
        success={state.success}
        errorTitle="Не вдалося створити лікаря"
        successTitle="Лікаря створено"
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Створюю лікаря…" : "Створити лікаря"}
      </Button>
    </form>
  );
}
