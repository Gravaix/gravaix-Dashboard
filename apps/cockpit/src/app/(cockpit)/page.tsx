import { CalendarDays, ClipboardList, Mail, TimerReset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

const tiles = [
  { title: "Neue Anfragen", icon: Mail },
  { title: "Offene Aufträge", icon: ClipboardList },
  { title: "Termine heute", icon: CalendarDays },
  { title: "Fällige Deadlines", icon: TimerReset },
];

export default function UebersichtPage() {
  return (
    <>
      <PageHeader title="Übersicht" description="Alles Wichtige auf einen Blick." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ title, icon: Icon }) => (
          <Card key={title} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="size-4" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">–</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Die Zahlen erscheinen, sobald Mails, Aufträge und Kalender angebunden sind.
      </p>
    </>
  );
}
