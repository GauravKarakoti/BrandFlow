import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  PenTool,
  CalendarDays,
  Database,
  Settings,
} from "lucide-react";

// Navigation items derived from the BrandFlow PRD
const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Content Generator", url: "/generate", icon: PenTool },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Agent Configuration", url: "/agent", icon: Settings },
];

const settingsItems = [
  { title: "Knowledge Base", url: "/knowledge", icon: Database },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-2.5 border-b border-border/50">
        <div className="flex items-center gap-2 font-semibold text-lg text-primary tracking-tight">
          <img 
            src="/logo.png" 
            alt="BrandFlow Logo" 
            className="h-10 w-10 object-contain" 
          />
          <span>BrandFlow</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}