import * as React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ProjectSwitcher } from "./project-switcher";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/10 min-h-screen">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border/50 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <ProjectSwitcher />
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-3.5rem)]">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}