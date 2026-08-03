import { Router } from "express";
import { desc } from "drizzle-orm";
import { db, posts } from "@workspace/db";

const router = Router();

/**
 * GET /api/posts
 * Fetch all posts (drafts and scheduled)
 */
router.get("/", async (req, res) => {
  try {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
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
router.post("/", async (req, res) => {
  try {
    const { platform, content, status, scheduledAt } = req.body;

    if (!platform || !content) {
      return res.status(400).json({ error: "Platform and content are required." });
    }

    const inserted = await db.insert(posts).values({
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

export default router;