"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ArrowUpRight } from "lucide-react";

import { LogoutButton } from "@/components/forms/logout-button";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/domain";

type MobileDashboardMenuProps = {
  title: string;
  subtitle: string;
  navigation: NavItem[];
  accentClassName: string;
};

export function MobileDashboardMenu({
  title,
  subtitle,
  navigation,
  accentClassName,
}: MobileDashboardMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full border-slate-200 bg-white px-4 text-slate-800 hover:bg-slate-50"
          />
        }
      >
        <Menu data-icon="inline-start" />
        Меню
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[88vw] max-w-[360px] border-r border-white/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(255,255,255,0.98)_100%)] p-0"
      >
        <SheetHeader className="border-b border-slate-100 px-5 py-5">
          <SheetTitle className="text-lg font-semibold text-slate-950">{title}</SheetTitle>
          <SheetDescription className="mt-1 leading-6 text-slate-500">{subtitle}</SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col px-4 py-4">
          <div className="min-h-0 flex-1 overflow-y-auto rounded-[1.5rem] bg-[#f3f6fb] p-3">
            <DashboardNav
              navigation={navigation}
              accentClassName={accentClassName}
              onNavigate={() => setOpen(false)}
            />
          </div>

          <div className="space-y-3 px-1 pt-4 pb-5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
