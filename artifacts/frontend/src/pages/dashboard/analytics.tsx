import { useGetAnalyticsOverview, useGetAnalyticsByPlatform, useGetAnalyticsTrends } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, Target, Activity } from "lucide-react";

export default function DashboardAnalytics() {
  const { data: overview, isLoading: loadingOverview } = useGetAnalyticsOverview({ query: { queryKey: ["analytics-overview"] } });
  const { data: platformStats, isLoading: loadingPlatforms } = useGetAnalyticsByPlatform({ query: { queryKey: ["analytics-platform"] } });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Impressions" value={overview?.impressions?.toLocaleString()} icon={Target} loading={loadingOverview} />
        <StatCard title="Total Reach" value={overview?.totalReach?.toLocaleString()} icon={TrendingUp} loading={loadingOverview} />
        <StatCard title="Followers" value={overview?.followerCount?.toLocaleString()} icon={Users} loading={loadingOverview} />
        <StatCard title="Avg Engagement" value={`${overview?.engagementRate?.toFixed(1)}%`} icon={Activity} loading={loadingOverview} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
          <CardHeader>
            <CardTitle className="text-white">Platform Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPlatforms ? (
              <Skeleton className="w-full h-[300px] rounded-xl bg-white/5" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformStats || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="platform" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'capitalize' }} 
                    />
                    <YAxis 
                      yAxisId="left" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#0A0A0F', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="reach" name="Reach" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="engagement" name="Engagement" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
          <CardHeader>
            <CardTitle className="text-white">Audience by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPlatforms ? (
               <Skeleton className="w-full h-[300px] rounded-xl bg-white/5" />
            ) : (
              <div className="space-y-6 mt-4">
                {platformStats?.map((stat) => (
                  <div key={stat.platform}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-zinc-300 capitalize">{stat.platform}</span>
                      <span className="text-sm font-bold text-white">{stat.followers.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-violet-500 h-full rounded-full" 
                        style={{ width: `${Math.min(100, (stat.followers / (overview?.followerCount || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading }: any) {
  return (
    <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80 group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
            <Icon className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 bg-white/10" />
            ) : (
              <h3 className="text-2xl font-bold text-white tracking-tight">{value || "0"}</h3>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}