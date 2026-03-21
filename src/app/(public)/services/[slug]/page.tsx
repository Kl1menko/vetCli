import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Phone, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import {
  clinicProfile,
  clinicServices,
  getClinicServiceBySlug,
  getServiceCategoryCountLabel,
  getServiceCategoryLabel,
  getServicesByCategory,
} from "@/constants/site";
import { createPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return clinicServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getClinicServiceBySlug(slug);

  if (!service) {
    return createPageMetadata({
      title: "Послуга не знайдена",
      description: "Опис обраної послуги не знайдено.",
      path: `/services/${slug}`,
    });
  }

  return createPageMetadata({
    title: service.title,
    description: service.shortDescription,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { slug } = await params;
  const service = getClinicServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const categoryServices = getServicesByCategory(service.category);
  const relatedServices = clinicServices.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <main className="w-full px-[15px] py-16 md:py-20">
      <section className="rounded-[2.4rem] bg-[linear-gradient(135deg,#0f2a4f_0%,#163d72_54%,#1f57f2_100%)] px-5 py-8 text-white shadow-[0_30px_70px_-44px_rgba(16,39,73,0.52)] md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/64">Послуга UltraVet</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.92] tracking-[-0.06em] md:text-[4.1rem]">
              {service.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78 md:text-[1rem]">
              {service.shortDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#102749]">
                {getServiceCategoryCountLabel(service.category)}
              </span>
              <span className="inline-flex rounded-full bg-white/14 px-3 py-1 text-xs font-semibold text-white">
                {getServiceCategoryLabel(service.category)}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.6rem] bg-white/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">Запис</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">Онлайн або телефоном</p>
            </div>
            <div className="rounded-[1.6rem] bg-white/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">Місто</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{clinicProfile.city}</p>
            </div>
            <div className="rounded-[1.6rem] bg-white/10 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">Години</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{clinicProfile.hours}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="overflow-hidden rounded-[2.25rem] border border-[#e2ecff] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_26px_60px_-44px_rgba(15,23,42,0.18)]">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#5b7ab0]">Що входить</p>
                <p className="mt-3 text-3xl font-semibold leading-[0.96] tracking-[-0.05em] text-[#102749]">
                  Коли ця послуга доречна.
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1f57f2]">
                <Sparkles className="size-5" />
              </span>
            </div>

            <p className="mt-5 text-base leading-8 text-slate-600 md:text-[1.05rem]">
              {service.description}
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {[
                "Запис можна оформити онлайн без дзвінка.",
                "Після прийому рекомендації лишаються в кабінеті.",
                "Команда підкаже, який формат звернення підійде.",
                "Історія візитів і документів зберігається в одному місці.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[1.4rem] border border-[#e4edff] bg-white px-4 py-4 text-sm leading-6 text-slate-600 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.14)]"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#1f57f2]">
                    <CheckCircle2 className="size-4" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-[#e4edff] pt-6 sm:flex-row">
              <Link
                href="/booking"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-14 rounded-full px-8 text-base shadow-[0_20px_38px_-22px_rgba(31,87,242,0.48)] md:h-15",
                )}
              >
                Записатися онлайн
              </Link>
              <a
                href={clinicProfile.phoneHref}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-14 rounded-full border-[#d3ddfb] bg-white px-8 text-base text-[#102749] shadow-[0_18px_34px_-24px_rgba(15,23,42,0.12)] md:h-15",
                )}
              >
                {clinicProfile.phone}
              </a>
            </div>

            <div className="mt-8 rounded-[1.7rem] border border-[#e4edff] bg-white/88 p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-[#5b7ab0]">У цій категорії</p>
              <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#102749]">
                {getServiceCategoryLabel(service.category)}
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {categoryServices.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/services/${item.slug}`}
                    className={cn(
                      "inline-flex rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      item.slug === service.slug
                        ? "border-[#1f57f2] bg-[#eef4ff] text-[#1f57f2]"
                        : "border-[#dbe7ff] bg-white text-slate-700 hover:border-[#bfd3ff] hover:bg-[#f7faff]",
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[2.25rem] border border-[#dbe7ff] bg-white shadow-[0_26px_60px_-44px_rgba(15,23,42,0.16)]">
            <CardContent className="grid gap-4 p-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-[#edf4ff] text-[#1f57f2]">
                  <CalendarDays className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#102749]">Як проходить запис</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Оберіть послугу, лікаря або автопідбір, дату і зручний вільний час.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-[#edf4ff] text-[#1f57f2]">
                  <MapPin className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#102749]">Де ми знаходимося</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {clinicProfile.city}, {clinicProfile.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-[#edf4ff] text-[#1f57f2]">
                  <Phone className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#102749]">Як зв’язатися</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {clinicProfile.phone} · {clinicProfile.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-[2.25rem] bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] p-6 shadow-[0_24px_56px_-44px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#5b7ab0]">Ще може підійти</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#102749]">
                  Схожі напрямки
                </p>
              </div>
              <Link href="/services" className="text-sm font-medium text-[#1f57f2]">
                Усі послуги
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {relatedServices.map((item) => (
                <Link
                  key={item.slug}
                  href={`/services/${item.slug}`}
                  className="group flex items-center justify-between rounded-[1.4rem] border border-[#e2ecff] bg-white px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cfe0ff]"
                >
                  <div>
                    <p className="text-base font-semibold text-[#102749]">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.shortDescription}</p>
                  </div>
                  <span className="ml-4 flex size-10 items-center justify-center rounded-full border border-[#d7e5ff] bg-[#f8fbff] text-[#3159b8] transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
