import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const brandsTable = pgTable("brands", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  name: text("name").notNull().default("My Brand"),
  description: text("description"),
  mission: text("mission"),
  vision: text("vision"),
  toneOfVoice: text("tone_of_voice"),
  primaryColor: text("primary_color").default("#7c3aed"),
  secondaryColor: text("secondary_color").default("#a78bfa"),
  logoUrl: text("logo_url"),
  website: text("website"),
  industry: text("industry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBrandSchema = createInsertSchema(brandsTable).omit({ id: true, createdAt: true });
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brandsTable.$inferSelect;
