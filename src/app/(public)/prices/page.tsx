import type { Metadata } from "next";

import { pricingPreview } from "@/constants/site";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Ціни",
  description:
    "Орієнтовні ціни на базові ветеринарні послуги в UltraVet: первинний прийом, вакцинація, УЗД та стоматологія.",
  path: "/prices",
});

export default function PricesPage() {
  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading eyebrow="Ціни" title="Орієнтовний прайс на базові послуги" description="Фінальна вартість залежить від складності випадку, додаткової діагностики, анестезії та витратних матеріалів." />
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {pricingPreview.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{item.price}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
