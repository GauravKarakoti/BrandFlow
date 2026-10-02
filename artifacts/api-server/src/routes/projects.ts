import { Router } from "express";
import { db } from "@workspace/db";
import { projects, agentSettings } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
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

// GET agent settings for a specific project
router.get("/:projectId/agent-settings", requireAuth, async (req, res) => {
  try {
    // Explicitly cast to string to satisfy Drizzle ORM types
    const projectId = req.params.projectId as string;
    
    if (!projectId) return res.status(400).json({ error: "Project ID is required" });

    const settings = await db
      .select()
      .from(agentSettings)
      .where(eq(agentSettings.projectId, projectId))
      .limit(1);
    
    // If no settings exist yet, return the default inactive structure
    if (!settings.length) {
      return res.json({ isActive: false, frequency: 3, contentTopics: "" });
    }
    
    return res.json(settings[0]);
  } catch (error) {
    console.error("Failed to fetch agent settings:", error);
    return res.status(500).json({ error: "Failed to fetch agent settings." });
  }
});

// PUT / UPDATE agent settings for a specific project
router.put("/:projectId/agent-settings", requireAuth, async (req, res) => {
  try {
    // Explicitly cast to string to satisfy Drizzle ORM types
    const projectId = req.params.projectId as string;
    
    if (!projectId) return res.status(400).json({ error: "Project ID is required" });

    const { isActive, frequency, contentTopics } = req.body;

    // Check if settings already exist for this project
    const existing = await db
      .select()
      .from(agentSettings)
      .where(eq(agentSettings.projectId, projectId))
      .limit(1);

    if (existing.length) {
      // Update existing settings
      const updated = await db.update(agentSettings)
        .set({ isActive, frequency, contentTopics, updatedAt: new Date() })
        .where(eq(agentSettings.projectId, projectId))
        .returning();
        
      return res.json(updated[0]);
    } else {
      // Insert new settings if this is the user's first time configuring it
      const inserted = await db.insert(agentSettings)
        .values({ projectId, isActive, frequency, contentTopics })
        .returning();
        
      return res.json(inserted[0]);
    }
  } catch (error) {
    console.error("Failed to update agent settings:", error);
    return res.status(500).json({ error: "Failed to update agent settings." });
  }
});

export default router;