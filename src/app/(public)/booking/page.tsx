import Link from "next/link";
import { CalendarDays, Clock3, PawPrint, ShieldCheck, Stethoscope } from "lucide-react";

import { auth } from "@/auth";
import { BookingForm } from "@/components/forms/booking-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Онлайн-запис",
    description:
      "Запишіть тварину на прийом онлайн: оберіть послугу, лікаря або будь-якого доступного спеціаліста, дату та реальний вільний час.",
    path: "/booking",
  });
}

export default async function BookingPage() {
  const session = await auth();
  const ownerProfile = session?.user?.id
    ? await prisma.ownerProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          pets: {
            where: { isArchived: false },
            orderBy: { name: "asc" },
          },
        },
      })
    : null;
  const [services, doctors] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true, isOnlineBookable: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, durationMinutes: true },
    }),
    prisma.doctor.findMany({
      where: { isActive: true },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, specialization: true },
    }),
  ]);

  const highlights = [
    {
      icon: CalendarDays,
      title: "Реальний календар",
      description: "Без випадкового часу і дзвінків для уточнення.",
    },
    {
      icon: Clock3,
      title: "30 секунд на вибір",
      description: "Тварина, послуга, лікар і готовий час в одному потоці.",
    },
    {
      icon: ShieldCheck,
      title: "Одразу в кабінеті",
      description: "Після бронювання запис видно без додаткових підтверджень.",
    },
  ];

  return (
    <main className="w-full px-[15px] py-6 md:py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#d9e4ef] bg-[linear-gradient(135deg,#f5fbfa_0%,#ffffff_54%,#eef7f5_100%)] px-5 py-6 shadow-[0_28px_80px_-62px_rgba(15,23,42,0.32)] md:px-7 md:py-7">
        <div className="relative grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
          <div className="max-w-3xl">
            <h1 className="max-w-4xl text-[2.2rem] leading-[0.94] font-semibold tracking-[-0.06em] text-slate-950 md:text-[3.8rem]">
              Онлайн-запис без довгих форм і випадкового часу
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Оберіть тварину, послугу і зручний час. Календар показує лише доступний час.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-[1.4rem] border border-white/90 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.2)]"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#e8efff] text-[#1f57f2]">
                    <Icon className="size-4" />
                  </div>
                  <p className="mt-3 text-sm font-semibold tracking-[-0.03em] text-slate-950 md:text-base">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-[#dbe5fb] bg-[linear-gradient(180deg,#173471_0%,#1f57f2_100%)] text-white shadow-[0_28px_70px_-46px_rgba(15,23,42,0.55)]">
            <CardContent className="grid gap-4 p-5">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/62">Три кроки</p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
                  Тварина, послуга, вільний час
                </p>
              </div>
              <div className="grid gap-3 text-sm leading-6 text-white/75">
                <div className="rounded-[1.1rem] border border-white/10 bg-white/7 px-4 py-3">1. Оберіть тварину і послугу</div>
                <div className="rounded-[1.1rem] border border-white/10 bg-white/7 px-4 py-3">2. Оберіть доступний день і час</div>
                <div className="rounded-[1.1rem] border border-white/10 bg-white/7 px-4 py-3">3. Підтвердьте запис</div>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-white/8 p-4 text-sm leading-6 text-white/72">
                <div className="flex items-center gap-2 text-white">
                  <Stethoscope className="size-4 text-[#bfd1ff]" />
                  <span className="font-semibold">Час не вигаданий</span>
                </div>
                <p className="mt-2">Система вже враховує графік лікаря, зайнятий час і тривалість послуги.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mt-8 w-full">
        {session?.user?.role === "CLIENT" && ownerProfile ? (
          <BookingForm
            pets={ownerProfile.pets.map((pet) => ({ id: pet.id, name: pet.name }))}
            services={services}
            doctors={doctors}
          />
        ) : (
          <Card className="overflow-hidden rounded-[2.2rem] border-[#d8def6] bg-[linear-gradient(135deg,#ffffff_0%,#f6f9ff_50%,#eef4ff_100%)] shadow-[0_28px_80px_-56px_rgba(15,23,42,0.38)]">
            <CardContent className="relative grid gap-7 p-6 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="absolute inset-y-0 right-0 hidden w-[30%] bg-[radial-gradient(circle_at_center,rgba(31,87,242,0.08),transparent_70%)] lg:block" />
              <div className="relative max-w-2xl">
                <p className="text-[1.9rem] font-semibold leading-[0.96] tracking-[-0.05em] text-slate-950 md:text-[2.35rem]">
                  Для онлайн-запису потрібен клієнтський акаунт
                </p>
                <p className="mt-4 max-w-xl text-[0.98rem] leading-7 text-slate-600">
                  Після входу Ви зможете обрати тварину, послугу, лікаря, дату і час.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#dbe3fb] bg-white/94 px-4 py-3 text-sm text-slate-700 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)]">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1f57f2]">
                      <PawPrint className="size-4.5" />
                    </span>
                    <span>Тварина з кабінету</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#dbe3fb] bg-white/94 px-4 py-3 text-sm text-slate-700 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)]">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1f57f2]">
                      <Stethoscope className="size-4.5" />
                    </span>
                    <span>Лікар або автопідбір</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-[1.2rem] border border-[#dbe3fb] bg-white/94 px-4 py-3 text-sm text-slate-700 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.2)]">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1f57f2]">
                      <CalendarDays className="size-4.5" />
                    </span>
                    <span>Актуальний вільний час</span>
                  </div>
                </div>
              </div>
              <div className="relative flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/login"
                  className={buttonVariants({
                    className:
                      "h-12 rounded-full bg-[#1f57f2] px-7 text-base shadow-[0_20px_38px_-22px_rgba(31,87,242,0.7)] hover:bg-[#194bdd] sm:min-w-[11rem] lg:h-13 lg:min-w-[13rem]",
                  })}
                >
                  Увійти
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 rounded-full border-[#d3ddfb] bg-white px-7 text-base text-[#102749] shadow-[0_18px_34px_-24px_rgba(15,23,42,0.18)] hover:bg-[#f8fbff] sm:min-w-[11rem] lg:h-13 lg:min-w-[13rem]",
                  )}
                >
                  Реєстрація
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </main>
  );
}
