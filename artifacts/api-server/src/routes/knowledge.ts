import { Router } from "express";
import { eq } from "drizzle-orm";
import { brandKnowledgeBase, db } from "@workspace/db";

const router = Router();

/**
 * GET /api/knowledge-base
 * Fetch current brand knowledge base record
 */
router.get("/", async (_req, res) => {
  try {
    const record = await db.select().from(brandKnowledgeBase).limit(1);
    return res.json(record[0] || null);
  } catch (error) {
    console.error("Failed to fetch Knowledge Base:", error);
    return res.status(500).json({ error: "Failed to fetch Knowledge Base data" });
  }
});

/**
 * POST /api/knowledge-base
 * Create or update the brand knowledge base context
 */
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const existing = await db.select().from(brandKnowledgeBase).limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(brandKnowledgeBase)
        .set({
          ...payload,
          updatedAt: new Date(),
        })
        .where(eq(brandKnowledgeBase.id, existing[0].id))
        .returning();

      return res.json(updated[0]);
    }

    const inserted = await db
      .insert(brandKnowledgeBase)
      .values(payload)
      .returning();

    return res.json(inserted[0]);
  } catch (error) {
    console.error("Failed to save Knowledge Base:", error);
    return res.status(500).json({ error: "Failed to save Knowledge Base data" });
  }
});

export default router;