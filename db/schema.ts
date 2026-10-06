import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  bigint,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ==========================================
// ENUM
// ==========================================
export const orderStatusEnum = pgEnum("order_status", [
  "WAITING_CONFIRMATION",
  "CONTACTED",
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
]);

export const orderSourceEnum = pgEnum("order_source", [
  "WEBSITE_WHATSAPP",
  "ADMIN_WHATSAPP",
]);

export const merchantOrderStatusEnum = pgEnum("merchant_order_status", [
  "NOT_CONTACTED",
  "CONTACTED",
  "ACCEPTED",
  "REJECTED",
  "PREPARING",
  "READY",
]);

export const driverAssignmentStatusEnum = pgEnum("driver_assignment_status", [
  "OFFERED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
]);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type MerchantOrderStatus = (typeof merchantOrderStatusEnum.enumValues)[number];
export type DriverAssignmentStatus = (typeof driverAssignmentStatusEnum.enumValues)[number];

// ==========================================
// 1. CATEGORIES
// ==========================================
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 2. SERVICE AREAS
// ==========================================
export const serviceAreas = pgTable("service_areas", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 3. MERCHANTS
// ==========================================
export const merchants = pgTable("merchants", {
  id: uuid("id").defaultRandom().primaryKey(),
  areaId: uuid("area_id").references(() => serviceAreas.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 4. PRODUCTS
// ==========================================
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  costPrice: bigint("cost_price", { mode: "number" }).default(0).notNull(),
  price: bigint("price", { mode: "number" }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true).notNull(),
  showOnHomepage: boolean("show_on_homepage").default(false).notNull(),
  homepagePosition: integer("homepage_position"),
  homepageBadge: varchar("homepage_badge", { length: 50 }),
  homepageBadgeColor: varchar("homepage_badge_color", { length: 20 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("products_merchant_slug_unique").on(table.merchantId, table.slug),
  index("products_merchant_available_idx").on(table.merchantId, table.isAvailable),
  index("products_category_idx").on(table.categoryId),
  uniqueIndex("products_homepage_position_unique").on(table.homepagePosition).where(sql`${table.showOnHomepage} = true`),
  check("products_homepage_position_check", sql`${table.homepagePosition} is null or ${table.homepagePosition} between 1 and 3`),
]);

// ==========================================
// 5. DRIVERS
// ==========================================
export const drivers = pgTable("drivers", {
  id: uuid("id").defaultRandom().primaryKey(),
  areaId: uuid("area_id").references(() => serviceAreas.id, { onDelete: "set null" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }),
  vehicleType: varchar("vehicle_type", { length: 50 }),
  vehiclePlate: varchar("vehicle_plate", { length: 50 }),
  commissionPercent: integer("commission_percent").default(80).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 6. ORDERS
// ==========================================
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  areaId: uuid("area_id").references(() => serviceAreas.id, { onDelete: "set null" }),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  trackingToken: varchar("tracking_token", { length: 64 }).notNull().unique(),
  merchantId: uuid("merchant_id")
    .notNull()
    .references(() => merchants.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  customerAddress: text("customer_address").notNull(),
  customerNote: text("customer_note"),
  source: orderSourceEnum("source").default("WEBSITE_WHATSAPP").notNull(),
  status: orderStatusEnum("status").default("WAITING_CONFIRMATION").notNull(),
  merchantStatus: merchantOrderStatusEnum("merchant_status").default("NOT_CONTACTED").notNull(),
  subtotal: bigint("subtotal", { mode: "number" }).notNull(),
  deliveryFee: bigint("delivery_fee", { mode: "number" }).default(0).notNull(),
  discount: bigint("discount", { mode: "number" }).default(0).notNull(),
  total: bigint("total", { mode: "number" }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }),
  promoCode: varchar("promo_code", { length: 50 }),
  adminNote: text("admin_note"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  assignedBy: varchar("assigned_by", { length: 100 }),
  customerContactedAt: timestamp("customer_contacted_at", { withTimezone: true }),
  merchantContactedAt: timestamp("merchant_contacted_at", { withTimezone: true }),
  merchantRespondedAt: timestamp("merchant_responded_at", { withTimezone: true }),
  driverCommissionPercent: integer("driver_commission_percent"),
  driverCommissionAmount: bigint("driver_commission_amount", { mode: "number" }),
  merchantPayoutAmount: bigint("merchant_payout_amount", { mode: "number" }),
  platformRevenueAmount: bigint("platform_revenue_amount", { mode: "number" }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("orders_status_created_idx").on(table.status, table.createdAt),
  index("orders_merchant_created_idx").on(table.merchantId, table.createdAt),
  index("orders_driver_status_idx").on(table.driverId, table.status),
  index("orders_customer_phone_created_idx").on(table.customerPhone, table.createdAt),
]);

// ==========================================
// 7. ORDER ITEMS
// ==========================================
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  costPrice: bigint("cost_price", { mode: "number" }).default(0).notNull(),
  price: bigint("price", { mode: "number" }).notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: bigint("subtotal", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("order_items_order_idx").on(table.orderId)]);

// ==========================================
// 8. ORDER STATUS HISTORY
// ==========================================
export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("order_status_history_order_created_idx").on(table.orderId, table.createdAt)]);

// ==========================================
// 9. DRIVER ASSIGNMENT HISTORY
// ==========================================
export const driverAssignmentHistory = pgTable("driver_assignment_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => drivers.id),
  status: driverAssignmentStatusEnum("status").default("OFFERED").notNull(),
  assignedBy: varchar("assigned_by", { length: 100 }),
  reason: text("reason"),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("driver_assignments_order_created_idx").on(table.orderId, table.createdAt)]);

// ==========================================
// 10. PROMO CODES
// ==========================================
export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 20 }).default("PERCENT").notNull(),
  discountValue: bigint("discount_value", { mode: "number" }).notNull(),
  maxDiscount: bigint("max_discount", { mode: "number" }).default(0).notNull(),
  minOrder: bigint("min_order", { mode: "number" }).default(0).notNull(),
  usageLimit: integer("usage_limit").default(0).notNull(),
  usedCount: integer("used_count").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ==========================================
// 11. PORTAL CMS CONTENT
// ==========================================
export const portalEntries = pgTable("portal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: varchar("type", { length: 30 }).notNull(),
  platform: varchar("platform", { length: 30 }),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary"),
  content: text("content"),
  imageUrl: text("image_url"),
  externalUrl: text("external_url"),
  ctaLabel: varchar("cta_label", { length: 80 }),
  embedUrl: text("embed_url"),
  location: varchar("location", { length: 255 }),
  price: bigint("price", { mode: "number" }).default(0).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("portal_entries_type_published_idx").on(table.type, table.isPublished, table.sortOrder),
]);

// ==========================================
// RELATIONS
// ==========================================
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const serviceAreasRelations = relations(serviceAreas, ({ many }) => ({
  merchants: many(merchants),
  drivers: many(drivers),
  orders: many(orders),
}));

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  area: one(serviceAreas, { fields: [merchants.areaId], references: [serviceAreas.id] }),
  products: many(products),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [products.merchantId],
    references: [merchants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  area: one(serviceAreas, { fields: [drivers.areaId], references: [serviceAreas.id] }),
  orders: many(orders),
  assignments: many(driverAssignmentHistory),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  area: one(serviceAreas, { fields: [orders.areaId], references: [serviceAreas.id] }),
  merchant: one(merchants, {
    fields: [orders.merchantId],
    references: [merchants.id],
  }),
  driver: one(drivers, {
    fields: [orders.driverId],
    references: [drivers.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  driverAssignments: many(driverAssignmentHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatusHistory.orderId],
    references: [orders.id],
  }),
}));

export const driverAssignmentHistoryRelations = relations(driverAssignmentHistory, ({ one }) => ({
  order: one(orders, {
    fields: [driverAssignmentHistory.orderId],
    references: [orders.id],
  }),
  driver: one(drivers, {
    fields: [driverAssignmentHistory.driverId],
    references: [drivers.id],
  }),
}));

// Infer Types
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type ServiceArea = typeof serviceAreas.$inferSelect;
export type NewServiceArea = typeof serviceAreas.$inferInsert;

export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type DriverAssignmentHistory = typeof driverAssignmentHistory.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
export type NewPromoCode = typeof promoCodes.$inferInsert;
export type PortalEntry = typeof portalEntries.$inferSelect;
export type NewPortalEntry = typeof portalEntries.$inferInsert;
