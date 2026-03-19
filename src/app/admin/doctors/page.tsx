import { createDoctorAction, deleteDoctorAction, updateDoctorAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";

export default async function AdminDoctorsPage() {
  await requireAdminAccess();

  const doctors = await prisma.doctor.findMany({
    orderBy: { fullName: "asc" },
    include: { user: true },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Додати лікаря</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDoctorAction} className="grid gap-4">
            <input name="fullName" placeholder="ПІБ" className="h-10 rounded-lg border border-input px-3" />
            <input name="email" placeholder="Email" className="h-10 rounded-lg border border-input px-3" />
            <input name="password" placeholder="Тимчасовий пароль" className="h-10 rounded-lg border border-input px-3" />
            <input name="specialization" placeholder="Спеціалізація" className="h-10 rounded-lg border border-input px-3" />
            <textarea name="bio" placeholder="Коротке біо" className="min-h-24 rounded-lg border border-input px-3 py-2" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked />
              Активний лікар
            </label>
            <Button type="submit">Створити лікаря</Button>
          </form>
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
                <form action={deleteDoctorAction}>
                  <input type="hidden" name="doctorId" value={doctor.id} />
                  <input type="hidden" name="userId" value={doctor.userId} />
                  <Button type="submit" variant="outline" size="sm">
                    Видалити
                  </Button>
                </form>
              </div>
              <details className="mt-4 rounded-xl border border-dashed border-border p-4">
                <summary className="cursor-pointer text-sm font-medium">Редагувати</summary>
                <form action={updateDoctorAction} className="mt-4 grid gap-3">
                  <input type="hidden" name="doctorId" value={doctor.id} />
                  <input type="hidden" name="userId" value={doctor.userId} />
                  <input name="fullName" defaultValue={doctor.fullName} className="h-10 rounded-lg border border-input px-3" />
                  <input name="email" defaultValue={doctor.user.email ?? ""} className="h-10 rounded-lg border border-input px-3" />
                  <input name="specialization" defaultValue={doctor.specialization} className="h-10 rounded-lg border border-input px-3" />
                  <textarea name="bio" defaultValue={doctor.bio ?? ""} className="min-h-24 rounded-lg border border-input px-3 py-2" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isActive" defaultChecked={doctor.isActive} />
                    Активний лікар
                  </label>
                  <Button type="submit">Зберегти зміни</Button>
                </form>
              </details>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
