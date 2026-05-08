CREATE TABLE "cockpit_device_pairings" (
	"pairing_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_code_hash" text NOT NULL,
	"user_code" text NOT NULL,
	"device_id" text NOT NULL,
	"device_name" text NOT NULL,
	"instance_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"token_label" text,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"exchanged_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cockpit_device_pairings_device_code_hash_idx" ON "cockpit_device_pairings" USING btree ("device_code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "cockpit_device_pairings_user_code_idx" ON "cockpit_device_pairings" USING btree ("user_code");--> statement-breakpoint
CREATE INDEX "cockpit_device_pairings_pending_idx" ON "cockpit_device_pairings" USING btree ("status","expires_at");