"use client";

import { useActionState } from "react";

import type { OwnerProfile } from "@prisma/client";

import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { CabinetActionState } from "@/server/actions/cabinet";

type CabinetProfileFormProps = {
  action: (
    state: CabinetActionState,
    formData: FormData,
  ) => Promise<CabinetActionState>;
  profile: Pick<OwnerProfile, "fullName" | "phone" | "email" | "address" | "notes">;
};

const initialState: CabinetActionState = {};

export function CabinetProfileForm({ action, profile }: CabinetProfileFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useActionToast(state, {
    successTitle: "Профіль оновлено",
    errorTitle: "Не вдалося оновити профіль",
  });

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-fullName">Ім&apos;я та прізвище</Label>
        <Input id="profile-fullName" name="fullName" defaultValue={profile.fullName} placeholder="Олена Бойко" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-phone">Телефон</Label>
        <Input id="profile-phone" name="phone" defaultValue={profile.phone ?? ""} placeholder="+380..." />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" name="email" type="email" defaultValue={profile.email ?? ""} placeholder="owner@ultravet.ua" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-address">Адреса</Label>
        <Input id="profile-address" name="address" defaultValue={profile.address ?? ""} placeholder="Місто, вулиця, будинок" />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="profile-notes">Додаткова нотатка</Label>
        <Textarea
          id="profile-notes"
          name="notes"
          defaultValue={profile.notes ?? ""}
          placeholder="Зручний номер для зв'язку, коментар для клініки, уточнення по адресі"
        />
      </div>

      <ActionFeedback
        error={state.error}
        success={state.success}
        errorTitle="Не вдалося зберегти зміни"
        successTitle="Збережено"
        className="md:col-span-2"
      />

      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending}>
          Зберегти зміни
        </Button>
      </div>
    </form>
  );
}
