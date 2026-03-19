import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { clinicServices } from "@/constants/site";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Послуги",
  description:
    "Основні послуги UltraVet: терапія, хірургія, стоматологія, УЗД, вакцинація, аналізи та супровід після прийому.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading eyebrow="Послуги" title="Основні напрямки UltraVet" description="Працюємо з профілактикою, діагностикою, лікуванням і супроводом тварини після прийому без розриву між публічним сайтом і медичною історією." />
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {clinicServices.map((service) => (
          <Link key={service.slug} href={`/services/${service.slug}`} className="group block">
            <Card className="h-full transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {service.shortDescription}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
