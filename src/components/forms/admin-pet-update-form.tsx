"use client";

import { useActionState } from "react";

import type { AdminActionState } from "@/server/actions/admin";
import { updatePetFormAction } from "@/server/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

const initialState: AdminActionState = {};

type AdminPetUpdateFormProps = {
  pet: {
    id: string;
    ownerId: string;
    name: string;
    species: string;
    breed: string;
    microchipNumber: string;
    notes: string;
  };
  owners: Array<{ id: string; fullName: string }>;
};

export function AdminPetUpdateForm({ pet, owners }: AdminPetUpdateFormProps) {
  const [state, formAction, isPending] = useActionState(updatePetFormAction, initialState);

  useActionToast(state, {
    successTitle: "Картку тварини оновлено",
    errorTitle: "Не вдалося оновити тварину",
  });

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <input type="hidden" name="petId" value={pet.id} />
      <div className="grid gap-1.5">
        <select name="ownerId" defaultValue={pet.ownerId} className="h-10 rounded-lg border border-input px-3">
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.fullName}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">За потреби можна переприв&apos;язати картку до іншого власника.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="name" defaultValue={pet.name} className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Основне ім&apos;я пацієнта в системі.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="species" defaultValue={pet.species} className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Вид тварини для картки і медичних записів.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="breed" defaultValue={pet.breed} className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Порода або лінія, якщо вона відома.</p>
      </div>
      <div className="grid gap-1.5">
        <input name="microchipNumber" defaultValue={pet.microchipNumber} className="h-10 rounded-lg border border-input px-3" />
        <p className="text-xs text-muted-foreground">Номер для ідентифікації тварини поза клінікою.</p>
      </div>
      <div className="grid gap-1.5">
        <textarea name="notes" defaultValue={pet.notes} className="min-h-24 rounded-lg border border-input px-3 py-2" />
        <p className="text-xs text-muted-foreground">Службові уточнення, які варто бачити команді клініки.</p>
      </div>
      <ActionFeedback error={state.error} success={state.success} errorTitle="Не вдалося оновити тварину" successTitle="Картку тварини оновлено" />
      <Button type="submit" disabled={isPending}>{isPending ? "Зберігаю…" : "Зберегти зміни"}</Button>
    </form>
  );
}
