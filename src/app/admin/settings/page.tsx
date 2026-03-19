import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Налаштування клініки</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Тут будуть загальні параметри клініки: графік роботи, системні налаштування і службові конфігурації.
      </CardContent>
    </Card>
  );
}
