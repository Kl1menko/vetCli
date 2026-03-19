import type { Metadata } from "next";

import { clinicProfile } from "@/constants/site";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Про клініку",
  description:
    "Дізнайтесь більше про підхід UltraVet у Львові: уважний сервіс, доказова ветеринарія, профілактика та супровід тварини на всіх етапах лікування.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading
        eyebrow="Про клініку"
        title="UltraVet поєднує уважний сервіс, клінічну системність і спокійну комунікацію з власником."
        description="Ми працюємо так, щоб кожен прийом мав чіткий маршрут: від запису і огляду до рекомендацій, контрольного візиту та збереженої медичної історії."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-semibold text-foreground">Доказовий підхід</p>
            <p className="mt-3">
              Для нас важливі послідовна діагностика, зрозуміле пояснення власнику тварини і спокійне планування подальших кроків без зайвих процедур.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-semibold text-foreground">Комфорт без хаосу</p>
            <p className="mt-3">
              Онлайн-запис, попередня історія звернень, результати аналізів і призначення зібрані в одному місці, щоб візит починався не з пошуку інформації.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-8 text-sm leading-7 text-muted-foreground">
            <p className="font-semibold text-foreground">Локальна клініка з людським тоном</p>
            <p className="mt-3">
              {clinicProfile.name} у {clinicProfile.city} працює для тих, кому важливі ясність, повага до часу і відчуття, що тварину тут справді знають.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
