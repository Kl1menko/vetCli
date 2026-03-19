import type { Metadata } from "next";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Відгуки",
  description:
    "Відгуки клієнтів UltraVet про турботу лікарів, зручний онлайн-запис та зрозумілу комунікацію після прийому.",
  path: "/reviews",
});

export default function ReviewsPage() {
  return (
    <main className="w-full px-[15px] py-16">
      <SectionHeading eyebrow="Відгуки" title="Що власники тварин цінують в UltraVet" description="Спокійна комунікація, ясні рекомендації після прийому і можливість повернутися до всієї історії звернень у кабінеті." />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          "Пояснили план лікування простою мовою, без поспіху і зайвого тиску. Дуже сподобалося, що після візиту всі призначення лишилися в кабінеті.",
          "Записали кота онлайн на найближчий слот без дзвінків. На прийомі все було спокійно, а результати аналізів отримали в тому ж профілі.",
          "Відчутно, що лікарі працюють системно: видно попередні звернення, рекомендації і контрольні кроки. Це знижує стрес і для нас, і для тварини.",
        ].map((review) => (
          <Card key={review}>
            <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
              {review}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
