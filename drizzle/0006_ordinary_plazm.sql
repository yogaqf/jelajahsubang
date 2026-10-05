CREATE TABLE "portal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(30) NOT NULL,
	"platform" varchar(30),
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"summary" text,
	"content" text,
	"image_url" text,
	"external_url" text,
	"embed_url" text,
	"location" varchar(255),
	"price" bigint DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portal_entries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "portal_entries_type_published_idx" ON "portal_entries" USING btree ("type","is_published","sort_order");