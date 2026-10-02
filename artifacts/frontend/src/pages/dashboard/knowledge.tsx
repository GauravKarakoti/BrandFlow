import { useState } from "react";
import { useListKnowledge, useCreateKnowledge, useDeleteKnowledge, KnowledgeInputType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, FileText, Package, HelpCircle, MessageSquare, BookOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DashboardKnowledge() {
  const { data: knowledge, isLoading, refetch } = useListKnowledge({ query: { queryKey: ["knowledge"] } });
  const createMutation = useCreateKnowledge();
  const deleteMutation = useDeleteKnowledge();
  const [open, setOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState<KnowledgeInputType>("document");
  const [content, setContent] = useState("");

  const handleCreate = () => {
    if (!title) return toast.error("Title is required");
    createMutation.mutate(
      { data: { title, type, content } },
      {
        onSuccess: () => {
          toast.success("Knowledge item added");
          setOpen(false);
          setTitle("");
          setContent("");
          refetch();
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Item deleted");
          refetch();
        }
      }
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "product": return <Package className="w-5 h-5 text-blue-400" />;
      case "faq": return <HelpCircle className="w-5 h-5 text-amber-400" />;
      case "post_example": return <MessageSquare className="w-5 h-5 text-pink-400" />;
      case "guideline": return <BookOpen className="w-5 h-5 text-emerald-400" />;
      default: return <FileText className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-violet-400" /> Knowledge Base
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Train the AI with your company's data</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0F] border border-white/10 text-white sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Knowledge Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Title</label>
                <Input 
                  value={title} onChange={(e) => setTitle(e.target.value)} 
                  className="bg-black/50 border-white/10" placeholder="e.g. Q3 Feature Release Specs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Type</label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="bg-black/50 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0F] border-white/10 text-white">
                    <SelectItem value="document">General Document</SelectItem>
                    <SelectItem value="product">Product Details</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="post_example">Post Example (Good)</SelectItem>
                    <SelectItem value="guideline">Brand Guideline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Content</label>
                <Textarea 
                  value={content} onChange={(e) => setContent(e.target.value)}
                  className="bg-black/50 border-white/10 min-h-[150px]" placeholder="Paste the text here..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add to Knowledge Base"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-xl bg-white/5" />
          <Skeleton className="h-32 w-full rounded-xl bg-white/5" />
        </div>
      ) : knowledge?.length === 0 ? (
        <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No knowledge items yet</h3>
            <p className="text-zinc-500 max-w-sm mb-6">Add documents, product details, and examples to improve AI generations.</p>
            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knowledge?.map((item) => (
            <Card key={item.id} className="glass-panel border-white/5 bg-[#0A0A0F] hover:border-violet-500/30 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1 line-clamp-1 pr-8">{item.title}</h4>
                    <p className="text-xs text-zinc-500 capitalize mb-3">
                      {item.type.replace('_', ' ')} • {format(new Date(item.createdAt), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-zinc-400 line-clamp-2">{item.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}