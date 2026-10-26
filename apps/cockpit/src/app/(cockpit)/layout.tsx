import { Brand } from "@/components/brand";
import { LogoutButton } from "@/components/logout-button";
import { BottomNav, SideNav } from "@/components/nav";
import { requireUser } from "@/lib/session";

export default async function CockpitLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-1">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar p-4 md:flex">
        <div className="px-3 pb-6 pt-2">
          <Brand />
        </div>
        <SideNav />
        <div className="mt-auto border-t pt-4">
          <p className="truncate px-3 pb-2 text-xs text-muted-foreground">{user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur md:hidden">
          <Brand />
          <LogoutButton />
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:px-8 md:py-10 md:pb-10">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
