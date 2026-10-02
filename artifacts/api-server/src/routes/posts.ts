import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, postsTable } from "@workspace/db";
import {
  CreatePostBody,
  UpdatePostBody,
  UpdatePostParams,
  GetPostParams,
  DeletePostParams,
  ListPostsQueryParams,
  GetPostResponse,
  ListPostsResponse,
  CreatePostResponse,
  UpdatePostResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { activityTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/posts", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = ListPostsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db
    .select()
    .from(postsTable)
    .where(eq(postsTable.userId, userId))
    .orderBy(desc(postsTable.createdAt))
    .$dynamic();

  const posts = await query.limit(params.data.limit ?? 50).offset(params.data.offset ?? 0);

  const filtered = posts.filter((p) => {
    if (params.data.platform && p.platform !== params.data.platform) return false;
    if (params.data.status && p.status !== params.data.status) return false;
    return true;
  });

  res.json(
    ListPostsResponse.parse(
      filtered.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        scheduledAt: p.scheduledAt?.toISOString() ?? null,
        publishedAt: p.publishedAt?.toISOString() ?? null,
      })),
    ),
  );
});

router.post("/posts", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { scheduledAt, ...rest } = parsed.data;
  const [post] = await db
    .insert(postsTable)
    .values({
      userId,
      ...rest,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? "scheduled" : "draft",
    })
    .returning();

  await db.insert(activityTable).values({
    userId,
    type: "schedule_created",
    description: `New post created for ${post.platform}`,
    platform: post.platform,
  });

  res.status(201).json(
    CreatePostResponse.parse({
      ...post,
      createdAt: post.createdAt.toISOString(),
      scheduledAt: post.scheduledAt?.toISOString() ?? null,
      publishedAt: post.publishedAt?.toISOString() ?? null,
    }),
  );
});

router.get("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db
    .select()
    .from(postsTable)
    .where(and(eq(postsTable.id, params.data.id), eq(postsTable.userId, userId)));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(
    GetPostResponse.parse({
      ...post,
      createdAt: post.createdAt.toISOString(),
      scheduledAt: post.scheduledAt?.toISOString() ?? null,
      publishedAt: post.publishedAt?.toISOString() ?? null,
    }),
  );
});

router.patch("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = UpdatePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { scheduledAt, ...rest } = parsed.data;
  const [post] = await db
    .update(postsTable)
    .set({ ...rest, scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined })
    .where(and(eq(postsTable.id, params.data.id), eq(postsTable.userId, userId)))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(
    UpdatePostResponse.parse({
      ...post,
      createdAt: post.createdAt.toISOString(),
      scheduledAt: post.scheduledAt?.toISOString() ?? null,
      publishedAt: post.publishedAt?.toISOString() ?? null,
    }),
  );
});

router.delete("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db
    .delete(postsTable)
    .where(and(eq(postsTable.id, params.data.id), eq(postsTable.userId, userId)))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
