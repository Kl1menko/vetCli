import type { Metadata } from "next";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "FAQ",
  description:
    "Поширені питання про онлайн-запис, підготовку до прийому, оплату, аналізи та документи після візиту до UltraVet.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading eyebrow="FAQ" title="Відповіді на базові питання перед записом" description="Коротко про те, як працює запис, що підготувати до візиту і де після прийому шукати документи та рекомендації." />
      <div className="mt-10 grid gap-4">
        {[
          [
            "Як працює онлайн-запис?",
            "Оберіть послугу, лікаря або режим “будь-який доступний лікар”, дату та вільний час. Після підтвердження запис з’явиться у вашому кабінеті.",
          ],
          [
            "Що підготувати до першого прийому?",
            "Візьміть попередні висновки, результати аналізів, список ліків або добавок, які тварина вже отримує, і коротко занотуйте основні симптоми.",
          ],
          [
            "Де знайти результати аналізів і призначення після візиту?",
            "Після прийому лікар додає візит, призначення, аналізи та рахунок у систему, а власник бачить їх у своєму кабінеті.",
          ],
        ].map(([question, answer]) => (
          <Card key={question}>
            <CardHeader>
              <CardTitle className="text-xl">{question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {answer}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
