import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Loader2, 
  Bot, 
  CalendarClock, 
  MessageSquareText 
} from "lucide-react";
import { BACKEND_URL } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Types for strict TypeScript adherence
interface AgentSettings {
  isActive: boolean;
  frequency: number;
  contentTopics: string;
}

export default function AgentConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authFetch, activeProjectId } = useAuth();

  // Form State
  const [isActive, setIsActive] = React.useState(false);
  const [frequency, setFrequency] = React.useState([3]);
  const [contentTopics, setContentTopics] = React.useState("");

  // 1. Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["agentSettings", activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return null;
      const res = await authFetch(`${BACKEND_URL}/api/projects/${activeProjectId}/agent-settings`);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
    enabled: !!activeProjectId, // Only run query if a project is active
  });

  // Sync server data to local state when loaded
  React.useEffect(() => {
    if (settings) {
      setIsActive(settings.isActive);
      setFrequency([settings.frequency]);
      setContentTopics(settings.contentTopics || "");
    }
  }, [settings]);

  // 2. Mutation to save settings
  const mutation = useMutation({
    mutationFn: async (payload: AgentSettings) => {
      const res = await authFetch(`${BACKEND_URL}/api/projects/${activeProjectId}/agent-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentSettings", activeProjectId] });
      toast({
        title: "Agent Settings Saved",
        description: "Your autonomous agent has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    mutation.mutate({
      isActive,
      frequency: frequency[0],
      contentTopics,
    });
  };

  // Match the loading state from Knowledge Base
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Agent</h1>
          <p className="text-muted-foreground mt-1">
            Configure your autopilot settings. When active, BrandFlow will automatically generate and schedule posts.
          </p>
        </div>
        <Button className="gap-2" onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Autopilot Configuration
          </CardTitle>
          <CardDescription>
            Control how frequently the AI posts and define the strict topics it should focus on.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Toggle Autopilot */}
          <div className={`flex items-center justify-between rounded-xl border p-6 transition-colors ${isActive ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 border-border/60'}`}>
            <div className="space-y-1">
              <Label className="text-base font-semibold">Enable Autopilot</Label>
              <p className="text-sm text-muted-foreground">
                Allow the background worker to operate autonomously.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label="Toggle autopilot"
            />
          </div>

          {/* Frequency Slider */}
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                Posting Frequency
              </Label>
              <span className="text-sm font-medium text-primary">
                {frequency[0]} posts / week
              </span>
            </div>
            <Slider
              value={frequency}
              onValueChange={setFrequency}
              max={14}
              min={1}
              step={1}
              className="w-full"
              disabled={!isActive}
            />
            <p className="text-sm text-muted-foreground">
              How many times per week should the agent schedule a post?
            </p>
          </div>

          {/* Content Topics */}
          <div className="grid gap-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <MessageSquareText className="h-4 w-4 text-muted-foreground" />
              Core Content Pillars & Topics
            </Label>
            <Textarea
              placeholder="e.g., SaaS growth metrics, bootstrapping tips, AI in marketing, building in public..."
              className="min-h-[120px] resize-none"
              value={contentTopics}
              onChange={(e) => setContentTopics(e.target.value)}
              disabled={!isActive}
            />
            <p className="text-sm text-muted-foreground">
              Provide the specific subjects the AI should strictly stick to when generating content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}