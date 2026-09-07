import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("user:password@ep-sample")) {
    console.error("❌ DATABASE_URL belum diatur dengan URL Neon asli di .env atau .env.local!");
    process.exit(1);
  }

  console.log("🌱 Menghubungkan ke Neon Database...");
  const sql = neon(url);
  const db = drizzle(sql, { schema });

  console.log("📦 Mengisi data awal Sharelok (Categories, Merchants, Products, Drivers)...");

  // 1. Categories
  console.log("-> Seeding categories...");
  const categoriesData = [
    {
      name: "Nasi & Lauk",
      slug: "nasi-lauk",
      description: "Aneka olahan nasi dan lauk khas Subang",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Mie & Bakso",
      slug: "mie-bakso",
      description: "Mie kocok, mie ayam, dan aneka bakso",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Cemilan & Tradisional",
      slug: "cemilan-tradisional",
      description: "Cireng, batagor, siomay khas Jawa Barat",
      imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Minuman & Es",
      slug: "minuman-es",
      description: "Es campur, kopi robusta, jus buah segar",
      imageUrl: "https://images.unsplash.com/photo-1521302080390-8d2bcdb29cc4?auto=format&fit=crop&w=600&q=80",
      isActive: true,
      sortOrder: 4,
    },
  ];

  const insertedCategories = [];
  for (const cat of categoriesData) {
    const [inserted] = await db.insert(schema.categories).values(cat).returning();
    insertedCategories.push(inserted);
  }

  // 2. Merchants
  console.log("-> Seeding merchants...");
  const merchantsData = [
    {
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
    },
    {
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
    },
    {
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
    },
  ];

  const insertedMerchants = [];
  for (const m of merchantsData) {
    const [inserted] = await db.insert(schema.merchants).values(m).returning();
    insertedMerchants.push(inserted);
  }

  // 3. Products
  console.log("-> Seeding products...");
  const productsData = [
    {
      merchantId: insertedMerchants[0].id,
      categoryId: insertedCategories[0].id,
      name: "Soto Subang Komplit",
      slug: "soto-subang-komplit",
      description: "Soto daging sapi empuk dengan kuah santan rempah khas Subang",
      price: 25000,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      sortOrder: 1,
    },
    {
      merchantId: insertedMerchants[0].id,
      categoryId: insertedCategories[0].id,
      name: "Nasi Goreng Spesial",
      slug: "nasi-goreng-spesial",
      description: "Nasi goreng bumbu rahasia dengan telur ceplok dan kerupuk",
      price: 18000,
      imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      sortOrder: 2,
    },
    {
      merchantId: insertedMerchants[1].id,
      categoryId: insertedCategories[1].id,
      name: "Mie Kocok Spesial Kikil",
      slug: "mie-kocok-spesial-kikil",
      description: "Mie kuning lembut disiram kuah kaldu sapi pekat bertabur kikil gurih",
      price: 22000,
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      sortOrder: 1,
    },
    {
      merchantId: insertedMerchants[1].id,
      categoryId: insertedCategories[1].id,
      name: "Bakso Sapi Urat Super",
      slug: "bakso-sapi-urat-super",
      description: "Bakso urat jumbo dengan kuah gurih dan pangsit goreng",
      price: 20000,
      imageUrl: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      sortOrder: 2,
    },
    {
      merchantId: insertedMerchants[2].id,
      categoryId: insertedCategories[2].id,
      name: "Cireng Isi Sambal Rujak",
      slug: "cireng-isi-sambal-rujak",
      description: "Cireng renyah di luar kenyal di dalam dengan saus cocol rujak",
      price: 12000,
      imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      sortOrder: 1,
    },
    {
      merchantId: insertedMerchants[2].id,
      categoryId: insertedCategories[3].id,
      name: "Kopi Susu Gula Aren Subang",
      slug: "kopi-susu-gula-aren-subang",
      description: "Kopi robusta Ciater dengan susu murni dan gula aren asli",
      price: 15000,
      imageUrl: "https://images.unsplash.com/photo-1517686469429-8a935e1c7b9c?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
      sortOrder: 2,
    },
  ];

  for (const p of productsData) {
    await db.insert(schema.products).values(p);
  }

  // 4. Drivers
  console.log("-> Seeding drivers...");
  const driversData = [
    {
      name: "Kang Asep Kurniawan",
      phone: "081311223344",
      whatsapp: "6281311223344",
      vehicleType: "Honda Vario 160",
      vehiclePlate: "T 4521 WX",
      isActive: true,
      notes: "Driver senior area Subang Kota & Ciater",
    },
    {
      name: "Mang Dedi Sukandar",
      phone: "085899887766",
      whatsapp: "6285899887766",
      vehicleType: "Yamaha NMAX",
      vehiclePlate: "T 2890 ZY",
      isActive: true,
      notes: "Standby area Jalancagak & Pagaden",
    },
  ];

  for (const d of driversData) {
    await db.insert(schema.drivers).values(d);
  }

  console.log("✅ Seed database Neon selesai dengan sukses!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Gagal melakukan seed database:", err);
  process.exit(1);
});
