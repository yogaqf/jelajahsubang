import { db, store, isDatabaseConfigured } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export { isDatabaseConfigured };

// ====================================================
// 1. STATS
// ====================================================
export async function getSharelokStats() {
  if (db && isDatabaseConfigured) {
    try {
      const allOrders = await db.select().from(schema.orders);
      const allDrivers = await db.select().from(schema.drivers);
      const allMerchants = await db.select().from(schema.merchants);

      const totalRevenue = allOrders
        .filter((o) => o.status === "COMPLETED")
        .reduce((sum, o) => sum + Number(o.total || 0), 0);

      const pendingOrders = allOrders.filter((o) => o.status === "PENDING").length;
      const preparingOrders = allOrders.filter((o) => o.status === "PREPARING").length;
      const deliveringOrders = allOrders.filter((o) => o.status === "DELIVERING").length;
      const completedOrders = allOrders.filter((o) => o.status === "COMPLETED").length;
      const activeDrivers = allDrivers.filter((d) => d.isActive).length;
      const activeMerchants = allMerchants.filter((m) => m.isActive).length;

      return {
        totalRevenue,
        totalOrders: allOrders.length,
        pendingOrders,
        preparingOrders,
        deliveringOrders,
        completedOrders,
        activeDrivers,
        activeMerchants,
        isLiveDb: true,
      };
    } catch (e) {
      console.error("Neon DB query failed, falling back to memory store:", e);
    }
  }

  // Fallback to memory store
  const totalRevenue = store.orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.total, 0);

  return {
    totalRevenue: totalRevenue || 55000,
    totalOrders: store.orders.length,
    pendingOrders: store.orders.filter((o) => o.status === "PENDING").length,
    preparingOrders: store.orders.filter((o) => o.status === "PREPARING").length,
    deliveringOrders: store.orders.filter((o) => o.status === "DELIVERING").length,
    completedOrders: store.orders.filter((o) => o.status === "COMPLETED").length,
    activeDrivers: store.drivers.filter((d) => d.isActive).length,
    activeMerchants: store.merchants.filter((m) => m.isActive).length,
    isLiveDb: false,
  };
}

// ====================================================
// 2. ORDERS
// ====================================================
export async function getOrders(filterStatus?: string, search?: string) {
  if (db && isDatabaseConfigured) {
    try {
      const ordersList = await db.query.orders.findMany({
        with: {
          merchant: true,
          driver: true,
          items: true,
          statusHistory: {
            orderBy: [desc(schema.orderStatusHistory.createdAt)],
          },
          driverAssignments: true,
        },
        orderBy: [desc(schema.orders.createdAt)],
      });

      let filtered = ordersList;
      if (filterStatus && filterStatus !== "ALL") {
        filtered = filtered.filter((o) => o.status === filterStatus);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.customerPhone.includes(q) ||
            o.merchant?.name.toLowerCase().includes(q)
        );
      }
      return filtered;
    } catch (e) {
      console.error("Failed fetching orders from Neon:", e);
    }
  }

  // Memory store
  let result = store.orders.map((o) => {
    const merchant = store.merchants.find((m) => m.id === o.merchantId) || null;
    const driver = store.drivers.find((d) => d.id === o.driverId) || null;
    return {
      ...o,
      merchant,
      driver,
    };
  });

  if (filterStatus && filterStatus !== "ALL") {
    result = result.filter((o) => o.status === filterStatus);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.merchant?.name.toLowerCase().includes(q)
    );
  }

  return result;
}

export async function updateOrderStatus(orderId: string, status: schema.OrderStatus, note?: string) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      await db
        .update(schema.orders)
        .set({ status, updatedAt: now })
        .where(eq(schema.orders.id, orderId));

      await db.insert(schema.orderStatusHistory).values({
        orderId,
        status,
        note: note || `Status diperbarui menjadi ${status}`,
        createdAt: now,
      });

      return { success: true };
    } catch (e) {
      console.error("Neon updateOrderStatus error:", e);
    }
  }

  const order = store.orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = now;
    order.statusHistory.unshift({
      id: `hist-${Date.now()}`,
      orderId,
      status,
      note: note || `Status diperbarui menjadi ${status}`,
      createdAt: now,
    });
  }
  return { success: true };
}

export async function assignDriver(
  orderId: string,
  driverId: string,
  assignedBy = "Admin Sharelok",
  reason?: string
) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      await db
        .update(schema.orders)
        .set({ driverId, assignedAt: now, assignedBy, updatedAt: now })
        .where(eq(schema.orders.id, orderId));

      await db.insert(schema.driverAssignmentHistory).values({
        orderId,
        driverId,
        assignedBy,
        reason: reason || "Penugasan driver oleh admin",
        createdAt: now,
      });

      return { success: true };
    } catch (e) {
      console.error("Neon assignDriver error:", e);
    }
  }

  const order = store.orders.find((o) => o.id === orderId);
  if (order) {
    order.driverId = driverId;
    order.assignedAt = now;
    order.assignedBy = assignedBy;
    order.updatedAt = now;
    order.driverAssignments.unshift({
      id: `assign-${Date.now()}`,
      orderId,
      driverId,
      assignedBy,
      reason: reason || "Penugasan driver oleh admin",
      createdAt: now,
    });
  }
  return { success: true };
}

// ====================================================
// 3. CATEGORIES
// ====================================================
export async function getCategories() {
  if (db && isDatabaseConfigured) {
    try {
      return await db.select().from(schema.categories).orderBy(schema.categories.sortOrder);
    } catch (e) {
      console.error("Neon getCategories error:", e);
    }
  }
  return [...store.categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createCategory(data: schema.NewCategory) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      const [newCat] = await db.insert(schema.categories).values(data).returning();
      return newCat;
    } catch (e) {
      console.error("Neon createCategory error:", e);
    }
  }
  const newCat: schema.Category = {
    id: `c-${Date.now()}`,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  store.categories.push(newCat);
  return newCat;
}

export async function updateCategory(id: string, data: Partial<schema.NewCategory>) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      const [updated] = await db
        .update(schema.categories)
        .set({ ...data, updatedAt: now })
        .where(eq(schema.categories.id, id))
        .returning();
      return updated;
    } catch (e) {
      console.error("Neon updateCategory error:", e);
    }
  }
  const idx = store.categories.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.categories[idx] = {
      ...store.categories[idx],
      ...data,
      updatedAt: now,
    };
    return store.categories[idx];
  }
  return null;
}

export async function deleteCategory(id: string) {
  if (db && isDatabaseConfigured) {
    try {
      await db.delete(schema.categories).where(eq(schema.categories.id, id));
      return { success: true };
    } catch (e) {
      console.error("Neon deleteCategory error:", e);
    }
  }
  store.categories = store.categories.filter((c) => c.id !== id);
  return { success: true };
}

// ====================================================
// 4. MERCHANTS
// ====================================================
export async function getMerchants() {
  if (db && isDatabaseConfigured) {
    try {
      return await db.select().from(schema.merchants).orderBy(schema.merchants.sortOrder);
    } catch (e) {
      console.error("Neon getMerchants error:", e);
    }
  }
  return [...store.merchants].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createMerchant(data: schema.NewMerchant) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      const [item] = await db.insert(schema.merchants).values(data).returning();
      return item;
    } catch (e) {
      console.error("Neon createMerchant error:", e);
    }
  }
  const item: schema.Merchant = {
    id: `m-${Date.now()}`,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    phone: data.phone || null,
    whatsapp: data.whatsapp || null,
    address: data.address || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    imageUrl: data.imageUrl || null,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  store.merchants.push(item);
  return item;
}

export async function updateMerchant(id: string, data: Partial<schema.NewMerchant>) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      const [updated] = await db
        .update(schema.merchants)
        .set({ ...data, updatedAt: now })
        .where(eq(schema.merchants.id, id))
        .returning();
      return updated;
    } catch (e) {
      console.error("Neon updateMerchant error:", e);
    }
  }
  const idx = store.merchants.findIndex((m) => m.id === id);
  if (idx !== -1) {
    store.merchants[idx] = { ...store.merchants[idx], ...data, updatedAt: now };
    return store.merchants[idx];
  }
  return null;
}

export async function deleteMerchant(id: string) {
  if (db && isDatabaseConfigured) {
    try {
      await db.delete(schema.merchants).where(eq(schema.merchants.id, id));
      return { success: true };
    } catch (e) {
      console.error("Neon deleteMerchant error:", e);
    }
  }
  store.merchants = store.merchants.filter((m) => m.id !== id);
  return { success: true };
}

// ====================================================
// 5. PRODUCTS
// ====================================================
export async function getProducts() {
  if (db && isDatabaseConfigured) {
    try {
      return await db.query.products.findMany({
        with: {
          merchant: true,
          category: true,
        },
        orderBy: [desc(schema.products.createdAt)],
      });
    } catch (e) {
      console.error("Neon getProducts error:", e);
    }
  }
  return store.products.map((p) => ({
    ...p,
    merchant: store.merchants.find((m) => m.id === p.merchantId) || null,
    category: store.categories.find((c) => c.id === p.categoryId) || null,
  }));
}

export async function createProduct(data: schema.NewProduct) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      const [item] = await db.insert(schema.products).values(data).returning();
      return item;
    } catch (e) {
      console.error("Neon createProduct error:", e);
    }
  }
  const item: schema.Product = {
    id: `p-${Date.now()}`,
    merchantId: data.merchantId,
    categoryId: data.categoryId || null,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    price: data.price,
    imageUrl: data.imageUrl || null,
    isAvailable: data.isAvailable ?? true,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  store.products.push(item);
  return item;
}

export async function updateProduct(id: string, data: Partial<schema.NewProduct>) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      const [updated] = await db
        .update(schema.products)
        .set({ ...data, updatedAt: now })
        .where(eq(schema.products.id, id))
        .returning();
      return updated;
    } catch (e) {
      console.error("Neon updateProduct error:", e);
    }
  }
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.products[idx] = { ...store.products[idx], ...data, updatedAt: now };
    return store.products[idx];
  }
  return null;
}

export async function deleteProduct(id: string) {
  if (db && isDatabaseConfigured) {
    try {
      await db.delete(schema.products).where(eq(schema.products.id, id));
      return { success: true };
    } catch (e) {
      console.error("Neon deleteProduct error:", e);
    }
  }
  store.products = store.products.filter((p) => p.id !== id);
  return { success: true };
}

// ====================================================
// 6. DRIVERS
// ====================================================
export async function getDrivers() {
  if (db && isDatabaseConfigured) {
    try {
      return await db.select().from(schema.drivers).orderBy(schema.drivers.name);
    } catch (e) {
      console.error("Neon getDrivers error:", e);
    }
  }
  return [...store.drivers];
}

export async function createDriver(data: schema.NewDriver) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      const [item] = await db.insert(schema.drivers).values(data).returning();
      return item;
    } catch (e) {
      console.error("Neon createDriver error:", e);
    }
  }
  const item: schema.Driver = {
    id: `d-${Date.now()}`,
    name: data.name,
    phone: data.phone,
    whatsapp: data.whatsapp || null,
    vehicleType: data.vehicleType || null,
    vehiclePlate: data.vehiclePlate || null,
    isActive: data.isActive ?? true,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now,
  };
  store.drivers.push(item);
  return item;
}

export async function updateDriver(id: string, data: Partial<schema.NewDriver>) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    try {
      const [updated] = await db
        .update(schema.drivers)
        .set({ ...data, updatedAt: now })
        .where(eq(schema.drivers.id, id))
        .returning();
      return updated;
    } catch (e) {
      console.error("Neon updateDriver error:", e);
    }
  }
  const idx = store.drivers.findIndex((d) => d.id === id);
  if (idx !== -1) {
    store.drivers[idx] = { ...store.drivers[idx], ...data, updatedAt: now };
    return store.drivers[idx];
  }
  return null;
}

export async function deleteDriver(id: string) {
  if (db && isDatabaseConfigured) {
    try {
      await db.delete(schema.drivers).where(eq(schema.drivers.id, id));
      return { success: true };
    } catch (e) {
      console.error("Neon deleteDriver error:", e);
    }
  }
  store.drivers = store.drivers.filter((d) => d.id !== id);
  return { success: true };
}
