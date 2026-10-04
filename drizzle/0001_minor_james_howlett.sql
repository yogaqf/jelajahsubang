CREATE INDEX "driver_assignments_order_created_idx" ON "driver_assignment_history" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_status_history_order_created_idx" ON "order_status_history" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_merchant_created_idx" ON "orders" USING btree ("merchant_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_driver_status_idx" ON "orders" USING btree ("driver_id","status");--> statement-breakpoint
CREATE INDEX "orders_customer_phone_created_idx" ON "orders" USING btree ("customer_phone","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "products_merchant_slug_unique" ON "products" USING btree ("merchant_id","slug");--> statement-breakpoint
CREATE INDEX "products_merchant_available_idx" ON "products" USING btree ("merchant_id","is_available");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");