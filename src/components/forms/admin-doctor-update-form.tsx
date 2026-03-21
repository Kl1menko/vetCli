"use client";

import { useActionState } from "react";

import type { AdminActionState } from "@/server/actions/admin";
import { updateDoctorFormAction } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

type AdminDoctorUpdateFormProps = {
  doctor: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    specialization: string;
    bio: string;
    isActive: boolean;
  };
};

export function AdminDoctorUpdateForm({ doctor }: AdminDoctorUpdateFormProps) {
  const [state, formAction, isPending] = useActionState(updateDoctorFormAction, initialState);

  useActionToast(state, {
    successTitle: "Лікаря оновлено",
    errorTitle: "Не вдалося оновити лікаря",
  });

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <input type="hidden" name="doctorId" value={doctor.id} />
      <input type="hidden" name="userId" value={doctor.userId} />
      <div className="grid gap-1.5">
        <input name="fullName" defaultValue={doctor.fullName} className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">ПІБ, який бачать адміністратори, клієнти і сам лікар.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="email" defaultValue={doctor.email} className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Email використовується для авторизації в системі.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="specialization" defaultValue={doctor.specialization} className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Основний напрям роботи лікаря.</p>
      </div>
      <div className="grid gap-1.5">
        <textarea name="bio" defaultValue={doctor.bio} className="min-h-24 rounded-lg border border-input px-3 py-2" />
        <p className="text-xs text-muted-foreground">Коротка професійна довідка або публічний опис.</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={doctor.isActive} />
        Активний лікар
      </label>
      <ActionFeedback error={state.error} success={state.success} errorTitle="Не вдалося оновити лікаря" successTitle="Лікаря оновлено" />
      <Button type="submit" disabled={isPending}>{isPending ? "Зберігаю…" : "Зберегти зміни"}</Button>
    </form>
  );
}
