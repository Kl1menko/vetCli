"use client";

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
import type { CabinetActionState } from "@/server/actions/cabinet";

export function AddPetDialog({
  action,
}: {
  action: (
    state: CabinetActionState,
    formData: FormData,
  ) => Promise<CabinetActionState>;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" className="h-10 w-full rounded-full px-5 sm:h-8 sm:w-auto" />
        }
      >
        Додати тварину
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-[1.75rem] border-[#d7e0ea] bg-[linear-gradient(180deg,#f9fbfd_0%,#f2f6fa_100%)] p-5 sm:max-w-3xl md:p-6">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-xl font-semibold text-slate-950">Нова тварина</DialogTitle>
          <DialogDescription className="leading-6 text-slate-600">
            Заповніть картку тварини, щоб далі записувати її на прийом і вести історію в кабінеті.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-[1.35rem] border border-white/80 bg-white/70 p-4">
          <PetForm action={action} mode="create" submitLabel="Додати тварину" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
