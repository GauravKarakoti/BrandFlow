import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Link as LinkIcon, 
  Unlink, 
  Loader2,
  CheckCircle2
} from "lucide-react";

const PLATFORMS = [
  { id: "x", name: "X (Twitter)", icon: Twitter, description: "Auto-publish tweets and threads." },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, description: "Publish posts to your professional network." },
  { id: "instagram", name: "Instagram", icon: Instagram, description: "Schedule visual content and carousels." },
  { id: "facebook", name: "Facebook", icon: Facebook, description: "Post directly to your Facebook Page." },
];

export default function Settings() {
  const { activeProjectId, authFetch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch connected accounts
  const { data: connectedAccounts, isLoading } = useQuery({
    queryKey: ["integrations", activeProjectId],
    queryFn: async () => {
      const res = await authFetch(`${BACKEND_URL}/api/integrations`);
      if (!res.ok) throw new Error("Failed to fetch integrations");
      return res.json();
    },
    enabled: !!activeProjectId,
  });

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await authFetch(`${BACKEND_URL}/api/integrations/auth-url/${provider}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Connection failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Perform a hard redirect to the OAuth Provider
      window.location.href = data.url;
    },
    onError: (error: any) => toast({ title: "Failed to connect", description: error.message, variant: "destructive" })
  });

  // Disconnect Mutation
  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`${BACKEND_URL}/api/integrations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Disconnect failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", activeProjectId] });
      toast({ title: "Account disconnected." });
    },
    onError: () => toast({ title: "Error", description: "Failed to disconnect account.", variant: "destructive" })
  });

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-indigo-500" />
          Workspace Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your integrations, billing, and team preferences for this workspace.
        </p>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="integrations">Social Accounts</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const connectedAccount = connectedAccounts?.find((acc: any) => acc.provider === platform.id);
              const isConnected = !!connectedAccount;
              const isConnecting = connectMutation.isPending && connectMutation.variables === platform.id;
              
              return (
                <Card key={platform.id} className="border-border/60">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${isConnected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{platform.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{platform.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {isConnected ? (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {connectedAccount.profileName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{connectedAccount.profileName}</p>
                            <p className="text-xs text-muted-foreground truncate">{connectedAccount.profileHandle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => disconnectMutation.mutate(connectedAccount.id)}
                            disabled={disconnectMutation.isPending}
                          >
                            <Unlink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => connectMutation.mutate(platform.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                        Connect {platform.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <SettingsIcon className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold">General Settings</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Workspace name configuration, timezone settings, and team member management will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}