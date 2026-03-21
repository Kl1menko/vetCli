"use client";

import { useActionState } from "react";

import { createPetFormAction, type AdminActionState } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

type AdminPetCreateFormProps = {
  owners: Array<{ id: string; fullName: string }>;
};

export function AdminPetCreateForm({ owners }: AdminPetCreateFormProps) {
  const [state, formAction, isPending] = useActionState(createPetFormAction, initialState);

  useActionToast(state, {
    successTitle: "Тварину додано",
    errorTitle: "Не вдалося додати тварину",
  });

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-1.5">
        <select name="ownerId" className="h-10 rounded-lg border border-input px-3">
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.fullName}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Оберіть власника, до якого буде прив&apos;язана картка тварини.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="name" placeholder="Ім'я тварини" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Ім&apos;я, яке буде видно в записах, візитах і кабінеті клієнта.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="species" placeholder="Вид" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Наприклад: собака, кішка, гризун або птах.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="breed" placeholder="Порода" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Якщо невідома, поле можна залишити порожнім.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="microchipNumber" placeholder="Номер чипа" className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Вкажіть номер мікрочипа, якщо він уже зареєстрований.</p>
      </div>
      <div className="grid gap-1.5">
        <textarea name="notes" placeholder="Нотатки" className="min-h-24 rounded-lg border border-input px-3 py-2" />
        <p className="text-xs text-muted-foreground">Короткі службові примітки: поведінка, особливості, важливий контекст.</p>
      </div>

      <ActionFeedback
        error={state.error}
        success={state.success}
        errorTitle="Не вдалося додати тварину"
        successTitle="Тварину додано"
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Додаю тварину…" : "Додати тварину"}
      </Button>
    </form>
  );
}
