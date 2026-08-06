import { pgTable, serial, integer, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const agentSettings = pgTable('agent_settings', {
  id: serial('id').primaryKey(),
  projectId: uuid('project_id').notNull(), // Foreign key to projects.id
  isActive: boolean('is_active').default(false).notNull(),
  frequency: integer('frequency').default(3).notNull(), // Target posts per week
  contentTopics: text('content_topics').notNull(), // Defining core pillars/topics
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});