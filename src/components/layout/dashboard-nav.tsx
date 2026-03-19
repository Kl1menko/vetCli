"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/domain";

type DashboardNavProps = {
  navigation: NavItem[];
  accentClassName: string;
  onNavigate?: () => void;
};

export function DashboardNav({ navigation, accentClassName, onNavigate }: DashboardNavProps) {
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
              "group flex items-center justify-between rounded-[1.15rem] px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-950",
              isActive && "bg-white text-slate-950 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.42)]",
            )}
          >
            <span>{item.label}</span>
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full bg-slate-200 transition-all duration-200 group-hover:scale-110",
                isActive && accentClassName,
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
