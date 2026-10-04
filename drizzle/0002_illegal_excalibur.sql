ALTER TABLE "order_items" ADD COLUMN "cost_price" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cost_price" bigint DEFAULT 0 NOT NULL;