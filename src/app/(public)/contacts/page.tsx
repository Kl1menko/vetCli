import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";

import { ClinicPhoneLink } from "@/components/shared/clinic-phone-link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { clinicProfile } from "@/constants/site";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Контакти",
  description:
    "Контакти UltraVet у Львові: адреса, телефон, години роботи та швидкий маршрут до клініки.",
  path: "/contacts",
});

export default function ContactsPage() {
  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading eyebrow="Контакти" title="Клініка, яку легко знайти і зручно відвідати" description="Телефон, адреса, графік роботи і коротка довідка для першого візиту до UltraVet." />
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="flex flex-col gap-6 p-8">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 text-primary" />
              <div>
                <p className="font-semibold">{clinicProfile.address}</p>
                <p className="text-sm text-muted-foreground">{clinicProfile.city}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 size-5 text-primary" />
              <div>
                <ClinicPhoneLink className="font-semibold text-foreground">
                  {clinicProfile.phone}
                </ClinicPhoneLink>
                <p className="text-sm text-muted-foreground">{clinicProfile.email}</p>
                <p className="text-sm text-muted-foreground">{clinicProfile.hours}</p>
                <p className="text-sm text-muted-foreground">{clinicProfile.closedDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex min-h-[360px] flex-col justify-between rounded-[2rem] border border-dashed border-border bg-muted/50 p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Перед візитом</p>
            <p className="mt-4 text-lg font-medium text-foreground">Якщо це перше звернення, підготуй коротку історію симптомів і список ліків, які тварина вже отримує.</p>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted-foreground">
            Для планових оглядів, вакцинації чи повторного візиту зручніше скористатися онлайн-записом, щоб одразу обрати доступний час і потрібного спеціаліста.
          </p>
        </div>
      </div>
    </main>
  );
}
