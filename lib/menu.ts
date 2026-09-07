interface KulinerItem {
      id: number;
      name: string;
      description: string;
      image: string;
      location: string;
      price: string;
}


export const kulinerItems = <KulinerItem[]>[
      {
            id: 1,
            name: 'Soto Subang',
            description: 'Soto tradisional khas Subang dengan rempah-rempah pilihan',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
            location: 'Jl. Pendidikan',
            price: 'Rp 25.000',
      },
      {
            id: 2,
            name: 'Mie Kocok',
            description: 'Mie kuah tradisional dengan tofu goreng dan daging sapi',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
            location: 'Jl. Sudirman',
            price: 'Rp 20.000',
      },
      {
            id: 3,
            name: 'Nasi Kuning',
            description: 'Nasi kuning gurih dengan lauk pauk lengkap',
            image: 'https://images.unsplash.com/photo-1504674900247-0b9c9d5989a2?auto=format&fit=crop&w=800&q=80',
            location: 'Jl. Ahmad Yani',
            price: 'Rp 30.000',
      },
      {
            id: 4,
            name: 'Bakso Subang',
            description: 'Bakso daging sapi premium dengan kuah yang nikmat',
            image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
            location: 'Jl. Gatot Subroto',
            price: 'Rp 28.000',
      },
      {
            id: 5,
            name: 'Cireng Sambal',
            description: 'Cireng renyah dengan sambal khas Subang',
            image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
            location: 'Jl. H. Nawawi',
            price: 'Rp 18.000',
      },
      {
            id: 6,
            name: 'Karedok',
            description: 'Salad sayur segar dengan bumbu kacang pedas dan manis',
            image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
            location: 'Jl. Veteran',
            price: 'Rp 22.000',
      },
      {
            id: 7,
            name: 'Es Campur',
            description: 'Minuman segar berisi buah, jelly, dan es serut',
            image: 'https://images.unsplash.com/photo-1521302080390-8d2bcdb29cc4?auto=format&fit=crop&w=800&q=80',
            location: 'Jl. Cibogo',
            price: 'Rp 15.000',
      },
      {
            id: 8,
            name: 'Tahu Gejrot',
            description: 'Tahu goreng kecil disajikan dengan kuah manis pedas',
            image: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=800&q=80',
            location: 'Jl. Raya Subang',
            price: 'Rp 12.000',
      },
];

export function getKulinerItems(): KulinerItem[] {
      return kulinerItems;
}

export function getFavoriteKulinerItems(): KulinerItem[] {
      return kulinerItems.slice(0, 4); // Mengambil 4 item pertama sebagai rekomendasi kuliner favorit
}

// ─── Sharelok Menu ───

export interface SharelokMenuItem {
      id: number;
      name: string;
      emoji: string;
      category: string;
      price: number;
      oldPrice: number | null;
      desc: string;
      badge: string | null;
}

export interface SharelokCategory {
      emoji: string;
      label: string;
      value: string;
}

export const sharelokCategories: SharelokCategory[] = [
      { emoji: "🍚", label: "Nasi", value: "nasi" },
      { emoji: "🍜", label: "Mie", value: "mie" },
      { emoji: "🧃", label: "Minuman", value: "minuman" },
      { emoji: "🍢", label: "Cemilan", value: "cemilan" },
      { emoji: "🦐", label: "Seafood", value: "seafood" },
      { emoji: "🍰", label: "Dessert", value: "dessert" },
];

export const sharelokMenu: SharelokMenuItem[] = [
      // ── Nasi ──
      {
            id: 1,
            name: "Nasi Goreng Spesial",
            emoji: "🍳",
            category: "nasi",
            price: 18000,
            oldPrice: 22000,
            desc: "Nasi goreng bumbu rahasia, telor mata sapi, kerupuk",
            badge: "Terlaris",
      },
      {
            id: 2,
            name: "Nasi Bakar Ayam",
            emoji: "🍗",
            category: "nasi",
            price: 22000,
            oldPrice: null,
            desc: "Nasi bakar dibungkus daun pisang, isian ayam suwir pedas",
            badge: null,
      },
      {
            id: 3,
            name: "Nasi Gudeg Jogja",
            emoji: "🍱",
            category: "nasi",
            price: 20000,
            oldPrice: 28000,
            desc: "Gudeg nangka muda, sambal krecek, telur pindang",
            badge: "Sale",
      },
      {
            id: 4,
            name: "Nasi Kuning Komplit",
            emoji: "🍛",
            category: "nasi",
            price: 25000,
            oldPrice: null,
            desc: "Nasi kuning gurih dengan ayam goreng, sambal, dan lalapan",
            badge: null,
      },

      // ── Mie ──
      {
            id: 5,
            name: "Mie Ayam Bakso",
            emoji: "🍜",
            category: "mie",
            price: 15000,
            oldPrice: null,
            desc: "Mie ayam klasik dengan bakso sapi dan pangsit goreng",
            badge: "Terlaris",
      },
      {
            id: 6,
            name: "Mie Goreng Jawa",
            emoji: "🍝",
            category: "mie",
            price: 16000,
            oldPrice: 20000,
            desc: "Mie goreng manis khas Jawa dengan sayur dan telur",
            badge: "Sale",
      },
      {
            id: 7,
            name: "Kwetiau Seafood",
            emoji: "🥘",
            category: "mie",
            price: 22000,
            oldPrice: null,
            desc: "Kwetiau goreng dengan udang, cumi, dan sayuran segar",
            badge: null,
      },

      // ── Cemilan ──
      {
            id: 8,
            name: "Siomay Bandung",
            emoji: "🥟",
            category: "cemilan",
            price: 12000,
            oldPrice: null,
            desc: "Siomay ikan tenggiri kukus, bumbu kacang spesial",
            badge: "Baru",
      },
      {
            id: 9,
            name: "Batagor Crispy",
            emoji: "🍘",
            category: "cemilan",
            price: 14000,
            oldPrice: null,
            desc: "Batagor renyah goreng dengan saus kacang dan kecap",
            badge: null,
      },
      {
            id: 10,
            name: "Cireng Isi Sambal",
            emoji: "🧀",
            category: "cemilan",
            price: 10000,
            oldPrice: 15000,
            desc: "Cireng renyah isi sambal rujak, keju, dan ayam",
            badge: "Sale",
      },
      {
            id: 11,
            name: "Tahu Gejrot",
            emoji: "🫘",
            category: "cemilan",
            price: 8000,
            oldPrice: null,
            desc: "Tahu goreng kecil dengan kuah gula asam pedas khas Cirebon",
            badge: null,
      },

      // ── Seafood ──
      {
            id: 12,
            name: "Udang Goreng Tepung",
            emoji: "🦐",
            category: "seafood",
            price: 25000,
            oldPrice: 30000,
            desc: "Udang segar dibalur tepung renyah, sambal mangga",
            badge: "Sale",
      },
      {
            id: 13,
            name: "Cumi Bakar Madu",
            emoji: "🦑",
            category: "seafood",
            price: 28000,
            oldPrice: null,
            desc: "Cumi bakar saus madu pedas manis, taburan wijen",
            badge: "Baru",
      },
      {
            id: 14,
            name: "Ikan Gurame Asam Manis",
            emoji: "🐟",
            category: "seafood",
            price: 35000,
            oldPrice: null,
            desc: "Gurame goreng krispi dengan saus asam manis segar",
            badge: null,
      },

      // ── Minuman ──
      {
            id: 15,
            name: "Es Teh Manis",
            emoji: "🧊",
            category: "minuman",
            price: 5000,
            oldPrice: null,
            desc: "Es teh manis segar, disajikan dingin",
            badge: null,
      },
      {
            id: 16,
            name: "Es Campur Segar",
            emoji: "🍧",
            category: "minuman",
            price: 12000,
            oldPrice: null,
            desc: "Es campur berisi buah, jelly, kolang-kaling, dan sirup",
            badge: "Terlaris",
      },
      {
            id: 17,
            name: "Jus Alpukat",
            emoji: "🥑",
            category: "minuman",
            price: 15000,
            oldPrice: 18000,
            desc: "Jus alpukat kental dengan susu coklat dan es krim",
            badge: "Sale",
      },
      {
            id: 18,
            name: "Kopi Susu Gula Aren",
            emoji: "☕",
            category: "minuman",
            price: 14000,
            oldPrice: null,
            desc: "Kopi robusta Subang dengan susu segar dan gula aren",
            badge: "Baru",
      },

      // ── Dessert ──
      {
            id: 19,
            name: "Pisang Goreng Coklat",
            emoji: "🍌",
            category: "dessert",
            price: 10000,
            oldPrice: null,
            desc: "Pisang goreng renyah disiram saus coklat dan keju",
            badge: null,
      },
      {
            id: 20,
            name: "Es Krim Kelapa Muda",
            emoji: "🍦",
            category: "dessert",
            price: 12000,
            oldPrice: 15000,
            desc: "Es krim homemade rasa kelapa muda, topping kelapa parut",
            badge: "Baru",
      },
      {
            id: 21,
            name: "Klepon Pandan",
            emoji: "🍡",
            category: "dessert",
            price: 8000,
            oldPrice: null,
            desc: "Klepon isi gula merah lumer, balutan kelapa parut segar",
            badge: null,
      },
];

export function getSharelokMenu(): SharelokMenuItem[] {
      return sharelokMenu;
}

export function getSharelokCategories(): SharelokCategory[] {
      return sharelokCategories;
}