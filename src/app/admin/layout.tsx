import type { ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { adminNavigation } from "@/constants/navigation";
import { requireAdminAccess } from "@/lib/auth/access";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminAccess();

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
