"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/domain";

type DashboardNavProps = {
  navigation: NavItem[];
  accentClassName: string;
  hoverClassName?: string;
  activeClassName?: string;
  inactiveDotClassName?: string;
  onNavigate?: () => void;
};

export function DashboardNav({
  navigation,
  accentClassName,
  hoverClassName,
  activeClassName,
  inactiveDotClassName,
  onNavigate,
}: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navigation.map((item) => {
        const isActive = item.matchStartsWith
          ? pathname.startsWith(item.href)
          : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center justify-between rounded-[1.15rem] px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-slate-950",
              hoverClassName ?? "hover:bg-white",
              isActive && (activeClassName ?? "bg-white text-slate-950 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.42)]"),
            )}
          >
            <span>{item.label}</span>
            {item.badgeCount && !isActive ? (
              <span
                className={cn(
                  "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold text-white shadow-sm",
                  accentClassName,
                )}
              >
                {item.badgeCount > 99 ? "99+" : item.badgeCount}
              </span>
            ) : (
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all duration-200 group-hover:scale-110",
                  inactiveDotClassName ?? "bg-slate-200",
                  isActive && accentClassName,
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
