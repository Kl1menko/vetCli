"use client";

import { useActionState } from "react";

import type { AdminActionState } from "@/server/actions/admin";
import { updateServiceFormAction } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

type AdminServiceUpdateFormProps = {
  service: {
    id: string;
    name: string;
    slug: string;
    category: string;
    durationMinutes: number;
    price: number;
    description: string;
    isActive: boolean;
    isOnlineBookable: boolean;
  };
};

export function AdminServiceUpdateForm({ service }: AdminServiceUpdateFormProps) {
  const [state, formAction, isPending] = useActionState(updateServiceFormAction, initialState);

  useActionToast(state, {
    successTitle: "Послугу оновлено",
    errorTitle: "Не вдалося оновити послугу",
  });

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <input type="hidden" name="serviceId" value={service.id} />
      <input name="name" defaultValue={service.name} className="h-10 rounded-lg border border-input px-3" />
      <input name="slug" defaultValue={service.slug} className="h-10 rounded-lg border border-input px-3" />
      <input name="category" defaultValue={service.category} className="h-10 rounded-lg border border-input px-3" />
      <input name="durationMinutes" defaultValue={service.durationMinutes} className="h-10 rounded-lg border border-input px-3" />
      <input name="price" defaultValue={service.price} className="h-10 rounded-lg border border-input px-3" />
      <textarea name="description" defaultValue={service.description} className="min-h-24 rounded-lg border border-input px-3 py-2" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={service.isActive} />
        Активна послуга
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isOnlineBookable" defaultChecked={service.isOnlineBookable} />
        Доступна для онлайн-запису
      </label>
      <ActionFeedback error={state.error} success={state.success} errorTitle="Не вдалося оновити послугу" successTitle="Послугу оновлено" />
      <Button type="submit" disabled={isPending}>{isPending ? "Зберігаю…" : "Зберегти зміни"}</Button>
    </form>
  );
}
