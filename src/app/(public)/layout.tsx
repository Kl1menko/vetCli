import type { ReactNode } from "react";

import { auth } from "@/auth";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { getClinicProfile } from "@/lib/clinic-settings";
import { roleHomePath } from "@/lib/permissions";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const clinicProfile = await getClinicProfile();
  const isAuthenticated = Boolean(session?.user);
  const accountHref = session?.user?.role ? roleHomePath(session.user.role) : "/login";

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader isAuthenticated={isAuthenticated} accountHref={accountHref} clinicProfile={clinicProfile} />
      {children}
      <PublicFooter clinicProfile={clinicProfile} />
    </div>
  );
}
