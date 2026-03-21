"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Instagram,
  LayoutDashboard,
  MapPin,
  Menu,
  Phone,
  Send,
  X,
} from "lucide-react";

import { ClinicPhoneLink } from "@/components/shared/clinic-phone-link";
import { StatCard } from "@/components/shared/stat-card";
import { clinicProfile, landingMetrics } from "@/constants/site";
import { roleHomePath } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Головна" },
  { href: "/about", label: "Про клініку" },
  { href: "/services", label: "Послуги" },
  { href: "/doctors", label: "Наші лікарі" },
  { href: "/faq", label: "Корисна інформація" },
  { href: "/contacts", label: "Контакти" },
];

type PublicHeroProps = {
  isAuthenticated?: boolean;
  role?: "CLIENT" | "ADMIN" | "DOCTOR" | "SUPERADMIN" | null;
};

export function PublicHero({ isAuthenticated = false, role = null }: PublicHeroProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const accountHref = roleHomePath(role);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <section className="relative overflow-hidden px-[15px] pb-8 pt-[15px] md:pb-14">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(31,87,242,0.18),transparent_22%),linear-gradient(180deg,#f4f6fb_0%,#ffffff_72%)]" />

      <div className="mb-3 w-full md:mb-0">
        <div className="flex items-center gap-2 md:hidden">
          <div className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-[1rem] bg-white/92 px-3 py-2 text-[11px] font-semibold tracking-[-0.01em] text-slate-600">
            <span className="flex size-7 shrink-0 items-center justify-center text-[#1f57f2]">
              <Clock3 className="size-[1.15rem]" />
            </span>
            <span className="truncate">{clinicProfile.hours}</span>
          </div>
          <ClinicPhoneLink className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1f57f2] shadow-[0_16px_30px_-20px_rgba(15,23,42,0.28)] hover:text-[#184de2]">
            <Phone className="size-5" />
          </ClinicPhoneLink>
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#102749] shadow-[0_16px_30px_-20px_rgba(15,23,42,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f4f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/30"
            aria-label="Відкрити навігацію"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>

        <div className="hidden w-full gap-2 rounded-[1.35rem] p-0 md:grid md:grid-cols-3 md:gap-3 md:p-0">
          <div className="flex min-w-0 w-full items-center justify-center gap-2 rounded-[1rem] bg-white/92 px-3 py-2 text-center text-[11px] font-semibold tracking-[-0.01em] text-slate-600 sm:min-h-[3.4rem] sm:gap-2.5 sm:px-4 sm:text-[12px]">
            <span className="flex size-7 shrink-0 items-center justify-center text-[#1f57f2] sm:size-8">
              <Clock3 className="size-[1.15rem]" />
            </span>
            <span className="truncate">{clinicProfile.hours}</span>
          </div>
          <div className="flex min-w-0 w-full items-center justify-center gap-2 rounded-[1rem] bg-white/92 px-3 py-2 text-center text-[11px] font-semibold tracking-[-0.01em] text-slate-600 sm:min-h-[3.4rem] sm:gap-2.5 sm:px-4 sm:text-[12px]">
            <span className="flex size-7 shrink-0 items-center justify-center text-[#1f57f2] sm:size-8">
              <Phone className="size-[1.15rem]" />
            </span>
            <ClinicPhoneLink className="truncate">{clinicProfile.phone}</ClinicPhoneLink>
          </div>
          <div className="flex min-w-0 w-full items-center justify-center gap-2 rounded-[1rem] bg-white/92 px-3 py-2 text-center text-[11px] font-semibold tracking-[-0.01em] text-slate-600 sm:min-h-[3.4rem] sm:gap-2.5 sm:px-4 sm:text-[12px]">
            <span className="flex size-7 shrink-0 items-center justify-center text-[#1f57f2] sm:size-8">
              <MapPin className="size-[1.15rem]" />
            </span>
            <span className="truncate">
              {clinicProfile.city}, {clinicProfile.address}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full rounded-[2.25rem] bg-white p-3 md:p-5">
        <div className="grid gap-3 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="grid gap-3">
            <div className="grid min-h-[12.5rem] rounded-[2rem] bg-[#f2f2f0] px-5 py-4 md:min-h-[14rem] md:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex items-center justify-center sm:justify-start">
                  <Image
                    src="/brand/logo.svg"
                    alt="UltraVet logo"
                    width={54}
                    height={58}
                    className="h-[2.7rem] w-auto object-contain sm:h-[3.6rem]"
                  />
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end sm:gap-3">
                  {isAuthenticated ? (
                    <Link
                      href={accountHref}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1f57f2] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(31,87,242,0.88)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#184de2] hover:shadow-[0_22px_40px_-20px_rgba(31,87,242,0.82)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/35 sm:h-12 sm:min-w-[14.5rem] sm:w-auto sm:px-6"
                    >
                      <LayoutDashboard className="size-4" />
                      Мій кабінет
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#c9d5f8] bg-white px-5 text-sm font-semibold text-[#0f2a4f] shadow-[0_16px_34px_-22px_rgba(15,23,42,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9eb5ff] hover:bg-[#f8fbff] hover:shadow-[0_20px_38px_-22px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/25 sm:h-12 sm:min-w-[14.5rem] sm:w-auto sm:px-6"
                      >
                        Увійти в кабінет
                      </Link>
                      <Link
                        href="/register"
                        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#1f57f2] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(31,87,242,0.88)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#184de2] hover:shadow-[0_22px_40px_-20px_rgba(31,87,242,0.82)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/35 sm:h-12 sm:min-w-[14.5rem] sm:w-auto sm:px-6"
                      >
                        Зареєструватись
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 max-w-[17rem] sm:mt-auto sm:max-w-md">
                <p className="text-[1.58rem] font-semibold leading-[0.96] tracking-[-0.055em] text-[#102749] sm:text-3xl md:text-4xl">
                  Ми уважні до тварин, людей і деталей у лікуванні.
                </p>
              </div>
            </div>

            <div className="grid min-h-[12.5rem] rounded-[2rem] bg-[#f2f2f0] p-5 md:min-h-[15rem] md:p-7">
              <div className="mt-auto flex flex-col gap-3 text-center sm:gap-4 sm:text-left">
                <div className="max-w-full text-[clamp(4rem,21vw,10.5rem)] font-semibold leading-[0.84] tracking-[-0.07em] text-[#0f2a4f] sm:origin-left sm:scale-x-[1.08]">
                  Ultra<span className="text-[#1f57f2]">Vet</span>
                </div>
                <p className="mx-auto max-w-lg text-sm leading-6 text-slate-600 sm:mx-0 sm:text-base sm:leading-7">
                  Сучасна ветклініка у Львові з онлайн-записом, кабінетом власника тварини та зрозумілою історією кожного звернення.
                </p>
              </div>
            </div>

            <div className="grid min-h-[13rem] rounded-[2rem] bg-[#1f57f2] px-5 py-4 text-white shadow-[0_28px_60px_-36px_rgba(31,87,242,0.72)] md:min-h-[17rem] md:p-7">
              <p className="text-[0.95rem] text-white/72 md:text-sm">Консультація та прийом</p>
              <div className="mt-auto flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="max-w-md">
                  <p className="text-[1.5rem] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-3xl md:text-4xl">
                    Запис на консультацію або прийом до лікаря без зайвого очікування.
                  </p>
                </div>
                <Link
                  href="/booking"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-6 text-[0.95rem] font-semibold text-[#0f2a4f] shadow-[0_20px_36px_-22px_rgba(15,23,42,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f7faff] hover:shadow-[0_24px_42px_-22px_rgba(15,23,42,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:h-14 sm:w-auto sm:px-7 sm:text-sm"
                >
                  Записатися
                </Link>
              </div>
            </div>
          </div>

          <div className="relative min-h-[31rem] overflow-hidden rounded-[2rem] bg-[#f2f2f0] p-3 sm:min-h-[36rem] md:min-h-[48rem] md:p-5">
            <button
              type="button"
              className="absolute right-4 top-4 z-10 hidden size-12 cursor-pointer items-center justify-center rounded-full bg-white text-[#102749] shadow-[0_18px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f4f7ff] hover:shadow-[0_22px_36px_-20px_rgba(15,23,42,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/30 md:flex md:right-5 md:top-5 md:size-14"
              aria-label="Відкрити навігацію"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="size-6" />
            </button>

            <div className="absolute inset-x-[6%] top-[6%] bottom-[22%] sm:inset-x-[8%] sm:top-[4%] sm:bottom-[18%] md:top-[3%] md:bottom-[8%]">
              <Image
                src="/hero-dog.png"
                alt="Собака на головному екрані UltraVet"
                fill
                priority
                className="object-contain object-bottom"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="absolute inset-x-3 bottom-3 grid gap-3 sm:grid-cols-2">
              <Link
                href="/services"
                className="group rounded-[1.6rem] bg-white/92 p-4 shadow-[0_24px_50px_-32px_rgba(15,23,42,0.34)] backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_56px_-30px_rgba(15,23,42,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/30 sm:rounded-[1.8rem] sm:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="max-w-[11rem] text-[1.3rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#102749] sm:max-w-[12rem] sm:text-2xl">
                    Комплексне експрес-обстеження
                  </p>
                  <span className="flex size-11 items-center justify-center rounded-full border border-slate-300 text-[#102749] transition-all duration-200 group-hover:border-[#1f57f2]/35 group-hover:bg-[#eef3ff] group-hover:text-[#1f57f2] sm:size-12">
                    <ArrowRight className="size-5" />
                  </span>
                </div>
              </Link>
              <Link
                href="/faq"
                className="group rounded-[1.6rem] bg-white/92 p-4 shadow-[0_24px_50px_-32px_rgba(15,23,42,0.34)] backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_56px_-30px_rgba(15,23,42,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/30 sm:rounded-[1.8rem] sm:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="max-w-[11rem] text-[1.3rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#102749] sm:max-w-[12rem] sm:text-2xl">
                    Інфекційна безпека і контроль
                  </p>
                  <span className="flex size-11 items-center justify-center rounded-full border border-slate-300 text-[#102749] transition-all duration-200 group-hover:border-[#1f57f2]/35 group-hover:bg-[#eef3ff] group-hover:text-[#1f57f2] sm:size-12">
                    <ArrowRight className="size-5" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {landingMetrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-[rgba(15,23,42,0.18)] backdrop-blur-[10px] transition-all duration-300 ease-out",
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="h-full w-full p-[15px]">
          <div
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "relative grid h-full overflow-auto rounded-[2.2rem] bg-white p-6 shadow-[0_36px_100px_-50px_rgba(15,23,42,0.42)] transition-all duration-300 ease-out md:p-8 lg:grid-cols-[0.9fr_1.1fr_0.72fr] lg:gap-10",
              isMenuOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.985] opacity-0",
            )}
          >
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="absolute right-6 top-6 z-20 flex size-14 cursor-pointer items-center justify-center rounded-full bg-[#f5f7fb] text-[#102749] shadow-[0_16px_32px_-22px_rgba(15,23,42,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_38px_-22px_rgba(15,23,42,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/30"
                aria-label="Закрити меню"
              >
                <X className="size-6" />
              </button>

              <div
                className={cn(
                  "flex flex-col justify-between gap-8 pt-3 transition-all delay-75 duration-300 ease-out",
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
              >
                <div className="space-y-8">
                  <Link href="/" className="inline-flex items-center gap-4" onClick={() => setIsMenuOpen(false)}>
                    <Image
                      src="/brand/logo.svg"
                      alt="UltraVet logo"
                      width={44}
                      height={48}
                      className="h-11 w-auto object-contain"
                    />
                    <span className="text-[2rem] font-semibold tracking-[-0.06em] text-[#0f2a4f]">
                      Ultra<span className="text-[#1f57f2]">Vet</span>
                    </span>
                  </Link>

                  <div className="grid gap-4 text-sm text-slate-600">
                    <div className="inline-flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 text-[#1f57f2]" />
                      <span>
                        {clinicProfile.city}, {clinicProfile.address}
                      </span>
                    </div>
                    <div className="inline-flex items-start gap-3">
                      <Phone className="mt-0.5 size-4 text-[#1f57f2]" />
                      <ClinicPhoneLink>{clinicProfile.phone}</ClinicPhoneLink>
                    </div>
                    <div className="inline-flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4 text-[#1f57f2]" />
                      <span>{clinicProfile.hours}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-12 items-center justify-center rounded-full bg-[#1f57f2] text-white shadow-[0_16px_34px_-22px_rgba(31,87,242,0.65)]"
                    >
                      <Instagram className="size-5" />
                    </Link>
                    <Link
                      href="https://t.me"
                      target="_blank"
                      rel="noreferrer"
                      className="flex size-12 items-center justify-center rounded-full bg-[#1f57f2] text-white shadow-[0_16px_34px_-22px_rgba(31,87,242,0.65)]"
                    >
                      <Send className="size-5" />
                    </Link>
                  </div>
                </div>
              </div>

              <nav
                className={cn(
                  "flex flex-col justify-center gap-5 py-8 transition-all delay-100 duration-300 ease-out lg:py-0",
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl font-semibold tracking-[-0.05em] text-[#102749] transition-colors hover:text-[#1f57f2] md:text-[2.7rem]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div
                className={cn(
                  "flex items-center justify-start transition-all delay-150 duration-300 ease-out lg:justify-end",
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
                )}
              >
                <div className="w-full max-w-[20rem] rounded-[2.2rem] bg-[#1f57f2] p-7 text-white shadow-[0_32px_62px_-34px_rgba(31,87,242,0.72)]">
                  <p className="max-w-[10rem] text-[2.15rem] font-semibold leading-[0.94] tracking-[-0.05em]">
                    Працюємо для вас щодня
                  </p>
                  <p className="mt-5 text-sm leading-6 text-white/74">
                    Швидкий запис на прийом, консультацію та повторний візит у кілька кліків.
                  </p>
                  <div className="mt-12 grid gap-3">
                    <Link
                      href="/booking"
                      onClick={() => setIsMenuOpen(false)}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#102749]"
                    >
                      Записатися на прийом
                    </Link>
                    {isAuthenticated ? (
                      <Link
                        href={accountHref}
                        onClick={() => setIsMenuOpen(false)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/24 bg-white/10 px-5 text-sm font-semibold text-white"
                      >
                        <LayoutDashboard className="size-4" />
                        Мій кабінет
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="inline-flex h-12 items-center justify-center rounded-full border border-white/24 bg-white/10 px-5 text-sm font-semibold text-white"
                      >
                        Увійти в кабінет
                      </Link>
                    )}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
