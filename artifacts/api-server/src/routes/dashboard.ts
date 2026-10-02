import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, postsTable, schedulesTable, commentsTable, activityTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetDashboardActivityResponse,
  GetDashboardTopPostsResponse,
  GetDashboardActivityQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const [posts, schedules, comments] = await Promise.all([
    db.select().from(postsTable).where(eq(postsTable.userId, userId)),
    db.select().from(schedulesTable).where(eq(schedulesTable.userId, userId)),
    db.select().from(commentsTable).where(eq(commentsTable.userId, userId)),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const publishedToday = posts.filter(
    (p) =>
      p.status === "published" &&
      p.publishedAt &&
      p.publishedAt >= today &&
      p.publishedAt < tomorrow,
  ).length;

  const pendingComments = comments.filter((c) => c.status === "pending").length;
  const scheduledPosts = schedules.filter((s) => s.status === "pending").length;

  const published = posts.filter((p) => p.status === "published");
  const totalReach = published.reduce((a, p) => a + (p.reach ?? 0), 0);
  const totalEngagement = published.reduce(
    (a, p) => a + (p.likes ?? 0) + (p.shares ?? 0) + (p.comments ?? 0),
    0,
  );
  const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
  const followerCount = Math.round(totalReach * 0.15) || 1240;
  const followerGrowth = posts.length > 0 ? 4.2 : 0;

  res.json(
    GetDashboardSummaryResponse.parse({
      totalPosts: posts.length,
      scheduledPosts,
      publishedToday,
      pendingComments,
      totalReach,
      engagementRate: Math.round(engagementRate * 100) / 100,
      followerCount,
      followerGrowth,
    }),
  );
});

router.get("/dashboard/activity", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = GetDashboardActivityQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const activities = await db
    .select()
    .from(activityTable)
    .where(eq(activityTable.userId, userId))
    .orderBy(desc(activityTable.createdAt))
    .limit(params.data.limit ?? 20);

  res.json(
    GetDashboardActivityResponse.parse(
      activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    ),
  );
});

router.get("/dashboard/top-posts", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.userId, userId))
    .orderBy(desc(postsTable.engagementScore))
    .limit(5);

  res.json(
    GetDashboardTopPostsResponse.parse(
      posts.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        scheduledAt: p.scheduledAt?.toISOString() ?? null,
        publishedAt: p.publishedAt?.toISOString() ?? null,
      })),
    ),
  );
});

export default router;
