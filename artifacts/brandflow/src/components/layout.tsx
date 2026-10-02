import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  LineChart, 
  MessageSquare, 
  Inbox, 
  Settings, 
  Database, 
  Users, 
  CreditCard, 
  User, 
  BotMessageSquare,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Sparkles, label: "Generate AI", href: "/dashboard/generate", highlight: true },
  { icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
  { icon: LineChart, label: "Analytics", href: "/dashboard/analytics" },
  { icon: MessageSquare, label: "Comments", href: "/dashboard/comments" },
  { icon: Inbox, label: "Inbox", href: "/dashboard/inbox" },
  { icon: BotMessageSquare, label: "AI Chat", href: "/dashboard/ai-chat" },
];

const settingsItems = [
  { icon: Settings, label: "Brand Profile", href: "/dashboard/brand" },
  { icon: Database, label: "Knowledge Base", href: "/dashboard/knowledge" },
  { icon: Users, label: "Team", href: "/dashboard/team" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
];

export function Layout({ children, title }: LayoutProps) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const NavLinks = () => (
    <>
      <div className="space-y-1 mb-8">
        <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Platform</p>
        {navItems.map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                active 
                  ? "bg-violet-600/10 text-violet-400" 
                  : item.highlight 
                    ? "text-violet-300 hover:bg-zinc-800/50 hover:text-violet-200" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}>
                <item.icon className={`w-4 h-4 ${active ? "text-violet-500" : ""}`} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="space-y-1">
        <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Settings</p>
        {settingsItems.map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <span className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                active 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}>
                <item.icon className={`w-4 h-4 ${active ? "text-zinc-300" : ""}`} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#050508] text-zinc-100 overflow-hidden font-sans">
      {/* Background noise */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A0A0F]/80 backdrop-blur-xl border-r border-white/5 z-10">
        <div className="p-6">
          <Link href="/dashboard">
            <span className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">BrandFlow</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <img src={user?.imageUrl || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=7C3AED&color=fff`} alt="User" className="w-9 h-9 rounded-full border border-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">{user?.fullName || "User"}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <Link href="/dashboard/profile">
            <span className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-400 hover:text-zinc-200 cursor-pointer rounded-lg hover:bg-white/5 transition-colors mb-1">
              <User className="w-4 h-4" />
              Profile
            </span>
          </Link>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-zinc-400 hover:text-red-400 cursor-pointer rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 min-w-0 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0A0A0F]/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-zinc-400 hover:text-white">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-[#0A0A0F] border-white/5 p-0 flex flex-col">
                <div className="p-6">
                  <span className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">BrandFlow</span>
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-2">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <Sparkles className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}