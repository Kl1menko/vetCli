import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthForm } from "@/components/forms/auth-form";
import { getClinicProfile } from "@/lib/clinic-settings";
import { generatePageMetadata } from "@/lib/metadata";
import { roleHomePath } from "@/lib/permissions";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Вхід",
    description:
      "Увійдіть у кабінет власника тварини, панель лікаря або внутрішню систему клініки UltraVet.",
    path: "/login",
  });
}

export default async function LoginPage() {
  const session = await auth();
  const clinicProfile = await getClinicProfile();

  if (session?.user?.role) {
    redirect(roleHomePath(session.user.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#edf3ff_0%,#f5f7fb_52%,#ffffff_100%)] px-4 py-6 md:px-6 md:py-10">
      <div className="w-full max-w-[38rem]">
        <AuthForm mode="login" clinicProfile={clinicProfile} />
      </div>
    </main>
  );
}
