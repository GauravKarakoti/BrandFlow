import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, 
  CalendarDays, 
  PenTool, 
  Clock, 
  CheckCircle2, 
  Linkedin,
  ArrowRight,
  Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BACKEND_URL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, activeProjectId, authFetch } = useAuth();

  // Fetch posts to calculate metrics and show upcoming queue
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", activeProjectId],
    queryFn: async () => {
      const res = await authFetch(`${BACKEND_URL}/api/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    enabled: !!activeProjectId,
  });

  // Calculate Metrics
  const drafts = posts?.filter((p: any) => p.status === 'draft') || [];
  const scheduled = posts?.filter((p: any) => p.status === 'scheduled') || [];
  const published = posts?.filter((p: any) => p.status === 'published') || []; // Assuming you eventually track published status

  // Get the next 3 upcoming scheduled posts, sorted by date
  const upcomingPosts = scheduled
    .filter((p: any) => p.scheduledAt && new Date(p.scheduledAt) > new Date())
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  // Helper to extract first name
  const firstName = user?.name ? user.name.split(" ")[0] : "there";

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your LinkedIn content today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setLocation("/generate")} className="gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white">
            <Sparkles className="h-4 w-4" /> Create Post
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-[#0A66C2]" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
              <div className="text-3xl font-bold">{scheduled.length}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
            <PenTool className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
              <div className="text-3xl font-bold">{drafts.length}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : (
              <div className="text-3xl font-bold">{published.length}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connected Profile</CardTitle>
            <Linkedin className="h-4 w-4 text-[#0A66C2]" />
          </CardHeader>
          <CardContent className="flex items-center gap-3 pt-2">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="h-8 w-8 rounded-full border border-border" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              </div>
            )}
            <div className="text-sm font-medium truncate">{user?.name || "LinkedIn User"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upcoming Posts */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              Upcoming Queue
            </CardTitle>
            <CardDescription>Your next scheduled LinkedIn posts.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : upcomingPosts.length > 0 ? (
              <div className="space-y-4">
                {upcomingPosts.map((post: any) => (
                  <div key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/20">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                        <Badge variant="secondary" className="font-medium bg-background text-xs">
                          {new Date(post.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(post.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/80 truncate">{post.content}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-muted-foreground gap-2 mt-2" onClick={() => setLocation("/calendar")}>
                  View full calendar <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/10">
                <Clock className="h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-foreground">No upcoming posts</p>
                <p className="text-xs text-muted-foreground max-w-[250px] mt-1 mb-4">
                  Your queue is empty. Generate some new content to keep your audience engaged.
                </p>
                <Button variant="outline" size="sm" onClick={() => setLocation("/generate")}>
                  Go to Studio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => setLocation("/generate")}
              >
                <div className="h-8 w-8 rounded-md bg-[#0A66C2]/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#0A66C2]" />
                </div>
                Generate new post
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => setLocation("/calendar")}
              >
                <div className="h-8 w-8 rounded-md bg-indigo-500/10 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                </div>
                View planner
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => setLocation("/knowledge")}
              >
                <div className="h-8 w-8 rounded-md bg-orange-500/10 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-orange-500" />
                </div>
                Train brand voice
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}