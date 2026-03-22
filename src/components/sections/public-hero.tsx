"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  Clock3,
  FileText,
  Instagram,
  LayoutDashboard,
  MapPin,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

import { ClinicPhoneLink } from "@/components/shared/clinic-phone-link";
import { StatCard } from "@/components/shared/stat-card";
import { landingMetrics, type ClinicProfile } from "@/constants/site";
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

const reassurancePoints = [
  {
    icon: ShieldCheck,
    label: "Прозорий план лікування",
    description: "Пояснюємо, що відбувається, які кроки далі і коли потрібен повторний візит.",
  },
  {
    icon: FileText,
    label: "Історія звернень у кабінеті",
    description: "Аналізи, рекомендації та рахунки зберігаються в одному місці без паперової плутанини.",
  },
  {
    icon: CalendarRange,
    label: "Онлайн-запис без дзвінків",
    description: "Бачите доступний час, обираєте лікаря і бронюєте візит за кілька хвилин.",
  },
] as const;

type PublicHeroProps = {
  isAuthenticated?: boolean;
  role?: "CLIENT" | "ADMIN" | "DOCTOR" | "SUPERADMIN" | null;
  clinicProfile: ClinicProfile;
};

export function PublicHero({ isAuthenticated = false, role = null, clinicProfile }: PublicHeroProps) {
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
    <section className="relative overflow-hidden px-[15px] pb-8 pt-[15px] md:flex md:min-h-[100svh] md:flex-col md:pb-[15px]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(31,87,242,0.18),transparent_22%),linear-gradient(180deg,#f4f6fb_0%,#ffffff_72%)]" />

      <div className="mb-3 w-full md:mb-3 md:shrink-0">
        <div className="flex items-center gap-2 md:hidden">
          <div className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-[1rem] bg-white/92 px-3 py-2 text-[11px] font-semibold tracking-[-0.01em] text-slate-600">
            <span className="flex size-7 shrink-0 items-center justify-center text-[#1f57f2]">
              <Clock3 className="size-[1.15rem]" />
            </span>
            <span className="truncate">{clinicProfile.hours}</span>
          </div>
          <ClinicPhoneLink
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1f57f2] shadow-[0_16px_30px_-20px_rgba(15,23,42,0.28)] hover:text-[#184de2]"
            phone={clinicProfile.phone}
            phoneHref={clinicProfile.phoneHref}
            clinicName={clinicProfile.name}
          >
            <Phone className="size-5" />
          </ClinicPhoneLink>
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#102749] shadow-[0_16px_30px_-20px_rgba(15,23,42,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f4f7ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/30"
            aria-label="Відкрити навігацію"
            aria-expanded={isMenuOpen}
            aria-controls="public-hero-menu"
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
            <ClinicPhoneLink
              className="truncate"
              phone={clinicProfile.phone}
              phoneHref={clinicProfile.phoneHref}
              clinicName={clinicProfile.name}
            >
              {clinicProfile.phone}
            </ClinicPhoneLink>
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

      <div className="w-full rounded-[2.25rem] bg-white p-3 md:flex md:min-h-0 md:flex-1 md:flex-col md:p-4">
        <div className="grid gap-3 md:min-h-0 md:flex-1 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="grid gap-3">
            <div className="grid min-h-[18rem] rounded-[2rem] bg-[linear-gradient(180deg,#f6f7f3_0%,#f0f1ec_100%)] px-5 py-5 md:min-h-[17.5rem] md:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                  <div className="max-w-2xl">
                    <div className="flex items-center justify-center sm:justify-start">
                      <Image
                        src="/brand/logo.svg"
                        alt="UltraVet logo"
                        width={54}
                        height={58}
                        className="h-[2.7rem] w-auto object-contain sm:h-[3.6rem]"
                      />
                    </div>
                    <p className="mt-3 text-[2rem] font-semibold leading-[0.92] tracking-[-0.065em] text-[#102749] sm:text-[2.6rem] md:text-[3rem]">
                      Лікуємо без хаосу:
                      <span className="block text-[#1f57f2]">запис, прийом і вся історія тварини в одному місці.</span>
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[14.5rem] lg:items-end lg:gap-3">
                    {isAuthenticated ? (
                      <Link
                        href={accountHref}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1f57f2] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(31,87,242,0.88)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#184de2] hover:shadow-[0_22px_40px_-20px_rgba(31,87,242,0.82)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/35 sm:h-12 lg:min-w-[14.5rem] lg:w-auto lg:px-6"
                      >
                        <LayoutDashboard className="size-4" />
                        Мій кабінет
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#c9d5f8] bg-white px-5 text-sm font-semibold text-[#0f2a4f] shadow-[0_16px_34px_-22px_rgba(15,23,42,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9eb5ff] hover:bg-[#f8fbff] hover:shadow-[0_20px_38px_-22px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/25 sm:h-12 lg:min-w-[14.5rem] lg:w-auto lg:px-6"
                        >
                          Увійти в кабінет
                        </Link>
                        <Link
                          href="/register"
                          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#1f57f2] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(31,87,242,0.88)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#184de2] hover:shadow-[0_22px_40px_-20px_rgba(31,87,242,0.82)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/35 sm:h-12 lg:min-w-[14.5rem] lg:w-auto lg:px-6"
                        >
                          Зареєструватись
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="max-w-xl">
                  <p className="text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                    UltraVet поєднує уважний очний прийом, зрозумілий маршрут лікування і клієнтський кабінет, де не губляться аналізи, рекомендації та подальші кроки.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/booking"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#102749] px-6 text-sm font-semibold text-white shadow-[0_22px_40px_-24px_rgba(15,23,42,0.48)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b203f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102749]/30"
                  >
                    Онлайн-запис 24/7
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#d5dceb] bg-white/88 px-6 text-sm font-semibold text-[#102749] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/25"
                  >
                    Переглянути напрямки лікування
                  </Link>
                </div>

              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid min-h-[13rem] rounded-[2rem] bg-[#f2f2f0] p-5 md:min-h-[11.5rem] md:p-6">
                <div className="mt-auto flex flex-col gap-3 text-center sm:gap-4 sm:text-left">
                  <div className="max-w-full text-[clamp(4rem,21vw,10.5rem)] font-semibold leading-[0.84] tracking-[-0.07em] text-[#0f2a4f] sm:origin-left sm:scale-x-[1.08]">
                    Ultra<span className="text-[#1f57f2]">Vet</span>
                  </div>
                  <p className="mx-auto max-w-lg text-sm leading-6 text-slate-600 sm:mx-0 sm:text-base sm:leading-7">
                    Сучасна ветклініка у Львові з онлайн-записом, кабінетом власника тварини та зрозумілою історією кожного звернення.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[31rem] overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#eef2fb_0%,#e5ebf8_100%)] p-3 sm:min-h-[36rem] md:min-h-[32rem] md:p-4">
            <button
              type="button"
              className="absolute right-4 top-4 z-10 hidden size-12 cursor-pointer items-center justify-center rounded-full bg-white text-[#102749] shadow-[0_18px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f4f7ff] hover:shadow-[0_22px_36px_-20px_rgba(15,23,42,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/30 md:flex md:right-5 md:top-5 md:size-14"
              aria-label="Відкрити навігацію"
              aria-expanded={isMenuOpen}
              aria-controls="public-hero-menu"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="size-6" />
            </button>

            <div className="absolute inset-x-4 top-4 z-[5] hidden sm:inset-x-5 sm:top-5 md:block">
              <div className="inline-flex max-w-[16rem] flex-col rounded-[1.6rem] border border-white/70 bg-white/88 p-4 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.3)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1f57f2]">
                  Онлайн-запис
                </p>
                <p className="mt-3 text-lg font-semibold leading-[1.02] tracking-[-0.05em] text-[#102749]">
                  Оберіть час без дзвінків і очікування відповіді.
                </p>
              </div>
            </div>

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
                    Який напрямок лікування вам потрібен?
                  </p>
                  <span className="flex size-11 items-center justify-center rounded-full border border-slate-300 text-[#102749] transition-all duration-200 group-hover:border-[#1f57f2]/35 group-hover:bg-[#eef3ff] group-hover:text-[#1f57f2] sm:size-12">
                    <ArrowRight className="size-5" />
                  </span>
                </div>
                <p className="mt-3 hidden max-w-[14rem] text-sm leading-6 text-slate-600 sm:block">
                  Перейдіть до послуг і знайдіть прийом, діагностику або процедуру за запитом вашої тварини.
                </p>
              </Link>

              <Link
                href="/faq"
                className="group rounded-[1.6rem] bg-white/92 p-4 shadow-[0_24px_50px_-32px_rgba(15,23,42,0.34)] backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_56px_-30px_rgba(15,23,42,0.36)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f57f2]/30 sm:rounded-[1.8rem] sm:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="max-w-[11rem] text-[1.3rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#102749] sm:max-w-[12rem] sm:text-2xl">
                    Як підготуватися до першого прийому?
                  </p>
                  <span className="flex size-11 items-center justify-center rounded-full border border-slate-300 text-[#102749] transition-all duration-200 group-hover:border-[#1f57f2]/35 group-hover:bg-[#eef3ff] group-hover:text-[#1f57f2] sm:size-12">
                    <ArrowRight className="size-5" />
                  </span>
                </div>
                <p className="mt-3 hidden max-w-[14rem] text-sm leading-6 text-slate-600 sm:block">
                  У FAQ зібрані базові відповіді про підготовку, документи, повторні візити та формат консультації.
                </p>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:mt-3 md:shrink-0 md:grid-cols-3">
          {landingMetrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
          {reassurancePoints.map((point) => {
            const Icon = point.icon;

            return (
              <div
                key={point.label}
                className="flex min-h-[10.5rem] flex-col items-center justify-center rounded-[1.75rem] border border-[#d9e4ff] bg-white px-6 py-6 text-center shadow-[0_24px_50px_-38px_rgba(15,23,42,0.14)] sm:min-h-[11rem] sm:px-7 sm:py-6 md:min-h-[9.5rem]"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-[#eef3ff] text-[#1f57f2]">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 text-[1rem] font-semibold tracking-[-0.03em] text-[#102749]">
                  {point.label}
                </p>
                <p className="mt-2 max-w-[18rem] text-[0.95rem] leading-5 text-slate-500 sm:max-w-[20rem] sm:text-sm sm:leading-6">
                  {point.description}
                </p>
              </div>
            );
          })}
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
            id="public-hero-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-hero-menu-title"
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
                  <span
                    id="public-hero-menu-title"
                    className="text-[2rem] font-semibold tracking-[-0.06em] text-[#0f2a4f]"
                  >
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
                    <ClinicPhoneLink
                      phone={clinicProfile.phone}
                      phoneHref={clinicProfile.phoneHref}
                      clinicName={clinicProfile.name}
                    >
                      {clinicProfile.phone}
                    </ClinicPhoneLink>
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
