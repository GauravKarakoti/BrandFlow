import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  
  // New fields populated by LinkedIn OAuth
  name: varchar("name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Gaurav's Workspace"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});