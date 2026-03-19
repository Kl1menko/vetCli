"use client";

import { useEffect, useRef } from "react";

import { toast } from "@/components/ui/toast";

type ActionToastState = {
  error?: string;
  success?: string;
};

type ActionToastOptions = {
  successTitle?: string;
  errorTitle?: string;
};

export function useActionToast(
  state: ActionToastState,
  {
    successTitle = "Готово",
    errorTitle = "Сталася помилка",
  }: ActionToastOptions = {},
) {
  const previousError = useRef<string | undefined>(undefined);
  const previousSuccess = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.error && state.error !== previousError.current) {
      toast({
        variant: "error",
        title: errorTitle,
        description: state.error,
      });
    }

    previousError.current = state.error;
  }, [errorTitle, state.error]);

  useEffect(() => {
    if (state.success && state.success !== previousSuccess.current) {
      toast({
        variant: "success",
        title: successTitle,
        description: state.success,
      });
    }

    previousSuccess.current = state.success;
  }, [state.success, successTitle]);
}
