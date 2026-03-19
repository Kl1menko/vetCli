import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowUpRight, ShieldCheck, Stethoscope, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/forms/logout-button";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MobileDashboardMenu } from "@/components/layout/mobile-dashboard-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button-variants";
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
    surface:
      "from-[#f7faff] via-[#eef4ff] to-white",
    sidebarGlow: "bg-[radial-gradient(circle_at_top_left,rgba(31,87,242,0.16),transparent_38%)]",
    icon: UserRound,
    quickHint: "Тварини, записи, документи",
  },
  doctor: {
    accentDot: "bg-[#12836f]",
    surface:
      "from-[#f4fcfa] via-[#edf8f5] to-white",
    sidebarGlow: "bg-[radial-gradient(circle_at_top_left,rgba(18,131,111,0.14),transparent_38%)]",
    icon: Stethoscope,
    quickHint: "Розклад, пацієнти, візити",
  },
  admin: {
    accentDot: "bg-[#d97706]",
    surface:
      "from-[#fff8ed] via-[#fff3e0] to-white",
    sidebarGlow: "bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.14),transparent_38%)]",
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

  return (
    <div
      className={cn(
        "min-h-[100dvh] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%)] lg:h-[100dvh] lg:overflow-hidden",
        theme.sidebarGlow,
      )}
    >
      <div className="px-[15px] py-[15px] lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[290px_1fr] lg:gap-5">
        <div className="mb-4 rounded-[1.75rem] border border-white/70 bg-white/88 p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.34)] backdrop-blur lg:hidden">
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
              navigation={navigation}
              accentClassName={theme.accentDot}
            />
          </div>
        </div>

        <aside className="sticky top-[15px] hidden h-[calc(100dvh-30px)] min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_26px_70px_-50px_rgba(15,23,42,0.42)] backdrop-blur lg:flex lg:top-0 lg:h-auto">
          <div className="rounded-[1.65rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(247,250,252,0.96)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
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
            <div className="mt-4 flex items-center gap-2 rounded-[1rem] bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <ThemeIcon className="size-4 text-slate-500" />
              <span className="truncate">{session?.user?.email ?? subtitle}</span>
            </div>
          </div>

          <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-[1.65rem] bg-[#f3f6fb] p-3">
            <div className="mb-3 px-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Розділи</p>
            </div>
            <div className="h-full overflow-y-auto pr-1">
              <DashboardNav navigation={navigation} accentClassName={theme.accentDot} />
            </div>
          </div>

          <div className="space-y-3 pt-5">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 w-full justify-between rounded-full border-slate-200 bg-white px-5 text-slate-700 hover:bg-slate-50",
              )}
            >
              <span>На сайт</span>
              <ArrowUpRight className="size-4" />
            </Link>
            <LogoutButton className="h-11 w-full justify-center rounded-full bg-slate-950 text-white hover:bg-slate-800" />
          </div>
        </aside>

        <main className="flex min-w-0 flex-col overflow-hidden lg:min-h-[calc(100dvh-30px)] lg:min-h-0">
          <header
            className={cn(
              "shrink-0 overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br px-4 shadow-[0_26px_70px_-54px_rgba(15,23,42,0.4)] md:px-6",
              density === "compact" ? "py-4" : "py-6",
              theme.surface,
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
            <div className="flex min-w-0 flex-col rounded-[2rem] border border-white/70 bg-white/92 p-4 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.34)] md:p-8 lg:h-full lg:min-h-0">
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
