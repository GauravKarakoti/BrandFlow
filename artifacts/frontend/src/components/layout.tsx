import * as React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/10 min-h-screen">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <div className="flex-1" />
          {/* We will add User Profile Dropdown and Workspace Selector here later */}
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-3.5rem)]">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}