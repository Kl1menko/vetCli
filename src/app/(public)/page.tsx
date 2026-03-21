import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { auth } from "@/auth";
import { PublicHero } from "@/components/sections/public-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { doctorsPreview, getServiceCategoryCountLabel } from "@/constants/site";
import { createPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "Ветклініка UltraVet у Львові",
  description:
    "Сучасна ветеринарна клініка у Львові з онлайн-записом, профілями лікарів, зрозумілими цінами та кабінетом власника тварини.",
  path: "/",
});

const servicesShowcase = [
  {
    title: "Хірургія",
    slug: "surgery",
    note: "Планові й ургентні втручання",
    countLabel: getServiceCategoryCountLabel("surgery"),
    theme: "sky",
    size: "lg",
  },
  {
    title: "Терапія",
    slug: "therapy",
    note: "Первинний огляд і контроль",
    countLabel: getServiceCategoryCountLabel("consultation"),
    theme: "rose",
    size: "sm",
  },
  {
    title: "Офтальмологія",
    slug: "ophthalmology",
    note: "Стан очей і повік",
    countLabel: getServiceCategoryCountLabel("ophthalmology"),
    theme: "blush",
    size: "sm",
  },
  {
    title: "Гігієнічні процедури",
    slug: "hygienic-procedures",
    note: "Догляд і профілактика",
    countLabel: getServiceCategoryCountLabel("hygienic"),
    theme: "amber",
    size: "lg",
  },
  {
    title: "Лабораторні дослідження",
    slug: "lab-tests",
    note: "Забір і розбір аналізів",
    countLabel: getServiceCategoryCountLabel("diagnostics"),
    theme: "violet",
    size: "lg",
  },
  {
    title: "Стоматологія",
    slug: "dentistry",
    note: "Зуби, ясна, санація",
    countLabel: getServiceCategoryCountLabel("dentistry"),
    theme: "purple",
    size: "sm",
  },
  {
    title: "Стаціонар",
    slug: "hospital",
    note: "Нагляд і підтримка стану",
    countLabel: getServiceCategoryCountLabel("hospital"),
    theme: "pink",
    size: "sm",
  },
  {
    title: "Візуальна діагностика",
    slug: "visual-diagnostics",
    note: "Уточнення клінічної картини",
    countLabel: getServiceCategoryCountLabel("diagnostics"),
    theme: "cyan",
    size: "lg",
  },
  {
    title: "Анестезіологія",
    slug: "anesthesiology",
    note: "Безпека під час процедур",
    countLabel: getServiceCategoryCountLabel("surgery"),
    theme: "orange",
    size: "lg",
  },
  {
    title: "Онкологія",
    slug: "oncology",
    note: "Оцінка і маршрутизація",
    countLabel: getServiceCategoryCountLabel("oncology"),
    theme: "teal",
    size: "sm",
  },
] as const;

const serviceThemeClassName = {
  sky: "bg-[linear-gradient(135deg,#8fd7ff_0%,#7fc6ff_45%,#63b4ff_100%)]",
  rose: "bg-[linear-gradient(135deg,#e78aa8_0%,#d06e91_100%)]",
  blush: "bg-[linear-gradient(135deg,#ffc1c9_0%,#f4aab6_100%)]",
  amber: "bg-[linear-gradient(135deg,#ffc74a_0%,#ffb11e_100%)]",
  violet: "bg-[linear-gradient(135deg,#c8bcff_0%,#b29cfb_100%)]",
  purple: "bg-[linear-gradient(135deg,#9b7cff_0%,#7f5bf0_100%)]",
  pink: "bg-[linear-gradient(135deg,#ff9eb5_0%,#ff8ca9_100%)]",
  cyan: "bg-[linear-gradient(135deg,#92defd_0%,#78ccfa_100%)]",
  orange: "bg-[linear-gradient(135deg,#ffc95b_0%,#ffb530_100%)]",
  teal: "bg-[linear-gradient(135deg,#5fb6d1_0%,#3b9dc5_100%)]",
} as const;

const primaryServiceImage = {
  surgery: {
    src: "/uploads/services/service-therapy-dog.png",
    alt: "Собака для картки хірургії",
    wrapperClassName: "bottom-0 right-2 h-[94%] w-[46%] md:right-4",
    objectClassName: "object-contain object-bottom",
  },
  therapy: {
    src: "/uploads/services/service-surgery-dog.png",
    alt: "Собака для картки терапії",
    wrapperClassName: "bottom-0 right-1 h-[94%] w-[58%] md:right-3",
    objectClassName: "object-contain object-bottom",
  },
} as const;

const secondaryServiceImage = {
  ophthalmology: {
    src: "/uploads/services/service-ophthalmology-new.png",
    alt: "Кіт для картки офтальмології",
    wrapperClassName: "bottom-0 right-0 h-[99%] w-[58%] md:right-1",
    objectClassName: "object-contain object-bottom",
  },
  "hygienic-procedures": {
    src: "/uploads/services/service-hygiene-dog.png",
    alt: "Собака для картки гігієнічних процедур",
    wrapperClassName: "bottom-0 right-3 h-[92%] w-[50%] md:right-4",
    objectClassName: "object-contain object-bottom",
  },
} as const;

const remainingServiceImage = {
  "lab-tests": {
    src: "/uploads/services/service-lab-dog.png",
    alt: "Собака для картки лабораторних досліджень",
    wrapperClassName: "bottom-0 right-2 h-[92%] w-[42%] md:right-4",
    objectClassName: "object-contain object-bottom",
  },
  dentistry: {
    src: "/uploads/services/service-dentistry-cat.png",
    alt: "Кіт для картки стоматології",
    wrapperClassName: "bottom-0 right-2 h-[92%] w-[46%] md:right-3",
    objectClassName: "object-contain object-bottom",
  },
  hospital: {
    src: "/uploads/services/service-hospital-ward.png",
    alt: "Тварина для картки стаціонару",
    wrapperClassName: "bottom-0 right-3 h-[90%] w-[44%] md:right-4",
    objectClassName: "object-contain object-bottom",
  },
  "visual-diagnostics": {
    src: "/uploads/services/service-diagnostics-dog.png",
    alt: "Собака для картки візуальної діагностики",
    wrapperClassName: "bottom-0 right-3 h-[90%] w-[44%] md:right-5",
    objectClassName: "object-contain object-bottom",
  },
  anesthesiology: {
    src: "/uploads/services/service-hospital-pet.png",
    alt: "Тварина для картки анестезіології",
    wrapperClassName: "bottom-0 right-4 h-[90%] w-[42%] md:right-5",
    objectClassName: "object-contain object-bottom",
  },
  oncology: {
    src: "/uploads/services/service-oncology-new.png",
    alt: "Тварина для картки онкології",
    wrapperClassName: "bottom-0 right-2 h-[88%] w-[50%] md:right-4",
    objectClassName: "object-contain object-bottom",
  },
} as const;

const homepageReviewImages = [
  { src: "/reviews/review-Armen Sarkisian-ChdDSU.png", alt: "Відгук Armen Sarkisian" },
  { src: "/reviews/review-Hrystyna Revus-Ci9DQU.png", alt: "Відгук Hrystyna Revus" },
  { src: "/reviews/review-Ira Hanchevska-ChZDSU.png", alt: "Відгук Ira Hanchevska" },
  { src: "/reviews/review-Khrystyna Tustanovska-Ci9DQU.png", alt: "Відгук Khrystyna Tustanovska" },
  { src: "/reviews/review-Lina Bachynska-ChZDSU.png", alt: "Відгук Lina Bachynska" },
  { src: "/reviews/review-Natali K-Ci9DQU.png", alt: "Відгук Natali K" },
  { src: "/reviews/review-Natalia Kachmar-Ci9DQU.png", alt: "Відгук Natalia Kachmar" },
  { src: "/reviews/review-Tatiana Kazako-ChZDSU.png", alt: "Відгук Tatiana Kazako" },
  { src: "/reviews/review-Арина Кравец-Ci9DQU.png", alt: "Відгук Арини Кравець" },
  { src: "/reviews/review-Василь-ChdDSU.png", alt: "Відгук Василя" },
  { src: "/reviews/review-Кристина Чемоданова-Ci9DQU.png", alt: "Відгук Кристини Чемоданової" },
  { src: "/reviews/review-Марія Можара-ChZDSU.png", alt: "Відгук Марії Можари" },
  { src: "/reviews/review-Роман Вовк-Ci9DQU.png", alt: "Відгук Романа Вовка" },
  { src: "/reviews/review-Таня Гранюк-ChZDSU.png", alt: "Відгук Тані Гранюк" },
  { src: "/reviews/review-Юлія Бурко-ChZDSU.png", alt: "Відгук Юлії Бурко" },
] as const;

export default async function HomePage() {
  const session = await auth();

  return (
    <main>
      <PublicHero
        isAuthenticated={Boolean(session?.user)}
        role={session?.user?.role ?? null}
      />

      <section className="w-full px-[15px] pb-20 pt-10 md:pb-20 md:pt-14">
        <div className="rounded-[2.25rem] bg-white p-3 md:p-5">
          <SectionHeading
            title="ПОСЛУГИ"
            description="Допомагаємо з діагностикою, лікуванням, хірургією, доглядом і відновленням тварин. Оберіть потрібний напрямок і перегляньте деталі послуги."
          />
          <div className="mt-10 grid gap-3 lg:grid-cols-12">
            {servicesShowcase.slice(0, 2).map((service, index) => (
              <Link
                key={service.title}
                href={`/services/${service.slug}`}
                className={cn(
                  "relative block min-h-[17rem] overflow-hidden rounded-[2rem] p-4 text-white shadow-[0_24px_54px_-34px_rgba(15,23,42,0.22)] transition-transform duration-200 hover:-translate-y-1 sm:p-5",
                  serviceThemeClassName[service.theme],
                  index === 0 ? "lg:col-span-6 lg:min-h-[20rem]" : "lg:col-span-4 lg:min-h-[20rem]",
                )}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="max-w-[46%] sm:max-w-[52%]">
                    <p className="text-[1.7rem] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[1.85rem]">{service.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#102749]">
                        {service.countLabel}
                      </span>
                      <span className="inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white">
                        {service.note}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "pointer-events-none absolute overflow-hidden",
                    primaryServiceImage[service.slug as keyof typeof primaryServiceImage].wrapperClassName,
                  )}
                >
                  <Image
                    src={primaryServiceImage[service.slug as keyof typeof primaryServiceImage].src}
                    alt={primaryServiceImage[service.slug as keyof typeof primaryServiceImage].alt}
                    fill
                    sizes="(min-width: 1024px) 28vw, 80vw"
                    className={primaryServiceImage[service.slug as keyof typeof primaryServiceImage].objectClassName}
                  />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(255,255,255,0.26),transparent_28%)]" />
              </Link>
            ))}

            <div className="hidden items-end rounded-[2rem] bg-white p-5 text-sm leading-7 text-slate-600 lg:col-span-2 lg:flex lg:min-h-[20rem]">
              <p className="max-w-[11rem]">
                Ми постійно вдосконалюємо роботу лабораторії, оновлюємо обладнання для діагностики, хірургії та інтенсивної терапії.
              </p>
            </div>

            <div className="hidden items-end rounded-[2rem] bg-white p-6 text-sm leading-7 text-slate-600 lg:col-span-2 lg:flex lg:min-h-[14rem]">
              Наші лікарі мають профільну освіту, працюють послідовно і пояснюють кожен етап лікування простою мовою.
            </div>

            {servicesShowcase.slice(2, 4).map((service, index) => (
              <Link
                key={service.title}
                href={`/services/${service.slug}`}
                className={cn(
                  "relative block min-h-[16.5rem] overflow-hidden rounded-[2rem] p-4 text-white shadow-[0_24px_54px_-34px_rgba(15,23,42,0.22)] transition-transform duration-200 hover:-translate-y-1 sm:p-5",
                  serviceThemeClassName[service.theme],
                  index === 0 ? "lg:col-span-4 lg:min-h-[16rem]" : "lg:col-span-6 lg:min-h-[16rem]",
                )}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="max-w-[48%] sm:max-w-[52%]">
                    <p className="max-w-[12rem] text-[1.55rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:max-w-[15rem] sm:text-[1.7rem]">{service.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#102749]">
                        {service.countLabel}
                      </span>
                      <span className="inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white">
                        {service.note}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "pointer-events-none absolute overflow-hidden",
                    secondaryServiceImage[service.slug as keyof typeof secondaryServiceImage].wrapperClassName,
                  )}
                >
                  <Image
                    src={secondaryServiceImage[service.slug as keyof typeof secondaryServiceImage].src}
                    alt={secondaryServiceImage[service.slug as keyof typeof secondaryServiceImage].alt}
                    fill
                    sizes="(min-width: 1024px) 24vw, 70vw"
                    className={secondaryServiceImage[service.slug as keyof typeof secondaryServiceImage].objectClassName}
                  />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(255,255,255,0.24),transparent_30%)]" />
              </Link>
            ))}

            {servicesShowcase.slice(4, 6).map((service, index) => (
              <Link
                key={service.title}
                href={`/services/${service.slug}`}
                className={cn(
                  "relative block min-h-[16.5rem] overflow-hidden rounded-[2rem] p-4 text-white shadow-[0_24px_54px_-34px_rgba(15,23,42,0.22)] transition-transform duration-200 hover:-translate-y-1 sm:p-5",
                  serviceThemeClassName[service.theme],
                  index === 0 ? "lg:col-span-6 lg:min-h-[18rem]" : "lg:col-span-4 lg:min-h-[18rem]",
                )}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div>
                    <p className="max-w-[12rem] text-[1.58rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:max-w-[15rem] sm:text-[1.75rem]">{service.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#102749]">
                        {service.countLabel}
                      </span>
                      <span className="inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white">
                        {service.note}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "pointer-events-none absolute overflow-hidden",
                    remainingServiceImage[service.slug as keyof typeof remainingServiceImage].wrapperClassName,
                  )}
                >
                  <Image
                    src={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].src}
                    alt={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].alt}
                    fill
                    sizes="(min-width: 1024px) 28vw, 80vw"
                    className={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].objectClassName}
                  />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(255,255,255,0.24),transparent_30%)]" />
              </Link>
            ))}

            <div className="hidden items-end rounded-[2rem] bg-white p-6 text-sm leading-7 text-slate-600 lg:col-span-2 lg:flex lg:min-h-[18rem]">
              Власник тварини бачить історію звернень у кабінеті, а команда клініки працює з єдиною медичною картиною.
            </div>

            {servicesShowcase.slice(6, 8).map((service, index) => (
              <Link
                key={service.title}
                href={`/services/${service.slug}`}
                className={cn(
                  "relative block min-h-[16.5rem] overflow-hidden rounded-[2rem] p-4 text-white shadow-[0_24px_54px_-34px_rgba(15,23,42,0.22)] transition-transform duration-200 hover:-translate-y-1 sm:p-5",
                  serviceThemeClassName[service.theme],
                  index === 0 ? "lg:col-span-4 lg:min-h-[16rem]" : "lg:col-span-6 lg:min-h-[16rem]",
                )}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div>
                    <p className="max-w-[12rem] text-[1.55rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:max-w-[15rem] sm:text-[1.7rem]">{service.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#102749]">
                        {service.countLabel}
                      </span>
                      <span className="inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white">
                        {service.note}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "pointer-events-none absolute overflow-hidden",
                    remainingServiceImage[service.slug as keyof typeof remainingServiceImage].wrapperClassName,
                  )}
                >
                  <Image
                    src={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].src}
                    alt={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].alt}
                    fill
                    sizes="(min-width: 1024px) 24vw, 70vw"
                    className={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].objectClassName}
                  />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(255,255,255,0.24),transparent_30%)]" />
              </Link>
            ))}

            {servicesShowcase.slice(8, 10).map((service, index) => (
              <Link
                key={service.title}
                href={`/services/${service.slug}`}
                className={cn(
                  "relative block min-h-[16.5rem] overflow-hidden rounded-[2rem] p-4 text-white shadow-[0_24px_54px_-34px_rgba(15,23,42,0.22)] transition-transform duration-200 hover:-translate-y-1 sm:p-5",
                  serviceThemeClassName[service.theme],
                  index === 0 ? "lg:col-span-6 lg:min-h-[18rem]" : "lg:col-span-4 lg:min-h-[18rem]",
                )}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div>
                    <p className="max-w-[12rem] text-[1.58rem] font-semibold leading-[0.96] tracking-[-0.05em] sm:max-w-[15rem] sm:text-[1.75rem]">{service.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#102749]">
                        {service.countLabel}
                      </span>
                      <span className="inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-semibold text-white">
                        {service.note}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "pointer-events-none absolute overflow-hidden",
                    remainingServiceImage[service.slug as keyof typeof remainingServiceImage].wrapperClassName,
                  )}
                >
                  <Image
                    src={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].src}
                    alt={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].alt}
                    fill
                    sizes="(min-width: 1024px) 28vw, 80vw"
                    className={remainingServiceImage[service.slug as keyof typeof remainingServiceImage].objectClassName}
                  />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(255,255,255,0.24),transparent_30%)]" />
              </Link>
            ))}

            <Link
              href="/services"
              className="group flex min-h-[18rem] flex-col justify-between rounded-[2rem] border border-[#c7d6ff] bg-white p-5 lg:col-span-2"
            >
              <div>
                <p className="max-w-[10rem] text-[1.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#102749]">
                  Усі послуги клініки
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Повний перелік напрямків, консультацій та процедур з поясненнями і наступними кроками.
                </p>
              </div>
              <div className="flex justify-end">
                <span className="flex size-12 items-center justify-center rounded-full bg-[#1f57f2] text-white transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight className="size-5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full px-[15px] py-20">
        <div className="overflow-hidden rounded-[2.25rem] bg-white p-4 md:p-6">
          <div className="relative mb-8 h-[10rem] overflow-hidden rounded-[1.8rem] bg-white md:mb-10 md:h-[16rem]">
            <Image
              src="/hero-cat.png"
              alt="Кіт у блоці підходу UltraVet"
              fill
              sizes="100vw"
              className="object-contain object-bottom"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionHeading
              title="Усе зроблено так, щоб власнику тварини було спокійно і зрозуміло."
              description="Ми не ускладнюємо шлях до допомоги. На сайті легко знайти потрібну послугу, записатися до лікаря і потім повернутися до всієї історії в кабінеті."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Швидкий запис", "Можна обрати послугу, лікаря і зручний час без зайвих дзвінків."],
                ["Уся історія в одному місці", "Візити, призначення, аналізи й документи зберігаються в кабінеті власника."],
                ["Зрозумілі профілі лікарів", "Кожен лікар має свою сторінку зі спеціалізацією і напрямками роботи."],
                ["Зручно повертатися", "Повторний запис і доступ до важливої інформації займають кілька натискань."],
              ].map(([title, description]) => (
                <Card key={title} className="border-[#e7eefc] bg-[#fbfcff] text-[#102749] shadow-none">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-[15px] py-20">
        <div className="rounded-[2.4rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_26px_60px_-44px_rgba(15,23,42,0.2)] md:p-6">
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.65fr] xl:items-stretch">
            <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2a4f_0%,#163d72_54%,#1f57f2_100%)] p-6 text-white shadow-[0_30px_60px_-36px_rgba(16,39,73,0.48)] md:min-h-[25rem] md:p-8">
              <p className="text-sm uppercase tracking-[0.26em] text-white/62">Лікарі UltraVet</p>
              <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-[0.92] tracking-[-0.05em] md:text-[2.9rem]">
                Команда, якій можна довірити лікування і контроль далі.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/78 md:text-[0.95rem]">
                Працюємо послідовно: огляд, план, пояснення для власника і вся історія в одному маршруті.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/doctors"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "rounded-full bg-white px-5 text-[#102749] hover:bg-[#eef3ff]",
                  )}
                >
                  Уся команда
                </Link>
                <Link
                  href="/booking"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-full border-white/24 bg-transparent px-5 text-white hover:bg-white/10",
                  )}
                >
                  Записатися
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {doctorsPreview.map((doctor, index) => (
                <Card
                  key={doctor.name}
                  className={cn(
                    "relative flex min-h-[25rem] flex-col overflow-hidden rounded-[2rem] border-0 p-0 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.18)]",
                    index === 0
                      ? "bg-[linear-gradient(180deg,#f6faff_0%,#edf4ff_100%)]"
                      : index === 1
                        ? "bg-[linear-gradient(180deg,#f8fbff_0%,#f1f5fb_100%)]"
                        : "bg-[linear-gradient(180deg,#f9fbff_0%,#eff6ff_100%)]",
                  )}
                >
                  <CardHeader className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-[1.55rem] leading-none tracking-[-0.05em] text-[#102749]">
                          {doctor.name}
                        </CardTitle>
                        <CardDescription className="mt-3 text-[0.95rem] font-medium text-[#3f5f8f]">
                          {doctor.specialization}
                        </CardDescription>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#d7e5ff] bg-white/92 px-3 py-1.5 text-xs font-medium leading-none text-[#3159b8] shadow-[0_12px_24px_-18px_rgba(31,87,242,0.38)]">
                        <span className="size-1.5 rounded-full bg-[#1f57f2]" />
                        {index === 0 ? "Планові прийоми" : index === 1 ? "Хірургія" : "Профільний прийом"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 px-6 pb-6 pt-0">
                    <p className="text-sm leading-7 text-slate-600">
                      {doctor.bio}
                    </p>
                  </CardContent>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.55)_100%)]" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-[15px] pb-20">
        <Card className="overflow-hidden rounded-[2.4rem] border-0 bg-[linear-gradient(135deg,#0f2a4f_0%,#163d72_52%,#1f57f2_100%)] text-white shadow-[0_30px_70px_-42px_rgba(16,39,73,0.52)]">
          <CardContent className="relative grid gap-8 px-5 py-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8 lg:py-14">
            <div className="absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_68%)] lg:block" />
            <div className="relative flex flex-col gap-4">
              <p className="text-sm uppercase tracking-[0.24em] text-white/62">Наступний крок</p>
              <h2 className="max-w-2xl text-3xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-[2.8rem]">
                Запишіть тварину онлайн або відкрийте власний кабінет, щоб зберігати всю історію звернень в одному місці.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-white/76 md:text-[0.95rem]">
                Запис, документи, призначення і попередні звернення завжди під рукою.
              </p>
            </div>
            <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/booking"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "h-14 min-w-[16rem] rounded-full bg-white px-8 text-base text-[#102749] hover:bg-[#eef3ff] md:h-16 md:min-w-[18rem] md:px-10 md:text-lg",
                )}
              >
                Записатися онлайн
              </Link>
              <Link
                href="/contacts"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-14 min-w-[16rem] rounded-full border-white/24 bg-transparent px-8 text-base text-white hover:bg-white/10 md:h-16 md:min-w-[18rem] md:px-10 md:text-lg",
                )}
              >
                Контакти клініки
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="w-full px-[15px] pb-20">
        <div className="rounded-[2.25rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_26px_60px_-44px_rgba(15,23,42,0.18)] md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.22em] text-[#5b7ab0]">Відгуки</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#102749] md:text-[2.5rem]">
                Що пишуть про UltraVet після прийому.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Реальні відгуки власників після запису, прийому і лікування.
              </p>
            </div>
            <Link
              href="/reviews"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full px-5")}
            >
              Усі відгуки
            </Link>
          </div>

          <div className="mt-8 -mx-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-3 px-1 snap-x snap-mandatory">
            {homepageReviewImages.map((review, index) => (
              <div
                key={review.src}
                className={cn(
                  "group w-[15.5rem] shrink-0 snap-start overflow-hidden rounded-[1.6rem] border border-[#e2ecff] bg-white shadow-[0_22px_44px_-36px_rgba(15,23,42,0.22)] transition-transform duration-300 hover:-translate-y-1 md:w-[17rem]",
                  index === 0
                    ? "animate-[reviewFloat_8s_ease-in-out_infinite] lg:translate-y-3"
                    : index === 1
                      ? "animate-[reviewFloatAlt_9s_ease-in-out_infinite]"
                      : "animate-[reviewFloat_10s_ease-in-out_infinite] lg:translate-y-5",
                )}
              >
                <div className="relative aspect-[0.92/1] bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] p-2">
                  <Image
                    src={review.src}
                    alt={review.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-contain object-center"
                  />
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
