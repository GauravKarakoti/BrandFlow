import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, teamTable, activityTable } from "@workspace/db";
import {
  InviteTeamMemberBody,
  RemoveTeamMemberParams,
  ListTeamResponse,
  InviteTeamMemberResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/team", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const members = await db
    .select()
    .from(teamTable)
    .where(eq(teamTable.ownerId, userId));

  res.json(
    ListTeamResponse.parse(
      members.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
    ),
  );
});

router.post("/team/invite", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = InviteTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db
    .insert(teamTable)
    .values({
      ownerId: userId,
      email: parsed.data.email,
      role: parsed.data.role,
      status: "invited",
    })
    .returning();

  await db.insert(activityTable).values({
    userId,
    type: "member_invited",
    description: `Invited ${parsed.data.email} as ${parsed.data.role}`,
  });

  res.status(201).json(
    InviteTeamMemberResponse.parse({ ...member, createdAt: member.createdAt.toISOString() }),
  );
});

router.delete("/team/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = RemoveTeamMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [member] = await db
    .delete(teamTable)
    .where(and(eq(teamTable.id, params.data.id), eq(teamTable.ownerId, userId)))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Team member not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
