CREATE TABLE "brand_knowledge_base" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_description" text,
	"mission_statement" text,
	"target_audience" text,
	"tone_and_voice" text,
	"logo_url" text,
	"brand_colors" jsonb DEFAULT '[]'::jsonb,
	"links" jsonb DEFAULT '[]'::jsonb,
	"documents" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
