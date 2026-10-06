ALTER TABLE "order_status_history" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'WAITING_CONFIRMATION'::text;--> statement-breakpoint
UPDATE "order_status_history" SET "status" = 'CANCELLED' WHERE "status" = 'EXPIRED';--> statement-breakpoint
UPDATE "orders" SET "status" = 'CANCELLED' WHERE "status" = 'EXPIRED';--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('WAITING_CONFIRMATION', 'CONTACTED', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "order_status_history" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'WAITING_CONFIRMATION'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";
