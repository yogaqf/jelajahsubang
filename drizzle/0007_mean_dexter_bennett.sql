ALTER TABLE "products" ADD COLUMN "show_on_homepage" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "homepage_position" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "homepage_badge" varchar(50);--> statement-breakpoint
CREATE UNIQUE INDEX "products_homepage_position_unique" ON "products" USING btree ("homepage_position") WHERE "products"."show_on_homepage" = true;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_homepage_position_check" CHECK ("products"."homepage_position" is null or "products"."homepage_position" between 1 and 3);