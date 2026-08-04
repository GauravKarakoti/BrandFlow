import { Router } from "express";
import { db } from "@workspace/db";
import { projects } from "@workspace/db/schema";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Create a new project/workspace for the authenticated user
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Workspace name is required." });

    const newProject = await db.insert(projects).values({
      userId: req.userId!,
      name,
    }).returning();

    return res.json(newProject[0]);
  } catch (error) {
    console.error("Failed to create project:", error);
    return res.status(500).json({ error: "Failed to create workspace." });
  }
});

export default router;