import { deleteServiceFormAction } from "@/server/actions/admin";
import { AdminServiceCreateForm } from "@/components/forms/admin-service-create-form";
import { AdminServiceUpdateForm } from "@/components/forms/admin-service-update-form";
import { ActionButtonForm } from "@/components/forms/action-button-form";
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
          <AdminServiceCreateForm />
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
                <ActionButtonForm
                  action={deleteServiceFormAction}
                  fields={[{ name: "serviceId", value: service.id }]}
                  submitLabel="Деактивувати"
                  pendingLabel="Деактивую…"
                  variant="outline"
                  size="sm"
                  successTitle="Послугу деактивовано"
                  errorTitle="Не вдалося деактивувати послугу"
                />
              </div>
              <details className="mt-4 rounded-xl border border-dashed border-border p-4">
                <summary className="cursor-pointer text-sm font-medium">Редагувати</summary>
                <AdminServiceUpdateForm
                  service={{
                    id: service.id,
                    name: service.name,
                    slug: service.slug,
                    category: service.category,
                    durationMinutes: service.durationMinutes,
                    price: Number(service.price),
                    description: service.description,
                    isActive: service.isActive,
                    isOnlineBookable: service.isOnlineBookable,
                  }}
                />
              </details>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
