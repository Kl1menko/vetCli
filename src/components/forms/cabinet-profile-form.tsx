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
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-fullName">Ім&apos;я та прізвище</Label>
        <Input
          id="profile-fullName"
          name="fullName"
          defaultValue={profile.fullName}
          placeholder="Олена Бойко"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">Так, як вас мають ідентифікувати адміністратори та лікарі клініки.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-phone">Телефон</Label>
        <Input id="profile-phone" name="phone" defaultValue={profile.phone ?? ""} placeholder="+380..." className="h-10" />
        <p className="text-xs text-muted-foreground">Номер для підтвердження записів і швидкого зв&apos;язку.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          name="email"
          type="email"
          defaultValue={profile.email ?? ""}
          placeholder="owner@ultravet.ua"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">На цю адресу можна надсилати документи та службові повідомлення.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-address">Адреса</Label>
        <Input
          id="profile-address"
          name="address"
          defaultValue={profile.address ?? ""}
          placeholder="Місто, вулиця, будинок"
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">Необов&apos;язково, але корисно для повної картки клієнта.</p>
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="profile-notes">Додаткова нотатка</Label>
        <Textarea
          id="profile-notes"
          name="notes"
          defaultValue={profile.notes ?? ""}
          placeholder="Зручний номер для зв'язку, коментар для клініки, уточнення по адресі"
          className="min-h-24"
        />
        <p className="text-xs text-muted-foreground">Можна вказати зручний спосіб зв&apos;язку або інші організаційні уточнення.</p>
      </div>

      <ActionFeedback
        error={state.error}
        success={state.success}
        errorTitle="Не вдалося зберегти зміни"
        successTitle="Збережено"
        className="md:col-span-2"
      />

      <div className="md:col-span-2">
        <Button type="submit" disabled={isPending} className="h-10 rounded-full px-5">
          Зберегти зміни
        </Button>
      </div>
    </form>
  );
}
