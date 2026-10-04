ALTER TABLE "orders" ADD COLUMN "tracking_token" varchar(64);--> statement-breakpoint
UPDATE "orders" SET "tracking_token" = replace(gen_random_uuid()::text, '-', '') WHERE "tracking_token" IS NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "tracking_token" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tracking_token_unique" UNIQUE("tracking_token");
