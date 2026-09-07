import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Check if database URL is configured
export const isDatabaseConfigured = Boolean(
  process.env.DATABASE_URL &&
    process.env.DATABASE_URL.startsWith("postgres") &&
    !process.env.DATABASE_URL.includes("user:password@ep-sample")
);

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

if (isDatabaseConfigured) {
  try {
    const sql: NeonQueryFunction<false, false> = neon(process.env.DATABASE_URL!);
    dbInstance = drizzle(sql, { schema });
  } catch (err) {
    console.warn("Failed to initialize Neon database connection:", err);
    dbInstance = null;
  }
}

export const db = dbInstance;

// ==========================================
// SEED / DEMO IN-MEMORY STORE FALLBACK
// (Ensures admin works seamlessly even before setting DATABASE_URL)
// ==========================================

export interface InMemoryStore {
  categories: schema.Category[];
  merchants: schema.Merchant[];
  products: schema.Product[];
  drivers: schema.Driver[];
  orders: (schema.Order & {
    items: schema.OrderItem[];
    statusHistory: schema.OrderStatusHistory[];
    driverAssignments: schema.DriverAssignmentHistory[];
  })[];
}

const now = new Date();

const initialCategories: schema.Category[] = [
  {
    id: "c1111111-1111-1111-1111-111111111111",
    name: "Nasi & Lauk",
    slug: "nasi-lauk",
    description: "Aneka olahan nasi dan lauk khas Subang",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    name: "Mie & Bakso",
    slug: "mie-bakso",
    description: "Mie kocok, mie ayam, dan aneka bakso",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    name: "Cemilan & Tradisional",
    slug: "cemilan-tradisional",
    description: "Cireng, batagor, siomay khas Jawa Barat",
    imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    sortOrder: 3,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "c4444444-4444-4444-4444-444444444444",
    name: "Minuman & Es",
    slug: "minuman-es",
    description: "Es campur, kopi robusta, jus buah segar",
    imageUrl: "https://images.unsplash.com/photo-1521302080390-8d2bcdb29cc4?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    sortOrder: 4,
    createdAt: now,
    updatedAt: now,
  },
];

const initialMerchants: schema.Merchant[] = [
  {
    id: "m1111111-1111-1111-1111-111111111111",
    name: "Warung Soto Ibu Neneng",
    slug: "soto-ibu-neneng",
    description: "Soto Subang asli legendaris dengan rempah pilihan sejak 1998",
    phone: "081234567891",
    whatsapp: "6281234567891",
    address: "Jl. Pendidikan No. 12, Karanganyar, Subang",
    latitude: "-6.5715000",
    longitude: "107.7587000",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "m2222222-2222-2222-2222-222222222222",
    name: "Mie Kocok & Bakso Mang Ade",
    slug: "mie-kocok-mang-ade",
    description: "Mie kocok kuah kental kaldu sapi segar dengan kikil empuk",
    phone: "081298765432",
    whatsapp: "6281298765432",
    address: "Jl. Jenderal Sudirman No. 45, Subang",
    latitude: "-6.5683000",
    longitude: "107.7601000",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "m3333333-3333-3333-3333-333333333333",
    name: "Kedai Kopi & Cemilan Pagaden",
    slug: "kedai-pagaden",
    description: "Kopi robusta khas Subang dan aneka cireng isi gurih",
    phone: "085712345678",
    whatsapp: "6285712345678",
    address: "Jl. Raya Pagaden No. 88, Subang",
    latitude: "-6.4950000",
    longitude: "107.7950000",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    isActive: true,
    sortOrder: 3,
    createdAt: now,
    updatedAt: now,
  },
];

const initialProducts: schema.Product[] = [
  {
    id: "p1111111-1111-1111-1111-111111111111",
    merchantId: "m1111111-1111-1111-1111-111111111111",
    categoryId: "c1111111-1111-1111-1111-111111111111",
    name: "Soto Subang Komplit",
    slug: "soto-subang-komplit",
    description: "Soto daging sapi empuk dengan kuah santan rempah khas Subang",
    price: 25000,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p2222222-2222-2222-2222-222222222222",
    merchantId: "m1111111-1111-1111-1111-111111111111",
    categoryId: "c1111111-1111-1111-1111-111111111111",
    name: "Nasi Goreng Spesial",
    slug: "nasi-goreng-spesial",
    description: "Nasi goreng bumbu rahasia dengan telur ceplok dan kerupuk",
    price: 18000,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p3333333-3333-3333-3333-333333333333",
    merchantId: "m2222222-2222-2222-2222-222222222222",
    categoryId: "c2222222-2222-2222-2222-222222222222",
    name: "Mie Kocok Spesial Kikil",
    slug: "mie-kocok-spesial-kikil",
    description: "Mie kuning lembut disiram kuah kaldu sapi pekat bertabur kikil gurih",
    price: 22000,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p4444444-4444-4444-4444-444444444444",
    merchantId: "m2222222-2222-2222-2222-222222222222",
    categoryId: "c2222222-2222-2222-2222-222222222222",
    name: "Bakso Sapi Urat Super",
    slug: "bakso-sapi-urat-super",
    description: "Bakso urat jumbo dengan kuah gurih dan pangsit goreng",
    price: 20000,
    imageUrl: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p5555555-5555-5555-5555-555555555555",
    merchantId: "m3333333-3333-3333-3333-333333333333",
    categoryId: "c3333333-3333-3333-3333-333333333333",
    name: "Cireng Isi Sambal Rujak",
    slug: "cireng-isi-sambal-rujak",
    description: "Cireng renyah di luar kenyal di dalam dengan saus cocol rujak",
    price: 12000,
    imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p6666666-6666-6666-6666-666666666666",
    merchantId: "m3333333-3333-3333-3333-333333333333",
    categoryId: "c4444444-4444-4444-4444-444444444444",
    name: "Kopi Susu Gula Aren Subang",
    slug: "kopi-susu-gula-aren-subang",
    description: "Kopi robusta Ciater dengan susu murni dan gula aren asli",
    price: 15000,
    imageUrl: "https://images.unsplash.com/photo-1517686469429-8a935e1c7b9c?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    sortOrder: 2,
    createdAt: now,
    updatedAt: now,
  },
];

const initialDrivers: schema.Driver[] = [
  {
    id: "d1111111-1111-1111-1111-111111111111",
    name: "Kang Asep Kurniawan",
    phone: "081311223344",
    whatsapp: "6281311223344",
    vehicleType: "Honda Vario 160",
    vehiclePlate: "T 4521 WX",
    isActive: true,
    notes: "Driver senior area Subang Kota & Ciater",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "d2222222-2222-2222-2222-222222222222",
    name: "Mang Dedi Sukandar",
    phone: "085899887766",
    whatsapp: "6285899887766",
    vehicleType: "Yamaha NMAX",
    vehiclePlate: "T 2890 ZY",
    isActive: true,
    notes: "Standby area Jalancagak & Pagaden",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "d3333333-3333-3333-3333-333333333333",
    name: "Ujang Supriatna",
    phone: "087712349876",
    whatsapp: "6287712349876",
    vehicleType: "Honda Beat",
    vehiclePlate: "T 6143 KL",
    isActive: false,
    notes: "Sedang istirahat / off duty",
    createdAt: now,
    updatedAt: now,
  },
];

const initialOrders: InMemoryStore["orders"] = [
  {
    id: "ord-1111111-1111-1111-1111-111111111111",
    orderNumber: "SHL-20260907-001",
    merchantId: "m1111111-1111-1111-1111-111111111111",
    driverId: "d1111111-1111-1111-1111-111111111111",
    customerName: "Rizky Ramadhan",
    customerPhone: "081288990011",
    customerAddress: "Perumahan Subang Indah Blok C No. 14, Subang",
    customerNote: "Tolong sambal dipisah dan kuah soto dibuat lebih panas ya",
    status: "DELIVERING",
    subtotal: 50000,
    deliveryFee: 10000,
    discount: 5000,
    total: 55000,
    paymentMethod: "COD / Tunai",
    paymentStatus: "PENDING",
    adminNote: "Driver sudah pickup dari resto",
    assignedAt: new Date(Date.now() - 15 * 60 * 1000),
    assignedBy: "Admin Sharelok",
    createdAt: new Date(Date.now() - 40 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    items: [
      {
        id: "item-1",
        orderId: "ord-1111111-1111-1111-1111-111111111111",
        productId: "p1111111-1111-1111-1111-111111111111",
        productName: "Soto Subang Komplit",
        price: 25000,
        quantity: 2,
        subtotal: 50000,
        createdAt: new Date(Date.now() - 40 * 60 * 1000),
      },
    ],
    statusHistory: [
      {
        id: "hist-1",
        orderId: "ord-1111111-1111-1111-1111-111111111111",
        status: "PENDING",
        note: "Pesanan masuk dari pelanggan",
        createdAt: new Date(Date.now() - 40 * 60 * 1000),
      },
      {
        id: "hist-2",
        orderId: "ord-1111111-1111-1111-1111-111111111111",
        status: "PREPARING",
        note: "Merchant mulai memasak",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: "hist-3",
        orderId: "ord-1111111-1111-1111-1111-111111111111",
        status: "DELIVERING",
        note: "Driver Kang Asep sedang mengantar pesanan",
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
      },
    ],
    driverAssignments: [
      {
        id: "assign-1",
        orderId: "ord-1111111-1111-1111-1111-111111111111",
        driverId: "d1111111-1111-1111-1111-111111111111",
        assignedBy: "Admin Sharelok",
        reason: "Driver terdekat dengan lokasi warung soto",
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
    ],
  },
  {
    id: "ord-2222222-2222-2222-2222-222222222222",
    orderNumber: "SHL-20260907-002",
    merchantId: "m2222222-2222-2222-2222-222222222222",
    driverId: null,
    customerName: "Siti Rahmawati",
    customerPhone: "082155667788",
    customerAddress: "Jl. Otista No. 78, Pasirkareumbi, Subang",
    customerNote: "Mie kocok jangan pakai seledri",
    status: "PREPARING",
    subtotal: 42000,
    deliveryFee: 8000,
    discount: 0,
    total: 50000,
    paymentMethod: "QRIS / Transfer",
    paymentStatus: "PAID",
    adminNote: "Menunggu makanan selesai dimasak untuk assign driver",
    assignedAt: null,
    assignedBy: null,
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    items: [
      {
        id: "item-2",
        orderId: "ord-2222222-2222-2222-2222-222222222222",
        productId: "p3333333-3333-3333-3333-333333333333",
        productName: "Mie Kocok Spesial Kikil",
        price: 22000,
        quantity: 1,
        subtotal: 22000,
        createdAt: new Date(Date.now() - 18 * 60 * 1000),
      },
      {
        id: "item-3",
        orderId: "ord-2222222-2222-2222-2222-222222222222",
        productId: "p4444444-4444-4444-4444-444444444444",
        productName: "Bakso Sapi Urat Super",
        price: 20000,
        quantity: 1,
        subtotal: 20000,
        createdAt: new Date(Date.now() - 18 * 60 * 1000),
      },
    ],
    statusHistory: [
      {
        id: "hist-4",
        orderId: "ord-2222222-2222-2222-2222-222222222222",
        status: "PENDING",
        note: "Pesanan masuk dan terverifikasi",
        createdAt: new Date(Date.now() - 18 * 60 * 1000),
      },
      {
        id: "hist-5",
        orderId: "ord-2222222-2222-2222-2222-222222222222",
        status: "PREPARING",
        note: "Dapur sedang memproses mie kocok & bakso",
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
    driverAssignments: [],
  },
  {
    id: "ord-3333333-3333-3333-3333-333333333333",
    orderNumber: "SHL-20260907-003",
    merchantId: "m3333333-3333-3333-3333-333333333333",
    driverId: null,
    customerName: "Budi Santoso",
    customerPhone: "081977665544",
    customerAddress: "Kantor BPN Subang, Jl. Mayjen Sutoyo",
    customerNote: "Kopi manis sedang, es dipisah",
    status: "PENDING",
    subtotal: 27000,
    deliveryFee: 10000,
    discount: 0,
    total: 37000,
    paymentMethod: "COD / Tunai",
    paymentStatus: "PENDING",
    adminNote: null,
    assignedAt: null,
    assignedBy: null,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    items: [
      {
        id: "item-4",
        orderId: "ord-3333333-3333-3333-3333-333333333333",
        productId: "p5555555-5555-5555-5555-555555555555",
        productName: "Cireng Isi Sambal Rujak",
        price: 12000,
        quantity: 1,
        subtotal: 12000,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
      {
        id: "item-5",
        orderId: "ord-3333333-3333-3333-3333-333333333333",
        productId: "p6666666-6666-6666-6666-666666666666",
        productName: "Kopi Susu Gula Aren Subang",
        price: 15000,
        quantity: 1,
        subtotal: 15000,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    ],
    statusHistory: [
      {
        id: "hist-6",
        orderId: "ord-3333333-3333-3333-3333-333333333333",
        status: "PENDING",
        note: "Pesanan baru menunggu konfirmasi admin",
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    ],
    driverAssignments: [],
  },
];

// Global singleton for in-memory store in dev
const globalForStore = globalThis as unknown as { sharelokStore?: InMemoryStore };

export const store: InMemoryStore =
  globalForStore.sharelokStore || {
    categories: initialCategories,
    merchants: initialMerchants,
    products: initialProducts,
    drivers: initialDrivers,
    orders: initialOrders,
  };

if (process.env.NODE_ENV !== "production") {
  globalForStore.sharelokStore = store;
}
