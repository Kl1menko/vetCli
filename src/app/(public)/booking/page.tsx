import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { BookingForm } from "@/components/forms/booking-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { createPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

export const metadata: Metadata = createPageMetadata({
  title: "Онлайн-запис",
  description:
    "Запишіть тварину на прийом онлайн: оберіть послугу, лікаря або будь-якого доступного спеціаліста, дату та реальний вільний слот.",
  path: "/booking",
});

export default async function BookingPage() {
  const session = await auth();
  const ownerProfile = session?.user?.id
    ? await prisma.ownerProfile.findUnique({
        where: { userId: session.user.id },
        include: { pets: true },
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

  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading
        eyebrow="Онлайн-запис"
        title="Запис на прийом з реальним вибором вільного часу"
        description="Day-grid календар показує лише ті слоти, які справді доступні з урахуванням графіка лікаря, блокувань і тривалості послуги."
        align="center"
      />
      <div className="mt-10 w-full">
        {session?.user?.role === "CLIENT" && ownerProfile ? (
          <BookingForm
            pets={ownerProfile.pets.map((pet) => ({ id: pet.id, name: pet.name }))}
            services={services}
            doctors={doctors}
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <p className="text-lg font-medium">Для реального онлайн-запису потрібно увійти як клієнт.</p>
              <p className="text-sm text-muted-foreground">
                Після входу ти зможеш обрати власну тварину, послугу, лікаря, дату і доступний час.
              </p>
              <div className="flex gap-3">
                <Link href="/login" className={buttonVariants()}>
                  Увійти
                </Link>
                <Link href="/register" className={cn(buttonVariants({ variant: "outline" }))}>
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
