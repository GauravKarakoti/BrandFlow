import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, commentsTable, activityTable } from "@workspace/db";
import {
  ReplyToCommentBody,
  ReplyToCommentParams,
  UpdateCommentStatusBody,
  UpdateCommentStatusParams,
  ListCommentsQueryParams,
  ListCommentsResponse,
  ReplyToCommentResponse,
  UpdateCommentStatusResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/comments", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = ListCommentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.userId, userId))
    .orderBy(desc(commentsTable.createdAt))
    .limit(params.data.limit ?? 50);

  const filtered = comments.filter((c) => {
    if (params.data.platform && c.platform !== params.data.platform) return false;
    if (params.data.status && c.status !== params.data.status) return false;
    return true;
  });

  res.json(
    ListCommentsResponse.parse(
      filtered.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/comments/:id/reply", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = ReplyToCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ReplyToCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [comment] = await db
    .update(commentsTable)
    .set({ reply: parsed.data.reply, status: "replied" })
    .where(and(eq(commentsTable.id, params.data.id), eq(commentsTable.userId, userId)))
    .returning();

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  await db.insert(activityTable).values({
    userId,
    type: "reply_sent",
    description: `Replied to a comment on ${comment.platform}`,
    platform: comment.platform,
  });

  res.json(
    ReplyToCommentResponse.parse({ ...comment, createdAt: comment.createdAt.toISOString() }),
  );
});

router.patch("/comments/:id/status", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = UpdateCommentStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCommentStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [comment] = await db
    .update(commentsTable)
    .set({ status: parsed.data.status })
    .where(and(eq(commentsTable.id, params.data.id), eq(commentsTable.userId, userId)))
    .returning();

  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  res.json(
    UpdateCommentStatusResponse.parse({ ...comment, createdAt: comment.createdAt.toISOString() }),
  );
});

export default router;
