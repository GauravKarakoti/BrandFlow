import { Router } from "express";
import { desc, eq, and } from "drizzle-orm";
import { db, posts } from "@workspace/db";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * GET /api/posts
 * Fetch all posts (drafts and scheduled) for the active project
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });

    const allPosts = await db.select()
      .from(posts)
      .where(eq(posts.projectId, req.projectId)) // Multi-tenant isolation
      .orderBy(desc(posts.createdAt));
      
    return res.json(allPosts);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return res.status(500).json({ error: "Failed to fetch posts." });
  }
});

/**
 * POST /api/posts
 * Save a new draft or schedule a post
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });

    const { platform, content, status, scheduledAt } = req.body;

    if (!platform || !content) {
      return res.status(400).json({ error: "Platform and content are required." });
    }

    const inserted = await db.insert(posts).values({
      projectId: req.projectId, // Fixes Error 1: Assigns post to the project
      platform,
      content,
      status: status || 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    }).returning();

    return res.json(inserted[0]);
  } catch (error) {
    console.error("Failed to save post:", error);
    return res.status(500).json({ error: "Failed to save post." });
  }
});

/**
 * PATCH /api/posts/:id
 * Update content, status, or schedule date
 */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });
    
    const id = req.params.id as string; // Fixes Error 2: Force string type
    const { content, status, scheduledAt } = req.body;

    const updated = await db.update(posts)
      .set({
        ...(content && { content }),
        ...(status && { status }),
        // If scheduledAt is explicitly passed as null, it reverts to draft timing
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        updatedAt: new Date(),
      })
      .where(and(
        eq(posts.id, id), 
        eq(posts.projectId, req.projectId) // Security: Ensure user owns this post
      ))
      .returning();

    return res.json(updated[0]);
  } catch (error) {
    console.error("Failed to update post:", error);
    return res.status(500).json({ error: "Failed to update post." });
  }
});

/**
 * DELETE /api/posts/:id
 * Permanently delete a draft
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!req.projectId) return res.status(400).json({ error: "Project context required." });
    
    const id = req.params.id as string; // Fixes Error 2: Force string type
    
    await db.delete(posts).where(and(
      eq(posts.id, id), 
      eq(posts.projectId, req.projectId) // Security: Ensure user owns this post
    ));
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return res.status(500).json({ error: "Failed to delete post." });
  }
});

export default router;