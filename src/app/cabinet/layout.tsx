import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { cabinetNavigation } from "@/constants/navigation";

export default function CabinetLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      title="Мій кабінет"
      subtitle="Усе важливе по тваринах, записах і документах зібрано тут, щоб не шукати по різних сторінках."
      variant="client"
      density="compact"
      navigation={cabinetNavigation}
    >
      {children}
    </DashboardShell>
  );
}
