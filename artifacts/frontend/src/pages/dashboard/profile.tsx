import { useUser } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Save } from "lucide-react";

export default function DashboardProfile() {
  const { user } = useUser();

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
              <img 
                src={user.imageUrl} 
                alt={user.fullName || "User"} 
                className="w-24 h-24 rounded-2xl border-2 border-white/10"
              />
              <button className="absolute -bottom-2 -right-2 bg-violet-600 text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/10 hover:bg-violet-700 transition-colors">
                <User className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{user.fullName}</h3>
              <p className="text-zinc-400">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">First Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    defaultValue={user.firstName || ""} 
                    className="bg-black/50 border-white/10 pl-10 text-white" 
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Last Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    defaultValue={user.lastName || ""} 
                    className="bg-black/50 border-white/10 pl-10 text-white" 
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input 
                  defaultValue={user.primaryEmailAddress?.emailAddress || ""} 
                  className="bg-black/50 border-white/10 pl-10 text-white text-zinc-500" 
                  disabled
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">To change your email, please use the account security settings.</p>
            </div>

            <div className="pt-6 flex justify-end">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-zinc-400" /> Security
          </CardTitle>
          <CardDescription className="text-zinc-400">Manage your account security and password</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}