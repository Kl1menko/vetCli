import Image from "next/image";
import Link from "next/link";
import { Clock3, LayoutDashboard, MapPin, Phone, Search } from "lucide-react";

import { auth } from "@/auth";
import { ClinicPhoneLink } from "@/components/shared/clinic-phone-link";
import { publicNavigation } from "@/constants/navigation";
import { clinicProfile } from "@/constants/site";
import { LogoutButton } from "@/components/forms/logout-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { roleHomePath } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export async function PublicHeader() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  const accountHref = session?.user?.role ? roleHomePath(session.user.role) : "/login";

  return (
    <header className="sticky top-0 z-40 bg-[linear-gradient(180deg,rgba(11,80,243,0.08)_0%,rgba(255,255,255,0)_100%)] px-[15px] pt-[15px] backdrop-blur">
      <div className="w-full rounded-[2rem] border border-white/70 bg-white/92 px-[15px] py-4 shadow-[0_22px_70px_-44px_rgba(15,23,42,0.42)] backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-[#f6f7f8] px-4 py-2 text-sm text-slate-500 md:inline-flex">
                <Search className="size-4 text-slate-400" />
                <span>Пошук послуг</span>
              </div>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-[#1f57f2] shadow-[0_10px_22px_-14px_rgba(31,87,242,0.8)]">
                  <Image
                    src="/brand/logo.svg"
                    alt={`${clinicProfile.name} logo`}
                    width={30}
                    height={32}
                    className="size-8 object-contain brightness-0 invert"
                    priority
                  />
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight text-slate-950">{clinicProfile.name}</div>
                  <div className="text-sm text-slate-500">{clinicProfile.city}</div>
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f7f8] px-3 py-2">
                <Clock3 className="size-4 text-[#1f57f2]" />
                <span className="font-medium text-slate-800">Цілодобово онлайн</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f7f8] px-3 py-2">
                <Phone className="size-4 text-[#1f57f2]" />
                <ClinicPhoneLink className="font-medium text-slate-800">
                  {clinicProfile.phone}
                </ClinicPhoneLink>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f7f8] px-3 py-2">
                <MapPin className="size-4 text-[#1f57f2]" />
                <span className="font-medium text-slate-800">
                  {clinicProfile.city}, {clinicProfile.address}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav className="hidden items-center gap-2 lg:flex">
              {publicNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-[#f3f6ff] hover:text-[#1f57f2]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href={accountHref}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "hidden rounded-full px-5 text-slate-700 hover:bg-[#f3f6ff] hover:text-[#1f57f2] sm:inline-flex",
                    )}
                  >
                    <LayoutDashboard data-icon="inline-start" />
                    Мій кабінет
                  </Link>
                  <div className="hidden sm:block">
                    <LogoutButton variant="ghost" className="rounded-full px-5 text-slate-700 hover:bg-[#f3f6ff] hover:text-[#1f57f2]" />
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "hidden rounded-full px-5 text-slate-700 hover:bg-[#f3f6ff] hover:text-[#1f57f2] sm:inline-flex",
                  )}
                >
                  Увійти
                </Link>
              )}
              <Link
                href="/booking"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#1f57f2] px-6 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(31,87,242,0.9)] transition-transform hover:-translate-y-0.5"
              >
                Записатися
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
