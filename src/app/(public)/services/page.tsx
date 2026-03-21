import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { clinicServices } from "@/constants/site";
import { createPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "Послуги",
  description:
    "Основні послуги UltraVet: терапія, хірургія, стоматологія, УЗД, вакцинація, аналізи та супровід після прийому.",
  path: "/services",
});

const serviceThemes = [
  "bg-[linear-gradient(135deg,#f7faff_0%,#edf4ff_100%)]",
  "bg-[linear-gradient(135deg,#f9fbff_0%,#eef3fb_100%)]",
  "bg-[linear-gradient(135deg,#f6fbff_0%,#edf8ff_100%)]",
  "bg-[linear-gradient(135deg,#fbfcff_0%,#f3f7ff_100%)]",
] as const;

export default function ServicesPage() {
  return (
    <main className="w-full px-[15px] py-16 md:py-20">
      <section className="rounded-[2.4rem] bg-[linear-gradient(135deg,#0f2a4f_0%,#163d72_54%,#1f57f2_100%)] px-5 py-8 text-white shadow-[0_30px_70px_-44px_rgba(16,39,73,0.52)] md:px-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/64">Послуги UltraVet</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.92] tracking-[-0.06em] md:text-[4.2rem]">
              Напрямки, з якими можна звернутися без зайвих сумнівів.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/78 md:text-[0.98rem]">
              Профілактика, діагностика, лікування, контроль після прийому і подальший маршрут для тварини.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Онлайн-запис", "24/7"],
              ["План лікування", "Після огляду"],
              ["Історія в кабінеті", "Завжди під рукою"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.6rem] bg-white/10 px-4 py-4 backdrop-blur-[2px]"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">{label}</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2.25rem] bg-white p-4 shadow-[0_26px_60px_-44px_rgba(15,23,42,0.18)] md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.22em] text-[#5b7ab0]">Оберіть напрямок</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#102749] md:text-[2.4rem]">
              Кожна послуга має короткий і зрозумілий опис.
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-slate-600">
            Якщо не впевнені, з чого почати, оберіть консультацію або терапію. Далі команда підкаже маршрут.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clinicServices.map((service, index) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-[#e2ecff] p-6 shadow-[0_24px_54px_-42px_rgba(15,23,42,0.2)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_30px_62px_-40px_rgba(15,23,42,0.22)]",
                serviceThemes[index % serviceThemes.length],
              )}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex rounded-full border border-[#d7e5ff] bg-white/92 px-3 py-1.5 text-xs font-medium text-[#3159b8]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-full border border-[#d7e5ff] bg-white/85 text-[#3159b8] transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
                <h3 className="mt-6 text-[1.8rem] font-semibold leading-[0.95] tracking-[-0.05em] text-[#102749]">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {service.shortDescription}
                </p>
                <div className="mt-6 pt-5 text-sm font-medium text-[#1f57f2]">
                  Детальніше
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
