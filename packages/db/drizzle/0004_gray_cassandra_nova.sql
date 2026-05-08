-- Rollback notes:
-- 1. Drop indexes `cockpit_task_details_review_idx`, `cockpit_task_details_project_plan_idx`,
--    and `cockpit_task_details_project_task_idx` before dropping `cockpit_task_details`.
-- 2. Drop table `cockpit_task_details`.
-- 3. Remove `observation` and `worktree_root_path` from `cockpit_projects`.
-- 4. Remove `metadata` from `cockpit_paired_devices`.
CREATE TABLE "cockpit_task_details" (
	"task_detail_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"task_id" text NOT NULL,
	"source" text DEFAULT 'live' NOT NULL,
	"detail_path" text,
	"detail_content" text,
	"handoff_summary" text,
	"handoff_content_hash" text,
	"output_summary" text,
	"output_content_hash" text,
	"archive_review_status" text,
	"archive_review_notes" text,
	"archive_reviewed_at" timestamp with time zone,
	"archive_metadata" jsonb,
	"usage" jsonb,
	"cost_estimate" jsonb,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cockpit_paired_devices" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "cockpit_projects" ADD COLUMN "worktree_root_path" text;--> statement-breakpoint
ALTER TABLE "cockpit_projects" ADD COLUMN "observation" jsonb;--> statement-breakpoint
ALTER TABLE "cockpit_task_details" ADD CONSTRAINT "cockpit_task_details_project_id_cockpit_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."cockpit_projects"("project_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cockpit_task_details_project_task_idx" ON "cockpit_task_details" USING btree ("project_id","source","task_id");--> statement-breakpoint
CREATE INDEX "cockpit_task_details_project_plan_idx" ON "cockpit_task_details" USING btree ("project_id","plan_id","updated_at");--> statement-breakpoint
CREATE INDEX "cockpit_task_details_review_idx" ON "cockpit_task_details" USING btree ("archive_review_status","updated_at");
