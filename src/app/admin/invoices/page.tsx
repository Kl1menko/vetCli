import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminInvoicesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Оплати та рахунки</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Тут можна створювати рахунки, оновлювати статус оплати і додавати PDF або пов&rsquo;язані файли.
      </CardContent>
    </Card>
  );
}
