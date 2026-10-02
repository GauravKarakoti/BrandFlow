import { useGetDashboardSummary, useGetDashboardActivity, useGetDashboardTopPosts, useGetAnalyticsTrends } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, MessageCircle, Share2, Heart, TrendingUp, Users, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverview() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ query: { queryKey: ["dashboard-summary"] } });
  const { data: activity, isLoading: loadingActivity } = useGetDashboardActivity({ limit: 5 }, { query: { queryKey: ["dashboard-activity", 5] } });
  const { data: topPosts, isLoading: loadingTopPosts } = useGetDashboardTopPosts({ query: { queryKey: ["dashboard-top-posts"] } });
  const { data: trends, isLoading: loadingTrends } = useGetAnalyticsTrends({ days: 7 }, { query: { queryKey: ["analytics-trends", 7] } });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Reach" 
          value={summary?.totalReach?.toLocaleString() || "0"} 
          trend="+12.5%" 
          icon={TrendingUp} 
          loading={loadingSummary} 
        />
        <StatsCard 
          title="Engagement Rate" 
          value={`${summary?.engagementRate?.toFixed(1) || "0"}%`} 
          trend="+2.1%" 
          icon={Activity} 
          loading={loadingSummary} 
        />
        <StatsCard 
          title="Total Followers" 
          value={summary?.followerCount?.toLocaleString() || "0"} 
          trend={`+${summary?.followerGrowth?.toFixed(1) || "0"}%`} 
          icon={Users} 
          loading={loadingSummary} 
        />
        <StatsCard 
          title="Pending Comments" 
          value={summary?.pendingComments?.toString() || "0"} 
          trend="Needs attention" 
          icon={MessageCircle} 
          loading={loadingSummary} 
          trendColor="text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-panel border-white/5 bg-[#0A0A0F]/80">
          <CardHeader>
            <CardTitle className="text-white">Audience Growth</CardTitle>
            <CardDescription className="text-zinc-400">Reach and engagement over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTrends ? (
              <Skeleton className="w-full h-[300px] rounded-xl bg-white/5" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0F', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="reach" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80 flex flex-col">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-zinc-400">Latest actions across your brand</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {loadingActivity ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}
              </div>
            ) : activity?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">No recent activity</div>
            ) : (
              <div className="space-y-6">
                {activity?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-violet-500 shrink-0 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
                    <div>
                      <p className="text-sm text-zinc-200">{item.description}</p>
                      <p className="text-xs text-zinc-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80">
        <CardHeader>
          <CardTitle className="text-white">Top Performing Posts</CardTitle>
          <CardDescription className="text-zinc-400">Posts with the highest engagement score</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTopPosts ? (
            <Skeleton className="h-48 w-full bg-white/5" />
          ) : topPosts?.length === 0 ? (
             <div className="py-8 text-center text-zinc-500">No published posts yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topPosts?.slice(0, 3).map((post) => (
                <div key={post.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-zinc-300 capitalize">
                      {post.platform}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-violet-400" />
                  </div>
                  <p className="text-sm text-zinc-200 line-clamp-3 mb-4">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3 h-3" /> {post.shares}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, trend, icon: Icon, loading, trendColor = "text-emerald-400" }: any) {
  return (
    <Card className="glass-panel border-white/5 bg-[#0A0A0F]/80 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <Icon className="w-4 h-4 text-zinc-300" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24 bg-white/10" />
        ) : (
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}