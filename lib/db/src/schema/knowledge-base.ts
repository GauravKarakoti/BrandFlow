import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const brandKnowledgeBase = pgTable("brand_knowledge_base", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Brand Identity
  companyDescription: text("company_description"),
  missionStatement: text("mission_statement"),
  targetAudience: text("target_audience"),
  toneAndVoice: text("tone_and_voice"),

  // Visual Assets
  logoUrl: text("logo_url"),
  brandColors: jsonb("brand_colors").$type<string[]>().default([]),

  // External Training Sources & Context
  links: jsonb("links").$type<string[]>().default([]),
  documents: jsonb("documents").$type<{ name: string; url: string }[]>().default([]),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BrandKnowledgeBase = typeof brandKnowledgeBase.$inferSelect;
export type NewBrandKnowledgeBase = typeof brandKnowledgeBase.$inferInsert;