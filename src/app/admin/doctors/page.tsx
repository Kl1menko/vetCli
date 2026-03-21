import {
  deactivateDoctorScheduleFormAction,
  deleteDoctorFormAction,
  upsertDoctorScheduleFormAction,
} from "@/server/actions/admin";
import { DoctorScheduleManager } from "@/components/forms/doctor-schedule-manager";
import { AdminDoctorCreateForm } from "@/components/forms/admin-doctor-create-form";
import { AdminDoctorUpdateForm } from "@/components/forms/admin-doctor-update-form";
import { ActionButtonForm } from "@/components/forms/action-button-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";

export default async function AdminDoctorsPage() {
  await requireAdminAccess();

  const doctors = await prisma.doctor.findMany({
    orderBy: { fullName: "asc" },
    include: {
      user: true,
      schedules: {
        orderBy: { weekday: "asc" },
      },
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Додати лікаря</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDoctorCreateForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Лікарі клініки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{doctor.fullName}</p>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                  <p className="text-sm text-muted-foreground">{doctor.isActive ? "Активний" : "Неактивний"}</p>
                </div>
                <ActionButtonForm
                  action={deleteDoctorFormAction}
                  fields={[
                    { name: "doctorId", value: doctor.id },
                    { name: "userId", value: doctor.userId },
                  ]}
                  submitLabel="Архівувати"
                  pendingLabel="Архівую…"
                  variant="outline"
                  size="sm"
                  successTitle="Лікаря архівовано"
                  errorTitle="Не вдалося архівувати лікаря"
                />
              </div>
              <details className="mt-4 rounded-xl border border-dashed border-border p-4">
                <summary className="cursor-pointer text-sm font-medium">Редагувати профіль</summary>
                <AdminDoctorUpdateForm
                  doctor={{
                    id: doctor.id,
                    userId: doctor.userId,
                    fullName: doctor.fullName,
                    email: doctor.user.email ?? "",
                    specialization: doctor.specialization,
                    bio: doctor.bio ?? "",
                    isActive: doctor.isActive,
                  }}
                />
              </details>
              <details className="mt-4 rounded-xl border border-dashed border-border p-4">
                <summary className="cursor-pointer text-sm font-medium">Тижневий графік</summary>
                <div className="mt-4">
                  <DoctorScheduleManager
                    doctorId={doctor.id}
                    canEditDoctorId
                    schedules={doctor.schedules.map((schedule) => ({
                      id: schedule.id,
                      weekday: schedule.weekday,
                      startTime: schedule.startTime,
                      endTime: schedule.endTime,
                      slotDurationMinutes: schedule.slotDurationMinutes,
                      breakStart: schedule.breakStart,
                      breakEnd: schedule.breakEnd,
                      isActive: schedule.isActive,
                    }))}
                    saveAction={upsertDoctorScheduleFormAction}
                    disableAction={deactivateDoctorScheduleFormAction}
                    title={`Графік ${doctor.fullName}`}
                    description="Саме цей тижневий шаблон використовується для календаря, онлайн-запису і вільних слотів."
                  />
                </div>
              </details>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
