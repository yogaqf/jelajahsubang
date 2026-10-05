import { db, store, isDatabaseConfigured } from "@/db";
import * as schema from "@/db/schema";
import { and, desc, eq, gte, inArray, lt, ne } from "drizzle-orm";

export { isDatabaseConfigured };

// ====================================================
// 1. STATS
// ====================================================
export async function getSharelokStats(from?: Date, to?: Date) {
  if (db && isDatabaseConfigured) {
    try {
      const dateFilter = from && to
        ? and(gte(schema.orders.createdAt, from), lt(schema.orders.createdAt, to))
        : from
          ? gte(schema.orders.createdAt, from)
          : to
            ? lt(schema.orders.createdAt, to)
            : undefined;
      const allOrders = await db.select().from(schema.orders).where(dateFilter);
      const allDrivers = await db.select().from(schema.drivers);
      const allMerchants = await db.select().from(schema.merchants);
      const allAreas = await db.select().from(schema.serviceAreas);

      const totalRevenue = allOrders
        .filter((o) => o.status === "COMPLETED")
        .reduce((sum, o) => sum + Number(o.total || 0), 0);

      const pendingOrders = allOrders.filter((o) =>
        ["WAITING_CONFIRMATION", "CONTACTED", "PENDING"].includes(o.status)
      ).length;
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
        activeAreas: allAreas.filter((area) => area.isActive).length,
        isLiveDb: true,
      };
    } catch (e) {
      console.error("Neon DB query failed, falling back to memory store:", e);
    }
  }

  // Fallback to memory store
  const periodOrders = store.orders.filter((order) =>
    (!from || order.createdAt >= from) && (!to || order.createdAt < to)
  );
  const totalRevenue = periodOrders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.total, 0);

  return {
    totalRevenue,
    totalOrders: periodOrders.length,
    pendingOrders: periodOrders.filter((o) =>
      ["WAITING_CONFIRMATION", "CONTACTED", "PENDING"].includes(o.status)
    ).length,
    preparingOrders: periodOrders.filter((o) => o.status === "PREPARING").length,
    deliveringOrders: periodOrders.filter((o) => o.status === "DELIVERING").length,
    completedOrders: periodOrders.filter((o) => o.status === "COMPLETED").length,
    activeDrivers: store.drivers.filter((d) => d.isActive).length,
    activeMerchants: store.merchants.filter((m) => m.isActive).length,
    activeAreas: store.serviceAreas.filter((area) => area.isActive).length,
    isLiveDb: false,
  };
}

// ====================================================
// 2. ORDERS
// ====================================================
export async function getOrders(filterStatus?: string, search?: string, from?: Date, to?: Date) {
  if (db && isDatabaseConfigured) {
    try {
      const statusFilter = filterStatus && filterStatus !== "ALL"
        ? eq(schema.orders.status, filterStatus as schema.OrderStatus)
        : undefined;
      const dateFilter = from && to
        ? and(gte(schema.orders.createdAt, from), lt(schema.orders.createdAt, to))
        : from
          ? gte(schema.orders.createdAt, from)
          : to
            ? lt(schema.orders.createdAt, to)
            : undefined;
      const ordersList = await db.query.orders.findMany({
        where: statusFilter && dateFilter ? and(statusFilter, dateFilter) : statusFilter || dateFilter,
        with: {
          area: true,
          merchant: true,
          driver: true,
        },
        orderBy: [desc(schema.orders.createdAt)],
        limit: 100,
      });

      let filtered = ordersList;
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
    const area = store.serviceAreas.find((item) => item.id === o.areaId) || null;
    return {
      ...o,
      items: undefined,
      statusHistory: undefined,
      merchant,
      driver,
      area,
      driverAssignments: undefined,
    };
  });

  if (filterStatus && filterStatus !== "ALL") {
    result = result.filter((o) => o.status === filterStatus);
  }
  if (from) result = result.filter((order) => order.createdAt >= from);
  if (to) result = result.filter((order) => order.createdAt < to);
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

export async function getOrderById(orderId: string) {
  if (db && isDatabaseConfigured) {
    return db.query.orders.findFirst({
      where: eq(schema.orders.id, orderId),
      with: {
        area: true,
        merchant: { with: { area: true } },
        driver: { with: { area: true } },
        items: true,
        statusHistory: { orderBy: [desc(schema.orderStatusHistory.createdAt)] },
        driverAssignments: {
          with: { driver: true },
          orderBy: [desc(schema.driverAssignmentHistory.createdAt)],
        },
      },
    });
  }
  const order = store.orders.find((item) => item.id === orderId);
  if (!order) return null;
  return {
    ...order,
    area: store.serviceAreas.find((item) => item.id === order.areaId) || null,
    merchant: store.merchants.find((item) => item.id === order.merchantId) || null,
    driver: store.drivers.find((item) => item.id === order.driverId) || null,
    driverAssignments: order.driverAssignments.map((assignment) => ({
      ...assignment,
      driver: store.drivers.find((item) => item.id === assignment.driverId) || null,
    })),
  };
}

const publicStatusCopy: Record<string, { label: string; description: string }> = {
  WAITING_CONFIRMATION: { label: "Pesanan diterima", description: "Admin sedang mengecek ketersediaan menu dan ongkir." },
  CONTACTED: { label: "Menunggu persetujuan", description: "Rincian menu dan ongkir sudah dikirim untuk dikonfirmasi." },
  PENDING: { label: "Menunggu konfirmasi", description: "Pesanan sedang menunggu konfirmasi lanjutan." },
  CONFIRMED: { label: "Pesanan dikonfirmasi", description: "Pesanan dan total pembayaran sudah disetujui." },
  PREPARING: { label: "Sedang disiapkan", description: "Mitra sedang menyiapkan pesananmu." },
  READY: { label: "Siap dijemput", description: "Pesanan sudah siap untuk diambil driver." },
  DELIVERING: { label: "Sedang diantar", description: "Driver sedang mengantar pesanan ke alamatmu." },
  COMPLETED: { label: "Pesanan selesai", description: "Pesanan telah diterima. Terima kasih sudah order di Sharelok." },
  CANCELLED: { label: "Pesanan dibatalkan", description: "Pesanan tidak dapat dilanjutkan. Hubungi admin jika membutuhkan bantuan." },
  EXPIRED: { label: "Pesanan kedaluwarsa", description: "Waktu konfirmasi pesanan telah berakhir." },
};

export async function getPublicOrderByTrackingToken(trackingToken: string) {
  const databaseOrder = db && isDatabaseConfigured
    ? await db.query.orders.findFirst({
        where: eq(schema.orders.trackingToken, trackingToken),
        with: {
          area: true,
          merchant: true,
          driver: true,
          items: true,
          statusHistory: { orderBy: [desc(schema.orderStatusHistory.createdAt)] },
        },
      })
    : null;
  const memoryOrder = !isDatabaseConfigured
    ? store.orders.find((item) => item.trackingToken === trackingToken)
    : null;
  const order = databaseOrder || (memoryOrder ? {
    ...memoryOrder,
    area: store.serviceAreas.find((item) => item.id === memoryOrder.areaId) || null,
    merchant: store.merchants.find((item) => item.id === memoryOrder.merchantId) || null,
    driver: store.drivers.find((item) => item.id === memoryOrder.driverId) || null,
  } : null);

  if (!order) return null;

  const chronologicalHistory = [...order.statusHistory]
    .reverse()
    .filter((entry, index, entries) => index === 0 || entries[index - 1].status !== entry.status)
    .map((entry) => ({
      id: entry.id,
      status: entry.status,
      label: publicStatusCopy[entry.status]?.label || "Status diperbarui",
      description: publicStatusCopy[entry.status]?.description || "Ada perkembangan baru pada pesananmu.",
      createdAt: entry.createdAt,
    }));

  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName.split(/\s+/)[0],
    status: order.status,
    statusLabel: publicStatusCopy[order.status]?.label || order.status,
    statusDescription: publicStatusCopy[order.status]?.description || "Status pesanan diperbarui.",
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    promoCode: order.promoCode,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    area: order.area ? { name: order.area.name } : null,
    merchant: order.merchant ? { name: order.merchant.name } : null,
    driver: order.driver ? {
      name: order.driver.name,
      vehicleType: order.driver.vehicleType,
      vehiclePlate: order.driver.vehiclePlate,
    } : null,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      price: Number(item.price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
    statusHistory: chronologicalHistory,
  };
}

export async function deleteOrder(orderId: string, confirmation: string) {
  if (db && isDatabaseConfigured) {
    const [order] = await db
      .select({ id: schema.orders.id, orderNumber: schema.orders.orderNumber })
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);
    if (!order) throw new Error("Pesanan tidak ditemukan.");
    if (confirmation.trim() !== order.orderNumber) {
      throw new Error("Nomor pesanan untuk verifikasi tidak cocok.");
    }
    await db.delete(schema.orders).where(eq(schema.orders.id, orderId));
    return { success: true, orderNumber: order.orderNumber };
  }

  const order = store.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (confirmation.trim() !== order.orderNumber) {
    throw new Error("Nomor pesanan untuk verifikasi tidak cocok.");
  }
  store.orders = store.orders.filter((item) => item.id !== orderId);
  return { success: true, orderNumber: order.orderNumber };
}

export async function updateOrderArea(orderId: string, areaId: string) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    const [updated] = await db.update(schema.orders).set({ areaId, updatedAt: now }).where(eq(schema.orders.id, orderId)).returning({ id: schema.orders.id });
    if (!updated) throw new Error("Pesanan tidak ditemukan.");
    return updated;
  }
  const order = store.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  order.areaId = areaId;
  order.updatedAt = now;
  return { id: order.id };
}

export interface WebsiteOrderInput {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNote?: string;
  areaId?: string;
  promoCode?: string;
  items: { productId: string; quantity: number }[];
}

export async function validatePromoCode(rawCode: string, rawSubtotal: number) {
  const code = rawCode.trim().toUpperCase();
  const subtotal = Math.max(0, Math.floor(Number(rawSubtotal) || 0));
  if (!code) throw new Error("Masukkan kode promo terlebih dahulu.");

  const promo = db && isDatabaseConfigured
    ? await db.query.promoCodes.findFirst({ where: eq(schema.promoCodes.code, code) })
    : store.promoCodes.find((item) => item.code.toUpperCase() === code);

  if (!promo || !promo.isActive) throw new Error("Kode promo tidak ditemukan atau sedang tidak aktif.");
  if (new Date(promo.expiresAt).getTime() <= Date.now()) throw new Error("Kode promo sudah kedaluwarsa.");
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) throw new Error("Kuota kode promo sudah habis.");
  if (subtotal < Number(promo.minOrder)) {
    throw new Error(`Minimal belanja untuk promo ini Rp ${Number(promo.minOrder).toLocaleString("id-ID")}.`);
  }

  let discount = promo.discountType === "FIXED"
    ? Number(promo.discountValue)
    : Math.floor(subtotal * Number(promo.discountValue) / 100);
  if (promo.discountType === "PERCENT" && Number(promo.maxDiscount) > 0) {
    discount = Math.min(discount, Number(promo.maxDiscount));
  }
  discount = Math.max(0, Math.min(subtotal, discount));

  return {
    id: promo.id,
    code: promo.code,
    description: promo.description,
    discount,
    usedCount: promo.usedCount,
  };
}

function createOrderNumber() {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("-", "");
  const suffix = Date.now().toString().slice(-6);
  return `SLK-${date}-${suffix}`;
}

export async function createWebsiteOrder(input: WebsiteOrderInput) {
  const normalizedItems = input.items
    .map((item) => ({ productId: item.productId, quantity: Math.floor(Number(item.quantity)) }))
    .filter((item) => item.productId && item.quantity > 0 && item.quantity <= 99);

  if (!input.customerName.trim() || !input.customerPhone.trim() || !input.customerAddress.trim()) {
    throw new Error("Nama, nomor WhatsApp, dan alamat wajib diisi.");
  }
  if (normalizedItems.length === 0) {
    throw new Error("Keranjang masih kosong.");
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
  if (db && isDatabaseConfigured) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (productIds.some((id) => !uuidPattern.test(id))) {
      throw new Error("Keranjang berisi menu versi lama. Muat ulang halaman lalu pilih kembali menu yang tersedia.");
    }
  }
  const availableProducts = db && isDatabaseConfigured
    ? await db.query.products.findMany({
        where: and(inArray(schema.products.id, productIds), eq(schema.products.isAvailable, true)),
        with: { merchant: { with: { area: true } } },
      })
    : store.products
        .filter((product) => productIds.includes(product.id) && product.isAvailable)
        .map((product) => ({
          ...product,
          merchant: store.merchants.find((merchant) => merchant.id === product.merchantId) || null,
        }));

  if (availableProducts.length !== productIds.length) {
    throw new Error("Ada menu yang sudah tidak tersedia. Silakan perbarui keranjang.");
  }
  if (availableProducts.some((product) => !product.merchant?.isActive)) {
    throw new Error("Toko sedang tutup dan belum menerima pesanan.");
  }

  const merchantIds = new Set(availableProducts.map((product) => product.merchantId));
  if (merchantIds.size !== 1) {
    throw new Error("Satu pesanan hanya boleh berisi menu dari satu mitra.");
  }

  const quantityByProduct = new Map(normalizedItems.map((item) => [item.productId, item.quantity]));
  const pricedItems = availableProducts.map((product) => {
    const quantity = quantityByProduct.get(product.id) || 0;
    return {
      productId: product.id,
      productName: product.name,
      costPrice: Number(product.costPrice),
      price: Number(product.price),
      quantity,
      subtotal: Number(product.price) * quantity,
    };
  });
  const subtotal = pricedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const merchantAreaId = availableProducts[0].merchant?.areaId || null;
  if (input.areaId && merchantAreaId !== input.areaId) {
    throw new Error("Toko tidak melayani area pengantaran yang dipilih.");
  }
  const promo = input.promoCode ? await validatePromoCode(input.promoCode, subtotal) : null;
  const discount = promo?.discount || 0;
  const now = new Date();
  const orderId = crypto.randomUUID();
  const orderNumber = createOrderNumber();
  const trackingToken = crypto.randomUUID().replaceAll("-", "");
  const merchantId = availableProducts[0].merchantId;

  const orderData = {
    id: orderId,
    orderNumber,
    trackingToken,
    merchantId,
    areaId: merchantAreaId,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    customerAddress: input.customerAddress.trim(),
    customerNote: input.customerNote?.trim() || null,
    source: "WEBSITE_WHATSAPP",
    status: "WAITING_CONFIRMATION",
    merchantStatus: "NOT_CONTACTED",
    subtotal,
    deliveryFee: 0,
    discount,
    total: Math.max(0, subtotal - discount),
    paymentMethod: "Belum disepakati",
    paymentStatus: "PENDING",
    promoCode: promo?.code || null,
    createdAt: now,
    updatedAt: now,
  } satisfies schema.NewOrder;

  if (db && isDatabaseConfigured) {
    await db.insert(schema.orders).values(orderData);
    try {
      await db.insert(schema.orderItems).values(
        pricedItems.map((item) => ({ ...item, id: crypto.randomUUID(), orderId, createdAt: now }))
      );
      await db.insert(schema.orderStatusHistory).values({
        id: crypto.randomUUID(),
        orderId,
        status: "WAITING_CONFIRMATION",
        note: "Customer melanjutkan konfirmasi pesanan melalui WhatsApp",
        createdAt: now,
      });
      if (promo) {
        await db
          .update(schema.promoCodes)
          .set({ usedCount: promo.usedCount + 1, updatedAt: now })
          .where(eq(schema.promoCodes.id, promo.id));
      }
    } catch (error) {
      await db.delete(schema.orders).where(eq(schema.orders.id, orderId));
      throw error;
    }
  } else {
    const order: InMemoryOrder = {
      ...orderData,
      id: orderId,
      driverId: null,
      adminNote: null,
      assignedAt: null,
      assignedBy: null,
      customerContactedAt: null,
      merchantContactedAt: null,
      merchantRespondedAt: null,
      areaId: merchantAreaId,
      promoCode: promo?.code || null,
      driverCommissionPercent: null,
      driverCommissionAmount: null,
      merchantPayoutAmount: null,
      platformRevenueAmount: null,
      completedAt: null,
      items: pricedItems.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        orderId,
        createdAt: now,
      })),
      statusHistory: [{
        id: crypto.randomUUID(),
        orderId,
        status: "WAITING_CONFIRMATION",
        note: "Customer melanjutkan konfirmasi pesanan melalui WhatsApp",
        createdAt: now,
      }],
      driverAssignments: [],
    };
    store.orders.unshift(order);
    if (promo) {
      const memoryPromo = store.promoCodes.find((item) => item.id === promo.id);
      if (memoryPromo) {
        memoryPromo.usedCount += 1;
        memoryPromo.updatedAt = now;
      }
    }
  }

  return {
    id: orderId,
    orderNumber,
    trackingToken,
    subtotal,
    total: Math.max(0, subtotal - discount),
    discount,
    promoCode: promo?.code || null,
    merchant: availableProducts[0].merchant,
    items: pricedItems,
  };
}

type InMemoryOrder = (typeof store.orders)[number];

export async function updateOrderStatus(orderId: string, status: schema.OrderStatus, note?: string) {
  const now = new Date();
  const contactPatch = status === "CONTACTED" ? { customerContactedAt: now } : {};
  if (db && isDatabaseConfigured) {
    try {
      let settlementPatch: Partial<schema.NewOrder> = {};
      if (status === "COMPLETED") {
        const order = await db.query.orders.findFirst({
          where: eq(schema.orders.id, orderId),
          with: { items: true, driver: true },
        });
        if (!order) throw new Error("Pesanan tidak ditemukan.");
        const merchantPayoutAmount = order.items.reduce(
          (sum, item) => sum + Number(item.costPrice) * item.quantity,
          0
        );
        const driverCommissionPercent = order.driver?.commissionPercent ?? 0;
        const driverCommissionAmount = Math.floor(
          Number(order.deliveryFee) * driverCommissionPercent / 100
        );
        const platformRevenueAmount = Math.max(
          0,
          Number(order.subtotal) - merchantPayoutAmount + Number(order.deliveryFee) -
            driverCommissionAmount - Number(order.discount)
        );
        settlementPatch = {
          driverCommissionPercent,
          driverCommissionAmount,
          merchantPayoutAmount,
          platformRevenueAmount,
          completedAt: now,
        };
      }
      await db
        .update(schema.orders)
        .set({ status, updatedAt: now, ...contactPatch, ...settlementPatch })
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
    if (status === "CONTACTED") order.customerContactedAt = now;
    if (status === "COMPLETED") {
      const driver = store.drivers.find((item) => item.id === order.driverId);
      order.merchantPayoutAmount = order.items.reduce(
        (sum, item) => sum + item.costPrice * item.quantity,
        0
      );
      order.driverCommissionPercent = driver?.commissionPercent ?? 0;
      order.driverCommissionAmount = Math.floor(
        order.deliveryFee * order.driverCommissionPercent / 100
      );
      order.platformRevenueAmount = Math.max(
        0,
        order.subtotal - order.merchantPayoutAmount + order.deliveryFee -
          order.driverCommissionAmount - order.discount
      );
      order.completedAt = now;
    }
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

export async function addOrderHistoryNote(orderId: string, note: string) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    const [order] = await db
      .select({ status: schema.orders.status })
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);
    if (!order) return null;
    const [history] = await db
      .insert(schema.orderStatusHistory)
      .values({ orderId, status: order.status, note, createdAt: now })
      .returning();
    return history;
  }

  const order = store.orders.find((item) => item.id === orderId);
  if (!order) return null;
  const history: schema.OrderStatusHistory = {
    id: crypto.randomUUID(),
    orderId,
    status: order.status,
    note,
    createdAt: now,
  };
  order.statusHistory.unshift(history);
  return history;
}

export interface OrderPaymentUpdate {
  deliveryFee?: number;
  discount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface OrderItemsUpdate {
  productId: string;
  quantity: number;
}

export async function updateOrderItems(orderId: string, rawItems: OrderItemsUpdate[]) {
  const normalizedItems = rawItems
    .map((item) => ({ productId: String(item.productId || ""), quantity: Math.floor(Number(item.quantity)) }))
    .filter((item) => item.productId && item.quantity > 0 && item.quantity <= 99);
  if (!normalizedItems.length) throw new Error("Pesanan harus memiliki minimal satu menu.");

  const now = new Date();
  const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const order = db && isDatabaseConfigured
    ? await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) })
    : store.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.paymentStatus === "PAID") throw new Error("Menu tidak dapat diubah setelah pembayaran diverifikasi.");
  if (["PREPARING", "READY", "DELIVERING", "COMPLETED", "CANCELLED", "EXPIRED"].includes(order.status)) {
    throw new Error("Menu tidak dapat diubah pada tahap pesanan ini.");
  }

  const products = db && isDatabaseConfigured
    ? await db.query.products.findMany({ where: inArray(schema.products.id, productIds) })
    : store.products.filter((product) => productIds.includes(product.id));
  if (products.length !== productIds.length) throw new Error("Ada menu pengganti yang tidak ditemukan.");
  if (products.some((product) => product.merchantId !== order.merchantId)) {
    throw new Error("Menu pengganti harus berasal dari mitra yang sama.");
  }

  const quantityByProduct = new Map(normalizedItems.map((item) => [item.productId, item.quantity]));
  const pricedItems = products.map((product) => {
    const quantity = quantityByProduct.get(product.id) || 0;
    return {
      productId: product.id,
      productName: product.name,
      costPrice: Number(product.costPrice),
      price: Number(product.price),
      quantity,
      subtotal: Number(product.price) * quantity,
    };
  });
  const subtotal = pricedItems.reduce((sum, item) => sum + item.subtotal, 0);
  let discount = 0;
  let promoCode = order.promoCode;
  if (promoCode) {
    const promo = db && isDatabaseConfigured
      ? await db.query.promoCodes.findFirst({ where: eq(schema.promoCodes.code, promoCode) })
      : store.promoCodes.find((item) => item.code === promoCode);
    if (promo && promo.isActive && new Date(promo.expiresAt).getTime() > Date.now() && subtotal >= Number(promo.minOrder)) {
      discount = promo.discountType === "FIXED"
        ? Number(promo.discountValue)
        : Math.floor(subtotal * Number(promo.discountValue) / 100);
      if (promo.discountType === "PERCENT" && Number(promo.maxDiscount) > 0) {
        discount = Math.min(discount, Number(promo.maxDiscount));
      }
      discount = Math.max(0, Math.min(subtotal, discount));
    } else {
      promoCode = null;
    }
  }
  const total = Math.max(0, subtotal + Number(order.deliveryFee) - discount);

  if (db && isDatabaseConfigured) {
    await db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
    await db.insert(schema.orderItems).values(pricedItems.map((item) => ({ ...item, orderId, createdAt: now })));
    await db.update(schema.orders).set({
      subtotal,
      discount,
      total,
      promoCode,
      status: "WAITING_CONFIRMATION",
      paymentStatus: "PENDING",
      updatedAt: now,
    }).where(eq(schema.orders.id, orderId));
    await db.insert(schema.orderStatusHistory).values({
      orderId,
      status: "WAITING_CONFIRMATION",
      note: "Rincian menu diubah admin. Total pesanan dihitung ulang dan menunggu konfirmasi customer.",
      createdAt: now,
    });
  } else {
    const memoryOrder = store.orders.find((item) => item.id === orderId)!;
    memoryOrder.items = pricedItems.map((item) => ({ ...item, id: crypto.randomUUID(), orderId, createdAt: now }));
    memoryOrder.subtotal = subtotal;
    memoryOrder.discount = discount;
    memoryOrder.total = total;
    memoryOrder.promoCode = promoCode;
    memoryOrder.status = "WAITING_CONFIRMATION";
    memoryOrder.paymentStatus = "PENDING";
    memoryOrder.updatedAt = now;
    memoryOrder.statusHistory.unshift({
      id: crypto.randomUUID(), orderId, status: "WAITING_CONFIRMATION",
      note: "Rincian menu diubah admin. Total pesanan dihitung ulang dan menunggu konfirmasi customer.", createdAt: now,
    });
  }
  return { subtotal, discount, total, promoCode };
}

export async function updateOrderPaymentDetails(orderId: string, data: OrderPaymentUpdate) {
  const now = new Date();
  const deliveryFee = Math.max(0, Math.floor(Number(data.deliveryFee ?? 0)));
  const discount = Math.max(0, Math.floor(Number(data.discount ?? 0)));

  if (db && isDatabaseConfigured) {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    if (!order) return null;
    const nextDeliveryFee = data.deliveryFee === undefined ? Number(order.deliveryFee) : deliveryFee;
    const nextDiscount = data.discount === undefined ? Number(order.discount) : discount;
    const total = Math.max(0, Number(order.subtotal) + nextDeliveryFee - nextDiscount);
    const [updated] = await db
      .update(schema.orders)
      .set({
        deliveryFee: nextDeliveryFee,
        discount: nextDiscount,
        total,
        ...(data.paymentMethod !== undefined ? { paymentMethod: data.paymentMethod } : {}),
        ...(data.paymentStatus !== undefined ? { paymentStatus: data.paymentStatus } : {}),
        updatedAt: now,
      })
      .where(eq(schema.orders.id, orderId))
      .returning();
    await db.insert(schema.orderStatusHistory).values({
      orderId,
      status: order.status,
      note: data.paymentStatus === "PAID"
        ? `Pembayaran ${data.paymentMethod || order.paymentMethod || "QRIS"} diverifikasi lunas`
        : `Rincian pembayaran diperbarui. Total ${total}`,
      createdAt: now,
    });
    return updated;
  }

  const order = store.orders.find((item) => item.id === orderId);
  if (!order) return null;
  if (data.deliveryFee !== undefined) order.deliveryFee = deliveryFee;
  if (data.discount !== undefined) order.discount = discount;
  if (data.paymentMethod !== undefined) order.paymentMethod = data.paymentMethod;
  if (data.paymentStatus !== undefined) order.paymentStatus = data.paymentStatus;
  order.total = Math.max(0, order.subtotal + order.deliveryFee - order.discount);
  order.updatedAt = now;
  order.statusHistory.unshift({
    id: crypto.randomUUID(),
    orderId,
    status: order.status,
    note: data.paymentStatus === "PAID"
      ? `Pembayaran ${data.paymentMethod || order.paymentMethod || "QRIS"} diverifikasi lunas`
      : `Rincian pembayaran diperbarui. Total ${order.total}`,
    createdAt: now,
  });
  return order;
}

export async function updateMerchantOrderStatus(
  orderId: string,
  merchantStatus: schema.MerchantOrderStatus
) {
  const now = new Date();
  const timestamps = merchantStatus === "CONTACTED"
    ? { merchantContactedAt: now }
    : merchantStatus === "ACCEPTED" || merchantStatus === "REJECTED"
      ? { merchantRespondedAt: now }
      : {};
  const mappedOrderStatus: schema.OrderStatus | undefined =
    merchantStatus === "PREPARING"
        ? "PREPARING"
        : merchantStatus === "READY"
          ? "READY"
          : undefined;

  if (db && isDatabaseConfigured) {
    const [updated] = await db
      .update(schema.orders)
      .set({ merchantStatus, ...(mappedOrderStatus ? { status: mappedOrderStatus } : {}), ...timestamps, updatedAt: now })
      .where(eq(schema.orders.id, orderId))
      .returning();
    await db.insert(schema.orderStatusHistory).values({
      orderId,
      status: mappedOrderStatus || updated.status,
      note: `Update mitra: ${merchantStatus.replaceAll("_", " ")}`,
      createdAt: now,
    });
    return updated;
  }

  const order = store.orders.find((item) => item.id === orderId);
  if (!order) return null;
  order.merchantStatus = merchantStatus;
  if (mappedOrderStatus) order.status = mappedOrderStatus;
  order.updatedAt = now;
  if (merchantStatus === "CONTACTED") order.merchantContactedAt = now;
  if (merchantStatus === "ACCEPTED" || merchantStatus === "REJECTED") {
    order.merchantRespondedAt = now;
  }
  order.statusHistory.unshift({
    id: crypto.randomUUID(),
    orderId,
    status: mappedOrderStatus || order.status,
    note: `Update mitra: ${merchantStatus.replaceAll("_", " ")}`,
    createdAt: now,
  });
  return order;
}

export async function offerDriver(
  orderId: string,
  driverId: string,
  assignedBy = "Admin Sharelok",
  reason?: string
) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    const [order] = await db.select({ areaId: schema.orders.areaId, status: schema.orders.status }).from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
    const [driver] = await db
      .select({ id: schema.drivers.id, areaId: schema.drivers.areaId })
      .from(schema.drivers)
      .where(and(eq(schema.drivers.id, driverId), eq(schema.drivers.isActive, true)))
      .limit(1);
    if (!driver) throw new Error("Driver tidak aktif atau tidak ditemukan.");
    if (!order || order.areaId !== driver.areaId) throw new Error("Driver hanya dapat menerima pesanan dari area operasional yang sama.");
    const [existing] = await db
      .select()
      .from(schema.driverAssignmentHistory)
      .where(and(
        eq(schema.driverAssignmentHistory.orderId, orderId),
        eq(schema.driverAssignmentHistory.driverId, driverId),
        eq(schema.driverAssignmentHistory.status, "OFFERED")
      ))
      .limit(1);
    if (existing) return existing;
    const [assignment] = await db
      .insert(schema.driverAssignmentHistory)
      .values({
        orderId,
        driverId,
        status: "OFFERED",
        assignedBy,
        reason: reason || "Penawaran pengantaran via WhatsApp",
        createdAt: now,
      })
      .returning();
    await db.insert(schema.orderStatusHistory).values({
      orderId,
      status: order.status,
      note: "Order ditawarkan kepada driver",
      createdAt: now,
    });
    return assignment;
  }

  const order = store.orders.find((item) => item.id === orderId);
  if (!order) return null;
  const driver = store.drivers.find((item) => item.id === driverId && item.isActive);
  if (!driver) throw new Error("Driver tidak aktif atau tidak ditemukan.");
  if (driver.areaId !== order.areaId) throw new Error("Driver hanya dapat menerima pesanan dari area operasional yang sama.");
  const existing = order.driverAssignments.find(
    (item) => item.driverId === driverId && item.status === "OFFERED"
  );
  if (existing) return existing;
  const assignment: schema.DriverAssignmentHistory = {
    id: crypto.randomUUID(),
    orderId,
    driverId,
    status: "OFFERED",
    assignedBy,
    reason: reason || "Penawaran pengantaran via WhatsApp",
    respondedAt: null,
    createdAt: now,
  };
  order.driverAssignments.unshift(assignment);
  order.statusHistory.unshift({
    id: crypto.randomUUID(),
    orderId,
    status: order.status,
    note: "Order ditawarkan kepada driver",
    createdAt: now,
  });
  return assignment;
}

export async function respondToDriverOffer(
  assignmentId: string,
  status: "ACCEPTED" | "REJECTED"
) {
  const now = new Date();
  if (db && isDatabaseConfigured) {
    const [assignment] = await db
      .update(schema.driverAssignmentHistory)
      .set({ status, respondedAt: now })
      .where(eq(schema.driverAssignmentHistory.id, assignmentId))
      .returning();
    if (!assignment) return null;
    if (status === "ACCEPTED") {
      await db
        .update(schema.driverAssignmentHistory)
        .set({ status: "CANCELLED", respondedAt: now })
        .where(and(
          eq(schema.driverAssignmentHistory.orderId, assignment.orderId),
          eq(schema.driverAssignmentHistory.status, "OFFERED")
        ));
      await db
        .update(schema.orders)
        .set({
          driverId: assignment.driverId,
          assignedAt: now,
          assignedBy: assignment.assignedBy,
          updatedAt: now,
        })
        .where(eq(schema.orders.id, assignment.orderId));
    }
    return assignment;
  }

  for (const order of store.orders) {
    const assignment = order.driverAssignments.find((item) => item.id === assignmentId);
    if (!assignment) continue;
    assignment.status = status;
    assignment.respondedAt = now;
    if (status === "ACCEPTED") {
      order.driverAssignments.forEach((item) => {
        if (item.id !== assignment.id && item.status === "OFFERED") {
          item.status = "CANCELLED";
          item.respondedAt = now;
        }
      });
      order.driverId = assignment.driverId;
      order.assignedAt = now;
      order.assignedBy = assignment.assignedBy;
      order.updatedAt = now;
    }
    return assignment;
  }
  return null;
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
      const [order] = await db.select({ areaId: schema.orders.areaId }).from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1);
      const [driver] = await db.select({ areaId: schema.drivers.areaId, isActive: schema.drivers.isActive }).from(schema.drivers).where(eq(schema.drivers.id, driverId)).limit(1);
      if (!order || !driver?.isActive || order.areaId !== driver.areaId) throw new Error("Driver tidak aktif atau berada di area berbeda.");
      await db
        .update(schema.orders)
        .set({ driverId, assignedAt: now, assignedBy, updatedAt: now })
        .where(eq(schema.orders.id, orderId));

      await db.insert(schema.driverAssignmentHistory).values({
        orderId,
        driverId,
        status: "ACCEPTED",
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
    const driver = store.drivers.find((item) => item.id === driverId && item.isActive);
    if (!driver || driver.areaId !== order.areaId) throw new Error("Driver tidak aktif atau berada di area berbeda.");
    order.driverId = driverId;
    order.assignedAt = now;
    order.assignedBy = assignedBy;
    order.updatedAt = now;
    order.driverAssignments.unshift({
      id: `assign-${Date.now()}`,
      orderId,
      driverId,
      status: "ACCEPTED",
      assignedBy,
      reason: reason || "Penugasan driver oleh admin",
      respondedAt: now,
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
// 4. SERVICE AREAS
// ====================================================
export async function getServiceAreas() {
  if (db && isDatabaseConfigured) {
    return db.query.serviceAreas.findMany({ orderBy: [schema.serviceAreas.sortOrder] });
  }
  return [...store.serviceAreas].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createServiceArea(data: schema.NewServiceArea) {
  const now = new Date();
  const payload = {
    ...data,
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    updatedAt: now,
  };
  if (!payload.name || !payload.slug) throw new Error("Nama dan slug area wajib diisi.");
  if (db && isDatabaseConfigured) {
    const [created] = await db.insert(schema.serviceAreas).values(payload).returning();
    return created;
  }
  if (store.serviceAreas.some((item) => item.slug === payload.slug)) throw new Error("Slug area sudah digunakan.");
  const created: schema.ServiceArea = {
    id: crypto.randomUUID(),
    name: payload.name,
    slug: payload.slug,
    description: payload.description || null,
    isActive: payload.isActive ?? false,
    sortOrder: payload.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  store.serviceAreas.push(created);
  return created;
}

export async function updateServiceArea(id: string, data: Partial<schema.NewServiceArea>) {
  const now = new Date();
  const payload = {
    ...data,
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.slug !== undefined ? { slug: data.slug.trim().toLowerCase() } : {}),
    updatedAt: now,
  };
  if (db && isDatabaseConfigured) {
    const [updated] = await db.update(schema.serviceAreas).set(payload).where(eq(schema.serviceAreas.id, id)).returning();
    return updated;
  }
  const index = store.serviceAreas.findIndex((item) => item.id === id);
  if (index < 0) return null;
  store.serviceAreas[index] = { ...store.serviceAreas[index], ...payload };
  return store.serviceAreas[index];
}

export async function deleteServiceArea(id: string) {
  const inUse = db && isDatabaseConfigured
    ? Boolean(await db.query.merchants.findFirst({ where: eq(schema.merchants.areaId, id) })) ||
      Boolean(await db.query.drivers.findFirst({ where: eq(schema.drivers.areaId, id) }))
    : store.merchants.some((item) => item.areaId === id) || store.drivers.some((item) => item.areaId === id);
  if (inUse) throw new Error("Area masih digunakan mitra atau driver. Pindahkan relasinya terlebih dahulu.");
  if (db && isDatabaseConfigured) await db.delete(schema.serviceAreas).where(eq(schema.serviceAreas.id, id));
  else store.serviceAreas = store.serviceAreas.filter((item) => item.id !== id);
  return { success: true };
}

// ====================================================
// 5. MERCHANTS
// ====================================================
export async function getMerchants() {
  if (db && isDatabaseConfigured) {
    try {
      return await db.query.merchants.findMany({ with: { area: true }, orderBy: [schema.merchants.sortOrder] });
    } catch (e) {
      console.error("Neon getMerchants error:", e);
    }
  }
  return [...store.merchants].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => ({ ...item, area: store.serviceAreas.find((area) => area.id === item.areaId) || null }));
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
    areaId: data.areaId || null,
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
// 6. PRODUCTS
// ====================================================
function normalizeProductHomepage(data: Partial<schema.NewProduct>) {
  const showOnHomepage = Boolean(data.showOnHomepage);
  if (!showOnHomepage) {
    return { showOnHomepage: false, homepagePosition: null, homepageBadge: null, homepageBadgeColor: null };
  }

  const homepagePosition = Number(data.homepagePosition);
  if (![1, 2, 3].includes(homepagePosition)) {
    throw new Error("Posisi menu beranda harus dipilih antara 1 sampai 3.");
  }

  const homepageBadge = String(data.homepageBadge || "Pilihan Hari Ini").trim().slice(0, 50);
  const allowedColors = ["orange", "red", "green", "blue", "purple", "dark"];
  const homepageBadgeColor = allowedColors.includes(String(data.homepageBadgeColor)) ? String(data.homepageBadgeColor) : "orange";
  return { showOnHomepage: true, homepagePosition, homepageBadge: homepageBadge || "Pilihan Hari Ini", homepageBadgeColor };
}

export async function getProducts() {
  if (db && isDatabaseConfigured) {
    try {
      return await db.query.products.findMany({
        with: {
          merchant: { with: { area: true } },
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
    merchant: (() => {
      const merchant = store.merchants.find((m) => m.id === p.merchantId);
      return merchant
        ? {
            ...merchant,
            area: store.serviceAreas.find((area) => area.id === merchant.areaId) || null,
          }
        : null;
    })(),
    category: store.categories.find((c) => c.id === p.categoryId) || null,
  }));
}

export async function createProduct(data: schema.NewProduct) {
  const now = new Date();
  const homepage = normalizeProductHomepage(data);
  if (db && isDatabaseConfigured) {
    try {
      if (homepage.showOnHomepage && homepage.homepagePosition) {
        await db.update(schema.products).set({ showOnHomepage: false, homepagePosition: null }).where(eq(schema.products.homepagePosition, homepage.homepagePosition));
      }
      const [item] = await db.insert(schema.products).values({ ...data, ...homepage }).returning();
      return item;
    } catch (e) {
      console.error("Neon createProduct error:", e);
    }
  }
  if (homepage.showOnHomepage && homepage.homepagePosition) {
    store.products = store.products.map((product) => product.homepagePosition === homepage.homepagePosition ? { ...product, showOnHomepage: false, homepagePosition: null } : product);
  }
  const item: schema.Product = {
    id: `p-${Date.now()}`,
    merchantId: data.merchantId,
    categoryId: data.categoryId || null,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    costPrice: data.costPrice ?? 0,
    price: data.price,
    imageUrl: data.imageUrl || null,
    isAvailable: data.isAvailable ?? true,
    ...homepage,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  store.products.push(item);
  return item;
}

export async function updateProduct(id: string, data: Partial<schema.NewProduct>) {
  const now = new Date();
  const homepage: Partial<Pick<schema.NewProduct, "showOnHomepage" | "homepagePosition" | "homepageBadge" | "homepageBadgeColor">> = data.showOnHomepage === undefined ? {} : normalizeProductHomepage(data);
  if (db && isDatabaseConfigured) {
    try {
      if (homepage.showOnHomepage && homepage.homepagePosition) {
        await db.update(schema.products).set({ showOnHomepage: false, homepagePosition: null }).where(and(eq(schema.products.homepagePosition, homepage.homepagePosition), ne(schema.products.id, id)));
      }
      const [updated] = await db
        .update(schema.products)
        .set({ ...data, ...homepage, updatedAt: now })
        .where(eq(schema.products.id, id))
        .returning();
      return updated;
    } catch (e) {
      console.error("Neon updateProduct error:", e);
    }
  }
  if (homepage.showOnHomepage && homepage.homepagePosition) {
    store.products = store.products.map((product) => product.id !== id && product.homepagePosition === homepage.homepagePosition ? { ...product, showOnHomepage: false, homepagePosition: null } : product);
  }
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.products[idx] = { ...store.products[idx], ...data, ...homepage, updatedAt: now };
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
// 7. DRIVERS
// ====================================================
export async function getDrivers() {
  if (db && isDatabaseConfigured) {
    try {
      return await db.query.drivers.findMany({ with: { area: true }, orderBy: [schema.drivers.name] });
    } catch (e) {
      console.error("Neon getDrivers error:", e);
    }
  }
  return store.drivers.map((item) => ({ ...item, area: store.serviceAreas.find((area) => area.id === item.areaId) || null }));
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
    areaId: data.areaId || null,
    name: data.name,
    phone: data.phone,
    whatsapp: data.whatsapp || null,
    vehicleType: data.vehicleType || null,
    vehiclePlate: data.vehiclePlate || null,
    commissionPercent: data.commissionPercent ?? 80,
    isActive: data.isActive ?? true,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now,
  };
  store.drivers.push(item);
  return item;
}

// ====================================================
// 8. PROMO CODES
// ====================================================
export async function getPromoCodes() {
  if (db && isDatabaseConfigured) {
    return db.query.promoCodes.findMany({ orderBy: [desc(schema.promoCodes.createdAt)] });
  }
  return [...store.promoCodes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function normalizePromoPayload(data: schema.NewPromoCode | Partial<schema.NewPromoCode>) {
  const discountType = data.discountType === undefined ? undefined : data.discountType === "FIXED" ? "FIXED" : "PERCENT";
  const discountValue = Math.max(0, Math.floor(Number(data.discountValue ?? 0)));
  if (discountType === "PERCENT" && discountValue > 100) {
    throw new Error("Diskon persentase maksimal 100%.");
  }
  return {
    ...data,
    ...(data.code !== undefined ? { code: data.code.trim().toUpperCase() } : {}),
    ...(discountType !== undefined ? { discountType } : {}),
    ...(data.discountValue !== undefined ? { discountValue } : {}),
    ...(data.maxDiscount !== undefined ? { maxDiscount: Math.max(0, Math.floor(Number(data.maxDiscount))) } : {}),
    ...(data.minOrder !== undefined ? { minOrder: Math.max(0, Math.floor(Number(data.minOrder))) } : {}),
    ...(data.usageLimit !== undefined ? { usageLimit: Math.max(0, Math.floor(Number(data.usageLimit))) } : {}),
  };
}

export async function createPromoCode(data: schema.NewPromoCode) {
  const now = new Date();
  const payload = normalizePromoPayload(data) as schema.NewPromoCode;
  if (!payload.code || !payload.expiresAt) throw new Error("Kode dan tanggal kedaluwarsa wajib diisi.");
  if (new Date(payload.expiresAt).getTime() <= Date.now()) throw new Error("Tanggal kedaluwarsa harus di masa mendatang.");
  if (db && isDatabaseConfigured) {
    const [created] = await db.insert(schema.promoCodes).values({ ...payload, updatedAt: now }).returning();
    return created;
  }
  if (store.promoCodes.some((item) => item.code === payload.code)) throw new Error("Kode promo sudah digunakan.");
  const created: schema.PromoCode = {
    id: crypto.randomUUID(),
    code: payload.code,
    description: payload.description || null,
    discountType: payload.discountType || "PERCENT",
    discountValue: Number(payload.discountValue),
    maxDiscount: Number(payload.maxDiscount || 0),
    minOrder: Number(payload.minOrder || 0),
    usageLimit: Number(payload.usageLimit || 0),
    usedCount: Number(payload.usedCount || 0),
    expiresAt: new Date(payload.expiresAt),
    isActive: payload.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
  store.promoCodes.push(created);
  return created;
}

export async function updatePromoCode(id: string, data: Partial<schema.NewPromoCode>) {
  const now = new Date();
  const payload = normalizePromoPayload(data);
  if (payload.expiresAt !== undefined && new Date(payload.expiresAt).getTime() <= Date.now()) {
    throw new Error("Tanggal kedaluwarsa harus di masa mendatang.");
  }
  if (db && isDatabaseConfigured) {
    const [updated] = await db.update(schema.promoCodes).set({ ...payload, updatedAt: now }).where(eq(schema.promoCodes.id, id)).returning();
    return updated;
  }
  const index = store.promoCodes.findIndex((item) => item.id === id);
  if (index < 0) return null;
  store.promoCodes[index] = { ...store.promoCodes[index], ...payload, updatedAt: now } as schema.PromoCode;
  return store.promoCodes[index];
}

export async function deletePromoCode(id: string) {
  if (db && isDatabaseConfigured) await db.delete(schema.promoCodes).where(eq(schema.promoCodes.id, id));
  else store.promoCodes = store.promoCodes.filter((item) => item.id !== id);
  return { success: true };
}

function jakartaDate(value: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export async function getDailyClosingReport(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Format tanggal tidak valid.");

  const sourceOrders = db && isDatabaseConfigured
    ? await db.query.orders.findMany({
        where: eq(schema.orders.status, "COMPLETED"),
        with: { items: true, merchant: true, driver: true, area: true },
        orderBy: [desc(schema.orders.updatedAt)],
      })
    : store.orders
        .filter((order) => order.status === "COMPLETED")
        .map((order) => ({
          ...order,
          merchant: store.merchants.find((item) => item.id === order.merchantId) || null,
          driver: store.drivers.find((item) => item.id === order.driverId) || null,
          area: store.serviceAreas.find((item) => item.id === order.areaId) || null,
        }));

  const closings = sourceOrders
    .filter((order) => jakartaDate(order.completedAt || order.updatedAt) === date)
    .map((order) => {
      const merchantPayout = order.merchantPayoutAmount ?? order.items.reduce(
        (sum, item) => sum + Number(item.costPrice) * item.quantity,
        0
      );
      const commissionPercent = order.driverCommissionPercent ?? order.driver?.commissionPercent ?? 0;
      const driverCommission = order.driverCommissionAmount ?? Math.floor(
        Number(order.deliveryFee) * commissionPercent / 100
      );
      const platformRevenue = order.platformRevenueAmount ?? Math.max(
        0,
        Number(order.subtotal) - merchantPayout + Number(order.deliveryFee) -
          driverCommission - Number(order.discount)
      );
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        closedAt: order.completedAt || order.updatedAt,
        customerName: order.customerName,
        areaId: order.areaId,
        areaName: order.area?.name || "Area belum ditentukan",
        merchantId: order.merchantId,
        merchantName: order.merchant?.name || "Mitra tidak ditemukan",
        driverId: order.driverId,
        driverName: order.driver?.name || "Tanpa driver",
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        discount: Number(order.discount),
        customerPayment: Number(order.total),
        merchantPayout,
        driverCommissionPercent: commissionPercent,
        driverCommission,
        platformRevenue,
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          sales: Number(item.subtotal),
        })),
      };
    });

  const merchantMap = new Map<string, { merchantId: string; merchantName: string; orders: number; sales: number; payout: number }>();
  const driverMap = new Map<string, { driverId: string; driverName: string; orders: number; deliveryFees: number; commission: number }>();
  const areaMap = new Map<string, { areaId: string | null; areaName: string; orders: number; customerPayments: number; platformRevenue: number }>();
  const menuMap = new Map<string, { productId: string | null; productName: string; merchantName: string; orderIds: Set<string>; quantity: number; sales: number }>();
  for (const closing of closings) {
    const areaKey = closing.areaId || "unassigned";
    const area = areaMap.get(areaKey) || {
      areaId: closing.areaId,
      areaName: closing.areaName,
      orders: 0,
      customerPayments: 0,
      platformRevenue: 0,
    };
    area.orders += 1;
    area.customerPayments += closing.customerPayment;
    area.platformRevenue += closing.platformRevenue;
    areaMap.set(areaKey, area);
    const merchant = merchantMap.get(closing.merchantId) || {
      merchantId: closing.merchantId,
      merchantName: closing.merchantName,
      orders: 0,
      sales: 0,
      payout: 0,
    };
    merchant.orders += 1;
    merchant.sales += closing.subtotal;
    merchant.payout += closing.merchantPayout;
    merchantMap.set(closing.merchantId, merchant);

    if (closing.driverId) {
      const driver = driverMap.get(closing.driverId) || {
        driverId: closing.driverId,
        driverName: closing.driverName,
        orders: 0,
        deliveryFees: 0,
        commission: 0,
      };
      driver.orders += 1;
      driver.deliveryFees += closing.deliveryFee;
      driver.commission += closing.driverCommission;
      driverMap.set(closing.driverId, driver);
    }

    for (const item of closing.items) {
      const menuKey = item.productId || `${closing.merchantId}:${item.productName}`;
      const menu = menuMap.get(menuKey) || {
        productId: item.productId,
        productName: item.productName,
        merchantName: closing.merchantName,
        orderIds: new Set<string>(),
        quantity: 0,
        sales: 0,
      };
      menu.orderIds.add(closing.id);
      menu.quantity += item.quantity;
      menu.sales += item.sales;
      menuMap.set(menuKey, menu);
    }
  }

  return {
    date,
    totals: closings.reduce(
      (total, closing) => ({
        orders: total.orders + 1,
        customerPayments: total.customerPayments + closing.customerPayment,
        merchantPayouts: total.merchantPayouts + closing.merchantPayout,
        driverCommissions: total.driverCommissions + closing.driverCommission,
        platformRevenue: total.platformRevenue + closing.platformRevenue,
      }),
      { orders: 0, customerPayments: 0, merchantPayouts: 0, driverCommissions: 0, platformRevenue: 0 }
    ),
    merchants: [...merchantMap.values()].sort((a, b) => b.orders - a.orders || b.payout - a.payout),
    drivers: [...driverMap.values()].sort((a, b) => b.orders - a.orders || b.commission - a.commission),
    areas: [...areaMap.values()].sort((a, b) => b.orders - a.orders || b.customerPayments - a.customerPayments),
    menus: [...menuMap.values()]
      .map((menu) => ({
        productId: menu.productId,
        productName: menu.productName,
        merchantName: menu.merchantName,
        orders: menu.orderIds.size,
        quantity: menu.quantity,
        sales: menu.sales,
      }))
      .sort((a, b) => b.orders - a.orders || b.quantity - a.quantity || b.sales - a.sales),
    closings,
  };
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
