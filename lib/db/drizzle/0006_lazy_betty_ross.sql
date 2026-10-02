ALTER TABLE "users" RENAME COLUMN "password_hash" TO "name";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;