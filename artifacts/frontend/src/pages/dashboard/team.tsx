import { useState } from "react";
import { useListTeam, useInviteTeamMember, useRemoveTeamMember, TeamInviteInputRole } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Mail, Trash2, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DashboardTeam() {
  const { data: team, isLoading, refetch } = useListTeam({ query: { queryKey: ["team"] } });
  const inviteMutation = useInviteTeamMember();
  const removeMutation = useRemoveTeamMember();
  
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamInviteInputRole>("editor");

  const handleInvite = () => {
    if (!email) return toast.error("Email is required");
    inviteMutation.mutate(
      { data: { email, role } },
      {
        onSuccess: () => {
          toast.success("Invitation sent");
          setOpen(false);
          setEmail("");
          refetch();
        }
      }
    );
  };

  const handleRemove = (id: number) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast.success("Member removed");
            refetch();
          }
        }
      );
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'owner': return <span className="text-xs px-2 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">Owner</span>;
      case 'admin': return <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Admin</span>;
      case 'editor': return <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Editor</span>;
      default: return <span className="text-xs px-2 py-1 rounded bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 font-medium capitalize">{role}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" /> Team Management
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Manage who has access to your brand workspace</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <UserPlus className="w-4 h-4 mr-2" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0F] border border-white/10 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                    className="bg-black/50 border-white/10 pl-9" placeholder="colleague@company.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Role</label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger className="bg-black/50 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0F] border-white/10 text-white">
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="editor">Editor - Can create & publish posts</SelectItem>
                    <SelectItem value="viewer">Viewer - Read only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleInvite} disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
              <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {team?.map((member) => (
                <div key={member.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <img 
                      src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name || member.email}&background=1A1A24&color=fff`} 
                      alt={member.name || member.email} 
                      className="w-12 h-12 rounded-full border border-white/10 bg-black" 
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white">{member.name || member.email}</p>
                        {getRoleBadge(member.role)}
                        {member.status === 'invited' && <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Pending</span>}
                      </div>
                      <p className="text-sm text-zinc-500">{member.email} • Joined {format(new Date(member.createdAt), 'MMM yyyy')}</p>
                    </div>
                  </div>
                  {member.role !== 'owner' && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}