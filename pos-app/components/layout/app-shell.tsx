import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { GamificationProvider } from "@/components/gamification/gamification-context";

/**
 * Standard authenticated page shell: responsive sidebar + top bar + content,
 * wrapped in the gamification provider so any page can award XP and show
 * celebration toasts via useGamification().
 */
export function AppShell({
  title,
  userId,
  children,
}: {
  title: string;
  userId: string;
  children: React.ReactNode;
}) {
  return (
    <GamificationProvider userId={userId}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Topbar title={title} />
          <main className="p-6 pb-24 sm:pb-6">{children}</main>
        </div>
      </div>
    </GamificationProvider>
  );
}
