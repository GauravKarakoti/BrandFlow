import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { brandKnowledgeBase, db } from "@workspace/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * GET /api/knowledge-base
 * Fetch current brand knowledge base record for the active project
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });

    const record = await db
      .select()
      .from(brandKnowledgeBase)
      .where(eq(brandKnowledgeBase.projectId, req.projectId)) // Multi-tenant isolation
      .limit(1);
      
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
router.post("/", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });

    const payload = req.body;
    
    // Search only within the active project
    const existing = await db
      .select()
      .from(brandKnowledgeBase)
      .where(eq(brandKnowledgeBase.projectId, req.projectId))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(brandKnowledgeBase)
        .set({
          ...payload,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(brandKnowledgeBase.id, existing[0].id),
            eq(brandKnowledgeBase.projectId, req.projectId) // Security enforcement
          )
        )
        .returning();

      return res.json(updated[0]);
    }

    // Insert new record, explicitly attaching the project ID
    const inserted = await db
      .insert(brandKnowledgeBase)
      .values({
        ...payload,
        projectId: req.projectId, 
      })
      .returning();

    return res.json(inserted[0]);
  } catch (error) {
    console.error("Failed to save Knowledge Base:", error);
    return res.status(500).json({ error: "Failed to save Knowledge Base data" });
  }
});

export default router;