"use client";

import { useActionState } from "react";

import { useActionToast } from "@/hooks/use-action-toast";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

type SimpleActionState = {
  error?: string;
  success?: string;
};

type ActionButtonFormProps = {
  action: (state: SimpleActionState, formData: FormData) => Promise<SimpleActionState>;
  fields: Array<{ name: string; value: string }>;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  buttonClassName?: string;
  successTitle?: string;
  errorTitle?: string;
};

const initialState: SimpleActionState = {};

export function ActionButtonForm({
  action,
  fields,
  submitLabel,
  pendingLabel,
  variant = "default",
  size = "default",
  className,
  buttonClassName,
  successTitle = "Готово",
  errorTitle = "Не вдалося виконати дію",
}: ActionButtonFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useActionToast(state, {
    successTitle,
    errorTitle,
  });

  return (
    <form action={formAction} className={className}>
      {fields.map((field) => (
        <input key={`${field.name}:${field.value}`} type="hidden" name={field.name} value={field.value} />
      ))}
      <Button type="submit" variant={variant} size={size} className={buttonClassName} disabled={isPending}>
        {isPending ? pendingLabel ?? submitLabel : submitLabel}
      </Button>
      <ActionFeedback error={state.error} success={undefined} errorTitle={errorTitle} className="mt-3" />
    </form>
  );
}
