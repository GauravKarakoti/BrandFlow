import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  UploadCloud, 
  Link as LinkIcon, 
  Palette,  
  Trash2, 
  Save,
  Loader2,
  Plus,
  X,
  FileText
} from "lucide-react";
import { BACKEND_URL } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface DocumentItem {
  name: string;
  url: string;
}

export default function KnowledgeBase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { authFetch, activeProjectId } = useAuth();

  // Form State
  const [companyDescription, setCompanyDescription] = React.useState("");
  const [missionStatement, setMissionStatement] = React.useState("");
  const [targetAudience, setTargetAudience] = React.useState("");
  const [toneAndVoice, setToneAndVoice] = React.useState("");
  
  const [links, setLinks] = React.useState<string[]>([]);
  const [newLink, setNewLink] = React.useState("");

  // New Form States for Assets & Docs
  const [brandColors, setBrandColors] = React.useState<string[]>([]);
  const [logoUrl, setLogoUrl] = React.useState<string>("");
  const [documents, setDocuments] = React.useState<DocumentItem[]>([]);

  // File Input Refs
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const documentInputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["knowledge-base", activeProjectId],
    queryFn: async () => {
      const res = await authFetch(`${BACKEND_URL}/api/knowledge-base`);
      if (!res.ok) throw new Error("Failed to fetch knowledge base");
      return res.json();
    }
  });

  React.useEffect(() => {
    if (data) {
      setCompanyDescription(data.companyDescription || "");
      setMissionStatement(data.missionStatement || "");
      setTargetAudience(data.targetAudience || "");
      setToneAndVoice(data.toneAndVoice || "");
      setLinks(data.links || []);
      setBrandColors(data.brandColors || []);
      setLogoUrl(data.logoUrl || "");
      setDocuments(data.documents || []);
    }
  }, [data]);

  // --- MUTATIONS ---
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await authFetch(`${BACKEND_URL}/api/knowledge-base`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Brand knowledge base updated." });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", activeProjectId] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await authFetch(`${BACKEND_URL}/api/upload/logo`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload logo");
      return res.json();
    },
    onSuccess: (data) => setLogoUrl(data.url),
    onError: (error: any) => toast({ title: "Upload Failed", description: error.message, variant: "destructive" })
  });

  const uploadDocMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await authFetch(`${BACKEND_URL}/api/upload/document`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload document");
      return res.json(); // Expected: { url: string, name: string }
    },
    onSuccess: (data) => setDocuments((prev) => [...prev, { name: data.name, url: data.url }]),
    onError: (error: any) => toast({ title: "Upload Failed", description: error.message, variant: "destructive" })
  });

  // --- HANDLERS ---
  const handleSave = () => {
    saveMutation.mutate({
      companyDescription, missionStatement, targetAudience,
      toneAndVoice, links, brandColors, logoUrl, documents
    });
  };

  const handleAddLink = () => {
    if (newLink && !links.includes(newLink)) {
      setLinks([...links, newLink]);
      setNewLink("");
    }
  };

  const handleAddColor = () => setBrandColors([...brandColors, "#000000"]);
  const handleUpdateColor = (index: number, val: string) => {
    const newColors = [...brandColors];
    newColors[index] = val;
    setBrandColors(newColors);
  };
  const handleRemoveColor = (index: number) => {
    setBrandColors(brandColors.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (type === 'logo') uploadLogoMutation.mutate(file);
    if (type === 'document') uploadDocMutation.mutate(file);
    
    // Reset input so the same file can be selected again if needed
    e.target.value = ''; 
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">Train your AI agents by providing context, brand guidelines, and assets.</p>
        </div>
        <Button className="gap-2" onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="assets">Brand Assets</TabsTrigger>
          <TabsTrigger value="sources">Training Sources</TabsTrigger>
        </TabsList>

        {/* IDENTITY TAB - Unchanged */}
        <TabsContent value="identity" className="space-y-6">
          {/* ... Keep Identity Tab exact same as before ... */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Brand Identity
              </CardTitle>
              <CardDescription>
                Define the core values and voice of your brand. The AI will use this to generate authentic content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="What does your company do? What products or services do you offer?" 
                  className="min-h-[100px] resize-none"
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="mission">Mission Statement</Label>
                  <Textarea 
                    id="mission" 
                    placeholder="e.g., To accelerate the world's transition to sustainable energy." 
                    className="min-h-[100px] resize-none"
                    value={missionStatement}
                    onChange={(e) => setMissionStatement(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Textarea 
                    id="audience" 
                    placeholder="Who are your customers? e.g., Tech-savvy millennials, B2B SaaS founders..." 
                    className="min-h-[100px] resize-none"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="voice">Tone & Voice</Label>
                <Input 
                  id="voice" 
                  placeholder="e.g., Professional yet approachable, witty, authoritative..." 
                  value={toneAndVoice}
                  onChange={(e) => setToneAndVoice(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSETS TAB - Fully Functional */}
        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Visual Assets
              </CardTitle>
              <CardDescription>Upload your logos and define your brand colors for visual content generation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Logo Upload (Cloudinary) */}
              <div className="grid gap-4">
                <Label>Brand Logo</Label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden" 
                  ref={logoInputRef}
                  onChange={(e) => handleFileChange(e, 'logo')}
                />
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-border/60 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer relative overflow-hidden"
                >
                  {uploadLogoMutation.isPending ? (
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="Brand Logo" className="max-h-32 object-contain" />
                  ) : (
                    <>
                      <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG (max. 5MB)</p>
                    </>
                  )}
                </div>
                {logoUrl && (
                  <Button variant="outline" size="sm" onClick={() => setLogoUrl("")} className="w-fit">
                    Remove Logo
                  </Button>
                )}
              </div>

              {/* Dynamic Color Theme */}
              <div className="grid gap-4">
                <Label>Brand Colors (Hex)</Label>
                <div className="flex flex-wrap gap-4 items-center">
                  {brandColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg border border-border/60 bg-muted/10">
                      <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => handleUpdateColor(index, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <Input 
                        value={color} 
                        onChange={(e) => handleUpdateColor(index, e.target.value)} 
                        className="w-24 uppercase font-mono text-sm" 
                        maxLength={7}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveColor(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddColor} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Color
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOURCES TAB - Fully Functional */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                External Training Sources
              </CardTitle>
              <CardDescription>Provide links to your website or upload PDFs for the AI to read.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="grid gap-4">
                <Label>Website & Blog Links</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://yourwebsite.com/about" 
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                  />
                  <Button variant="secondary" onClick={handleAddLink} type="button">Add Link</Button>
                </div>
                {links.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {links.map((link) => (
                      <div key={link} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/10 text-sm">
                        <span className="truncate max-w-[80%] text-muted-foreground">{link}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setLinks(links.filter((l) => l !== link))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Upload (Backblaze S3) */}
              <div className="grid gap-4">
                <Label>Documents (PDF, TXT, DOCX)</Label>
                <input 
                  type="file" 
                  accept=".pdf,.txt,.docx"
                  className="hidden" 
                  ref={documentInputRef}
                  onChange={(e) => handleFileChange(e, 'document')}
                />
                <div 
                  onClick={() => documentInputRef.current?.click()}
                  className="border-2 border-dashed border-border/60 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {uploadDocMutation.isPending ? (
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
                  ) : (
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                  )}
                  <p className="text-sm font-medium">{uploadDocMutation.isPending ? "Uploading..." : "Upload Brand Guidelines or Manuals"}</p>
                </div>

                {documents.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/10 text-sm">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="truncate max-w-[200px] md:max-w-[400px] text-muted-foreground">{doc.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive" 
                          onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}