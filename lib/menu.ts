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