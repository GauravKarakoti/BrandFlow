import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Copy, 
  Calendar, 
  Wand2, 
  Check, 
  Share2, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook,
  RotateCw,
  Bookmark
} from "lucide-react";
import { BACKEND_URL } from "@/lib/utils";

// Platform options supported by BrandFlow
const PLATFORMS = [
  { id: "x", name: "X (Twitter)", icon: Twitter, color: "hover:bg-slate-800" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "hover:bg-blue-600" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "hover:bg-pink-600" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "hover:bg-blue-700" },
];

const TONES = [
  "Professional & Authoritative",
  "Witty & Engaging",
  "Casual & Friendly",
  "Bold & Boldly Opinionated",
  "Urgent & Promotional",
  "Educational & Insightful"
];

const FORMATS = [
  "Single Post",
  "Thread / Multi-part",
  "Caption & Hashtags",
  "Hook & Call to Action"
];

export default function ContentGenerator() {
  const { toast } = useToast();

  // Generator Controls State
  const [prompt, setPrompt] = React.useState("");
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>(["x", "linkedin"]);
  const [tone, setTone] = React.useState(TONES[0]);
  const [format, setFormat] = React.useState(FORMATS[0]);
  
  // Context & Styling Toggles
  const [useBrandVoice, setUseBrandVoice] = React.useState(true);
  const [includeHashtags, setIncludeHashtags] = React.useState(true);
  const [includeEmojis, setIncludeEmojis] = React.useState(true);

  // Output State
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [variations, setVariations] = React.useState<Array<{
    id: string;
    platform: string;
    content: string;
    characterCount: number;
  }>>([]);

  // --- AI Generation Mutation ---
  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${BACKEND_URL}/api/generate/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate content");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Update UI with the AI-generated results
      setVariations(data.variations);
      toast({
        title: "Content generated!",
        description: `Successfully crafted variations for ${selectedPlatforms.length} platform(s).`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const savePostMutation = useMutation({
    mutationFn: async (payload: { platform: string, content: string, status: string }) => {
      const res = await fetch(`${BACKEND_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save post");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Draft Saved", description: "You can view it in the Planner." });
    }
  });

  const handleSaveDraft = (platform: string, content: string) => {
    savePostMutation.mutate({ platform, content, status: 'draft' });
  };

  const togglePlatform = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a topic or instruction for the AI.",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform required",
        description: "Please select at least one platform target.",
        variant: "destructive"
      });
      return;
    }

    // Trigger the actual backend call
    generateMutation.mutate({
      prompt,
      platforms: selectedPlatforms,
      tone,
      format,
      useBrandVoice,
      includeHashtags,
      includeEmojis
    });
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-indigo-500" />
          AI Content Studio
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate platform-native social media content tailored to your brand voice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS */}
        <Card className="lg:col-span-5 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Generator Controls</CardTitle>
            <CardDescription>Configure output parameters for your AI agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Prompt Input */}
            <div className="grid gap-2">
              <Label htmlFor="prompt" className="font-semibold">Topic or Key Message</Label>
              <Textarea 
                id="prompt" 
                placeholder="e.g., Announce our new AI analytics feature launching next Tuesday. Highlight time savings for marketers." 
                className="min-h-[120px] resize-none"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            {/* Platform Selection */}
            <div className="grid gap-2">
              <Label className="font-semibold">Target Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedPlatforms.includes(p.id);
                  return (
                    <Button
                      key={p.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="gap-2 rounded-lg"
                      onClick={() => togglePlatform(p.id)}
                    >
                      <Icon className="h-4 w-4" />
                      {p.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Tone & Format Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-semibold">Writing Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="font-semibold">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Use Knowledge Base RAG</Label>
                  <p className="text-xs text-muted-foreground">Inject brand mission, tone, and audience context.</p>
                </div>
                <Switch checked={useBrandVoice} onCheckedChange={setUseBrandVoice} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Include Hashtags</Label>
                  <p className="text-xs text-muted-foreground">Auto-generate relevant niche hashtags.</p>
                </div>
                <Switch checked={includeHashtags} onCheckedChange={setIncludeHashtags} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Include Emojis</Label>
                  <p className="text-xs text-muted-foreground">Enhance visual engagement with emoji hooks.</p>
                </div>
                <Switch checked={includeEmojis} onCheckedChange={setIncludeEmojis} />
              </div>
            </div>

            {/* Generate Action Button */}
            <Button 
              className="w-full gap-2 py-2 text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <RotateCw className="h-5 w-5 animate-spin" />
                  Generating Posts...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: CANVAS & PREVIEW */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {variations.length === 0 ? (
            <Card className="min-h-[480px] flex flex-col items-center justify-center text-center p-8 border-dashed border-border/60 bg-muted/10">
              <Sparkles className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold">Your Studio Canvas</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Enter a topic on the left and click "Generate Content" to craft tailored social posts.
              </p>
            </Card>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Generated Output</h2>
                {useBrandVoice && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-500" />
                    RAG Enhanced
                  </Badge>
                )}
              </div>

              {variations.map((v) => {
                // Determine icon based on backend's formatted platform string
                const PlatformMeta = PLATFORMS.find((p) => 
                  p.id.toLowerCase() === v.platform.toLowerCase() || 
                  p.name.toLowerCase().includes(v.platform.toLowerCase())
                );
                const Icon = PlatformMeta?.icon || Share2;

                return (
                  <Card key={v.id} className="border-border/60 hover:border-border transition-all">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm capitalize">{PlatformMeta?.name || v.platform}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {v.characterCount} chars
                      </span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-xl bg-muted/20 text-sm whitespace-pre-wrap font-sans leading-relaxed border border-border/40">
                        {v.content}
                      </div>

                      {/* Action Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleCopy(v.id, v.content)}
                          >
                            {copiedId === v.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            {copiedId === v.id ? "Copied" : "Copy"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleSaveDraft(v.platform, v.content)}
                            disabled={savePostMutation.isPending}
                          >
                            <Bookmark className="h-4 w-4" />
                            Save Draft
                          </Button>
                        </div>

                        <Button size="sm" className="gap-2 bg-slate-900 dark:bg-slate-100">
                          <Calendar className="h-4 w-4" />
                          Schedule Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}