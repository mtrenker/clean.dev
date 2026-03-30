CREATE TYPE testimonial_status AS ENUM ('pending', 'submitted', 'approved', 'declined');
--> statement-breakpoint
CREATE TYPE testimonial_role AS ENUM ('client', 'manager', 'peer');
--> statement-breakpoint
CREATE TABLE "testimonial_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_role" testimonial_role NOT NULL,
	"engagement_context" text NOT NULL,
	"token" uuid NOT NULL DEFAULT gen_random_uuid(),
	"status" testimonial_status NOT NULL DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "testimonial_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "testimonial_invitations_token_idx" ON "testimonial_invitations" ("token");
--> statement-breakpoint
CREATE INDEX "testimonial_invitations_status_idx" ON "testimonial_invitations" ("status");
--> statement-breakpoint
CREATE TABLE "testimonial_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"answers" jsonb NOT NULL DEFAULT '{}'::jsonb,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "testimonial_responses_invitation_id_unique" UNIQUE("invitation_id")
);
--> statement-breakpoint
ALTER TABLE "testimonial_responses" ADD CONSTRAINT "testimonial_responses_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."testimonial_invitations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "testimonial_consent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"public_with_name" boolean NOT NULL DEFAULT false,
	"public_anonymous" boolean NOT NULL DEFAULT false,
	"private_only" boolean NOT NULL DEFAULT true,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "testimonial_consent_invitation_id_unique" UNIQUE("invitation_id")
);
--> statement-breakpoint
ALTER TABLE "testimonial_consent" ADD CONSTRAINT "testimonial_consent_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."testimonial_invitations"("id") ON DELETE cascade ON UPDATE no action;
