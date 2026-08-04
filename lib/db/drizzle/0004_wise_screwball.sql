ALTER TABLE "posts" ADD COLUMN "project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "brand_knowledge_base" ADD COLUMN "project_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_knowledge_base" ADD CONSTRAINT "brand_knowledge_base_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_knowledge_base" ADD CONSTRAINT "brand_knowledge_base_project_id_unique" UNIQUE("project_id");