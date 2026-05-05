export type DestinasiItem = {
  nama: string;
  kategori: string;
  alamatSingkat: string;
};

export type DestinasiKecamatan = {
  kecamatan: string;
  destinasi: DestinasiItem[];
};

export const destinasiPerKecamatan: DestinasiKecamatan[] = [
  {
    kecamatan: "Ciater",
    destinasi: [
      { nama: "Sari Ater Hot Spring", kategori: "Wisata Alam", alamatSingkat: "Jalan Raya Ciater" },
      { nama: "Kebun Teh Ciater", kategori: "Agrowisata", alamatSingkat: "Kawasan Perkebunan Ciater" },
      { nama: "Curug Koleangkak", kategori: "Air Terjun", alamatSingkat: "Nagrak, Ciater" },
    ],
  },
  {
    kecamatan: "Jalancagak",
    destinasi: [
      { nama: "Capolaga Adventure Camp", kategori: "Wisata Alam", alamatSingkat: "Panaruban, Jalancagak" },
      { nama: "Kawah Tangkuban Perahu (akses Subang)", kategori: "Geowisata", alamatSingkat: "Perbatasan Subang-Bandung" },
      { nama: "Orchid Forest Cikole (akses sekitar)", kategori: "Wisata Keluarga", alamatSingkat: "Jalur Jalancagak-Lembang" },
    ],
  },
  {
    kecamatan: "Cijambe",
    destinasi: [
      { nama: "Curug Cijalu", kategori: "Air Terjun", alamatSingkat: "Cipancar, Cijambe" },
      { nama: "Area Camping Cijambe", kategori: "Wisata Alam", alamatSingkat: "Perbukitan Cijambe" },
      { nama: "Kebun Kopi Rakyat", kategori: "Edukasi", alamatSingkat: "Desa-desa penghasil kopi Cijambe" },
    ],
  },
  {
    kecamatan: "Subang",
    destinasi: [
      { nama: "Alun-Alun Subang", kategori: "Wisata Kota", alamatSingkat: "Pusat Kota Subang" },
      { nama: "Museum Wisma Karya", kategori: "Sejarah", alamatSingkat: "Jl. Ade Irma Suryani" },
      { nama: "Taman KS Tubun", kategori: "Ruang Terbuka", alamatSingkat: "Dekat pusat pemerintahan" },
    ],
  },
  {
    kecamatan: "Pagaden",
    destinasi: [
      { nama: "Sentra Kuliner Pagaden", kategori: "Kuliner", alamatSingkat: "Koridor utama Pagaden" },
      { nama: "Area Persawahan Edukatif", kategori: "Agrowisata", alamatSingkat: "Desa sekitar Pagaden" },
      { nama: "Wisata Sepeda Desa", kategori: "Aktivitas", alamatSingkat: "Rute kampung-kampung Pagaden" },
    ],
  },
  {
    kecamatan: "Pamanukan",
    destinasi: [
      { nama: "Pantai Pondok Bali", kategori: "Pantai", alamatSingkat: "Mayangan, Pamanukan" },
      { nama: "Pelabuhan Nelayan", kategori: "Wisata Bahari", alamatSingkat: "Pesisir Pamanukan" },
      { nama: "Pusat Ikan Asin Tradisional", kategori: "Belanja Lokal", alamatSingkat: "Area pasar pesisir" },
    ],
  },
];

export function kecamatanToSlug(kecamatan: string): string {
  return kecamatan.toLowerCase().replace(/\s+/g, "-");
}

export function getDestinasiByKecamatanSlug(slug: string): DestinasiKecamatan | null {
  return destinasiPerKecamatan.find((item) => kecamatanToSlug(item.kecamatan) === slug) ?? null;
}
