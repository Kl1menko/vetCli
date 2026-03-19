import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireDoctorAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function DoctorPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireDoctorAccess();
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!doctor) {
    notFound();
  }

  const pet = await prisma.pet.findFirst({
    where: {
      id,
      OR: [
        {
          appointments: {
            some: {
              doctorId: doctor.id,
            },
          },
        },
        {
          visits: {
            some: {
              doctorId: doctor.id,
            },
          },
        },
      ],
    },
    include: {
      owner: true,
      appointments: {
        where: { doctorId: doctor.id },
        include: {
          service: true,
          visit: true,
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
      },
      visits: {
        where: { doctorId: doctor.id },
        include: {
          diagnoses: true,
          prescriptions: true,
          labResults: true,
          invoice: true,
          appointment: {
            include: {
              service: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      vaccinations: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!pet) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{pet.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Власник</p>
            <p className="font-medium">{pet.owner.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Вид / порода</p>
            <p className="font-medium">{pet.species} · {pet.breed ?? "Без породи"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Вік / дата народження</p>
            <p className="font-medium">{pet.birthDate ? pet.birthDate.toLocaleDateString("uk-UA") : "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Мікрочип</p>
            <p className="font-medium">{pet.microchipNumber ?? "—"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">Алергії</p>
            <p className="font-medium">{pet.allergies ?? "Не вказано"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">Хронічні стани</p>
            <p className="font-medium">{pet.chronicConditions ?? "Не вказано"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Записи по цій тварині</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {pet.appointments.length ? (
            pet.appointments.map((appointment) => (
              <div key={appointment.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {appointment.date.toLocaleDateString("uk-UA")} · {appointment.startTime}
                    </p>
                    <p className="text-sm text-muted-foreground">{appointment.service.name}</p>
                  </div>
                  {appointment.visit ? (
                    <Link href={`/doctor/visits/${appointment.visit.id}`} className={cn(buttonVariants({ size: "sm" }))}>
                      Відкрити візит
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">Візит ще не створено</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="У вас ще не було прийомів по цій тварині"
              description="Коли з’являться записи, тут можна буде швидко перейти до візиту і побачити короткий контекст по кожному зверненню."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Що було на минулих прийомах</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {pet.visits.length ? (
            pet.visits.map((visit) => (
              <div key={visit.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {visit.appointment.date.toLocaleDateString("uk-UA")} · {visit.appointment.service.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Діагнозів: {visit.diagnoses.length} · Призначень: {visit.prescriptions.length} · Аналізів: {visit.labResults.length}
                    </p>
                  </div>
                  <Link href={`/doctor/visits/${visit.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    Перейти до візиту
                  </Link>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{visit.summary ?? "Підсумок ще не заповнений."}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Рахунок: {visit.invoice ? `${visit.invoice.totalAmount.toString()} грн` : "ще не створено"}
                </p>
              </div>
            ))
          ) : (
            <EmptyState
              title="Історія поки порожня"
              description="Після створення візиту тут з’являться діагнози, призначення, аналізи та короткий підсумок прийому."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
