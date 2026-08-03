import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  platform: varchar("platform", { length: 50 }).notNull(),
  content: text("content").notNull(),
  
  // Status can be: 'draft', 'scheduled', or 'published'
  status: varchar("status", { length: 20 }).notNull().default('draft'),
  
  // Null if it's just a draft
  scheduledAt: timestamp("scheduled_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;