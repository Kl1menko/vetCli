"use client";

import { useActionState } from "react";

import type { AdminActionState } from "@/server/actions/admin";
import { updateClientFormAction } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

type AdminClientUpdateFormProps = {
  client: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  };
};

export function AdminClientUpdateForm({ client }: AdminClientUpdateFormProps) {
  const [state, formAction, isPending] = useActionState(updateClientFormAction, initialState);

  useActionToast(state, {
    successTitle: "Клієнта оновлено",
    errorTitle: "Не вдалося оновити клієнта",
  });

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <input type="hidden" name="ownerProfileId" value={client.id} />
      <input type="hidden" name="userId" value={client.userId} />
      <div className="grid gap-1.5">
        <input name="fullName" defaultValue={client.fullName} placeholder="ПІБ" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Повне ім&apos;я власника в картці клієнта.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="email" defaultValue={client.email} placeholder="Email" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Email для входу й листування з клінікою.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="phone" defaultValue={client.phone} placeholder="Телефон" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Номер, на який телефонують щодо записів.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="address" defaultValue={client.address} placeholder="Адреса" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Необов&apos;язкове поле для повної картки клієнта.</p>
      </div>
      <div className="grid gap-1.5">
        <textarea name="notes" defaultValue={client.notes} placeholder="Нотатки" className="min-h-24 rounded-lg border border-input px-3 py-2" />
        <p className="text-xs text-muted-foreground">Службові нотатки, які бачить команда клініки.</p>
      </div>
      <ActionFeedback error={state.error} success={state.success} errorTitle="Не вдалося оновити клієнта" successTitle="Клієнта оновлено" />
      <Button type="submit" disabled={isPending}>{isPending ? "Зберігаю…" : "Зберегти зміни"}</Button>
    </form>
  );
}
