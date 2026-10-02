import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar as CalendarIcon, Clock, Edit2, Trash2, Linkedin, CalendarPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const getPlatformMeta = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return { icon: Linkedin, color: "text-blue-600" };
  return { icon: CalendarIcon, color: "text-primary" };
};

export default function Calendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authFetch, activeProjectId } = useAuth();

  // Dialog States
  const [editingPost, setEditingPost] = React.useState<{id: string, content: string} | null>(null);
  const [schedulingPost, setSchedulingPost] = React.useState<{id: string, platform: string} | null>(null);
  const [scheduleDate, setScheduleDate] = React.useState("");

  // Data Fetching
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", activeProjectId],
    queryFn: async () => {
      const res = await authFetch(`${BACKEND_URL}/api/posts`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
  });

  // Update Mutation (Used for Editing, Scheduling, and Reverting to Draft)
  const updatePostMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string, content?: string, status?: string, scheduledAt?: string | null }) => {
      const res = await authFetch(`${BACKEND_URL}/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update post");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts", activeProjectId] });
      
      if (variables.status === 'scheduled') toast({ title: "Post Scheduled!" });
      else if (variables.status === 'draft') toast({ title: "Reverted to Draft" });
      else toast({ title: "Post Updated" });
      
      setEditingPost(null);
      setSchedulingPost(null);
      setScheduleDate("");
    },
    onError: () => toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
  });

  // Delete Mutation (Used for permanently deleting Drafts)
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`${BACKEND_URL}/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", activeProjectId] });
      toast({ title: "Draft deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete.", variant: "destructive" })
  });

  // Handlers
  const handleDeleteClick = (post: any) => {
    if (post.status === 'scheduled') {
      // Revert scheduled to draft
      updatePostMutation.mutate({ id: post.id, status: 'draft', scheduledAt: null });
    } else {
      // Hard delete draft
      deletePostMutation.mutate(post.id);
    }
  };

  const handleConfirmEdit = () => {
    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, content: editingPost.content });
    }
  };

  const handleConfirmSchedule = () => {
    if (schedulingPost && scheduleDate) {
      updatePostMutation.mutate({ 
        id: schedulingPost.id, 
        status: 'scheduled', 
        scheduledAt: new Date(scheduleDate).toISOString() 
      });
    }
  };

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
      <Card className="border-border/60 shadow-sm hover:border-border transition-colors flex flex-col h-full">
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
        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
          <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-4">
            {post.content}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40 mt-auto">
            {post.status === 'draft' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-muted-foreground hover:text-primary"
                onClick={() => setSchedulingPost({ id: post.id, platform: post.platform })}
              >
                <CalendarPlus className="h-4 w-4 mr-2" /> Schedule
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-muted-foreground hover:text-primary"
              onClick={() => setEditingPost({ id: post.id, content: post.content })}
            >
              <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDeleteClick(post)}
              title={post.status === 'scheduled' ? "Revert to Draft" : "Delete Draft"}
            >
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

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Make changes to your post content.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={editingPost?.content || ""}
              onChange={(e) => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : null)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
            <Button onClick={handleConfirmEdit} disabled={updatePostMutation.isPending}>
              {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={!!schedulingPost} onOpenChange={(open) => !open && setSchedulingPost(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
            <DialogDescription>
              Select a date and time to publish this draft to {schedulingPost?.platform}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="datetime">Date & Time</Label>
              <Input 
                id="datetime"
                type="datetime-local" 
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedulingPost(null)}>Cancel</Button>
            <Button 
              onClick={handleConfirmSchedule} 
              disabled={!scheduleDate || updatePostMutation.isPending}
            >
              {updatePostMutation.isPending ? "Scheduling..." : "Confirm Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}