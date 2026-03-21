"use client";

import { ActionButtonForm } from "@/components/forms/action-button-form";
import { PetForm } from "@/components/forms/pet-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Pet } from "@prisma/client";
import type { CabinetActionState } from "@/server/actions/cabinet";

export function EditPetDialog({
  pet,
  updateAction,
  deleteAction,
}: {
  pet: Pick<
    Pet,
    | "id"
    | "name"
    | "species"
    | "breed"
    | "sex"
    | "birthDate"
    | "weight"
    | "color"
    | "microchipNumber"
    | "isSterilized"
    | "allergies"
    | "chronicConditions"
    | "notes"
  >;
  updateAction: (
    state: CabinetActionState,
    formData: FormData,
  ) => Promise<CabinetActionState>;
  deleteAction: (
    state: CabinetActionState,
    formData: FormData,
  ) => Promise<CabinetActionState>;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 w-full rounded-full border-slate-300/90 bg-white/90 px-4 text-slate-800 hover:border-slate-400 hover:bg-white sm:h-11 sm:min-w-[148px] sm:px-5"
          />
        }
      >
        Редагувати
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-[1.75rem] border-[#d7e0ea] bg-[linear-gradient(180deg,#f9fbfd_0%,#f2f6fa_100%)] p-5 sm:max-w-3xl md:p-6">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-xl font-semibold text-slate-950">Редагувати картку тварини</DialogTitle>
          <DialogDescription className="leading-6 text-slate-600">
            Оновіть дані тварини, медичні позначки або архівуйте картку, якщо вона більше не потрібна в активному списку.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-[1.35rem] border border-white/80 bg-white/70 p-4">
          <PetForm action={updateAction} mode="update" pet={pet} submitLabel="Зберегти зміни" />
          <ActionButtonForm
            action={deleteAction}
            fields={[{ name: "petId", value: pet.id }]}
            submitLabel="Архівувати тварину"
            pendingLabel="Архівую…"
            variant="ghost"
            size="sm"
            className="mt-4"
            buttonClassName="text-sm font-medium text-destructive transition-opacity hover:opacity-80"
            successTitle="Тварину архівовано"
            errorTitle="Не вдалося архівувати тварину"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
