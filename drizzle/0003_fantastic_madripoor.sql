ALTER TABLE "drivers" ADD COLUMN "commission_percent" integer DEFAULT 80 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "driver_commission_percent" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "driver_commission_amount" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "merchant_payout_amount" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "platform_revenue_amount" bigint;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "completed_at" timestamp with time zone;