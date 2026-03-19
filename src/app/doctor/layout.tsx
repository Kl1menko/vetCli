import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { doctorNavigation } from "@/constants/navigation";

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      title="Робочий кабінет лікаря"
      subtitle="Тут під рукою розклад, пацієнти й записи по прийомах, щоб вести день без зайвих перемикань."
      variant="doctor"
      navigation={doctorNavigation}
    >
      {children}
    </DashboardShell>
  );
}
