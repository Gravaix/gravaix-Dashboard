import { CalendarDays, ClipboardList, LayoutDashboard, Mail } from "lucide-react";

export const navLinks = [
  { href: "/", label: "Übersicht", icon: LayoutDashboard },
  { href: "/mails", label: "Mails", icon: Mail },
  { href: "/auftraege", label: "Aufträge", icon: ClipboardList },
  { href: "/kalender", label: "Kalender", icon: CalendarDays },
] as const;
