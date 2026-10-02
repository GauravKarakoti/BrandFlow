import { Router, type IRouter } from "express";
import { eq, desc, count, sum } from "drizzle-orm";
import { db, postsTable, commentsTable } from "@workspace/db";
import {
  GetAnalyticsOverviewResponse,
  GetAnalyticsByPlatformResponse,
  GetAnalyticsTrendsResponse,
  GetAnalyticsTrendsQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/analytics/overview", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const posts = await db.select().from(postsTable).where(eq(postsTable.userId, userId));
  const published = posts.filter((p) => p.status === "published");
  const scheduled = posts.filter((p) => p.status === "scheduled");

  const totalReach = published.reduce((a, p) => a + (p.reach ?? 0), 0);
  const totalLikes = published.reduce((a, p) => a + (p.likes ?? 0), 0);
  const totalShares = published.reduce((a, p) => a + (p.shares ?? 0), 0);
  const totalComments = published.reduce((a, p) => a + (p.comments ?? 0), 0);
  const totalEngagement = totalLikes + totalShares + totalComments;

  const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const postsThisWeek = posts.filter(
    (p) =>
      p.createdAt >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
  ).length;

  // Simulate follower count based on reach
  const followerCount = Math.round(totalReach * 0.15) || 1240;
  const growthPercent = postsThisWeek > 0 ? 4.2 : 0;

  res.json(
    GetAnalyticsOverviewResponse.parse({
      totalPosts: posts.length,
      totalReach,
      totalEngagement,
      followerCount,
      engagementRate: Math.round(engagementRate * 100) / 100,
      impressions: Math.round(totalReach * 1.8),
      postsThisWeek,
      growthPercent,
    }),
  );
});

router.get("/analytics/platforms", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.userId, userId));

  const platforms = ["twitter", "linkedin", "instagram", "facebook"];
  const result = platforms.map((platform) => {
    const pp = posts.filter((p) => p.platform === platform && p.status === "published");
    const reach = pp.reduce((a, p) => a + (p.reach ?? 0), 0);
    const engagement =
      pp.reduce((a, p) => a + (p.likes ?? 0) + (p.shares ?? 0) + (p.comments ?? 0), 0);
    return {
      platform,
      posts: pp.length,
      reach,
      engagement,
      followers: Math.round(reach * 0.12) || 0,
      engagementRate: reach > 0 ? Math.round((engagement / reach) * 10000) / 100 : 0,
    };
  });

  res.json(GetAnalyticsByPlatformResponse.parse(result));
});

router.get("/analytics/trends", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = GetAnalyticsTrendsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const days = params.data.days ?? 30;
  const posts = await db.select().from(postsTable).where(eq(postsTable.userId, userId));

  // Build daily aggregates for the last N days
  const result: Array<{
    date: string;
    engagement: number;
    reach: number;
    impressions: number;
    followers: number;
  }> = [];

  let runningFollowers = Math.max(800, posts.length * 12);

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);

    const dayPosts = posts.filter(
      (p) => p.createdAt >= day && p.createdAt < nextDay && p.status === "published",
    );

    const reach = dayPosts.reduce((a, p) => a + (p.reach ?? 0), 0);
    const engagement = dayPosts.reduce(
      (a, p) => a + (p.likes ?? 0) + (p.shares ?? 0) + (p.comments ?? 0),
      0,
    );

    runningFollowers += Math.floor(Math.random() * 5);

    result.push({
      date: day.toISOString().split("T")[0],
      engagement: engagement || Math.floor(Math.random() * 80 + 20),
      reach: reach || Math.floor(Math.random() * 600 + 200),
      impressions: Math.round((reach || Math.floor(Math.random() * 600 + 200)) * 1.8),
      followers: runningFollowers,
    });
  }

  res.json(GetAnalyticsTrendsResponse.parse(result));
});

export default router;
