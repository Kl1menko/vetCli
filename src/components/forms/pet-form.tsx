"use client";

import { useActionState } from "react";

import type { Pet } from "@prisma/client";

import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { CabinetActionState } from "@/server/actions/cabinet";

type PetFormProps = {
  action: (
    state: CabinetActionState,
    formData: FormData,
  ) => Promise<CabinetActionState>;
  mode: "create" | "update";
  pet?: Pick<
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
  submitLabel: string;
};

const initialState: CabinetActionState = {};

export function PetForm({ action, mode, pet, submitLabel }: PetFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  useActionToast(state, {
    successTitle: mode === "create" ? "Тварину додано" : "Картку оновлено",
    errorTitle: mode === "create" ? "Не вдалося додати тварину" : "Не вдалося оновити картку",
  });

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      {mode === "update" && pet ? <input type="hidden" name="petId" value={pet.id} /> : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-name`}>Ім&rsquo;я</Label>
        <Input id={`${mode}-name`} name="name" defaultValue={pet?.name ?? ""} placeholder="Мія" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-species`}>Вид тварини</Label>
        <Input id={`${mode}-species`} name="species" defaultValue={pet?.species ?? ""} placeholder="Кішка" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-breed`}>Порода</Label>
        <Input id={`${mode}-breed`} name="breed" defaultValue={pet?.breed ?? ""} placeholder="Британська короткошерста" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-sex`}>Стать</Label>
        <select
          id={`${mode}-sex`}
          name="sex"
          defaultValue={pet?.sex ?? "UNKNOWN"}
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="UNKNOWN">Невідомо</option>
          <option value="MALE">Самець</option>
          <option value="FEMALE">Самка</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-birthDate`}>Дата народження</Label>
        <Input
          id={`${mode}-birthDate`}
          name="birthDate"
          type="date"
          defaultValue={pet?.birthDate ? new Date(pet.birthDate).toISOString().slice(0, 10) : ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-weight`}>Вага, кг</Label>
        <Input
          id={`${mode}-weight`}
          name="weight"
          type="number"
          step="0.1"
          min="0"
          defaultValue={pet?.weight?.toString() ?? ""}
          placeholder="4.8"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-color`}>Колір</Label>
        <Input id={`${mode}-color`} name="color" defaultValue={pet?.color ?? ""} placeholder="Сірий" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-microchip`}>Номер мікрочипа</Label>
        <Input
          id={`${mode}-microchip`}
          name="microchipNumber"
          defaultValue={pet?.microchipNumber ?? ""}
          placeholder="ULTRA-MIA-001"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3 text-sm md:col-span-2">
        <input
          type="checkbox"
          name="isSterilized"
          defaultChecked={pet?.isSterilized ?? false}
          className="size-4 rounded border border-input"
        />
        Стерилізована / кастрована
      </label>

      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor={`${mode}-allergies`}>Алергії</Label>
        <Textarea
          id={`${mode}-allergies`}
          name="allergies"
          defaultValue={pet?.allergies ?? ""}
          placeholder="Кормові алергії, реакції на препарати"
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor={`${mode}-chronic`}>Хронічні стани</Label>
        <Textarea
          id={`${mode}-chronic`}
          name="chronicConditions"
          defaultValue={pet?.chronicConditions ?? ""}
          placeholder="Хронічний гастрит, контроль нирок"
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor={`${mode}-notes`}>Нотатки</Label>
        <Textarea
          id={`${mode}-notes`}
          name="notes"
          defaultValue={pet?.notes ?? ""}
          placeholder="Поводиться спокійно, потрібен м'який підхід на огляді"
        />
      </div>

      <ActionFeedback
        error={state.error}
        success={state.success}
        errorTitle="Не вдалося зберегти дані"
        successTitle="Збережено"
        className="md:col-span-2"
      />

      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
