import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Linkedin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Your Profile</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage your personal settings</p>
        </div>
      </div>

      <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
            <div className="relative">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name || "User"} 
                  className="w-24 h-24 rounded-2xl border-2 border-white/10 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-2 border-white/10 bg-zinc-800 flex items-center justify-center">
                  <User className="w-10 h-10 text-zinc-500" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-[#0A66C2] text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/10">
                <Linkedin className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
              <p className="text-zinc-400">{user.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input 
                  defaultValue={user.name || ""} 
                  className="bg-black/50 border-white/10 pl-10 text-white" 
                  readOnly
                  disabled
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">Your name is synced directly from your LinkedIn profile.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input 
                  defaultValue={user.email || ""} 
                  className="bg-black/50 border-white/10 pl-10 text-white text-zinc-500" 
                  readOnly
                  disabled
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">To change your email, please update it on your connected LinkedIn account.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}