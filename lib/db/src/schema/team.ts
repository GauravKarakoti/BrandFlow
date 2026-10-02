import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const teamTable = pgTable("team", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(), // the workspace owner
  memberId: text("member_id"), // Clerk userId if accepted
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("editor"), // owner | admin | editor | viewer
  status: text("status").notNull().default("invited"), // active | invited | inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teamTable).omit({ id: true, createdAt: true });
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teamTable.$inferSelect;
