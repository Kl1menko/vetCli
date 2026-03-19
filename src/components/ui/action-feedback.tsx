import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ActionFeedbackProps = {
  error?: string;
  success?: string;
  errorTitle?: string;
  successTitle?: string;
  className?: string;
};

export function ActionFeedback({
  error,
  success,
  errorTitle = "Не вдалося завершити дію",
  successTitle = "Готово",
  className,
}: ActionFeedbackProps) {
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert className={className}>
        <AlertTitle>{successTitle}</AlertTitle>
        <AlertDescription>{success}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
