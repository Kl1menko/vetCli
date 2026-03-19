import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavigation } from "@/constants/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell
      title="Кабінет адміністратора"
      subtitle="Тут можна керувати записами, графіком лікарів і базою клініки без плутанини в робочих процесах."
      variant="admin"
      navigation={adminNavigation}
    >
      {children}
    </DashboardShell>
  );
}
