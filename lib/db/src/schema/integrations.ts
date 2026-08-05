import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { projects } from "./auth"; // Adjust import path if necessary

export const socialAccounts = pgTable("social_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  
  // Will exclusively be 'linkedin'
  provider: varchar("provider", { length: 50 }).notNull(), 
  
  // The unique ID from LinkedIn (the 'sub' field)
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  
  // OAuth Tokens used by the node-cron background worker
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  
  // Display info for the UI
  profileName: varchar("profile_name", { length: 255 }),
  profileHandle: varchar("profile_handle", { length: 255 }),
  profileImageUrl: text("profile_image_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});