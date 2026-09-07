CREATE TABLE "content_revision" (
	"id" text PRIMARY KEY NOT NULL,
	"snapshot_path" text NOT NULL,
	"current_path" text NOT NULL,
	"commit_sha" text,
	"backup_repo" text NOT NULL,
	"branch" text NOT NULL,
	"published_by" text NOT NULL,
	"status" text NOT NULL,
	"summary" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"company_url" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"date" text NOT NULL,
	"icon" text NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_bullet" (
	"id" text PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"text" text NOT NULL,
	"visibility" text NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_bullet_focus_weight" (
	"id" text PRIMARY KEY NOT NULL,
	"bullet_id" text NOT NULL,
	"focus_id" text NOT NULL,
	"weight" real NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_bullet_skill_link" (
	"id" text PRIMARY KEY NOT NULL,
	"bullet_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_focus_weight" (
	"id" text PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"focus_id" text NOT NULL,
	"weight" real NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "focus_definition" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"short_label" text NOT NULL,
	"category" text NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"aliases" jsonb NOT NULL,
	"related_skill_ids" jsonb NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jd_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"focus_ids" text[] DEFAULT '{}' NOT NULL,
	"raw_text" text,
	"extraction" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_asset" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"kind" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_name" text NOT NULL,
	"url" text NOT NULL,
	"path" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_link" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"hash" text NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_highlight" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"detail" text NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_highlight_focus_weight" (
	"id" text PRIMARY KEY NOT NULL,
	"highlight_id" text NOT NULL,
	"focus_id" text NOT NULL,
	"weight" real NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"impact" text NOT NULL,
	"detail" text NOT NULL,
	"featured" boolean NOT NULL,
	"visibility" text NOT NULL,
	"case_study" jsonb,
	"public_proof" jsonb,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_focus_weight" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"focus_id" text NOT NULL,
	"weight" real NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_link" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"label" text NOT NULL,
	"href" text NOT NULL,
	"kind" text NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_skill_link" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"focus_ids" text[] DEFAULT '{}' NOT NULL,
	"variant" jsonb NOT NULL,
	"analysis" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resume_variants_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "site_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"timezone" text NOT NULL,
	"last_updated_label" text NOT NULL,
	"content_promise" text NOT NULL,
	"current_focus_labels" jsonb NOT NULL,
	"email" text NOT NULL,
	"github_url" text NOT NULL,
	"linkedin_url" text NOT NULL,
	"profile_image_url" text,
	"hero_label" text NOT NULL,
	"recruiter_pitch" text NOT NULL,
	"overview" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"category" text NOT NULL,
	"aliases" jsonb NOT NULL,
	"highlights" jsonb,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_focus_weight" (
	"id" text PRIMARY KEY NOT NULL,
	"skill_id" text NOT NULL,
	"focus_id" text NOT NULL,
	"weight" real NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "summary_template" (
	"id" text PRIMARY KEY NOT NULL,
	"focus_ids" jsonb NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"sort_order" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience_bullet" ADD CONSTRAINT "experience_bullet_experience_id_experience_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_bullet_focus_weight" ADD CONSTRAINT "experience_bullet_focus_weight_bullet_id_experience_bullet_id_fk" FOREIGN KEY ("bullet_id") REFERENCES "public"."experience_bullet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_bullet_focus_weight" ADD CONSTRAINT "experience_bullet_focus_weight_focus_id_focus_definition_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."focus_definition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_bullet_skill_link" ADD CONSTRAINT "experience_bullet_skill_link_bullet_id_experience_bullet_id_fk" FOREIGN KEY ("bullet_id") REFERENCES "public"."experience_bullet"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_bullet_skill_link" ADD CONSTRAINT "experience_bullet_skill_link_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_focus_weight" ADD CONSTRAINT "experience_focus_weight_experience_id_experience_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_focus_weight" ADD CONSTRAINT "experience_focus_weight_focus_id_focus_definition_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."focus_definition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_highlight_focus_weight" ADD CONSTRAINT "profile_highlight_focus_weight_highlight_id_profile_highlight_id_fk" FOREIGN KEY ("highlight_id") REFERENCES "public"."profile_highlight"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_highlight_focus_weight" ADD CONSTRAINT "profile_highlight_focus_weight_focus_id_focus_definition_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."focus_definition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_focus_weight" ADD CONSTRAINT "project_focus_weight_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_focus_weight" ADD CONSTRAINT "project_focus_weight_focus_id_focus_definition_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."focus_definition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_link" ADD CONSTRAINT "project_link_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_skill_link" ADD CONSTRAINT "project_skill_link_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_skill_link" ADD CONSTRAINT "project_skill_link_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_focus_weight" ADD CONSTRAINT "skill_focus_weight_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_focus_weight" ADD CONSTRAINT "skill_focus_weight_focus_id_focus_definition_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."focus_definition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jd_requests_focus_ids_idx" ON "jd_requests" USING gin ("focus_ids");--> statement-breakpoint
CREATE INDEX "resume_variants_focus_ids_idx" ON "resume_variants" USING gin ("focus_ids");