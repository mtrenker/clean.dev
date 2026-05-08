-- Rename freelancer columns to contractor in settings table
ALTER TABLE "settings" RENAME COLUMN "freelancer_name" TO "contractor_name";--> statement-breakpoint
ALTER TABLE "settings" RENAME COLUMN "freelancer_address" TO "contractor_address";--> statement-breakpoint

-- Add payment terms columns to clients table
ALTER TABLE "clients" ADD COLUMN "payment_due_days" integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "early_payment_discount_rate" numeric(5, 4);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "early_payment_due_days" integer;
