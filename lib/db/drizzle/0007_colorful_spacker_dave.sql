CREATE TABLE "agent_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"frequency" integer DEFAULT 3 NOT NULL,
	"content_topics" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
