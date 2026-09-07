ALTER TABLE "jd_requests" ADD COLUMN "expires_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "resume_variants" ADD COLUMN "expires_at" timestamp with time zone NOT NULL;