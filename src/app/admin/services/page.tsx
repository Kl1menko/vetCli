import { createServiceAction, deleteServiceAction, updateServiceAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminAccess } from "@/lib/auth/access";
import { clinicServices } from "@/constants/site";
import { prisma } from "@/lib/prisma";

function getServiceDisplayLabel(value: string) {
  return clinicServices.find((service) => service.slug === value)?.title ?? value;
}

export default async function AdminServicesPage() {
  await requireAdminAccess();

  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Додати послугу</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createServiceAction} className="grid gap-4">
            <input name="name" placeholder="Назва" className="h-10 rounded-lg border border-input px-3" />
            <input name="slug" placeholder="Системна назва для URL" className="h-10 rounded-lg border border-input px-3" />
            <input name="category" placeholder="Категорія українською або slug напряму" className="h-10 rounded-lg border border-input px-3" />
            <input name="durationMinutes" placeholder="Тривалість (хв)" className="h-10 rounded-lg border border-input px-3" />
            <input name="price" placeholder="Ціна" className="h-10 rounded-lg border border-input px-3" />
            <textarea name="description" placeholder="Опис послуги" className="min-h-24 rounded-lg border border-input px-3 py-2" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked />
              Активна послуга
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isOnlineBookable" defaultChecked />
              Доступна для онлайн-запису
            </label>
            <Button type="submit">Створити послугу</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Усі послуги</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getServiceDisplayLabel(service.category)} · {service.durationMinutes} хв
                  </p>
                  <p className="text-sm text-muted-foreground">{Number(service.price)} грн</p>
                </div>
                <form action={deleteServiceAction}>
                  <input type="hidden" name="serviceId" value={service.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Видалити
                  </Button>
                </form>
              </div>
              <details className="mt-4 rounded-xl border border-dashed border-border p-4">
                <summary className="cursor-pointer text-sm font-medium">Редагувати</summary>
                <form action={updateServiceAction} className="mt-4 grid gap-3">
                  <input type="hidden" name="serviceId" value={service.id} />
                  <input name="name" defaultValue={service.name} className="h-10 rounded-lg border border-input px-3" />
                  <input name="slug" defaultValue={service.slug} className="h-10 rounded-lg border border-input px-3" />
                  <input name="category" defaultValue={service.category} className="h-10 rounded-lg border border-input px-3" />
                  <input name="durationMinutes" defaultValue={service.durationMinutes} className="h-10 rounded-lg border border-input px-3" />
                  <input name="price" defaultValue={Number(service.price)} className="h-10 rounded-lg border border-input px-3" />
                  <textarea
                    name="description"
                    defaultValue={service.description}
                    className="min-h-24 rounded-lg border border-input px-3 py-2"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isActive" defaultChecked={service.isActive} />
                    Активна послуга
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isOnlineBookable" defaultChecked={service.isOnlineBookable} />
                    Доступна для онлайн-запису
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
