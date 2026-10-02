import { Router, type IRouter } from "express";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db, schedulesTable, postsTable, activityTable } from "@workspace/db";
import {
  CreateScheduleBody,
  UpdateScheduleBody,
  UpdateScheduleParams,
  DeleteScheduleParams,
  ListSchedulesQueryParams,
  ListSchedulesResponse,
  CreateScheduleResponse,
  UpdateScheduleResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/schedules", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = ListSchedulesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const schedules = await db
    .select({
      id: schedulesTable.id,
      postId: schedulesTable.postId,
      scheduledAt: schedulesTable.scheduledAt,
      platform: schedulesTable.platform,
      status: schedulesTable.status,
      createdAt: schedulesTable.createdAt,
      post: {
        id: postsTable.id,
        content: postsTable.content,
        caption: postsTable.caption,
        hashtags: postsTable.hashtags,
        platform: postsTable.platform,
        status: postsTable.status,
        tone: postsTable.tone,
        imageUrl: postsTable.imageUrl,
        engagementScore: postsTable.engagementScore,
        likes: postsTable.likes,
        shares: postsTable.shares,
        comments: postsTable.comments,
        reach: postsTable.reach,
        createdAt: postsTable.createdAt,
        scheduledAt: postsTable.scheduledAt,
        publishedAt: postsTable.publishedAt,
      },
    })
    .from(schedulesTable)
    .leftJoin(postsTable, eq(schedulesTable.postId, postsTable.id))
    .where(eq(schedulesTable.userId, userId))
    .orderBy(desc(schedulesTable.scheduledAt));

  const filtered = schedules.filter((s) => {
    if (params.data.platform && s.platform !== params.data.platform) return false;
    if (params.data.from && s.scheduledAt < new Date(params.data.from)) return false;
    if (params.data.to && s.scheduledAt > new Date(params.data.to)) return false;
    return true;
  });

  res.json(
    ListSchedulesResponse.parse(
      filtered.map((s) => ({
        ...s,
        scheduledAt: s.scheduledAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        post: s.post
          ? {
              ...s.post,
              createdAt: s.post.createdAt.toISOString(),
              scheduledAt: s.post.scheduledAt?.toISOString() ?? null,
              publishedAt: s.post.publishedAt?.toISOString() ?? null,
            }
          : null,
      })),
    ),
  );
});

router.post("/schedules", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = CreateScheduleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [schedule] = await db
    .insert(schedulesTable)
    .values({
      userId,
      postId: parsed.data.postId,
      scheduledAt: new Date(parsed.data.scheduledAt),
      platform: parsed.data.platform,
    })
    .returning();

  await db.insert(activityTable).values({
    userId,
    type: "schedule_created",
    description: `Post scheduled for ${parsed.data.platform}`,
    platform: parsed.data.platform,
  });

  res.status(201).json(
    CreateScheduleResponse.parse({
      ...schedule,
      scheduledAt: schedule.scheduledAt.toISOString(),
      createdAt: schedule.createdAt.toISOString(),
    }),
  );
});

router.patch("/schedules/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = UpdateScheduleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateScheduleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { scheduledAt, ...rest } = parsed.data;
  const [schedule] = await db
    .update(schedulesTable)
    .set({ ...rest, scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined })
    .where(and(eq(schedulesTable.id, params.data.id), eq(schedulesTable.userId, userId)))
    .returning();

  if (!schedule) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  res.json(
    UpdateScheduleResponse.parse({
      ...schedule,
      scheduledAt: schedule.scheduledAt.toISOString(),
      createdAt: schedule.createdAt.toISOString(),
    }),
  );
});

router.delete("/schedules/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = DeleteScheduleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [schedule] = await db
    .delete(schedulesTable)
    .where(and(eq(schedulesTable.id, params.data.id), eq(schedulesTable.userId, userId)))
    .returning();

  if (!schedule) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
