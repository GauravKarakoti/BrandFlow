import { useState, useRef, useEffect } from "react";
import { useAiChat } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/react";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function DashboardAiChat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm BrandFlow AI. I can help you draft posts, analyze trends, or answer questions about your brand's data. What can I do for you today?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useAiChat();

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    chatMutation.mutate(
      { data: { message: userMessage } },
      {
        onSuccess: (data) => {
          setMessages(prev => [...prev, { role: "ai", content: data.response }]);
        },
        onError: () => {
          setMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting to the server right now." }]);
        }
      }
    );
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#0A0A0F]/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay z-0"></div>
      
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center px-6 bg-black/20 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
            <Bot className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold tracking-tight">BrandFlow Assistant</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 z-10 space-y-6" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
              msg.role === "ai" ? "bg-violet-600/20 border border-violet-500/30" : "bg-white/5 border border-white/10"
            }`}>
              {msg.role === "ai" ? <Sparkles className="w-4 h-4 text-violet-400" /> : <User className="w-4 h-4 text-zinc-400" />}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === "ai" 
                ? "bg-white/5 border border-white/5 text-zinc-200 rounded-tl-sm" 
                : "bg-violet-600 text-white rounded-tr-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex gap-4 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-black/20 border-t border-white/5 z-10 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 max-w-4xl mx-auto relative"
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..." 
            className="bg-black/50 border-white/10 h-12 pr-12 text-white focus-visible:ring-violet-500 rounded-xl"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1 top-1 h-10 w-10 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(124,58,237,0.3)]"
            disabled={!input.trim() || chatMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex gap-2 justify-center mt-3 flex-wrap">
          {["Draft a tweet about our new launch", "Analyze my top performing posts", "What's the best time to post?"].map((prompt, i) => (
            <button 
              key={i}
              type="button"
              onClick={() => setInput(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}