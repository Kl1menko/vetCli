import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminVisitsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Історія прийомів</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Тут адміністратор бачить підсумки візитів, призначення, файли і чеки без редагування медичної частини.
      </CardContent>
    </Card>
  );
}
