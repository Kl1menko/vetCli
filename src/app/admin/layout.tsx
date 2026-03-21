import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavigation } from "@/constants/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      title="Кабінет адміністратора"
      subtitle="Записи, графік лікарів і база клініки."
      variant="admin"
      navigation={adminNavigation}
    >
      {children}
    </DashboardShell>
  );
}
