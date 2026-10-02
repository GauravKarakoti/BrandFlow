import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useGenerateContent, useCreatePost } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Copy, CalendarPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { PostInputPlatform } from "@workspace/api-client-react";

const formSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters."),
  platform: z.enum(["twitter", "linkedin", "instagram", "facebook"] as const),
  tone: z.enum(["professional", "funny", "casual", "luxury", "startup", "corporate"] as const),
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(true),
  variations: z.number().min(1).max(5).default(3),
});

export default function DashboardGenerate() {
  const [results, setResults] = useState<{ content: string; hashtags?: string; cta?: string }[]>([]);
  const generateMutation = useGenerateContent();
  const createPostMutation = useCreatePost();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      platform: "twitter",
      tone: "professional",
      includeHashtags: true,
      includeEmojis: true,
      variations: 3,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    generateMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setResults(data.variations);
          toast.success("Content generated successfully");
        },
        onError: () => {
          toast.error("Failed to generate content");
        }
      }
    );
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to clipboard");
  };

  const handleSaveToDrafts = (content: string, platform: string, hashtags?: string) => {
    createPostMutation.mutate({
      data: {
        content,
        platform: platform as PostInputPlatform,
        status: "draft",
        hashtags: hashtags || "",
      }
    }, {
      onSuccess: () => toast.success("Saved to drafts"),
      onError: () => toast.error("Failed to save draft")
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              AI Studio
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Configure parameters to generate high-converting social content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Topic or context</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Announcing our new AI features that help teams save 10 hours a week..." 
                          className="bg-black/50 border-white/10 text-white resize-none h-24 focus-visible:ring-violet-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/10 text-white focus:ring-violet-500">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#0A0A0F] border-white/10 text-white">
                            <SelectItem value="twitter">X / Twitter</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Tone of Voice</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/10 text-white focus:ring-violet-500">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#0A0A0F] border-white/10 text-white">
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="funny">Humorous</SelectItem>
                            <SelectItem value="casual">Casual & Relatable</SelectItem>
                            <SelectItem value="luxury">High-End Luxury</SelectItem>
                            <SelectItem value="startup">Scrappy Startup</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-2 border-t border-white/5">
                  <FormField
                    control={form.control}
                    name="includeHashtags"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-black/20 p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm text-zinc-300">Include Hashtags</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeEmojis"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-black/20 p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm text-zinc-300">Include Emojis</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? "Generating..." : "Generate Magic"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <div className="flex flex-col h-full space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Generated Results</h2>
          
          {results.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-black/20 text-center p-8 min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">Awaiting Instructions</h3>
              <p className="text-zinc-500 max-w-sm">
                Fill out the parameters on the left and hit generate to see AI-crafted posts tailored to your brand.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {results.map((result, idx) => (
                <div key={idx} className="bg-[#0A0A0F] border border-white/10 hover:border-violet-500/30 transition-all rounded-xl p-5 relative group shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-white/10 hover:bg-white/20 text-white border-0 h-8"
                      onClick={() => handleCopy(`${result.content}\n\n${result.hashtags || ''}`, idx)}
                    >
                      {copiedIndex === idx ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copiedIndex === idx ? "Copied" : "Copy"}
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-violet-600 hover:bg-violet-700 text-white h-8 shadow-none"
                      onClick={() => handleSaveToDrafts(result.content, form.getValues("platform"), result.hashtags)}
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                  </div>
                  
                  <div className="pr-32 whitespace-pre-wrap text-zinc-200 text-sm leading-relaxed mb-4">
                    {result.content}
                  </div>
                  
                  {result.hashtags && (
                    <div className="text-violet-400 text-sm font-medium mt-2">
                      {result.hashtags}
                    </div>
                  )}
                  
                  {result.cta && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Suggested CTA</span>
                      <span className="text-sm text-zinc-300 bg-white/5 px-3 py-1 rounded-md">{result.cta}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}