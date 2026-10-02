import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Send, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_CHATS = [
  { id: 1, name: "Sarah Jenkins", platform: "twitter", lastMsg: "Loved your recent post about AI!", time: "10:42 AM", unread: true },
  { id: 2, name: "TechCrunch", platform: "linkedin", lastMsg: "Would you be open to an interview?", time: "Yesterday", unread: false },
  { id: 3, name: "Alex Chen", platform: "instagram", lastMsg: "How much is the enterprise plan?", time: "Tuesday", unread: false },
];

export default function DashboardInbox() {
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#0A0A0F]/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 bg-[#050508]/80 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <Input 
              placeholder="Search messages..." 
              className="pl-9 bg-black/50 border-white/10 text-sm h-9 text-white focus-visible:ring-violet-500" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_CHATS.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat)}
              className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${activeChat.id === chat.id ? 'bg-violet-600/10' : 'hover:bg-white/5'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-semibold ${activeChat.id === chat.id ? 'text-violet-300' : 'text-zinc-200'}`}>
                  {chat.name}
                </span>
                <span className="text-xs text-zinc-500">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 truncate pr-4">{chat.lastMsg}</span>
                {chat.unread && <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0A0A0F]/40 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay"></div>
        
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center px-6 bg-black/20 backdrop-blur-sm z-10">
          <div>
            <h3 className="text-white font-semibold">{activeChat.name}</h3>
            <p className="text-xs text-zinc-400 capitalize">{activeChat.platform}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0">
              {activeChat.name.charAt(0)}
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
              <p className="text-sm text-zinc-200 leading-relaxed">{activeChat.lastMsg}</p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-sm z-10">
          <div className="flex items-end gap-2 bg-black/50 border border-white/10 rounded-xl p-2 focus-within:ring-1 focus-within:ring-violet-500 transition-all">
            <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-400 hover:text-white shrink-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </Button>
            <textarea 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent text-sm text-white resize-none max-h-32 min-h-[36px] outline-none py-2 scrollbar-hide"
              rows={1}
            />
            <div className="flex items-center gap-1 shrink-0 pb-1">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white">
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button size="icon" className="h-8 w-8 bg-violet-600 hover:bg-violet-700 text-white rounded-lg">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}