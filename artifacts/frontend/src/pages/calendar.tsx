import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar as CalendarIcon, Clock, Edit2, Trash2, Twitter, Linkedin, Instagram, Facebook } from "lucide-react";

// Helper to map platform to icons and colors
const getPlatformMeta = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('x') || p.includes('twitter')) return { icon: Twitter, color: "text-slate-800 dark:text-slate-200" };
  if (p.includes('linkedin')) return { icon: Linkedin, color: "text-blue-600" };
  if (p.includes('instagram')) return { icon: Instagram, color: "text-pink-600" };
  if (p.includes('facebook')) return { icon: Facebook, color: "text-blue-700" };
  return { icon: CalendarIcon, color: "text-primary" };
};

export default function Calendar() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_URL}/api/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const drafts = posts?.filter((p: any) => p.status === 'draft') || [];
  const scheduled = posts?.filter((p: any) => p.status === 'scheduled') || [];

  const PostCard = ({ post }: { post: any }) => {
    const { icon: Icon, color } = getPlatformMeta(post.platform);
    
    return (
      <Card className="border-border/60 shadow-sm hover:border-border transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted/50">
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <span className="font-semibold text-sm capitalize">{post.platform}</span>
          </div>
          {post.status === 'scheduled' && post.scheduledAt && (
            <Badge variant="secondary" className="gap-1.5 font-medium">
              <Clock className="h-3 w-3" />
              {new Date(post.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Badge>
          )}
          {post.status === 'draft' && (
            <Badge variant="outline" className="text-muted-foreground">Draft</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-4">
            {post.content}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
              <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarIcon className="h-7 w-7 text-indigo-500" />
          Content Planner
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your drafts and review your upcoming scheduled social media pipeline.
        </p>
      </div>

      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="scheduled">Scheduled ({scheduled.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduled.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/10">
              <Clock className="h-10 w-10 text-muted-foreground/40 mb-4" />
              <h3 className="font-medium text-lg">No posts scheduled</h3>
              <p className="text-muted-foreground text-sm mt-1">Generate content in the Studio and schedule it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduled.map((post: any) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {drafts.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/10">
             <Edit2 className="h-10 w-10 text-muted-foreground/40 mb-4" />
             <h3 className="font-medium text-lg">No drafts saved</h3>
             <p className="text-muted-foreground text-sm mt-1">Your saved ideas and WIP posts will appear here.</p>
           </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((post: any) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}