CREATE TABLE "promo_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discount_type" varchar(20) DEFAULT 'PERCENT' NOT NULL,
	"discount_value" bigint NOT NULL,
	"max_discount" bigint DEFAULT 0 NOT NULL,
	"min_order" bigint DEFAULT 0 NOT NULL,
	"usage_limit" integer DEFAULT 0 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "service_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_areas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "drivers" ADD COLUMN "area_id" uuid;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "area_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "area_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "promo_code" varchar(50);--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_area_id_service_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."service_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_area_id_service_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."service_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_area_id_service_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."service_areas"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "service_areas" ("name", "slug", "description", "is_active", "sort_order") VALUES
  ('Ciater', 'ciater', 'Cakupan layanan aktif wilayah Ciater', true, 1),
  ('Jalancagak', 'jalancagak', 'Segera hadir di wilayah Jalancagak', false, 2),
  ('Kasomalang', 'kasomalang', 'Segera hadir di wilayah Kasomalang', false, 3)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
UPDATE "merchants" SET "area_id" = (SELECT "id" FROM "service_areas" WHERE "slug" = 'ciater') WHERE "area_id" IS NULL;
--> statement-breakpoint
UPDATE "drivers" SET "area_id" = (SELECT "id" FROM "service_areas" WHERE "slug" = 'ciater') WHERE "area_id" IS NULL;
--> statement-breakpoint
UPDATE "orders" SET "area_id" = (SELECT "id" FROM "service_areas" WHERE "slug" = 'ciater') WHERE "area_id" IS NULL;
