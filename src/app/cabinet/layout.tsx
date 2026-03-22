import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { cabinetNavigation } from "@/constants/navigation";
import { requireCabinetAccess } from "@/lib/auth/access";

export default async function CabinetLayout({ children }: { children: ReactNode }) {
  await requireCabinetAccess();

  return (
    <DashboardShell
      title="Мій кабінет"
      subtitle="Тварини, записи і документи в одному кабінеті."
      variant="client"
      density="compact"
      navigation={cabinetNavigation}
    >
      {children}
    </DashboardShell>
  );
}
