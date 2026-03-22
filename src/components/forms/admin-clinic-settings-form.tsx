"use client";

import { useActionState } from "react";

import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import type { AdminActionState } from "@/server/actions/admin";

type ClinicSettingsFormValues = {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  closedDay: string;
};

type AdminClinicSettingsFormProps = {
  action: (
    state: AdminActionState,
    formData: FormData,
  ) => Promise<AdminActionState>;
  settings: ClinicSettingsFormValues;
};

const initialState: AdminActionState = {};

export function AdminClinicSettingsForm({ action, settings }: AdminClinicSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formKey = JSON.stringify(settings);

  useActionToast(state, {
    successTitle: "Налаштування збережено",
    errorTitle: "Не вдалося зберегти налаштування",
  });

  return (
    <form key={formKey} action={formAction} className="grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clinic-settings-name">Назва клініки</Label>
        <Input id="clinic-settings-name" name="name" defaultValue={settings.name} className="h-10" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clinic-settings-city">Місто</Label>
        <Input id="clinic-settings-city" name="city" defaultValue={settings.city} className="h-10" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clinic-settings-address">Адреса</Label>
        <Input id="clinic-settings-address" name="address" defaultValue={settings.address} className="h-10" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clinic-settings-phone">Телефон</Label>
        <Input id="clinic-settings-phone" name="phone" defaultValue={settings.phone} className="h-10" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clinic-settings-email">Email</Label>
        <Input id="clinic-settings-email" name="email" type="email" defaultValue={settings.email} className="h-10" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clinic-settings-hours">Години роботи</Label>
        <Input id="clinic-settings-hours" name="hours" defaultValue={settings.hours} className="h-10" />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label htmlFor="clinic-settings-closedDay">Вихідний / спецрежим</Label>
        <Input id="clinic-settings-closedDay" name="closedDay" defaultValue={settings.closedDay} className="h-10" />
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
          {isPending ? "Зберігаю…" : "Зберегти налаштування"}
        </Button>
      </div>
    </form>
  );
}
