CREATE TABLE "cockpit_device_sessions" (
	"session_id" text PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"token_id" uuid,
	"connection_id" text,
	"instance_name" text,
	"last_acked_sequence" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cockpit_device_tokens" (
	"token_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"token_label" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cockpit_manual_prune_runs" (
	"prune_run_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text,
	"requested_by" text,
	"reason" text,
	"pruned_through_sequence" integer,
	"pruned_before" timestamp with time zone,
	"deleted_event_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cockpit_paired_devices" (
	"device_id" text PRIMARY KEY NOT NULL,
	"device_name" text NOT NULL,
	"instance_name" text,
	"paired_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cockpit_projected_project_state" (
	"project_id" text PRIMARY KEY NOT NULL,
	"schema_version" integer NOT NULL,
	"latest_event_id" text,
	"latest_event_sequence" integer DEFAULT 0 NOT NULL,
	"dirty" boolean DEFAULT false NOT NULL,
	"projected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"state" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cockpit_projects" (
	"project_id" text PRIMARY KEY NOT NULL,
	"project_slug" text,
	"project_name" text,
	"local_root_path" text,
	"telemetry" jsonb,
	"latest_event_sequence" integer DEFAULT 0 NOT NULL,
	"latest_event_at" timestamp with time zone,
	"projection_dirty" boolean DEFAULT false NOT NULL,
	"dirty_marked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cockpit_raw_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"project_id" text NOT NULL,
	"device_id" text NOT NULL,
	"session_id" text,
	"schema_version" integer NOT NULL,
	"sequence" integer NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text NOT NULL,
	"run_id" text,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"event" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cockpit_device_sessions" ADD CONSTRAINT "cockpit_device_sessions_device_id_cockpit_paired_devices_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."cockpit_paired_devices"("device_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cockpit_device_sessions" ADD CONSTRAINT "cockpit_device_sessions_token_id_cockpit_device_tokens_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."cockpit_device_tokens"("token_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cockpit_device_tokens" ADD CONSTRAINT "cockpit_device_tokens_device_id_cockpit_paired_devices_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."cockpit_paired_devices"("device_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cockpit_manual_prune_runs" ADD CONSTRAINT "cockpit_manual_prune_runs_project_id_cockpit_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."cockpit_projects"("project_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cockpit_projected_project_state" ADD CONSTRAINT "cockpit_projected_project_state_project_id_cockpit_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."cockpit_projects"("project_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cockpit_raw_events" ADD CONSTRAINT "cockpit_raw_events_project_id_cockpit_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."cockpit_projects"("project_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cockpit_raw_events" ADD CONSTRAINT "cockpit_raw_events_device_id_cockpit_paired_devices_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."cockpit_paired_devices"("device_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cockpit_device_sessions_active_idx" ON "cockpit_device_sessions" USING btree ("device_id","ended_at","last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cockpit_device_tokens_token_hash_idx" ON "cockpit_device_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "cockpit_device_tokens_active_idx" ON "cockpit_device_tokens" USING btree ("device_id","revoked_at","expires_at");--> statement-breakpoint
CREATE INDEX "cockpit_manual_prune_runs_project_idx" ON "cockpit_manual_prune_runs" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "cockpit_paired_devices_active_idx" ON "cockpit_paired_devices" USING btree ("revoked_at","updated_at");--> statement-breakpoint
CREATE INDEX "cockpit_projected_project_state_dirty_idx" ON "cockpit_projected_project_state" USING btree ("dirty","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cockpit_projects_project_slug_idx" ON "cockpit_projects" USING btree ("project_slug");--> statement-breakpoint
CREATE INDEX "cockpit_projects_projection_dirty_idx" ON "cockpit_projects" USING btree ("projection_dirty","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cockpit_raw_events_device_sequence_idx" ON "cockpit_raw_events" USING btree ("project_id","device_id","sequence");--> statement-breakpoint
CREATE INDEX "cockpit_raw_events_project_sequence_idx" ON "cockpit_raw_events" USING btree ("project_id","sequence");--> statement-breakpoint
CREATE INDEX "cockpit_raw_events_occurred_at_idx" ON "cockpit_raw_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "cockpit_raw_events_batch_idx" ON "cockpit_raw_events" USING btree ("batch_id");