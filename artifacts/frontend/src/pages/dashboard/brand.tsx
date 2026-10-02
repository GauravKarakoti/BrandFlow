import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetBrand, useUpdateBrand } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  toneOfVoice: z.string().optional(),
  primaryColor: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
});

export default function DashboardBrand() {
  const { data: brand, isLoading } = useGetBrand({ query: { queryKey: ["brand"] } });
  const updateBrandMutation = useUpdateBrand();
  const queryClient = useQueryClient();
  const initRef = useRef(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      mission: "",
      vision: "",
      toneOfVoice: "",
      primaryColor: "",
      website: "",
      industry: "",
    },
  });

  useEffect(() => {
    if (brand && !initRef.current) {
      form.reset({
        name: brand.name || "",
        description: brand.description || "",
        mission: brand.mission || "",
        vision: brand.vision || "",
        toneOfVoice: brand.toneOfVoice || "",
        primaryColor: brand.primaryColor || "",
        website: brand.website || "",
        industry: brand.industry || "",
      });
      initRef.current = true;
    }
  }, [brand, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateBrandMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          toast.success("Brand updated successfully");
          queryClient.setQueryData(["brand"], data);
        },
        onError: () => {
          toast.error("Failed to update brand");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-[400px] w-full rounded-2xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Brand Identity</h2>
          <p className="text-zinc-400 text-sm mt-1">Configure your brand guidelines for AI generation</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
          <Settings className="w-6 h-6 text-violet-400" />
        </div>
      </div>

      <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Brand Name</FormLabel>
                      <FormControl>
                        <Input className="bg-black/50 border-white/10 text-white h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Website</FormLabel>
                      <FormControl>
                        <Input className="bg-black/50 border-white/10 text-white h-11" placeholder="https://" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Industry</FormLabel>
                      <FormControl>
                        <Input className="bg-black/50 border-white/10 text-white h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Brand Color (Hex)</FormLabel>
                      <div className="flex gap-3">
                        <div 
                          className="w-11 h-11 rounded-lg border border-white/10 shrink-0" 
                          style={{ backgroundColor: field.value || 'transparent' }}
                        />
                        <FormControl>
                          <Input className="bg-black/50 border-white/10 text-white h-11" placeholder="#7C3AED" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-white/5 pt-8 space-y-8">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Description</FormLabel>
                      <FormDescription className="text-zinc-500 mb-2">What does your company do?</FormDescription>
                      <FormControl>
                        <Textarea className="bg-black/50 border-white/10 text-white h-24 resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toneOfVoice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Tone of Voice Guidelines</FormLabel>
                      <FormDescription className="text-zinc-500 mb-2">How should the AI sound when writing for your brand?</FormDescription>
                      <FormControl>
                        <Textarea className="bg-black/50 border-white/10 text-white h-32 resize-none" placeholder="e.g. Professional but approachable. Never use corporate jargon. Use active voice..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateBrandMutation.isPending} className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-8 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  <Save className="w-4 h-4 mr-2" />
                  {updateBrandMutation.isPending ? "Saving..." : "Save Brand Identity"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}