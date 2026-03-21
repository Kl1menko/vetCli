"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

import { publicNavigation } from "@/constants/navigation";
import { clinicProfile } from "@/constants/site";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type PublicHeaderProps = {
  accountHref: string;
  isAuthenticated: boolean;
};

export function PublicHeader({ accountHref, isAuthenticated }: PublicHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 px-[15px] pt-[15px]">
      <div className="w-full rounded-[2rem] border border-[#dce6fb] bg-white/94 px-4 py-4 shadow-[0_22px_70px_-44px_rgba(15,23,42,0.26)] backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/brand/logo.svg"
              alt={`${clinicProfile.name} logo`}
              width={44}
              height={48}
              className="h-11 w-auto shrink-0 object-contain"
              priority
            />
            <div className="min-w-0">
              <div className="truncate text-[1.8rem] font-semibold leading-[0.9] tracking-[-0.07em] text-[#0f2a4f] sm:text-[2rem]">
                Ultra<span className="text-[#1f57f2]">Vet</span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-[#dce6fb] bg-white text-[#102749] shadow-[0_16px_32px_-24px_rgba(15,23,42,0.18)] lg:hidden"
            aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <div className="hidden items-center gap-3 lg:flex">
            <nav className="flex items-center gap-2">
              {publicNavigation.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#eef4ff] text-[#1f57f2]"
                        : "text-slate-600 hover:bg-[#f3f6ff] hover:text-[#1f57f2]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {isAuthenticated ? (
              <Link
                href={accountHref}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full border-[#d3ddfb] bg-white px-5 text-[#102749]",
                )}
              >
                <LayoutDashboard data-icon="inline-start" />
                Кабінет
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full border-[#d3ddfb] bg-white px-5 text-[#102749]",
                )}
              >
                Увійти
              </Link>
            )}

            <Link
              href="/booking"
              className={cn(
                buttonVariants(),
                "rounded-full bg-[#1f57f2] px-6 text-white shadow-[0_16px_32px_-18px_rgba(31,87,242,0.9)] hover:bg-[#184de2]",
              )}
            >
              Записатися
            </Link>
          </div>
        </div>

        {isOpen ? (
          <div className="mt-4 grid gap-3 border-t border-[#e8eefb] pt-4 lg:hidden">
            <nav className="grid gap-2">
              {publicNavigation.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-[1rem] px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#eef4ff] text-[#1f57f2]"
                        : "bg-[#f8fbff] text-slate-700 hover:bg-[#f2f6ff] hover:text-[#1f57f2]",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="grid gap-2 sm:grid-cols-2">
              {isAuthenticated ? (
                <Link
                  href={accountHref}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 rounded-full border-[#d3ddfb] bg-white px-5 text-[#102749]",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard data-icon="inline-start" />
                  Кабінет
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 rounded-full border-[#d3ddfb] bg-white px-5 text-[#102749]",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Увійти
                </Link>
              )}

              <Link
                href="/booking"
                className={cn(buttonVariants(), "h-12 rounded-full bg-[#1f57f2] px-5 text-white hover:bg-[#184de2]")}
                onClick={() => setIsOpen(false)}
              >
                Записатися
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
