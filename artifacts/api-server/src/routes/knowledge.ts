import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, knowledgeTable } from "@workspace/db";
import {
  CreateKnowledgeBody,
  DeleteKnowledgeParams,
  ListKnowledgeResponse,
  CreateKnowledgeResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/knowledge", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const items = await db
    .select()
    .from(knowledgeTable)
    .where(eq(knowledgeTable.userId, userId))
    .orderBy(desc(knowledgeTable.createdAt));

  res.json(
    ListKnowledgeResponse.parse(
      items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() })),
    ),
  );
});

router.post("/knowledge", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = CreateKnowledgeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(knowledgeTable)
    .values({ userId, ...parsed.data })
    .returning();

  res.status(201).json(
    CreateKnowledgeResponse.parse({ ...item, createdAt: item.createdAt.toISOString() }),
  );
});

router.delete("/knowledge/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = DeleteKnowledgeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(knowledgeTable)
    .where(and(eq(knowledgeTable.id, params.data.id), eq(knowledgeTable.userId, userId)))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Knowledge item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
