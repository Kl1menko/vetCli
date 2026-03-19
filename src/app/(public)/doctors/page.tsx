import type { Metadata } from "next";

import { doctorsPreview } from "@/constants/site";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Лікарі",
  description:
    "Познайомтесь із командою UltraVet: спеціалізації лікарів, напрямки роботи та короткі профілі перед записом на прийом.",
  path: "/doctors",
});

export default function DoctorsPage() {
  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading eyebrow="Лікарі" title="Команда UltraVet" description="Оберіть спеціаліста за напрямком або запишіться до будь-якого доступного лікаря, якщо важливіше знайти найближчий вільний час." />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {doctorsPreview.map((doctor) => (
          <Card key={doctor.name}>
            <CardHeader>
              <CardTitle>{doctor.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{doctor.specialization}</p>
              <p>{doctor.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
