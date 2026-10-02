import { useState } from "react";
import { useListSchedules } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { CalendarPlus, Clock, Instagram, Linkedin, Twitter, Facebook } from "lucide-react";
import { format, isSameDay } from "date-fns";

export default function DashboardCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: schedules, isLoading } = useListSchedules({}, { query: { queryKey: ["schedules"] } });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter": return <Twitter className="w-4 h-4 text-blue-400" />;
      case "linkedin": return <Linkedin className="w-4 h-4 text-blue-600" />;
      case "instagram": return <Instagram className="w-4 h-4 text-pink-500" />;
      case "facebook": return <Facebook className="w-4 h-4 text-blue-500" />;
      default: return <Twitter className="w-4 h-4" />;
    }
  };

  const selectedDateSchedules = schedules?.filter(s => date && isSameDay(new Date(s.scheduledAt), date)) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Calendar
              <Button size="sm" variant="ghost" className="h-8 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10">
                <CalendarPlus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="bg-black/20 rounded-xl border border-white/5 p-3 text-white"
              modifiers={{
                hasEvent: (d) => schedules?.some(s => isSameDay(new Date(s.scheduledAt), d)) || false
              }}
              modifiersStyles={{
                hasEvent: { border: '1px solid rgba(124, 58, 237, 0.5)' }
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {date ? format(date, "MMMM d, yyyy") : "Select a date"}
          </h2>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            Schedule Post
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-24 w-full rounded-xl bg-white/5" />
          </div>
        ) : selectedDateSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#0A0A0F]/50">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <CalendarPlus className="w-6 h-6 text-zinc-500" />
            </div>
            <p className="text-zinc-400 font-medium">No posts scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDateSchedules.map((schedule) => (
              <div key={schedule.id} className="p-5 rounded-xl bg-[#0A0A0F] border border-white/5 flex gap-4 hover:border-violet-500/30 transition-colors">
                <div className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-white/5 pr-4">
                  <span className="text-lg font-bold text-white">{format(new Date(schedule.scheduledAt), "HH:mm")}</span>
                  <span className="text-xs text-zinc-500 uppercase">{format(new Date(schedule.scheduledAt), "a")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getPlatformIcon(schedule.platform)}
                    <span className="text-xs font-medium text-zinc-400 capitalize">{schedule.platform}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      schedule.status === 'sent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      schedule.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-200 line-clamp-2">{schedule.post?.content || "No content"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}