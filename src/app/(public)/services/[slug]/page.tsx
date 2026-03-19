import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { clinicProfile, clinicServices, getClinicServiceBySlug } from "@/constants/site";
import { createPageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return clinicServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getClinicServiceBySlug(slug);

  if (!service) {
    return createPageMetadata({
      title: "Послуга не знайдена",
      description: "Опис обраної послуги не знайдено.",
      path: `/services/${slug}`,
    });
  }

  return createPageMetadata({
    title: service.title,
    description: service.shortDescription,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { slug } = await params;
  const service = getClinicServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading
        eyebrow="Послуга"
        title={service.title}
        description={service.shortDescription}
      />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardContent className="space-y-6 p-8">
            <p className="text-base leading-8 text-muted-foreground">{service.description}</p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Запис на цю послугу доступний через онлайн-форму або телефоном.</p>
              <p>
                Якщо потрібна допомога з вибором спеціаліста, адміністратор клініки підкаже, який формат
                прийому підійде саме вашій тварині.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/booking" className={buttonVariants()}>
                Записатися онлайн
              </Link>
              <a
                href={clinicProfile.phoneHref}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                {clinicProfile.phone}
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="flex min-h-[320px] flex-col justify-between rounded-[2rem] border border-dashed border-border bg-muted/40 p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Як проходить запис
            </p>
            <p className="mt-4 text-lg font-medium text-foreground">
              Обери зручний слот, вкажи тварину та коротко опиши запит, щоб команда підготувалася до прийому.
            </p>
          </div>
          <div className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>Місто: {clinicProfile.city}</p>
            <p>Адреса: {clinicProfile.address}</p>
            <p>Години роботи: {clinicProfile.hours}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
