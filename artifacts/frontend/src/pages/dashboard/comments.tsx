import { useState } from "react";
import { useListComments, useUpdateCommentStatus, useReplyToComment, useGenerateReply } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ShieldAlert, Sparkles, MessageCircleReply, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DashboardComments() {
  const { data: comments, isLoading, refetch } = useListComments({}, { query: { queryKey: ["comments"] } });
  const updateStatusMutation = useUpdateCommentStatus();
  const replyMutation = useReplyToComment();
  const generateReplyMutation = useGenerateReply();

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleUpdateStatus = (id: number, status: any) => {
    updateStatusMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast.success(`Comment marked as ${status}`);
        refetch();
      }
    });
  };

  const handleGenerateReply = (commentText: string, platform: string) => {
    generateReplyMutation.mutate({ data: { commentText, platform } }, {
      onSuccess: (data) => setReplyText(data.reply)
    });
  };

  const handleSendReply = (id: number) => {
    replyMutation.mutate({ id, data: { reply: replyText } }, {
      onSuccess: () => {
        toast.success("Reply sent successfully");
        setReplyingTo(null);
        setReplyText("");
        refetch();
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Comments & Mentions</h2>
          <p className="text-zinc-400 text-sm mt-1">Manage interactions across all your platforms</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl bg-white/5" />
          <Skeleton className="h-32 w-full rounded-xl bg-white/5" />
        </div>
      ) : comments?.length === 0 ? (
        <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <MessageCircleReply className="w-12 h-12 text-zinc-600 mb-4" />
            <p className="text-zinc-400">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments?.map((comment) => (
            <Card key={comment.id} className="glass-panel border-white/5 bg-[#0A0A0F]/80 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {comment.authorAvatar ? (
                        <img src={comment.authorAvatar} alt={comment.authorName} className="w-10 h-10 rounded-full bg-white/5" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-lg">
                          {comment.authorName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{comment.authorName}</p>
                        <p className="text-xs text-zinc-500">
                          {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")} • <span className="capitalize text-violet-400">{comment.platform}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {comment.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="h-8 border-white/10 hover:bg-white/10 text-white" onClick={() => setReplyingTo(comment.id)}>
                            <CornerDownRight className="w-4 h-4 mr-2" /> Reply
                          </Button>
                          <Button size="sm" className="h-8 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-0" onClick={() => handleUpdateStatus(comment.id, 'resolved')}>
                            <Check className="w-4 h-4 mr-2" /> Resolve
                          </Button>
                        </>
                      )}
                      {comment.status === 'replied' && <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Replied</span>}
                      {comment.status === 'resolved' && <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Resolved</span>}
                    </div>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">{comment.content}</p>

                  {comment.reply && (
                     <div className="ml-8 mt-4 p-4 rounded-xl bg-white/5 border border-white/5 relative">
                       <CornerDownRight className="w-5 h-5 text-zinc-600 absolute -left-8 top-4" />
                       <p className="text-xs font-semibold text-violet-400 mb-1">Your reply</p>
                       <p className="text-sm text-zinc-300">{comment.reply}</p>
                     </div>
                  )}

                  {replyingTo === comment.id && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Draft Reply</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                          onClick={() => handleGenerateReply(comment.content, comment.platform)}
                          disabled={generateReplyMutation.isPending}
                        >
                          <Sparkles className="w-4 h-4 mr-2" /> {generateReplyMutation.isPending ? "Generating..." : "AI Generate"}
                        </Button>
                      </div>
                      <Textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..." 
                        className="bg-black/50 border-white/10 text-white min-h-[100px] focus-visible:ring-violet-500" 
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancel</Button>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => handleSendReply(comment.id)} disabled={!replyText || replyMutation.isPending}>
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}