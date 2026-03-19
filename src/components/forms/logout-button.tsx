import { LogOut } from "lucide-react";

import { logoutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function LogoutButton({
  className,
  variant = "outline",
}: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant={variant} className={cn(className)}>
        Вийти
        <LogOut data-icon="inline-end" />
      </Button>
    </form>
  );
}
