import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, BarChart3, Clock, Zap, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const isSignedIn = !!user;
  const ctaLink = isSignedIn ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <img 
              src="/logo.png" 
              alt="BrandFlow Logo" 
              className="h-6 w-6 object-contain" 
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">BrandFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <Link href="/login">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Log in</span>
              </Link>
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-10 pb-32 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
          BrandFlow AI 2.0 is now live
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-foreground">
          The cockpit for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">modern marketing teams.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Generate content, schedule posts, monitor engagement, and auto-reply—all in your brand's unique voice. Stop assembling tools. Start flowing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={ctaLink}>
            <Button size="lg" className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105">
              Start your free trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Dashboard Preview Mockup */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto mb-16">
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-2xl shadow-2xl p-2">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 bottom-0 h-1/3"></div>
          <div className="rounded-xl border border-border bg-card overflow-hidden aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative">
             <div className="absolute inset-0 grid grid-cols-[1fr_3fr] opacity-50">
               <div className="border-r border-border p-4 flex flex-col gap-4">
                 <div className="h-6 w-24 bg-muted rounded"></div>
                 <div className="h-4 w-full bg-muted rounded"></div>
                 <div className="h-4 w-3/4 bg-primary/20 rounded"></div>
                 <div className="h-4 w-5/6 bg-muted rounded"></div>
               </div>
               <div className="p-8 flex flex-col gap-6">
                 <div className="h-10 w-48 bg-muted rounded-lg mb-4"></div>
                 <div className="grid grid-cols-3 gap-4 mb-4">
                   <div className="h-24 bg-muted rounded-xl border border-border"></div>
                   <div className="h-24 bg-muted rounded-xl border border-border"></div>
                   <div className="h-24 bg-muted rounded-xl border border-border"></div>
                 </div>
                 <div className="h-48 bg-primary/5 rounded-xl border border-primary/10"></div>
               </div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center z-20">
               <div className="px-6 py-3 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground font-medium flex items-center gap-2 shadow-sm">
                 <Sparkles className="w-5 h-5 text-primary" /> AI Generating Content...
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Everything you need to grow</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A unified platform that replaces your fragmented marketing stack.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "AI Content Generation", desc: "Instantly create high-converting posts in your exact brand voice." },
              { icon: Clock, title: "Smart Scheduling", desc: "Drag-and-drop calendar with automated best-time-to-post algorithms." },
              { icon: BarChart3, title: "Deep Analytics", desc: "Track engagement, reach, and follower growth across all platforms." },
              { icon: MessageCircle, title: "Unified Inbox", desc: "Manage comments, DMs, and mentions from one central interface." },
              { icon: Sparkles, title: "Auto-Replies", desc: "Let AI handle routine questions and escalate the complex ones." },
              { icon: CheckCircle2, title: "Brand Guardrails", desc: "Ensure every post passes your tone, mission, and style guidelines." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors group shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                  <f.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto bg-card border border-border shadow-xl shadow-primary/5 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px]"></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground relative z-10">Ready to scale your brand?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto relative z-10 text-lg">
            Join thousands of marketers who use BrandFlow to command their social presence.
          </p>
          <div className="relative z-10">
            <Link href={ctaLink}>
              <Button size="lg" className="h-14 px-10 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                Get started for free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 text-muted-foreground text-sm text-center bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="BrandFlow Logo" 
              className="h-8 w-8 object-contain" 
            />
            <span className="font-semibold text-foreground">BrandFlow</span>
          </div>
          <p>© {new Date().getFullYear()} BrandFlow Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://x.com/GauravKara_koti" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="https://www.linkedin.com/in/gaurav-karakoti" className="hover:text-foreground transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}