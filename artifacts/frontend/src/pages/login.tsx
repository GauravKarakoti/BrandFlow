import * as React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from "@/lib/utils";
import { Sparkles, Loader2, Linkedin } from "lucide-react";

export default function Login() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      toast({ 
        title: "Authentication Failed", 
        description: "Could not sign in with LinkedIn. Please try again.", 
        variant: "destructive" 
      });
      // Clean the URL so the toast doesn't keep appearing on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleLinkedInAuth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/linkedin/auth-url`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to initiate login");
      
      // Redirect directly to the LinkedIn authorization screen
      window.location.href = data.url;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/60">
        <CardHeader className="space-y-3 items-center text-center">
          <div className="h-24 w-24 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
            <img 
              src="/logo.png" 
              alt="BrandFlow Logo" 
              className="h-24 w-24 object-contain" 
            />
          </div>
          <CardTitle className="text-2xl font-bold">Sign in to BrandFlow</CardTitle>
          <CardDescription>
            Access your workspace and manage your LinkedIn presence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full h-12 text-base gap-3 bg-[#0A66C2] hover:bg-[#004182] text-white" 
            onClick={handleLinkedInAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Linkedin className="h-5 w-5 fill-current" />
            )}
            Continue with LinkedIn
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}