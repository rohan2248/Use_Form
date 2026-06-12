ALTER TABLE "forms" ADD COLUMN "max_responses" integer;
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "email_notifications" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "daily_digest" boolean DEFAULT false NOT NULL;
