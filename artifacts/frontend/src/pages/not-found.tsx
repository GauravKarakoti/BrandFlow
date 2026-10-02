import { Link } from "wouter";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center text-white px-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
          <Sparkles className="w-8 h-8 text-violet-500" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">404</h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-white hover:bg-zinc-200 text-black rounded-full px-8 h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}