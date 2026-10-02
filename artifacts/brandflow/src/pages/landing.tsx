import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, BarChart3, Clock, Zap, MessageCircle, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@clerk/react";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const ctaLink = isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-violet-500/30 font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">BrandFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <Link href="/sign-in">
                <span className="text-sm font-medium text-zinc-300 hover:text-white cursor-pointer transition-colors">Log in</span>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-white hover:bg-zinc-200 text-black rounded-full px-6">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-32 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          BrandFlow AI 2.0 is now live
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
          The cockpit for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400">modern marketing teams.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Generate content, schedule posts, monitor engagement, and auto-reply—all in your brand's unique voice. Stop assembling tools. Start flowing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={ctaLink}>
            <Button size="lg" className="h-14 px-8 text-base bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all hover:scale-105">
              Start your free trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-full">
            Book a demo
          </Button>
        </div>
      </section>

      {/* Dashboard Preview Mockup */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto mb-32">
        <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0F]/80 backdrop-blur-2xl shadow-2xl p-2">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent z-10 bottom-0 h-1/3"></div>
          <div className="rounded-xl border border-white/5 bg-[#0A0A0F] overflow-hidden aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative">
             <div className="absolute inset-0 grid grid-cols-[1fr_3fr] opacity-50">
               <div className="border-r border-white/5 p-4 flex flex-col gap-4">
                 <div className="h-6 w-24 bg-white/5 rounded"></div>
                 <div className="h-4 w-full bg-white/5 rounded"></div>
                 <div className="h-4 w-3/4 bg-violet-500/20 rounded"></div>
                 <div className="h-4 w-5/6 bg-white/5 rounded"></div>
               </div>
               <div className="p-8 flex flex-col gap-6">
                 <div className="h-10 w-48 bg-white/5 rounded-lg mb-4"></div>
                 <div className="grid grid-cols-3 gap-4 mb-4">
                   <div className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
                   <div className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
                   <div className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
                 </div>
                 <div className="h-48 bg-violet-500/5 rounded-xl border border-violet-500/10"></div>
               </div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center z-20">
               <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-violet-400" /> AI Generating Content...
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Everything you need to grow</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">A unified platform that replaces your fragmented marketing stack.</p>
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
              <div key={i} className="p-6 rounded-2xl bg-[#0A0A0F] border border-white/5 hover:border-violet-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-600/20 transition-all">
                  <f.icon className="w-6 h-6 text-zinc-400 group-hover:text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-violet-900/40 to-black border border-violet-500/20 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 blur-[80px]"></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white relative z-10">Ready to scale your brand?</h2>
          <p className="text-zinc-300 mb-8 max-w-xl mx-auto relative z-10 text-lg">
            Join thousands of marketers who use BrandFlow to command their social presence.
          </p>
          <div className="relative z-10">
            <Link href={ctaLink}>
              <Button size="lg" className="h-14 px-10 text-base bg-white text-black hover:bg-zinc-200 rounded-full">
                Get started for free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-zinc-500 text-sm text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="font-semibold text-white">BrandFlow</span>
          </div>
          <p>© {new Date().getFullYear()} BrandFlow Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}