import type { ReactNode } from "react";

import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { SessionUser } from "@/lib/auth/types";

type DashboardShellProps = {
  children: ReactNode;
  user: SessionUser;
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar isAdmin={user.role === "admin"} user={user} />
      <SidebarInset className="bg-muted/40">
        <DashboardHeader />
        <main className="flex w-full min-w-0 flex-1 flex-col gap-4 p-4 sm:p-6 has-data-fullbleed:h-[calc(100svh-3.5rem)] has-data-fullbleed:min-h-0 has-data-fullbleed:gap-0 has-data-fullbleed:overflow-hidden has-data-fullbleed:p-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
