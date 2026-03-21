import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowUpRight, ShieldCheck, Stethoscope, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/forms/logout-button";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MobileDashboardMenu } from "@/components/layout/mobile-dashboard-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button-variants";
import { getUnreadCabinetNotificationCounts } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/domain";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  variant: "client" | "doctor" | "admin";
  density?: "default" | "compact";
  navigation: NavItem[];
  children: ReactNode;
};

const shellThemes = {
  client: {
    accentDot: "bg-[#1f57f2]",
    appBg: "bg-[linear-gradient(180deg,#eaf1fb_0%,#e3ebf7_44%,#edf2f8_100%)]",
    shellFrame: "border-[#d6e0ee] bg-[#eef3f8]",
    mobileCard: "border-[#dbe4ef] bg-[#f3f7fb]",
    sidebarCard: "border-[#d7e0ea] bg-[#f2f6fa]",
    profileCard: "border-[#d9e3ef] bg-[linear-gradient(180deg,#f7fafd_0%,#edf3f8_100%)]",
    contactPill: "bg-[#e8eef8] text-slate-700",
    navSurface: "bg-[#e3ebf6]",
    navHover: "hover:bg-[#f6f9fd]",
    navActive: "bg-[#fdfefe] text-slate-950 shadow-[0_16px_34px_-28px_rgba(31,87,242,0.34)] ring-1 ring-[#dbe6f6]",
    navDot: "bg-[#c9d7ec]",
    headerSurface: "border-[#d7e1ee] bg-[linear-gradient(135deg,#eef4fb_0%,#e6eef9_100%)]",
    contentSurface: "border-[#d7e1ee] bg-[#f5f8fb]",
    siteButton: "border-[#cfd8e5] bg-[#f9fbfd] text-slate-700 hover:bg-white",
    logoutButton: "bg-[#dc2626] text-white hover:bg-[#b91c1c]",
    icon: UserRound,
    quickHint: "Тварини, записи, документи",
  },
  doctor: {
    accentDot: "bg-[#12836f]",
    appBg: "bg-[linear-gradient(180deg,#e7f2ef_0%,#e2efeb_44%,#ebf3ef_100%)]",
    shellFrame: "border-[#d1e1dc] bg-[#edf4f1]",
    mobileCard: "border-[#d5e4df] bg-[#f2f7f4]",
    sidebarCard: "border-[#d2e2dd] bg-[#eff5f2]",
    profileCard: "border-[#d4e3df] bg-[linear-gradient(180deg,#f6fbf9_0%,#eaf2ef_100%)]",
    contactPill: "bg-[#e5efec] text-slate-700",
    navSurface: "bg-[#dfebe7]",
    navHover: "hover:bg-[#f5fbf8]",
    navActive: "bg-[#fbfefd] text-slate-950 shadow-[0_16px_34px_-28px_rgba(18,131,111,0.32)] ring-1 ring-[#d3e7df]",
    navDot: "bg-[#bdd5ce]",
    headerSurface: "border-[#d2e2dd] bg-[linear-gradient(135deg,#edf7f4_0%,#e4f1ed_100%)]",
    contentSurface: "border-[#d2e2dd] bg-[#f3f8f6]",
    siteButton: "border-[#cadcd6] bg-[#f9fcfb] text-slate-700 hover:bg-white",
    logoutButton: "bg-[#dc2626] text-white hover:bg-[#b91c1c]",
    icon: Stethoscope,
    quickHint: "Розклад, пацієнти, візити",
  },
  admin: {
    accentDot: "bg-[#d97706]",
    appBg: "bg-[linear-gradient(180deg,#f5eee5_0%,#f1e8de_44%,#f4eee6_100%)]",
    shellFrame: "border-[#e4d5c5] bg-[#f4ece2]",
    mobileCard: "border-[#e6d8ca] bg-[#f8f1e8]",
    sidebarCard: "border-[#e5d7c8] bg-[#f5ede4]",
    profileCard: "border-[#e6d8ca] bg-[linear-gradient(180deg,#fcf7f1_0%,#f1e8df_100%)]",
    contactPill: "bg-[#eee4d8] text-slate-700",
    navSurface: "bg-[#ede2d4]",
    navHover: "hover:bg-[#fcf7f1]",
    navActive: "bg-[#fffdfb] text-slate-950 shadow-[0_16px_34px_-28px_rgba(217,119,6,0.3)] ring-1 ring-[#eadac7]",
    navDot: "bg-[#d9c8b2]",
    headerSurface: "border-[#e3d4c4] bg-[linear-gradient(135deg,#fbf3ea_0%,#f2e7d9_100%)]",
    contentSurface: "border-[#e3d4c4] bg-[#faf5ef]",
    siteButton: "border-[#dfd1c2] bg-[#fcfaf7] text-slate-700 hover:bg-white",
    logoutButton: "bg-[#dc2626] text-white hover:bg-[#b91c1c]",
    icon: ShieldCheck,
    quickHint: "Записи, графік, база клініки",
  },
} as const;

export async function DashboardShell({
  title,
  subtitle,
  variant,
  density = "default",
  navigation,
  children,
}: DashboardShellProps) {
  const session = await auth();
  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "UV";
  const theme = shellThemes[variant];
  const ThemeIcon = theme.icon;
  const unreadCabinetCounts =
    variant === "client" && session?.user?.id
      ? await getUnreadCabinetNotificationCounts(session.user.id)
      : null;
  const resolvedNavigation =
    variant === "client" && unreadCabinetCounts
      ? navigation.map((item) => ({
          ...item,
          badgeCount:
            item.href === "/cabinet/visits"
              ? unreadCabinetCounts.visits ?? 0
              : item.href === "/cabinet/prescriptions"
                ? unreadCabinetCounts.prescriptions ?? 0
                : item.href === "/cabinet/lab-results"
                  ? unreadCabinetCounts["lab-results"] ?? 0
                  : item.href === "/cabinet/invoices"
                    ? unreadCabinetCounts.invoices ?? 0
                    : item.badgeCount,
        }))
      : navigation;

  return (
    <div
      className={cn(
        "min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden",
        theme.appBg,
      )}
    >
      <div className={cn("px-[15px] py-[15px] lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[290px_1fr] lg:gap-5", theme.shellFrame)}>
        <div className={cn("mb-4 rounded-[1.75rem] border p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)] lg:hidden", theme.mobileCard)}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-11 rounded-2xl ring-1 ring-slate-200/80">
                <AvatarFallback className="rounded-2xl bg-slate-950 text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-950">{session?.user?.name ?? title}</p>
                <p className="truncate text-sm text-slate-500">{theme.quickHint}</p>
              </div>
            </div>
            <MobileDashboardMenu
              title={title}
              subtitle={subtitle}
              navigation={resolvedNavigation}
              accentClassName={theme.accentDot}
              panelClassName={theme.sidebarCard}
              navSurfaceClassName={theme.navSurface}
              navHoverClassName={theme.navHover}
              navActiveClassName={theme.navActive}
              navInactiveDotClassName={theme.navDot}
              logoutButtonClassName={theme.logoutButton}
            />
          </div>
        </div>

        <aside className={cn("sticky top-[15px] hidden h-[calc(100dvh-30px)] min-h-0 flex-col overflow-hidden rounded-[2rem] border p-5 shadow-[0_26px_70px_-50px_rgba(15,23,42,0.26)] lg:flex lg:top-0 lg:h-auto", theme.sidebarCard)}>
          <div className={cn("rounded-[1.65rem] border p-4", theme.profileCard)}>
            <div className="flex items-start gap-3">
              <Avatar className="size-12 rounded-2xl ring-1 ring-slate-200/80">
                <AvatarFallback className="rounded-2xl bg-slate-950 text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-base font-semibold text-slate-950">
                  {session?.user?.name ?? title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{theme.quickHint}</p>
              </div>
            </div>
            <div className={cn("mt-4 flex items-center gap-2 rounded-[1rem] px-3 py-2 text-sm", theme.contactPill)}>
              <ThemeIcon className="size-4 text-slate-500" />
              <span className="truncate">{session?.user?.email ?? subtitle}</span>
            </div>
          </div>

          <div className={cn("mt-5 min-h-0 flex-1 overflow-hidden rounded-[1.65rem] p-3", theme.navSurface)}>
            <div className="mb-3 px-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Розділи</p>
            </div>
            <div className="h-full overflow-y-auto pr-1">
              <DashboardNav
                navigation={resolvedNavigation}
                accentClassName={theme.accentDot}
                hoverClassName={theme.navHover}
                activeClassName={theme.navActive}
                inactiveDotClassName={theme.navDot}
              />
            </div>
          </div>

          <div className="space-y-3 pt-5">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 w-full justify-between rounded-full px-5",
                theme.siteButton,
              )}
            >
              <span>На сайт</span>
              <ArrowUpRight className="size-4" />
            </Link>
            <LogoutButton className={cn("h-11 w-full justify-center rounded-full", theme.logoutButton)} />
          </div>
        </aside>

        <main className="flex min-w-0 flex-col overflow-hidden lg:min-h-[calc(100dvh-30px)] lg:min-h-0">
          <header
            className={cn(
              "shrink-0 overflow-hidden rounded-[2rem] border px-4 shadow-[0_24px_50px_-42px_rgba(15,23,42,0.22)] md:px-6",
              density === "compact" ? "py-4" : "py-6",
              theme.headerSurface,
            )}
          >
            <div className="flex flex-col gap-5">
              <div>
                <h1
                  className={cn(
                    "max-w-2xl font-semibold tracking-[-0.04em] text-slate-950",
                    density === "compact" ? "text-[2rem] md:text-[2.1rem]" : "text-3xl md:text-[2.4rem]",
                  )}
                >
                  {title}
                </h1>
                <p
                  className={cn(
                    "max-w-2xl text-sm text-slate-600",
                    density === "compact" ? "mt-2 leading-6" : "mt-3 leading-7",
                  )}
                >
                  {subtitle}
                </p>
              </div>
            </div>
          </header>

          <div className="flex-1 py-4 lg:min-h-0 lg:py-6">
            <div className={cn("flex min-w-0 flex-col rounded-[2rem] border p-4 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.22)] md:p-8 lg:h-full lg:min-h-0", theme.contentSurface)}>
              <div className="min-w-0 flex-1 overflow-x-hidden lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
